const { z } = require('zod');

const createMessageSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(200),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(5000),
  subBrand: z.string().optional(),
});

module.exports = { createMessageSchema };
