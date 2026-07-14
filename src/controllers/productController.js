const { prisma } = require('../config/database');

// GET /api/products - liste publique avec filtres optionnels
const getProducts = async (req, res) => {
  try {
    const { category, brand, search, page: pageStr, limit: limitStr } = req.query;
    const page = Math.max(1, parseInt(pageStr) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr) || 12));
    const skip = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.product.count({ where }),
    ]);

    res.json({
      status: 'ok',
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération des produits' });
  }
};

// GET /api/products/:id - détail public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Produit introuvable' });
    }

    res.json({ status: 'ok', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération du produit' });
  }
};

// POST /api/products - création (protégée)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, image, stock } = req.body;

    if (!name || !description || !price || !category || !brand || !image) {
      return res.status(400).json({ status: 'error', message: 'Champs requis manquants' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price),
        category,
        brand,
        image,
        stock: stock ? parseInt(stock) : 0,
        updatedAt: new Date(),
      },
    });

    res.status(201).json({ status: 'ok', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la création du produit' });
  }
};

// PUT /api/products/:id - mise à jour (protégée)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, brand, image, stock } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Produit introuvable' });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(category !== undefined && { category }),
        ...(brand !== undefined && { brand }),
        ...(image !== undefined && { image }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        updatedAt: new Date(),
      },
    });

    res.json({ status: 'ok', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la mise à jour du produit' });
  }
};

// DELETE /api/products/:id - suppression (protégée)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Produit introuvable' });
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });

    res.json({ status: 'ok', message: 'Produit supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la suppression du produit' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
