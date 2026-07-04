const express = require('express');
const router = express.Router();
const { createMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', createMessage);
router.get('/', authenticate, authorize('admin'), getMessages);
router.patch('/:id/read', authenticate, authorize('admin'), markAsRead);

module.exports = router;
