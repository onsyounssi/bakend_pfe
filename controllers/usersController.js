// controllers/usersController.js
const User = require("../models/Users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await User.findOne({ email: new RegExp("^" + email + "$", "i") });
    if (!user) return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    res.status(200).json({
      message: "Email de réinitialisation envoyé avec succès (Simulé)",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Mot de passe requis" });
    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ─────────────────────────────────────────────
// Register — retourne token + user + role
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { lastName, firstName, phone, email, role, password, acceptTerms } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      lastName,
      firstName,
      phone,
      email,
      role,
      password: hashedPassword,
      acceptTerms,
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
    const userData = { ...req.body };
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const nouvelUser = new User(userData);
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
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};