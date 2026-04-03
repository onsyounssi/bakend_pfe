///// routes/reviewRoutes.js 
const express = require("express"); 
const router = express.Router(); 
const reviewController = require("../controllers/reviewController.js"); 
 
router.post("/ajouter", reviewController.ajouterReview); 
router.get("/", reviewController.listerReview); 
router.get("/:id", reviewController.getReviewById); 
router.put("/:id", reviewController.updateReview); 
router.delete("/:id", reviewController.deleteReview); 
module.exports = router; 