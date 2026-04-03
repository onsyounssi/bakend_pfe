// controllers/bookingController.js
const Booking = require("../models/Booking.js");
const SitterProfile = require("../models/SitterProfile.js");

// ─────────────────────────────────────────────
// Créer une réservation (Parent)
// ─────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Erreur createBooking:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer les réservations d'un parent
// ─────────────────────────────────────────────
exports.getBookingsByParent = async (req, res) => {
  try {
    const parentId = req.user.id;
    const bookings = await Booking.find({ parentId })
      .populate("sitterProfileId", "nom image tarifHoraire localisation")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer les réservations d'un baby-sitter
// ─────────────────────────────────────────────
exports.getBookingsBySitter = async (req, res) => {
  try {
    const sitterId = req.user.id;
    const bookings = await Booking.find({ sitterId })
      .populate("parentId", "firstName lastName phone email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Mettre à jour le statut d'une réservation
// ─────────────────────────────────────────────
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const allowed = ["pending", "confirmed", "completed", "cancelled"];
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
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer toutes les réservations (admin)
// ─────────────────────────────────────────────
exports.listerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("parentId", "firstName lastName email")
      .populate("sitterProfileId", "nom tarifHoraire")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// Récupérer une réservation par ID
// ─────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("parentId", "firstName lastName email phone")
      .populate("sitterProfileId", "nom tarifHoraire localisation");
    if (!booking) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// ─────────────────────────────────────────────
// Supprimer une réservation
// ─────────────────────────────────────────────
exports.deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    res.json({ message: "Réservation supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

// Alias pour compatibilité ancienne route
exports.ajouterBooking = exports.createBooking;
exports.updateBooking = exports.updateBookingStatus;
