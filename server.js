const express = require("express"); 
const cors = require("cors"); 
const dotenv = require("dotenv");
const path = require("path"); 
const connectDB = require("./config/db.js"); 
dotenv.config();


// Connexion BDD 
connectDB();

const app = express();

// Middleware

app.use(cors({
  
  origin: process.env.FRONTEND_URL ||'http://localhost:5173', // Your React app port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use(express.json()); 
app.use("/api/chat", chatRoutes);

// Lancer le serveur 
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
console.log(`Serveur lancé sur le port ${PORT}`);
});