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
    const user = await User.findOne({ email: req.body.email });

    // Ne pas révéler si l'utilisateur existe
    if (!user) {
      return res.json({ message: "Si cet email existe, un lien a été envoyé." });
    }

    // Générer token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hasher le token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      // Envoyer email réel (Gmail)
      await sendEmail(user.email, resetUrl);
      console.log(`\n\n[INFO] L'email a bien été expédié via les serveurs de Gmail vers : ${user.email}\n`);
      res.status(200).json({
        message: "Email de réinitialisation envoyé avec succès vers votre vraie boîte de réception !"
      });
    } catch (emailError) {
      console.error("\n[DÉBOGAGE] Nodemailer n'a pas pu envoyer l'e-mail. Ce n'est pas grave, nous évitons l'erreur 500 et gardons le token valide pour le développement.");

      // On ne supprime PAS le token pour que vous puissiez continuer.
      console.log(`\n=======================================================\n`);
      console.log(`[CONTOURNEMENT LOCAL] Veuillez cliquer sur ce lien pour continuer:\n▶ ${resetUrl}`);
      console.log(`\n=======================================================\n`);

      // On certifie au frontend que "tout va bien" (code 200 au lieu de 500)
      return res.status(200).json({
        message: "L'e-mail simulé a été généré. Veuillez regarder le terminal (console) pour le lien de réinitialisation."
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

const sendEmail = async (email, url) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"SmartBabyCare" <noreply@smartbabycare.com>',
    to: email,
    subject: "SmartBabyCare - Réinitialisation du mot de passe",
    html: `
      <h2>Réinitialisation du mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour SmartBabyCare.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
      <br/>
      <a href="${url}" style="background-color: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
      <br/><br/>
      <p>(Ou copiez-collez ce lien : <a href="${url}">${url}</a>)</p>
      <br/>
      <p><em>Ce lien est valide pendant 15 minutes.</em></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
    `,
  });

  return null;
};

// ─────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalide ou expiré" });
  }

  user.password = await bcrypt.hash(req.body.password, 10);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Mot de passe mis à jour" });
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