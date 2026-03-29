const mongoose = require("mongoose");

const SitterProfileSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    image: { type: String },
    localisation: { type: String }, // Ex: "Tunis 15ème"
    specialite: { type: String },   // Ex: "Nourrissons (0-2 ans)"
    description: { type: String },  // Le texte de présentation
    tarifHoraire: { type: Number, required: true }, // Utiliser Number pour les calculs
    experience: { type: String },   // Ex: "5 ans d'expérience"
    noteMoyenne: { type: Number, default: 0 },
    nbAvis: { type: Number, default: 0 },
    langues: [{ type: String }],    // Array: ["Français", "Anglais"]
    certification: { type: Number },
    // On stocke les dispo sous forme d'objet pour plus de flexibilité
    disponibilites: {
        lun: { type: Boolean, default: false },
        mar: { type: Boolean, default: false },
        mer: { type: Boolean, default: false },
        jeu: { type: Boolean, default: false },
        ven: { type: Boolean, default: false },
        sam: { type: Boolean, default: false },
        dim: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model("SitterProfile", SitterProfileSchema);