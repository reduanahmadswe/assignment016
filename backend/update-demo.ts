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
  console.log('✅ Demo user updated!');
  console.log('Email:', user.email);
  console.log('isVerified:', user.isVerified);
  console.log('isActive:', user.isActive);
}

main().finally(() => prisma.$disconnect());
