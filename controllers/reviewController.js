const Review = require("../models/Review.js");
const SitterProfile = require("../models/SitterProfile.js");


// Ajouter un Avis 
exports.ajouterReview = async (req, res) => {
  try {
    const { sitterProfileId, parentId, note, commentaire, auteur, sitterName } = req.body;

    if (!sitterProfileId || !parentId || !note) {
      return res.status(400).json({ message: "Données manquantes (sitterProfileId, parentId, note)" });
    }

    const nouveauReview = new Review({
      sitterProfileId,
      parentId,
      note,
      commentaire,
      auteur,
      sitterName
    });

    await nouveauReview.save();

    // Recalculer les statistiques du SitterProfile
    const reviews = await Review.find({ sitterProfileId });
    const nbAvis = reviews.length;
    const noteMoyenne = reviews.reduce((acc, r) => acc + r.note, 0) / nbAvis;

    await SitterProfile.findByIdAndUpdate(sitterProfileId, {
      noteMoyenne: parseFloat(noteMoyenne.toFixed(1)),
      nbAvis: nbAvis
    });

    res.status(201).json(nouveauReview);
  } catch (err) {
    console.error("Erreur ajout avis:", err);
    res.status(400).json({ message: "Erreur d’ajout", error: err.message });
  }
};


// Récupérer tous les avis 
exports.listerReview = async (req, res) => {
  try {
    const review = await Review.find();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un avis par ID 
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "avis non trouvé" });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour  un avis
exports.updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // retourne le document mis à jour 
        runValidators: true // applique les validations du schema 
      }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "avis non trouvé" });
    }

    // Recalculer les statistiques du SitterProfile
    const { sitterProfileId } = updatedReview;
    if (sitterProfileId) {
      const reviews = await Review.find({ sitterProfileId });
      const nbAvis = reviews.length;
      const noteMoyenne = nbAvis > 0 ? reviews.reduce((acc, r) => acc + r.note, 0) / nbAvis : 0;

      await SitterProfile.findByIdAndUpdate(sitterProfileId, {
        noteMoyenne: parseFloat(noteMoyenne.toFixed(1)),
        nbAvis: nbAvis
      });
    }

    res.json(updatedReview);
  } catch (err) {
    res.status(400).json({
      message: "Erreur de mise à jour", error:
        err.message
    });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "avis non trouvé" });

    const sitterProfileId = review.sitterProfileId;
    await Review.findByIdAndDelete(req.params.id);

    if (sitterProfileId) {
      const reviews = await Review.find({ sitterProfileId });
      const nbAvis = reviews.length;
      const noteMoyenne = nbAvis > 0 ? reviews.reduce((acc, r) => acc + r.note, 0) / nbAvis : 0;
      await SitterProfile.findByIdAndUpdate(sitterProfileId, {
        noteMoyenne: parseFloat(noteMoyenne.toFixed(1)),
        nbAvis
      });
    }
    res.json({ message: "avis supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
}; 