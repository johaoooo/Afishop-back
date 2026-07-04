const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Toutes les routes admin sont protégées par authenticate + authorize('admin')
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
