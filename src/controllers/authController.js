const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { prisma } = require('../config/database');
const { sendPasswordReset, sendVerificationEmail } = require('../services/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const ADMIN_EMAILS = ['admin@aficollection.com', 'josephdehazounde@gmail.com'];

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ status: 'error', message: 'Email, mot de passe et nom sont requis' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'Un compte existe déjà avec cet email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';

    // Génération du jeton de vérification d'email (valable 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isVerified: false,
        verificationToken,
        verificationExpires,
        updatedAt: new Date(),
      },
    });

    // Envoi de l'email de bienvenue avec lien d'activation
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (mailErr) {
      console.error('[Auth Register] Erreur envoi email activation:', mailErr.message);
    }

    res.status(201).json({
      status: 'ok',
      requiresVerification: true,
      message: 'Compte créé avec succès ! Un e-mail d\'activation vous a été envoyé. Veuillez vérifier votre boîte de réception pour activer votre compte.',
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de l\'inscription' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email et mot de passe sont requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Identifiants invalides' });
    }

    if (!user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce compte a été créé avec Google. Veuillez vous connecter avec le bouton Google.',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: 'error', message: 'Identifiants invalides' });
    }

    // Vérification de l'activation de l'adresse email (sauf pour les admins de secours)
    if (!user.isVerified && !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return res.status(403).json({
        status: 'error',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez votre boîte de réception ou demandez un nouveau lien.',
        email: user.email,
      });
    }

    if (ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin', updatedAt: new Date() },
      });
    }

    const token = generateToken(user);

    res.json({
      status: 'ok',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la connexion' });
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    });
    res.json({ status: 'ok', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur introuvable' });
    }

    const dataToUpdate = { updatedAt: new Date() };

    if (name) {
      dataToUpdate.name = name;
    }

    if (avatar !== undefined) {
      dataToUpdate.avatar = avatar;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ status: 'error', message: 'Le mot de passe actuel est requis pour le changer' });
      }
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ status: 'error', message: 'Mot de passe actuel incorrect' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ status: 'error', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    });

    res.json({ status: 'ok', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la mise à jour du profil' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 'error', message: 'Email requis' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ status: 'ok', message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await sendPasswordReset(email, token);
    res.json({ status: 'ok', message: 'Email envoyé ! Vérifiez votre boîte de réception.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de l\'envoi de l\'email' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Email, token et nouveau mot de passe requis' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ status: 'error', message: 'Lien invalide ou expiré' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ status: 'ok', message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la réinitialisation' });
  }
};

const setupAdmin = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('Admin@Afi2026!', 10);
    const emails = ['admin@aficollection.com', 'josephdehazounde@gmail.com'];
    const updatedUsers = [];

    for (const email of emails) {
      const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'admin', password: hashedPassword, updatedAt: new Date() },
        create: {
          email,
          name: email.startsWith('admin') ? 'Admin AFI' : 'Dehazounde Joseph',
          password: hashedPassword,
          role: 'admin',
          updatedAt: new Date(),
        },
      });
      updatedUsers.push({ id: user.id, email: user.email, role: user.role });
    }

    res.json({ status: 'ok', message: 'Administrateurs configurés avec succès', users: updatedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body?.token;
    const email = req.query.email || req.body?.email;

    if (!token) {
      return res.status(400).json({ status: 'error', message: 'Jeton de vérification requis' });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        ...(email ? { email } : {}),
      },
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Lien de confirmation invalide ou déjà utilisé' });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res.status(400).json({ status: 'error', message: 'Ce lien de confirmation a expiré. Veuillez demander un nouvel email.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
        updatedAt: new Date(),
      },
    });

    const sessionToken = generateToken(updatedUser);

    res.json({
      status: 'ok',
      message: 'Votre compte a été activé avec succès !',
      token: sessionToken,
      user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, avatar: updatedUser.avatar },
    });
  } catch (error) {
    console.error('Erreur vérification email:', error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la vérification de l\'email' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Adresse email requise' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ status: 'ok', message: 'Si un compte existe avec cet email, un nouveau lien a été envoyé.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ status: 'error', message: 'Ce compte est déjà activé. Vous pouvez vous connecter.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
        updatedAt: new Date(),
      },
    });

    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (mailErr) {
      console.error('[Auth Resend] Erreur envoi email activation:', mailErr.message);
    }

    res.json({
      status: 'ok',
      message: 'Un nouvel email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.',
    });
  } catch (error) {
    console.error('Erreur renvoi vérification:', error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de l\'envoi de l\'email' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ status: 'error', message: 'Jeton Google requis' });
    }

    let payload;
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.error('[Google Auth] Erreur vérification token:', verifyErr.message);
        return res.status(401).json({ status: 'error', message: 'Jeton Google invalide ou expiré' });
      }
    } else {
      const decoded = jwt.decode(credential);
      if (!decoded || !decoded.email) {
        return res.status(400).json({ status: 'error', message: 'Impossible de décoder le jeton Google' });
      }
      payload = decoded;
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Adresse email introuvable dans le compte Google' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { googleId: googleId },
        ],
      },
    });

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          isVerified: true,
          avatar: user.avatar || picture || null,
          role: isAdmin ? 'admin' : user.role,
          updatedAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          avatar: picture || null,
          googleId,
          isVerified: true,
          role: isAdmin ? 'admin' : 'user',
          updatedAt: new Date(),
        },
      });
    }

    const token = generateToken(user);

    res.json({
      status: 'ok',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erreur Google Login:', error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la connexion Google' });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
  setupAdmin,
  verifyEmail,
  resendVerification,
};
