require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { prisma } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// ============================================================
// CORS - Configuration complète
// ============================================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Middlewares de sécurité
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Routes de test
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API AFI Collection opérationnelle' });
});

app.get('/health/db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', message: 'Connexion base de données OK', userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

// Route pour vérifier les variables d'environnement
app.get('/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'non défini',
    FRONTEND_URL: process.env.FRONTEND_URL || 'non défini',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Définie' : '❌ Non définie',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Défini' : '❌ Non défini',
    PORT: process.env.PORT || '5000',
  });
});
