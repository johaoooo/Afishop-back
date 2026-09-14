const { prisma } = require('../config/database');

// La BDD stocke les modules en String[] : on normalise
// les objets { title } éventuels vers leur titre.
const normalizeModules = (modules) => {
  if (!Array.isArray(modules)) return [];
  return modules
    .map((m) => (typeof m === 'string' ? m.trim() : (m && m.title ? String(m.title).trim() : '')))
    .filter(Boolean);
};

const getTrainings = async (req, res) => {
  try {
    const trainings = await prisma.training.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ status: 'ok', count: trainings.length, trainings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération des formations' });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const training = await prisma.training.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!training) return res.status(404).json({ status: 'error', message: 'Formation introuvable' });
    res.json({ status: 'ok', training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la récupération de la formation' });
  }
};

const createTraining = async (req, res) => {
  try {
    const { title, description, duration, price, modules, students, image, color } = req.body;
    if (!title || !description || !duration || !price) {
      return res.status(400).json({ status: 'error', message: 'Champs requis manquants' });
    }
    const training = await prisma.training.create({
      data: {
        title, description, duration, price: String(price),
        modules: normalizeModules(modules),
        students: students ? parseInt(students) : 0,
        image: image || '',
        color: color || '',
        updatedAt: new Date(),
      },
    });
    res.status(201).json({ status: 'ok', training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la création de la formation' });
  }
};

const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.training.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Formation introuvable' });

    const { modules: rawModules, price: rawPrice, ...rest } = req.body;
    const training = await prisma.training.update({
      where: { id: parseInt(id) },
      data: { ...rest,
        ...(rawPrice !== undefined ? { price: String(rawPrice) } : {}),
        ...(rawModules !== undefined ? { modules: normalizeModules(rawModules) } : {}),
        updatedAt: new Date() },
    });
    res.json({ status: 'ok', training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la mise à jour de la formation' });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.training.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Formation introuvable' });

    await prisma.training.delete({ where: { id: parseInt(id) } });
    res.json({ status: 'ok', message: 'Formation supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur lors de la suppression de la formation' });
  }
};

module.exports = { getTrainings, getTrainingById, createTraining, updateTraining, deleteTraining };
