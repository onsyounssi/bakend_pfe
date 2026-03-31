///// routes/bookingRoutes.js 
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController.js");

router.post("/ajouter", bookingController.ajouterBooking);
router.get("/", bookingController.listerBookings);
router.get("/:id", bookingController.getBookingById);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);
module.exports = router; 
