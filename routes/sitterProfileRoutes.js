// routes/sitterProfileRoutes.js
const express = require("express");
const router = express.Router();
const sitterProfileController = require("../controllers/sitterProfileController.js");
const upload = require("../middlewares/uploadMiddleware.js");

// Routes d'inscription et ajout
router.post("/register", upload.single("image"), sitterProfileController.register);
router.post("/ajouter", sitterProfileController.ajouterSitterProfile);

// Routes CRUD principales
router.get("/", sitterProfileController.listerSitterProfiles);
router.get("/:id", sitterProfileController.getSitterProfileById);
router.put("/:id", sitterProfileController.updateSitterProfile);
router.delete("/:id", sitterProfileController.deleteSitterProfile);

module.exports = router;