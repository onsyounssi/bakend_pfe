const express = require("express"); 
const cors = require("cors"); 
const dotenv = require("dotenv"); 
const connectDB = require("./config/db.js"); 

dotenv.config();

// Connexion BDD 
connectDB();

const app = express();

// Middleware 
app.use(cors()); 
app.use(express.json());

// Routes 
const usersRoutes = require("./routes/usersRoutes.js");
app.use("/api/Users", usersRoutes);

const sitterProfileRoutes = require("./routes/sitterProfileRoutes.js");
app.use("/api/SitterProfiles", sitterProfileRoutes);

const reviewRoutes = require("./routes/reviewRoutes.js");
app.use("/api/Reviews", reviewRoutes);

const bookingRoutes = require("./routes/bookingRoutes.js");
app.use("/api/Bookings", bookingRoutes);

// Lancer le serveur 
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
console.log(`Serveur lancé sur le port ${PORT}`);
});