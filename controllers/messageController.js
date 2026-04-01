const Message = require("../models/Message.js");
const User = require("../models/Users.js");

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ message: "Expéditeur, destinataire et texte obligatoires." });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'envoi du message", error: err.message });
  }
};

// Récupérer les messages pour un utilisateur spécifique
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer tous les messages où l'utilisateur est soit expéditeur, soit destinataire
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate("senderId", "firstName lastName image").populate("receiverId", "firstName lastName image").sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des messages", error: err.message });
  }
};
