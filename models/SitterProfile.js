// models/SitterProfile.js
const mongoose = require("mongoose");

const SitterProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true }, // lien vers le compte User
    nom: { type: String, required: true },
    image: { type: String },
    localisation: { type: String },
    specialite: { type: String },
    description: { type: String },
    tarifHoraire: { type: Number, required: true },
    experience: { type: String },
    noteMoyenne: { type: Number, default: 0 },
    nbAvis: { type: Number, default: 0 },
    langues: [{ type: String }],
    certification: { type: Number },
    disponibilites: {
      lun: { type: Boolean, default: false },
      mar: { type: Boolean, default: false },
      mer: { type: Boolean, default: false },
      jeu: { type: Boolean, default: false },
      ven: { type: Boolean, default: false },
      sam: { type: Boolean, default: false },
      dim: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SitterProfile", SitterProfileSchema);