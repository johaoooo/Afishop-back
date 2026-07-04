// Middleware générique : valide req.body contre un schéma Zod donné
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ status: 'error', message: 'Données invalides', errors });
  }

  req.body = result.data; // remplace par les données validées/nettoyées
  next();
};

module.exports = validate;
