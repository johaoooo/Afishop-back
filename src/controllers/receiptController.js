const PDFDocument = require('pdfkit');
const axios = require('axios');
const { prisma } = require('../config/database');

const LOGO_URL = process.env.LOGO_URL || 'https://res.cloudinary.com/dzxesa3wi/image/upload/v1783162335/afiii_wqkawf.png';

const STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

// Vérifie les "magic bytes" pour confirmer que le buffer est bien un PNG ou un JPEG.
// pdfkit ne supporte que ces deux formats et plante sur tout le reste (WebP, SVG, HTML d'erreur...).
function isValidImageBuffer(buffer) {
  if (!buffer || buffer.length < 8) return false;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  return isPng || isJpeg;
}

async function fetchLogoSafely() {
  try {
    const response = await axios.get(LOGO_URL, { responseType: 'arraybuffer', timeout: 5000 });
    const buffer = Buffer.from(response.data);
    return isValidImageBuffer(buffer) ? buffer : null;
  } catch (e) {
    console.error('Logo indisponible pour le reçu, génération sans logo:', e.message);
    return null;
  }
}

// GET /api/orders/:id/receipt - génère et télécharge le reçu PDF d'une commande payée
const downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        User: { select: { id: true, name: true, email: true } },
        OrderItem: { include: { Product: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Commande introuvable' });
    }
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Accès refusé' });
    }
    if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ status: 'error', message: 'Le reçu n\'est disponible que pour une commande payée' });
    }

    const logoBuffer = await fetchLogoSafely();

    // Génération en mémoire (pas en streaming direct) : si quoi que ce soit échoue,
    // on peut encore renvoyer une erreur JSON proprement, sans avoir déjà entamé la réponse HTTP.
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        if (logoBuffer) {
          doc.image(logoBuffer, 50, 45, { width: 90 });
        }
        doc
          .fontSize(20)
          .fillColor('#1a6b3c')
          .text('AFI Collection', logoBuffer ? 160 : 50, 50)
          .fontSize(9)
          .fillColor('#666666')
          .text('Cotonou, Bénin', logoBuffer ? 160 : 50, 75)
          .text('contact@aficollection.com', logoBuffer ? 160 : 50, 88);

        doc
          .fontSize(16)
          .fillColor('#111111')
          .text('Reçu de paiement', 50, 150);

        doc
          .fontSize(10)
          .fillColor('#666666')
          .text(`Commande #${order.id}`, 50, 175)
          .text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, 190)
          .text(`Statut : ${STATUS_LABELS[order.status] || order.status}`, 50, 205);

        doc
          .fontSize(10)
          .fillColor('#666666')
          .text('Facturé à :', 350, 175)
          .fillColor('#111111')
          .text(order.User?.name || '—', 350, 190)
          .fillColor('#666666')
          .text(order.User?.email || '—', 350, 203);

        doc.moveTo(50, 235).lineTo(545, 235).strokeColor('#e0e0e0').stroke();

        let y = 250;
        doc
          .fontSize(9)
          .fillColor('#999999')
          .text('ARTICLE', 50, y)
          .text('QTÉ', 340, y, { width: 50, align: 'right' })
          .text('PRIX UNIT.', 400, y, { width: 70, align: 'right' })
          .text('TOTAL', 480, y, { width: 65, align: 'right' });

        y += 20;
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e0e0e0').stroke();
        y += 15;

        order.OrderItem.forEach((item) => {
          const lineTotal = item.price * item.quantity;
          doc
            .fontSize(10)
            .fillColor('#111111')
            .text(item.Product?.name || 'Produit supprimé', 50, y, { width: 280 })
            .text(String(item.quantity), 340, y, { width: 50, align: 'right' })
            .text(`${item.price.toLocaleString('fr-FR')} F`, 400, y, { width: 70, align: 'right' })
            .text(`${lineTotal.toLocaleString('fr-FR')} F`, 480, y, { width: 65, align: 'right' });
          y += 25;
        });

        y += 10;
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e0e0e0').stroke();
        y += 20;

        doc
          .fontSize(12)
          .fillColor('#1a6b3c')
          .font('Helvetica-Bold')
          .text('Total payé', 350, y, { width: 120, align: 'right' })
          .text(`${order.total.toLocaleString('fr-FR')} FCFA`, 480, y, { width: 65, align: 'right' });

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#999999')
          .text(
            'Merci pour votre confiance. Ce reçu confirme la réception de votre paiement par AFI Collection.',
            50,
            750,
            { width: 495, align: 'center' }
          );

        doc.end();
      } catch (innerError) {
        reject(innerError);
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="recu-commande-${order.id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Erreur lors de la génération du reçu' });
    }
  }
};

module.exports = { downloadReceipt };
