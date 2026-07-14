const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendPasswordReset(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  try {
    await transporter.sendMail({
      from: `"AFI Collection" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de mot de passe - AFI Collection',
      html: `...`,
    });
    console.log('✅ Email sent to', email);
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
}

async function sendOrderConfirmation(email, order, userName) {
  const itemsHtml = order.items?.map((item) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${item.name || `Produit #${item.productId}`}</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:center;">x${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:right;">${(item.price * item.quantity).toLocaleString('fr-FR')} F</td></tr>`
  ).join('');

  try {
    await transporter.sendMail({
      from: `"AFI Collection" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Confirmation de commande #${order.id} - AFI Collection`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
        <div style="background:#1a6b3c;padding:24px;text-align:center;border-radius:12px 12px 0 0;"><h1 style="color:white;margin:0;font-size:20px;">AFI Collection</h1></div>
        <div style="padding:32px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
          <h2 style="color:#111827;font-size:18px;margin:0 0 4px;">Merci ${userName} !</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Votre commande #${order.id} a bien été confirmée.</p>
          <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
          <div style="border-top:2px solid #1a6b3c;padding-top:12px;margin-top:12px;text-align:right;font-size:16px;font-weight:bold;color:#111827;">Total : ${order.total.toLocaleString('fr-FR')} FCFA</div>
        </div></div>`,
    });
    console.log('✅ Order email sent to', email);
  } catch (err) {
    console.error('❌ Order email error:', err.message);
  }
}

module.exports = { sendPasswordReset, sendOrderConfirmation };
