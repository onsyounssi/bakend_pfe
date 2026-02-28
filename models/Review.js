// models/Review.js 
const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema(
    {
    note: {
        type: Number,
        required: true 
    },
    commentaire: { type: String, required: true },
    
    date:{
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);