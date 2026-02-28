// models/Booking.js 
const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema(
    {
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: { type: Date, required: true },
    statut: {
        type: String, enum: ['pending', 'confirmed', 'completed'],
            default: 'pending'},
    montantTotale: {
        type: Number 
    },
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);