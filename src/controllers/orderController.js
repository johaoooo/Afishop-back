const { prisma } = require('../config/database');
const { sendOrderConfirmation } = require('../services/email');

// POST /api/orders - créer une commande (protégée)
// Body attendu: { items: [{ productId, quantity }, ...], street, city, postalCode, country, phone }
const createOrder = async (req, res) => {
  try {
    const { items, street, city, postalCode, country, phone } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'La commande doit contenir au moins un article' });
    }

    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new Error(`Produit ${item.productId} introuvable`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour "${product.name}" (disponible: ${product.stock})`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity }, updatedAt: new Date() },
        });

        total += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: 'pending',
          street,
          city,
          postalCode,
          country,
          phone,
          OrderItem: { create: orderItemsData },
        },
        include: { OrderItem: { include: { Product: true } } },
      });

      return newOrder;
    });

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const items = order.OrderItem.map((oi) => ({
          productId: oi.productId,
          quantity: oi.quantity,
          price: oi.price,
          name: oi.Product?.name,
        }));
        await sendOrderConfirmation(user.email, { ...order, items }, user.name).catch(() => {});
      }
    } catch (_) {}

    res.status(201).json({ status: 'ok', order });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: 'error', message: error.message || 'Erreur lors de la création de la commande' });
  }
};

// GET /api/orders - commandes de l'utilisateur connecté
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { OrderItem: { include: { Product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ status: 'ok', count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération des commandes' });
  }
};

// GET /api/orders/admin/all - toutes les commandes du site (admin uniquement)
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        User: { select: { id: true, name: true, email: true } },
        OrderItem: { include: { Product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ status: 'ok', count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération des commandes' });
  }
};

// GET /api/orders/:id - détail d'une commande (protégée, propriétaire uniquement)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { OrderItem: { include: { Product: true } } },
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Commande introuvable' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Accès refusé' });
    }

    res.json({ status: 'ok', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération de la commande' });
  }
};

// PATCH /api/orders/:id/status - mise à jour du statut (admin uniquement, utile après paiement Kkiapay)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Statut invalide' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status, updatedAt: new Date() },
    });

    res.json({ status: 'ok', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la mise à jour du statut' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders };
