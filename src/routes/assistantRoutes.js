const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/assistantController');
const validate = require('../middlewares/validate');
const { chatSchema } = require('../validators/assistantValidators');
const { assistantLimiter } = require('../middlewares/rateLimiter');

router.post('/chat', assistantLimiter, validate(chatSchema), chat);

module.exports = router;
