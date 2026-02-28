///// routes/sitterProfileRoutes.js 
const express = require("express"); 
const router = express.Router(); 
const sitterProfileController = require("../controllers/sitterProfileController.js"); 
 
router.post("/ajouter", sitterProfileController.ajouterSitterProfile); 
router.get("/", sitterProfileController.listerSitterProfiles); 
router.get("/:id", sitterProfileController.getSitterProfileById); 
router.put("/:id", sitterProfileController.updateSitterProfile); 
router.delete("/:id", sitterProfileController.deleteSitterProfile); 
module.exports = router; 
