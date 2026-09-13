const rateLimit = require('express-rate-limit');

// Limite stricte sur les routes sensibles (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives max par IP sur la fenêtre
  message: { status: 'error', message: 'Trop de tentatives, réessayez dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite plus large pour l'API générale
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { status: 'error', message: 'Trop de requêtes, réessayez plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite stricte pour l'assistant IA (coût API par appel)
const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 messages max par IP sur la fenêtre
  message: { status: 'error', message: 'Trop de messages, réessayez dans quelques minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, assistantLimiter };
