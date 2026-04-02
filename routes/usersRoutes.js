// routes/usersRoutes.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware");

// Mot de passe oublié / réinitialisation
router.post("/forgot-password", usersController.forgotPassword);
router.post("/reset-password/:token", usersController.resetPassword);

// Inscription publique
router.post("/register", usersController.register);

// Connexion publique
router.post("/login", usersController.login);

// Routes protégées admin
router.post(
  "/ajouter",
  upload.single("image"),
  protect,
  authorizeRoles("admin"),
  usersController.ajouterUtilisateur
);

router.get("/", protect, authorizeRoles("admin"), usersController.listerUtilisateurs);

// Routes protégées utilisateurs
router.get("/:id", protect, usersController.getUtilisateurById);
router.put("/:id", protect, usersController.updateUtilisateur);
router.delete("/:id", protect, authorizeRoles("admin"), usersController.deleteUtilisateur);

module.exports = router;
