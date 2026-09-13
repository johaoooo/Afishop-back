const { z } = require('zod');

const historyItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1000),
});

const chatSchema = z.object({
  message: z.string().min(1, 'Le message est vide').max(1000, 'Message trop long (1000 caractères max)'),
  history: z.array(historyItemSchema).max(10).optional().default([]),
});

module.exports = { chatSchema };
