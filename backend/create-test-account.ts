import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestAccount() {
  const email = 'info.reduanahmad@gmail.com';
  const password = 'Test@123456';
  const name = 'Test User - Reduan Ahmad';
  const phone = '+8801712345678';

  );
  );

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      }`);
      [0].includes('.')}`);
      
      // Delete existing user for fresh test
      await prisma.user.delete({
        where: { email: email.trim() },
      });
      }

    // Get role and auth provider IDs
    const userRole = await prisma.userRole.findUnique({
      where: { code: 'user' },
    });

    const localAuth = await prisma.authProvider.findUnique({
      where: { code: 'local' },
    });

    if (!userRole || !localAuth) {
      throw new Error('Required lookup data not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Log email details BEFORE creating user
    }`);
    }`);
    || []).length}`);
    [0]}`);
    [0].includes('.')}`);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        password: hashedPassword,
        name,
        phone: phone.replace(/[\s\-()]/g, ''),
        roleId: userRole.id,
        authProviderId: localAuth.id,
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Log email details AFTER creating user
    }`);
    || []).length}`);
    [0]}`);
    [0].includes('.')}`);

    // Verify by reading from database again
    const verifyUser = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: { email: true, name: true },
    });

    if (verifyUser) {
      }`);
    }

    // Compare with and without dots
    ? '✅ YES' : '❌ NO'}`);
    [0].includes('.') ? '✅ YES' : '❌ NO'}`);

    );
    );
    ');
    } catch (error: any) {
    console.error('\n❌ Error creating test account:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email already exists in database');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccount();
