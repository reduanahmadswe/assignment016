import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function disableOTP() {
  const email = 'info.reduanahmad@gmail.com';
  
  await prisma.user.update({
    where: { email },
    data: { emailOtpEnabled: false },
  });
  
  await prisma.$disconnect();
}

disableOTP();
