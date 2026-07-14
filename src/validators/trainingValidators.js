const { z } = require('zod');

const createTrainingSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(5000),
  duration: z.string().min(1, 'La durée est requise').max(100),
  price: z.coerce.number().positive('Le prix doit être positif'),
  modules: z.array(z.object({
    title: z.string().min(1),
    duration: z.string().optional(),
  })).optional(),
  students: z.coerce.number().int().min(0).optional(),
  image: z.string().url().or(z.string()).optional(),
  color: z.string().optional(),
});

const updateTrainingSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  duration: z.string().min(1).max(100).optional(),
  price: z.coerce.number().positive().optional(),
  modules: z.array(z.object({
    title: z.string().min(1),
    duration: z.string().optional(),
  })).optional(),
  students: z.coerce.number().int().min(0).optional(),
  image: z.string().url().or(z.string()).optional(),
  color: z.string().optional(),
});

module.exports = { createTrainingSchema, updateTrainingSchema };
