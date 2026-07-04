// Middleware global de gestion d'erreurs — doit être ajouté en dernier dans app.js
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Erreurs Prisma connues (ex: contrainte unique violée)
  if (err.code === 'P2002') {
    return res.status(409).json({ status: 'error', message: 'Cette valeur existe déjà (conflit d\'unicité)' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ status: 'error', message: 'Ressource introuvable' });
  }

  // Erreur JSON malformé envoyé par le client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'Corps de requête JSON invalide' });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Erreur interne du serveur' : err.message,
  });
};

// Middleware pour les routes non trouvées (404)
const notFound = (req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.originalUrl} introuvable` });
};

module.exports = { errorHandler, notFound };
