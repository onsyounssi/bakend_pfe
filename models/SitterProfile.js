
// models/SitterProfile.js 
const mongoose = require("mongoose");

const SitterProfileSchema = new mongoose.Schema(
    {
    tarifHoraire: {
        type: String,
        required: true 
    },
    competences: { type: String, required: true },
    biographie:{
        type: String},
    estVerifie: {
        type: Boolean }, 
            
    disponibilités:{
        type: String
    },
}, { timestamps: true });

module.exports = mongoose.model("SitterProfile", SitterProfileSchema);