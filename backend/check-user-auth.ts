import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserAuth() {
  const email = 'raufulalam15@gmail.com';
  
  );
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { authProvider: true },
  });

  if (!user) {
    await prisma.$disconnect();
    return;
  }

  }`);
  
  if (user.authProvider.code === 'google') {
    } else {
    }
  
  );
  await prisma.$disconnect();
}

checkUserAuth().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
