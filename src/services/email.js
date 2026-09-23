const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendPasswordReset(email, token) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('ℹ️ [Email Service] SMTP non configuré, email de réinitialisation ignoré.');
    return;
  }
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
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('ℹ️ [Email Service] SMTP non configuré, email de confirmation ignoré.');
    return;
  }
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

async function sendVerificationEmail(email, token, userName) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('ℹ️ [Email Service] SMTP non configuré, email de vérification ignoré.');
    return;
  }
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verifier-email?token=${token}&email=${encodeURIComponent(email)}`;
  try {
    await transporter.sendMail({
      from: `"AFI Collection" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Activez votre compte - AFI Collection',
      html: `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: #1a6b3c; padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.05em; font-weight: 700;">AFI COLLECTION</h1>
          <p style="color: #d1fae5; margin: 6px 0 0; font-size: 13px;">L'Élégance Artisanale Africaine</p>
        </div>
        <div style="padding: 32px 24px; color: #1f2937;">
          <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #111827;">Bienvenue, ${userName || 'cher client'} !</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            Merci pour votre inscription sur <strong>AFI Collection</strong>. Pour des raisons de sécurité et pour finaliser l'ouverture de votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #1a6b3c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(26, 107, 60, 0.3);">
              Confirmer mon adresse email
            </a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #6b7280; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br>
            <a href="${verifyUrl}" style="color: #1a6b3c; word-break: break-all;">${verifyUrl}</a>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
            Ce lien est valable pendant 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.
          </p>
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
          © ${new Date().getFullYear()} Maison AFI Collection. Tous droits réservés.
        </div>
      </div>`,
    });
    console.log('✅ Verification email sent to', email);
  } catch (err) {
    console.error('❌ Verification email error:', err.message);
  }
}

module.exports = { sendPasswordReset, sendOrderConfirmation, sendVerificationEmail };
