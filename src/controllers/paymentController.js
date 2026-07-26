const { kkiapay } = require('@kkiapay-org/nodejs-sdk');
const { prisma } = require('../config/database');

const isSandbox =
  process.env.KKIAPAY_SANDBOX === 'true' ||
  process.env.KKIAPAY_SANDBOX === '1' ||
  process.env.KKIAPAY_SANDBOX === true ||
  String(process.env.KKIAPAY_SANDBOX).toLowerCase() === 'true';

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY,
  publickey: process.env.KKIAPAY_PUBLIC_KEY,
  secretkey: process.env.KKIAPAY_SECRET,
  sandbox: isSandbox,
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
      return res.json({ status: 'ok', message: 'Commande déjà confirmée payée', order });
    }

    // 2. Vérification du paiement (FedaPay / Kkiapay / Sandbox)
    const isFedaPaySandbox = process.env.FEDAPAY_SANDBOX !== 'false';
    const fedapaySecretKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_wtOxPL085MeAxQfxr6a_f4Uh';
    const fedapayBaseUrl = isFedaPaySandbox ? 'https://sandbox-api.fedapay.com/v1' : 'https://api.fedapay.com/v1';

    // Verification FedaPay
    if (String(transactionId).startsWith('fedapay_') || String(transactionId).startsWith('test_') || !isNaN(Number(transactionId))) {
      const axios = require('axios');
      try {
        const fedaRes = await axios.get(`${fedapayBaseUrl}/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${fedapaySecretKey}` }
        });
        const fedaTx = fedaRes.data['v1/transaction'] || fedaRes.data.transaction || fedaRes.data;
        if (fedaTx && (fedaTx.status === 'approved' || fedaTx.status === 'transferred')) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid', updatedAt: new Date() },
          });
          return res.json({ status: 'ok', message: 'Paiement FedaPay confirmé', order: updatedOrder });
        }
      } catch (fedaError) {
        console.warn('[FedaPay Verify Warning]:', fedaError.message);
        if (isSandbox || isFedaPaySandbox) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid', updatedAt: new Date() },
          });
          return res.json({ status: 'ok', message: 'Paiement FedaPay Sandbox validé', order: updatedOrder });
        }
      }
    }

    // Verification Kkiapay
    let transaction = null;
    try {
      transaction = await k.verify(transactionId);
    } catch (kkiapayError) {
      console.warn('[Kkiapay Verify Warning]:', kkiapayError.message, 'mode Sandbox:', isSandbox);
      
      if (isSandbox) {
        console.log(`[Kkiapay Sandbox] Auto-validation de la commande #${order.id} pour transactionId=${transactionId}`);
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { status: 'paid', updatedAt: new Date() },
        });
        return res.json({ status: 'ok', message: 'Paiement Sandbox validé', order: updatedOrder });
      }

      return res.status(400).json({
        status: 'error',
        message: `Paiement non confirmé : ${kkiapayError.message || 'Transaction introuvable'}`,
      });
    }

    // 3. Vérifier le statut retourné par le SDK Kkiapay
    if (transaction && transaction.status !== 'SUCCESS') {
      return res.status(400).json({
        status: 'error',
        message: 'Paiement non confirmé par Kkiapay',
        paymentStatus: transaction.status,
      });
    }

    // 4. Vérifier le montant si disponible
    if (transaction && transaction.amount && transaction.amount < order.total) {
      return res.status(400).json({ status: 'error', message: 'Montant payé insuffisant par rapport à la commande' });
    }

    // 5. Marquer la commande comme payée
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid', updatedAt: new Date() },
    });

    res.json({ status: 'ok', message: 'Paiement confirmé', order: updatedOrder });
  } catch (error) {
    console.error('[Kkiapay Verify Fatal Error]:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur lors de la vérification du paiement' });
  }
};

module.exports = { verifyPayment };

