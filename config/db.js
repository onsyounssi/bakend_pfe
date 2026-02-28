// config/db.js 
const mongoose = require("mongoose"); 
const dotenv = require("dotenv"); 

// Charger les variables d'envirBbddonnement AVANT de les utiliser
dotenv.config(); 

//connection à la base de données MongoDBà l'aide de Mongoose 
const connectDB = async () => { 
  
  try { 
     
    await mongoose.connect(process.env.MONGO_URI)  
    console.log("Connexion MongoDB réussie"); 
  } catch (err) { 
    console.error("Erreur de connexion MongoDB :", err.message); 
    process.exit(1); 
  } 
}; 

module.exports = connectDB;
