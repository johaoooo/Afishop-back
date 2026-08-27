const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Token invalide ou expiré' });
  }
};

const ADMIN_EMAILS = ['admin@aficollection.com', 'josephdehazounde@gmail.com'];

const authorize = (...roles) => {
  return (req, res, next) => {
    const isSpecialAdmin = req.user && req.user.email && ADMIN_EMAILS.includes(req.user.email.toLowerCase());
    if (!roles.includes(req.user.role) && !isSpecialAdmin) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
