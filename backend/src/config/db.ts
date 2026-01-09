import { PrismaClient } from '@prisma/client';

// Create Prisma Client instance for SQLite
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
  errorFormat: 'pretty',
});

export const connectDB = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log(' Prisma Database connected successfully');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
