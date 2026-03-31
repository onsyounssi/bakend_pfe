// models/Booking.js 
const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema(
    {
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sitterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        dateDebut: {
            type: Date,
            required: true
        },
        dateFin: { type: Date, required: true },
        statut: {
            type: String, enum: ['pending', 'confirmed', 'completed'],
            default: 'pending'
        },
        montantTotale: {
            type: Number
        },
    }, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);