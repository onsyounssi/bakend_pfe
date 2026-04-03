const Message = require("../models/Message.js");

// Récupérer les messages pour un utilisateur spécifique
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    // On cherche les messages où l'user est soit l'envoyeur, soit le receveur
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .populate("senderId", "firstName lastName image")
    .populate("receiverId", "firstName lastName image")
    .sort({ createdAt: 1 }); // Tri chronologique pour le fil de discussion

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();

    // On renvoie le message avec les infos peuplées pour l'affichage immédiat
    const fullMessage = await Message.findById(newMessage._id)
      .populate("senderId", "firstName lastName image")
      .populate("receiverId", "firstName lastName image");

    res.status(201).json(fullMessage);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'envoi", error: err.message });
  }
};