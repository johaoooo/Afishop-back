require('dotenv').config();
const path = require('path');
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
  origin: (origin, callback) => {
    // Autorise localhost, Vercel (toutes URLs .vercel.app), domaines aficollection et absence d'origin (outils API)
    if (
      !origin ||
      origin.endsWith('.vercel.app') ||
      origin.includes('aficollection') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Middlewares de sécurité
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cloudinary', require('./routes/cloudinaryRoutes'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/upload', require('./routes/uploadRoutes'));

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

