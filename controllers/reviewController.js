// controllers/reviewController.js 
const Review = require("../models/Review.js"); 


// Ajouter un Avis 
exports.ajouterReview = async (req, res) => { 
try { 
const nouveauReview = new Review(req.body); 
await nouveauReview.save(); 
res.status(201).json(nouveauReview); 
} catch (err) { 
res.status(400).json({ message: "Erreur d’ajout", error: 
err.message }); 
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
 
    res.json(updatedReview); 
  } catch (err) { 
    res.status(400).json({ message: "Erreur de mise à jour", error: 
err.message }); 
  } 
}; 
 
// Supprimer un avis
exports.deleteReview = async (req, res) => { 
  try { 
    const deletedReview = await Review.findByIdAndDelete(req.params.id); 
 
    if (!deletedReview) { 
      return res.status(404).json({ message: "avis non trouvé" }); 
    } 
 
    res.json({ message: "avis supprimé avec succès" }); 
  } catch (err) { 
    res.status(500).json({ message: "Erreur de suppression", error: 
err.message }); 
  } 
}; 