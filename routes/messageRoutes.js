const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

// Optionnel: utiliser protect si le frontend envoie toujours le token pour la page message
router.post("/send", messageController.sendMessage);
router.get("/:userId", messageController.getMessages);

module.exports = router;
