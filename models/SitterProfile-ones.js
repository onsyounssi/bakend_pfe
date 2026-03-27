
// models/SitterProfile.js 
const mongoose = require("mongoose");

const SitterProfileSchema = new mongoose.Schema(
    {
    nom:{ type:String, required: true},
    tarifHoraire: {
        type: String,
        required: true 
    },
    experience: { type: String, },
    noteMoyenne:{
        type: Number},
    estVerifie: {
        type: Boolean }, 
            
    disponibilités:{
        type: String
    },
    certification:{ type: Number},
     image: { type: String },  

}, { timestamps: true });

module.exports = mongoose.model("SitterProfile", SitterProfileSchema);