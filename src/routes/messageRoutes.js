const express = require('express');
const router = express.Router();
const { createMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createMessageSchema } = require('../validators/messageValidators');

router.post('/', validate(createMessageSchema), createMessage);
router.get('/', authenticate, authorize('admin'), getMessages);
router.patch('/:id/read', authenticate, authorize('admin'), markAsRead);

module.exports = router;
