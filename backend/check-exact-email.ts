import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmail() {
  try {
    // Search for emails containing "reduan"
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'reduan',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isVerified: true,
      },
    });

    with "reduan" in email:\n`);

    users.forEach((user) => {
      );
      });

    // Also check for "info" emails
    const infoUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: 'info',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isVerified: true,
      },
    });

    with email starting with "info":\n`);

    infoUsers.forEach((user) => {
      );
      });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmail();
