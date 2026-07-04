const { kkiapay } = require('@kkiapay-org/nodejs-sdk');
const { prisma } = require('../config/database');

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY,
  publickey: process.env.KKIAPAY_PUBLIC_KEY,
  secretkey: process.env.KKIAPAY_SECRET,
  sandbox: process.env.KKIAPAY_SANDBOX === 'true',
});

// POST /api/payments/verify - appelé par le frontend après le widget Kkiapay
// Body attendu: { transactionId, orderId }
const verifyPayment = async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;
    const userId = req.user.id;

    if (!transactionId || !orderId) {
      return res.status(400).json({ status: 'error', message: 'transactionId et orderId sont requis' });
    }

    // 1. Vérifier que la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Commande introuvable' });
    }
    if (order.userId !== userId) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé' });
    }
    if (order.status === 'paid') {
      return res.status(409).json({ status: 'error', message: 'Commande déjà payée' });
    }

    // 2. Vérifier la transaction directement auprès de Kkiapay (jamais faire confiance au frontend seul)
    const transaction = await k.verify(transactionId);

    if (transaction.status !== 'SUCCESS') {
      return res.status(400).json({
        status: 'error',
        message: 'Paiement non confirmé par Kkiapay',
        paymentStatus: transaction.status,
      });
    }

    // 3. Vérifier que le montant payé correspond bien au total de la commande
    if (transaction.amount < order.total) {
      return res.status(400).json({ status: 'error', message: 'Montant payé insuffisant par rapport à la commande' });
    }

    // 4. Marquer la commande comme payée
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid', updatedAt: new Date() },
    });

    res.json({ status: 'ok', message: 'Paiement confirmé', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la vérification du paiement' });
  }
};

module.exports = { verifyPayment };
