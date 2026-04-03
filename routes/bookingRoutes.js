// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController.js");
const { protect } = require("../middlewares/authMiddleware.js");

// Parent crée une réservation
router.post("/", protect, bookingController.createBooking);

// Récupérer les réservations du parent connecté
router.get("/parent/mes-reservations", protect, bookingController.getBookingsByParent);

// Récupérer les réservations du baby-sitter connecté
router.get("/sitter/mes-demandes", protect, bookingController.getBookingsBySitter);

// Mettre à jour le statut (sitter accepte/refuse ou parent annule)
router.put("/:id/status", protect, bookingController.updateBookingStatus);

// Admin: lister toutes les réservations
router.get("/", protect, bookingController.listerBookings);

// Récupérer une réservation par ID
router.get("/:id", protect, bookingController.getBookingById);

// Supprimer une réservation
router.delete("/:id", protect, bookingController.deleteBooking);

// Compatibilité ancienne route
router.post("/ajouter", protect, bookingController.createBooking);
router.put("/:id", protect, bookingController.updateBookingStatus);

module.exports = router;