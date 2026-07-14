const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  initAdmin,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { updateUserSchema } = require('../validators/adminValidators');

// Route publique : premier admin (ne fonctionne que s'il n'y a aucun admin)
router.post('/init', initAdmin);

// Toutes les routes admin ci-dessous sont protégées par authenticate + authorize('admin')
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', validate(updateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
