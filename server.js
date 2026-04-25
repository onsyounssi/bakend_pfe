const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const keystripe = "sk_test_51TEuEjF6c29lnWPAQ7tzDdFIe556b3lyMU3mvdKGD6g6q7wZMnGnXF1DMUFYGGiyIK8YMc4QGGjiou7GX6ygo28N00nvE22FDQ"
const stripe = require("stripe")(keystripe);
const connectDB = require("./config/db.js");
const asyncHandler = require("./utils/asyncHandler.js");
const errorMiddleware = require("./middlewares/errorMiddleware.js");
dotenv.config();



// Connexion BDD 
connectDB();

const app = express();

// Middleware

app.use(cors({

  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your React app port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/create-checkout-session', asyncHandler(async (req, res) => {
  const { booking } = req.body;

  if (!booking || !booking.montantTotale) {
    return res.status(400).json({ error: "Booking data with montantTotale is required" });
  }

  // Stripe expects the amount in cents (lowest denomination)
  const amountInCents = Math.round(booking.montantTotale * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: "Réservation SmartBabyCare",
            description: `Garde du ${new Date(booking.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(booking.dateFin).toLocaleDateString('fr-FR')}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking._id || booking.id,
      parentId: booking.parentId,
    },
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?BookingId=${booking._id || booking.id}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
  });

  res.json({ url: session.url });
}));
// Routes 
const usersRoutes = require("./routes/usersRoutes.js");
app.use("/api/Users", usersRoutes);



app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const sitterProfileRoutes = require("./routes/sitterProfileRoutes.js");
app.use("/api/SitterProfiles", sitterProfileRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const reviewRoutes = require("./routes/reviewRoutes.js");
app.use("/api/Reviews", reviewRoutes);

const bookingRoutes = require("./routes/bookingRoutes.js");
app.use("/api/Bookings", bookingRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

const messageRoutes = require("./routes/messageRoutes.js");
app.use("/api/Messages", messageRoutes);

app.use(errorMiddleware);

// Lancer le serveur 
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
  
  // Test de la connexion SMTP au démarrage
  const transporter = require("./config/mail.js");
  try {
    await transporter.verify();
    console.log("✅ Connexion SMTP réussie (Prêt à envoyer des emails)");
  } catch (err) {
    console.error("❌ Erreur de configuration SMTP dans .env :", err.message);
  }
});


