import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Demo@123', 12);
  const user = await prisma.user.update({ 
    where: { email: 'demo@example.com' }, 
    data: { 
      password: hash, 
      isVerified: true, 
      isActive: true 
    }
  });
  }

main().finally(() => prisma.$disconnect());
