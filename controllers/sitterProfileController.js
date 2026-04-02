// controllers/sitterProfileController.js
const SitterProfile = require("../models/SitterProfile.js");

// ─────────────────────────────────────────────
// Créer un profil baby-sitter lié à l'userId
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const userId = req.user.id; // injecté par le middleware auth

    // Vérifier si le profil existe déjà pour cet utilisateur
    const existant = await SitterProfile.findOne({ userId });
    if (existant) {
      return res.status(400).json({ message: "Ce compte a déjà un profil baby-sitter" });
    }

    const {
      nom,
      tarifHoraire,
      experience,
      localisation,
      specialite,
      description,
      langues,
      disponibilites,
    } = req.body;

    if (!nom || !tarifHoraire) {
      return res.status(400).json({ message: "nom et tarifHoraire sont requis" });
    }

    const sitterProfile = await SitterProfile.create({
      userId,
      nom,
      tarifHoraire: parseFloat(tarifHoraire),
      experience,
      localisation,
      specialite,
      description,
      langues: typeof langues === "string" ? langues.split(",").map(l => l.trim()) : langues || [],
      disponibilites:
        typeof disponibilites === "string"
          ? JSON.parse(disponibilites)
          : disponibilites || {},
      image: req.file ? req.file.filename : "default.jpg",
      noteMoyenne: 0,
      nbAvis: 0,
    });

    res.status(201).json({ success: true, profile: sitterProfile });
  } catch (error) {
    console.error("Erreur register sitter:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer le profil du sitter connecté
// ─────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await SitterProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Aucun profil trouvé pour ce compte" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Ancien ajout sans auth (admin)
// ─────────────────────────────────────────────
exports.ajouterSitterProfile = async (req, res) => {
  try {
    const nouvelSitterProfile = new SitterProfile(req.body);
    await nouvelSitterProfile.save();
    res.status(201).json(nouvelSitterProfile);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer tous les profils
// ─────────────────────────────────────────────
exports.listerSitterProfiles = async (req, res) => {
  try {
    const sitterProfiles = await SitterProfile.find().sort({ createdAt: -1 });
    res.json(sitterProfiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer un profil par ID
// ─────────────────────────────────────────────
exports.getSitterProfileById = async (req, res) => {
  try {
    const sitterProfile = await SitterProfile.findById(req.params.id);
    if (!sitterProfile) {
      return res.status(404).json({ message: "Profil de sitter non trouvé" });
    }
    res.json(sitterProfile);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Mettre à jour un profil
// ─────────────────────────────────────────────
exports.updateSitterProfile = async (req, res) => {
  try {
    const updatedSitter = await SitterProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSitter) {
      return res.status(404).json({ message: "Profil de sitter non trouvé" });
    }
    res.json(updatedSitter);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Supprimer un profil
// ─────────────────────────────────────────────
exports.deleteSitterProfile = async (req, res) => {
  try {
    const deletedSitter = await SitterProfile.findByIdAndDelete(req.params.id);
    if (!deletedSitter) {
      return res.status(404).json({ message: "Profil de sitter non trouvé" });
    }
    res.json({ message: "Profil de sitter supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};