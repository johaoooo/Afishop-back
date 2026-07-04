// Enveloppe une fonction async de contrôleur pour transmettre automatiquement
// toute erreur au middleware errorHandler, sans try/catch répété partout.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
