// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sitterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sitterProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "SitterProfile" },
    date: { type: Date, default: Date.now },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    statut: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    montantTotale: { type: Number, default: 0 },
    message: { type: String, default: "" }, // note/message du parent
    notificationRead: { type: Boolean, default: false }, // sitter a-t-il vu la notif ?
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);