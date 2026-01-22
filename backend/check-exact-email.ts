import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmail() {
  try {
    console.log('🔍 Checking emails in database...\n');

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

    console.log(`Found ${users.length} user(s) with "reduan" in email:\n`);

    users.forEach((user) => {
      console.log('─────────────────────────────────────');
      console.log('ID:', user.id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Email Length:', user.email.length);
      console.log('Has dots?', user.email.includes('.'));
      console.log('Active?', user.isActive);
      console.log('Email Verified?', user.isVerified);
      console.log('─────────────────────────────────────\n');
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

    console.log(`\nFound ${infoUsers.length} user(s) with email starting with "info":\n`);

    infoUsers.forEach((user) => {
      console.log('─────────────────────────────────────');
      console.log('ID:', user.id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Email Length:', user.email.length);
      console.log('Has dots?', user.email.includes('.'));
      console.log('Active?', user.isActive);
      console.log('Email Verified?', user.isVerified);
      console.log('─────────────────────────────────────\n');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmail();
