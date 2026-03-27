// controllers/sitterProfileController.js 
const SitterProfile = require("../models/SitterProfile.js"); 

// Ajouter un profile de sitter 
exports.ajouterSitterProfile = async (req, res) => { 
try { 
const nouvelSitterProfile = new SitterProfile(req.body); 
await nouvelSitterProfile.save(); 
res.status(201).json(nouvelSitterProfile); 
} catch (err) { 
res.status(400).json({ message: "Erreur d’ajout", error: 
err.message }); 
} 
}; 

exports.register = async (req, res) => { 
  try { 
    const { nom, tarifHoraire, experience, noteMoyenne, disponibilités, certification} = req.body; 
 
    const userExiste = await SitterProfile.findOne({ nom }); 
    if (userExiste) { 
      return res.status(400).json({ message: "Nom déjà utilisé" 
}); 
    } 
 
    const sitterProfile = await SitterProfile.create({ 
      nom,
      tarifHoraire,  
      experience,  
      noteMoyenne,
      disponibilités,
      certification,
      image: req.file ? req.file.filename : null 
    }); 
 
    res.status(201).json(
      {
       _id: sitterProfile._id, 
      nom: sitterProfile.nom,
      tarifHoraire: sitterProfile.tarifHoraire, 
      experience: sitterProfile.experience,
      noteMoyenne: sitterProfile.noteMoyenne,
      disponibilités: sitterProfile.disponibilités,
      certification: sitterProfile.certification,
      image: sitterProfile.image, 
    }

    ); 
 
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  } 
}; 




// Récupérer tous les profils de sitter 
exports.listerSitterProfiles = async (req, res) => { 
  try { 
    const sitterProfiles = await SitterProfile.find(); 
    res.json(sitterProfiles); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}; 
 
// Récupérer un profil de sitter par ID 
exports.getSitterProfileById = async (req, res) => { 
  try { 
    const sitterProfiles = await SitterProfile.findById(req.params.id); 
 
    if (!sitterProfiles) { 
      return res.status(404).json({ message: "Profil de sitter non trouvé" }); 
    } 
 
    res.json(sitterProfiles); 
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
        new: true,          // retourne le document mis à jour 
        runValidators: true // applique les validations du schema 
      } 
    ); 
 
    if (!updatedSitter) { 
      return res.status(404).json({ message: "Profil de sitter non trouvé" }); 
    } 
 
    res.json(updatedSitter); 
  } catch (err) { 
    res.status(400).json({ message: "Erreur de mise à jour", error: 
err.message }); 
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
    res.status(500).json({ message: "Erreur de suppression", error: 
err.message }); 
  } 
}; 