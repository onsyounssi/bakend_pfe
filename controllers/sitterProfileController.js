// controllers/sitterProfileController.js
const SitterProfile = require("../models/SitterProfile.js");

// Ajouter un profile de sitter
exports.ajouterSitterProfile = async (req, res) => {
  try {
    const nouvelSitterProfile = new SitterProfile(req.body);
    await nouvelSitterProfile.save();
    res.status(201).json(nouvelSitterProfile);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      nom,
      tarifHoraire,
      experience,
      localisation,
      specialite,
      description,
      langues,
      disponibilites
    } = req.body;

    // Vérification si le profil existe déjà
    const userExiste = await SitterProfile.findOne({ nom });
    if (userExiste) return res.status(400).json({ message: "Nom déjà utilisé" });

    // Création avec les nouvelles données
    const sitterProfile = await SitterProfile.create({
      nom,
      tarifHoraire,
      experience,
      localisation,
      specialite,
      description,
      langues: typeof langues === 'string' ? langues.split(',') : langues,
      disponibilites: typeof disponibilites === 'string' ? JSON.parse(disponibilites) : disponibilites,
      image: req.file ? req.file.filename : "default.jpg",
      noteMoyenne: 0,
      nbAvis: 0
    });

    res.status(201).json(sitterProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les profils de sitter
exports.listerSitterProfiles = async (req, res) => {
  try {
    const sitterProfiles = await SitterProfile.find().sort({ createdAt: -1 });
    res.json(sitterProfiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un profil de sitter par ID
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

// Mettre à jour un profil de sitter
exports.updateSitterProfile = async (req, res) => {
  try {
    const updatedSitter = await SitterProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedSitter) {
      return res.status(404).json({ message: "Profil de sitter non trouvé" });
    }

    res.json(updatedSitter);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un profil de sitter
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