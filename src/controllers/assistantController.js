const { chatWithAssistant } = require('../services/geminiService');

// POST /api/assistant/chat — conversation avec l'assistant AFI (public, limité)
async function chat(req, res, next) {
  try {
    const { message, history } = req.body;
    const reply = await chatWithAssistant(message, history || []);
    res.json({ status: 'ok', reply });
  } catch (error) {
    if (error.response?.data?.error?.message) {
      return res.status(502).json({ status: 'error', message: "Le service IA est momentanément indisponible, réessayez dans un instant." });
    }
    next(error);
  }
}

module.exports = { chat };
