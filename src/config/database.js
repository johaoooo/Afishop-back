const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = { prisma };
