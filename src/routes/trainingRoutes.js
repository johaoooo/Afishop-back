const express = require('express');
const router = express.Router();
const { getTrainings, getTrainingById, createTraining, updateTraining, deleteTraining } = require('../controllers/trainingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createTrainingSchema, updateTrainingSchema } = require('../validators/trainingValidators');

router.get('/', getTrainings);
router.get('/:id', getTrainingById);
router.post('/', authenticate, authorize('admin'), validate(createTrainingSchema), createTraining);
router.put('/:id', authenticate, authorize('admin'), validate(updateTrainingSchema), updateTraining);
router.delete('/:id', authenticate, authorize('admin'), deleteTraining);

module.exports = router;
