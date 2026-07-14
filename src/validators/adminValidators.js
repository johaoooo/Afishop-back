const { z } = require('zod');

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Rôle invalide' }) }).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { updateUserSchema };
