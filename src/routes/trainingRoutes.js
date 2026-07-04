const express = require('express');
const router = express.Router();
const { getTrainings, getTrainingById, createTraining, updateTraining, deleteTraining } = require('../controllers/trainingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', getTrainings);
router.get('/:id', getTrainingById);
router.post('/', authenticate, authorize('admin'), createTraining);
router.put('/:id', authenticate, authorize('admin'), updateTraining);
router.delete('/:id', authenticate, authorize('admin'), deleteTraining);

module.exports = router;
