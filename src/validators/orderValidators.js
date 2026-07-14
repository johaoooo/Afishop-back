const { z } = require('zod');

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive('ID produit invalide'),
      quantity: z.number().int().positive('La quantité doit être supérieure à 0'),
    })
  ).min(1, 'La commande doit contenir au moins un article'),
  street: z.string().min(2, 'L\'adresse est requise').max(500),
  city: z.string().min(2, 'La ville est requise').max(200),
  postalCode: z.string().min(1, 'Le code postal est requis').max(20),
  country: z.string().min(1, 'Le pays est requis').max(100),
  phone: z.string().min(5, 'Le téléphone est requis').max(30),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Statut invalide' }),
  }),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
