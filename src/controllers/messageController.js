const { prisma } = require('../config/database');

// POST /api/messages - public (formulaire de contact)
const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, subBrand } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ status: 'error', message: 'Nom, email et message sont requis' });
    }
    const newMessage = await prisma.message.create({
      data: { name, email, phone, subject, message, subBrand },
    });
    res.status(201).json({ status: 'ok', message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de l\'envoi du message' });
  }
};

// GET /api/messages - admin uniquement
const getMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ status: 'ok', count: messages.length, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération des messages' });
  }
};

// PATCH /api/messages/:id/read - admin uniquement
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { read: true },
    });
    res.json({ status: 'ok', message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la mise à jour du message' });
  }
};

module.exports = { createMessage, getMessages, markAsRead };
