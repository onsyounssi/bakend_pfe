// controllers/bookingController.js
const Booking = require("../models/Booking.js");
const SitterProfile = require("../models/SitterProfile.js");
const asyncHandler = require("../utils/asyncHandler.js");

// ─────────────────────────────────────────────
// Créer une réservation (Parent)
// ─────────────────────────────────────────────
exports.createBooking = asyncHandler(async (req, res) => {
  const { sitterProfileId, dateDebut, dateFin, message } = req.body;
  const parentId = req.user.id; // injecté par le middleware auth

  if (!sitterProfileId || !dateDebut || !dateFin) {
    return res.status(400).json({ message: "sitterProfileId, dateDebut et dateFin sont requis" });
  }

  // Récupérer le profil sitter pour obtenir son userId et tarifHoraire
  const sitterProfile = await SitterProfile.findById(sitterProfileId);
  if (!sitterProfile) {
    return res.status(404).json({ message: "Profil baby-sitter introuvable" });
  }

  // Calcul de la durée et du montant
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const heures = (fin - debut) / (1000 * 60 * 60);
  const montantTotale = Math.max(0, heures * sitterProfile.tarifHoraire);

  const booking = new Booking({
    parentId,
    sitterId: sitterProfile.userId || null,
    sitterProfileId,
    dateDebut: debut,
    dateFin: fin,
    message: message || "",
    montantTotale: parseFloat(montantTotale.toFixed(2)),
    statut: "pending",
  });

  await booking.save();

  res.status(201).json({ success: true, booking });
});

// ─────────────────────────────────────────────
// Récupérer les réservations d'un parent
// ─────────────────────────────────────────────
exports.getBookingsByParent = asyncHandler(async (req, res) => {
  const parentId = req.user.id;
  const bookings = await Booking.find({ parentId })
    .populate("sitterProfileId", "nom image tarifHoraire localisation")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// ─────────────────────────────────────────────
// Récupérer les réservations d'un baby-sitter
// ─────────────────────────────────────────────
exports.getBookingsBySitter = asyncHandler(async (req, res) => {
  const sitterId = req.user.id;
  const bookings = await Booking.find({ sitterId })
    .populate("parentId", "firstName lastName phone email")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// ─────────────────────────────────────────────
// Mettre à jour le statut d'une réservation
// ─────────────────────────────────────────────
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  const allowed = ["pending", "accepted", "confirmed", "completed", "cancelled"];
  if (!allowed.includes(statut)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { statut },
    { new: true }
  ).populate("parentId", "firstName lastName email phone");

  if (!booking) {
    return res.status(404).json({ message: "Réservation non trouvée" });
  }

  res.json({ success: true, booking });
});

// ─────────────────────────────────────────────
// Récupérer toutes les réservations (admin)
// ─────────────────────────────────────────────
exports.listerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("parentId", "firstName lastName email")
    .populate("sitterProfileId", "nom tarifHoraire")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// ─────────────────────────────────────────────
// Récupérer une réservation par ID
// ─────────────────────────────────────────────
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("parentId", "firstName lastName email phone")
    .populate("sitterProfileId", "nom tarifHoraire localisation");
  if (!booking) {
    return res.status(404).json({ message: "Réservation non trouvée" });
  }
  res.json(booking);
});

// ─────────────────────────────────────────────
// Supprimer une réservation
// ─────────────────────────────────────────────
exports.deleteBooking = asyncHandler(async (req, res) => {
  const deleted = await Booking.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Réservation non trouvée" });
  }
  res.json({ message: "Réservation supprimée avec succès" });
});

// Alias pour compatibilité ancienne route
exports.ajouterBooking = exports.createBooking;
exports.updateBooking = exports.updateBookingStatus;
