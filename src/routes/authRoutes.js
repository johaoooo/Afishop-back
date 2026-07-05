const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidators');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateProfile);

module.exports = router;
