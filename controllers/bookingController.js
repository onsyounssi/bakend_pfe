// controllers/bookingController.js 
const Booking = require("../models/Booking.js"); 



// Ajouter un réservation 
exports.ajouterBooking = async (req, res) => { 
try { 
const nouvelBooking = new SitterProfile(req.body); 
await nouvelBooking.save(); 
res.status(201).json(nouvelBooking); 
} catch (err) { 
res.status(400).json({ message: "Erreur d’ajout", error: 
err.message }); 
} 
}; 


// Récupérer tous les réservations 
exports.listerBookings = async (req, res) => { 
  try { 
    const bookings = await Booking.find(); 
    res.json(bookings); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
}; 
 
// Récupérer un réservation par ID 
exports.getBookingById = async (req, res) => { 
  try { 
    const bookings = await Booking.findById(req.params.id); 
 
    if (!bookings) { 
      return res.status(404).json({ message: "réservation non trouvé" }); 
    } 
 
    res.json(bookings); 
  } catch (err) { 
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message }); 
  } 
}; 
 
// Mettre à jour un réservation
exports.updateBooking = async (req, res) => { 
  try { 
    const updatedBooking = await Booking.findByIdAndUpdate( 
      req.params.id, 
      req.body, 
      { 
        new: true,          // retourne le document mis à jour 
        runValidators: true // applique les validations du schema 
      } 
    ); 
 
    if (!updatedBooking) { 
      return res.status(404).json({ message: "réservation non trouvé" }); 
    } 
 
    res.json(updatedBooking); 
  } catch (err) { 
    res.status(400).json({ message: "Erreur de mise à jour", error: 
err.message }); 
  } 
}; 
 
// Supprimer un réservation 
exports.deleteBooking = async (req, res) => { 
  try { 
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id); 
 
    if (!deletedBooking) { 
      return res.status(404).json({ message: "réservation non trouvé" }); 
    } 
 
    res.json({ message: "réservation supprimé avec succès" }); 
  } catch (err) { 
    res.status(500).json({ message: "Erreur de suppression", error: 
err.message }); 
  } 
}; 