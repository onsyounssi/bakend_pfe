// controllers/userController.js 
const User = require("../models/Users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const nodemailer = require("nodemailer");
exports.forgotPassword = async (req, res) => {
  // configure mail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  try {
    console.log('Requête reçue:', req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });
    }

    // Générer un token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    console.log('Token généré pour', email, ':', token);

    // Ici, vous devriez envoyer un email avec le token
    // Pour le test, on renvoie le token dans la réponse
    res.status(200).json({
      message: 'Email de réinitialisation envoyé avec succès',
      token: token // À enlever en production, juste pour le test
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
/*const resetUrl = `http://localhost:3000/reset-password/${token}`;
const message = `
You requested a password reset.
Click the link below:
${resetUrl}
`;

await transporter.sendMail({
to: user.email,
subject: "Password Reset",
text: message
});
 

res.json({ message: "Reset email sent" });
};*/
exports.resetPassword = async (req, res) => {

  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('Reset password avec token:', token);

    if (!password) {
      return res.status(400).json({ message: 'Mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier le token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    const bcrypt = require("bcryptjs");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log('Mot de passe réinitialisé pour:', user.email);

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};



// Ajouter un utilisateur (admin uniquement) 
exports.ajouterUtilisateur = async (req, res) => {
  try {
    const nouvelUser = new User(req.body);
    await nouvelUser.save();

    res.status(201).json(nouvelUser);
  } catch (err) {
    res.status(400).json({
      message: "Erreur d’ajout", error:
        err.message
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { lastName, firstName, phone, email, role, password, acceptTerms } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {

      return res.status(409).json({
        message: "Email déjà utilisé"
      });
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
      image: req.file ? req.file.filename : null
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successufully',
      user: {
        _id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'server error during registration',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les utilisateurs 
exports.listerUtilisateurs = async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un utilisateur par ID 
exports.getUtilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un utilisateur 
exports.updateUtilisateur = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // retourne le document mis à jour 
        runValidators: true // applique les validations du schema 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({
      message: "Erreur de mise à jour", error:
        err.message
    });
  }
};

// Supprimer un utilisateur 
exports.deleteUtilisateur = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({
      message: "Erreur de suppression", error:
        err.message
    });
  }
};