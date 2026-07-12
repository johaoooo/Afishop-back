const { prisma } = require('../config/database');

// ============================================================
// STATISTIQUES
// ============================================================
const getStats = async (req, res) => {
  try {
    const [users, products, orders, messages, trainings] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.message.count(),
      prisma.training.count(),
    ]);

    const revenueResult = await prisma.order.aggregate({
      where: { status: { in: ['paid', 'delivered'] } },
      _sum: { total: true },
    });

    res.json({
      status: 'ok',
      users,
      products,
      orders,
      messages,
      trainings,
      revenue: revenueResult._sum.total || 0,
    });
  } catch (error) {
    console.error('❌ Erreur getStats:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================================
// UTILISATEURS
// ============================================================
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: 'ok', users });
  } catch (error) {
    console.error('❌ Erreur getUsers:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================================
// UPDATE UTILISATEUR
// ============================================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Convertir l'ID en nombre
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'ID invalide' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ status: 'ok', user });
  } catch (error) {
    console.error('❌ Erreur updateUser:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================================
// DELETE UTILISATEUR
// ============================================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Convertir l'ID en nombre
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ status: 'error', message: 'ID invalide' });
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression d'un admin
    if (existingUser.role === 'admin') {
      return res.status(403).json({ status: 'error', message: 'Impossible de supprimer un administrateur' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ status: 'ok', message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur deleteUser:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ============================================================
// INIT PREMIER ADMIN
// ============================================================
const initAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email requis' });
    }

    // Vérifier qu'aucun admin n'existe déjà
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      return res.status(403).json({ status: 'error', message: 'Un administrateur existe déjà' });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Aucun utilisateur trouvé avec cet email' });
    }

    // Promouvoir en admin
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    res.json({
      status: 'ok',
      message: `Utilisateur ${updated.email} promu administrateur`,
      user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
    });
  } catch (error) {
    console.error('❌ Erreur initAdmin:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getStats, getUsers, updateUser, deleteUser, initAdmin };
