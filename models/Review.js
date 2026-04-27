// models/Review.js 
const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema(
    {
        sitterProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SitterProfile",
            required: true
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sitterName: { type: String }, // Nom du sitter au moment de l'avis
        note: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        commentaire: { type: String, required: true },
        auteur: { type: String, default: "Parent" },
        date: {
            type: Date,
            default: Date.now
        },
    }, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);