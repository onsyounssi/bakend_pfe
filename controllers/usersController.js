// controllers/usersController.js
const User = require("../models/Users.js");
const SitterProfile = require("../models/SitterProfile.js");
const Booking = require("../models/Booking.js");
const Message = require("../models/Message.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateResetToken, hashToken } = require("../utils/cryptoToken.js");
const { sendPasswordResetEmail } = require("../utils/sendEmail.js");
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────
// 7. Backend — contrôleur (logique métier)
// ─────────────────────────────────────────────

/** POST /api/Users/forgot-password  { "email": "..." } */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Toujours répondre 200 pour ne pas révéler si l'email existe (sécurité)
    if (!user) {
      return res.status(200).json({
        message: "Si un compte existe avec cet email, un lien a été envoyé.",
      });
    }

    const resetToken = generateResetToken();
    const hashed = hashToken(resetToken);

    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 h

    await user.save({ validateBeforeSave: false });

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontend}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    let previewUrl = null;
    let emailSent = false;
    try {
      const info = await sendPasswordResetEmail(user.email, resetUrl);
      emailSent = true;
      if (info && info.envelope) {
        previewUrl = nodemailer.getTestMessageUrl(info) || null;
      }
    } catch (emailError) {
      console.error("⚠️ Email failure, providing direct link for development:", emailError.message);
    }

    return res.status(200).json({
      message: emailSent 
        ? "Un lien de réinitialisation a été envoyé à votre adresse email." 
        : "Lien de réinitialisation généré (E-mail non envoyé).",
      resetUrl: emailSent ? null : resetUrl, // On donne le lien si l'email a échoué
      previewUrl
    });
  } catch (error) {
    console.error("CRITICAL: ForgotPassword General Error:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la demande de réinitialisation",
      error: error.message
    });
  }
};

/** POST /api/Users/reset-password  { "email", "token", "password" } */
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password || password.length < 8) {
      return res.status(400).json({ message: "Données invalides (mot de passe min. 8 caractères)." });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken");

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou expiré." });
    }

    // Le mot de passe sera haché par le hook pre("save") du modèle
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("ResetPassword Error:", error);
    res.status(500).json({ message: "Erreur lors de la réinitialisation", error: error.message });
  }
};

// ─────────────────────────────────────────────
// Register — retourne token + user + role
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { lastName, firstName, phone, email, role, password, acceptTerms, ville } = req.body;

    if (password && password.length > 8) {
      return res.status(400).json({ message: "Le mot de passe ne doit pas dépasser 8 caractères" });
    }

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const user = new User({
      lastName,
      firstName,
      phone,
      email,
      role,
      password,
      acceptTerms,
      ville,
      image: req.file ? req.file.filename : null,
    });
    await user.save();

    // Générer un token JWT immédiatement après l'inscription
    const token = jwt.sign(
      { id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      token,
      user: {
        _id: user._id,
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription", error: error.message });
  }
};

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Identifiants invalides" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Identifiants invalides" });

    const token = jwt.sign(
      { id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Ajouter un utilisateur (admin)
// ─────────────────────────────────────────────
exports.ajouterUtilisateur = async (req, res) => {
  try {
    const nouvelUser = new User(req.body);
    await nouvelUser.save();

    // Si c'est un baby-sitter, on peut initialiser son SitterProfile automatiquement.
    if (nouvelUser.role === 'baby-sitter') {
      const SitterProfile = require("../models/SitterProfile.js");
      await SitterProfile.create({
        userId: nouvelUser._id,
        prenom: nouvelUser.firstName,
        nom: nouvelUser.lastName,
        tarifHoraire: 10, // Valeur par defaut
      });
    }

    res.status(201).json(nouvelUser);
  } catch (err) {
    let errorMessage = "Erreur d'ajout";
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.code === 11000) {
      errorMessage = "Cet email ou ce numéro de téléphone existe déjà.";
    }
    res.status(400).json({ message: errorMessage, error: err.message });
  }
};

// ─────────────────────────────────────────────
// Lister tous les utilisateurs (admin)
// ─────────────────────────────────────────────
exports.listerUtilisateurs = async (req, res) => {
  try {
    const user = await User.find().select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer un utilisateur par ID
// ─────────────────────────────────────────────
exports.getUtilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Mettre à jour un utilisateur
// ─────────────────────────────────────────────
exports.updateUtilisateur = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(updatedUser);
  } catch (err) {
    let errorMessage = "Erreur de mise à jour";
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.code === 11000) {
      errorMessage = "Cet email ou ce numéro de téléphone existe déjà.";
    }
    res.status(400).json({ message: errorMessage, error: err.message });
  }
};

// ─────────────────────────────────────────────
// Supprimer un utilisateur
// ─────────────────────────────────────────────
exports.deleteUtilisateur = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Supprimer le profil Sitter si présent
    await SitterProfile.findOneAndDelete({ userId: userId });

    // 2. Supprimer les réservations liées (en tant que parent ou sitter)
    await Booking.deleteMany({
      $or: [{ parentId: userId }, { sitterId: userId }]
    });

    // 3. Supprimer les messages liés
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    // 4. Supprimer l'utilisateur lui-même
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur et toutes ses données associées supprimés avec succès" });
  } catch (err) {
    console.error("Erreur suppression utilisateur:", err);
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};