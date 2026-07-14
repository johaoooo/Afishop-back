const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(200),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(5000),
  price: z.coerce.number().positive('Le prix doit être positif'),
  category: z.string().min(1, 'La catégorie est requise'),
  brand: z.string().min(1, 'La marque est requise'),
  image: z.string().url('L\'image doit être une URL valide').or(z.string().min(1, 'L\'image est requise')),
  stock: z.coerce.number().int().min(0, 'Le stock ne peut pas être négatif').default(0),
});

const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.coerce.number().positive().optional(),
  category: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  image: z.string().url().or(z.string().min(1)).optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

module.exports = { createProductSchema, updateProductSchema };
