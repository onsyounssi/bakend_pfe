const SitterProfile = require("../models/SitterProfile.js");
const asyncHandler = require("../utils/asyncHandler.js");

// ─────────────────────────────────────────────
// Créer un profil baby-sitter lié à l'userId
// ─────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const userId = req.user.id; // injecté par le middleware auth

  // Vérifier si le profil existe déjà pour cet utilisateur
  const existant = await SitterProfile.findOne({ userId });
  if (existant) {
    return res.status(400).json({ message: "Ce compte a déjà un profil baby-sitter" });
  }

  const {
    prenom,
    nom,
    tarifHoraire,
    experience,
    localisation,
    specialite,
    description,
    langues,
    disponibilites,
  } = req.body;

  if (!prenom || !nom || !tarifHoraire) {
    return res.status(400).json({ message: "prenom, nom et tarifHoraire sont requis" });
  }

  const sitterProfile = await SitterProfile.create({
    userId,
    prenom,
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
});

// ─────────────────────────────────────────────
// Récupérer le profil du sitter connecté
// ─────────────────────────────────────────────
exports.getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await SitterProfile.findOne({ userId });
  if (!profile) {
    return res.status(404).json({ message: "Aucun profil trouvé pour ce compte" });
  }
  res.json(profile);
});

// ─────────────────────────────────────────────
// Ancien ajout sans auth (admin)
// ─────────────────────────────────────────────
exports.ajouterSitterProfile = asyncHandler(async (req, res) => {
  const nouvelSitterProfile = new SitterProfile(req.body);
  await nouvelSitterProfile.save();
  res.status(201).json(nouvelSitterProfile);
});

// ─────────────────────────────────────────────
// Récupérer tous les profils
// ─────────────────────────────────────────────
exports.listerSitterProfiles = asyncHandler(async (req, res) => {
  const sitterProfiles = await SitterProfile.find().sort({ createdAt: -1 });
  res.json(sitterProfiles);
});

// ─────────────────────────────────────────────
// Récupérer un profil par ID
// ─────────────────────────────────────────────
exports.getSitterProfileById = asyncHandler(async (req, res) => {
  const sitterProfile = await SitterProfile.findById(req.params.id);
  if (!sitterProfile) {
    return res.status(404).json({ message: "Profil de sitter non trouvé" });
  }
  res.json(sitterProfile);
});

// ─────────────────────────────────────────────
// Mettre à jour un profil
// ─────────────────────────────────────────────
exports.updateSitterProfile = asyncHandler(async (req, res) => {
  const updatedSitter = await SitterProfile.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedSitter) {
    return res.status(404).json({ message: "Profil de sitter non trouvé" });
  }
  res.json(updatedSitter);
});

// ─────────────────────────────────────────────
// Supprimer un profil
// ─────────────────────────────────────────────
exports.deleteSitterProfile = asyncHandler(async (req, res) => {
  const deletedSitter = await SitterProfile.findByIdAndDelete(req.params.id);
  if (!deletedSitter) {
    return res.status(404).json({ message: "Profil de sitter non trouvé" });
  }
  res.json({ message: "Profil de sitter supprimé avec succès" });
});