// routes/sitterProfileRoutes.js
const express = require("express");
const router = express.Router();
const sitterProfileController = require("../controllers/sitterProfileController.js");
const upload = require("../middlewares/uploadMiddleware.js");
const { protect } = require("../middlewares/authMiddleware.js");

// Route publique: lister tous les profils (pour la page de recherche)
router.get("/", sitterProfileController.listerSitterProfiles);

// Route protégée: récupérer le profil du sitter connecté
router.get("/me", protect, sitterProfileController.getMyProfile);

// Route protégée: créer son profil sitter (avec upload photo)
router.post("/register", protect, upload.single("image"), sitterProfileController.register);

// Route admin: ajouter manuellement
router.post("/ajouter", sitterProfileController.ajouterSitterProfile);

// Routes CRUD
router.get("/:id", sitterProfileController.getSitterProfileById);
router.put("/:id", protect, upload.single("image"), sitterProfileController.updateSitterProfile);
router.delete("/:id", protect, sitterProfileController.deleteSitterProfile);

module.exports = router;