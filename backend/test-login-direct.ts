import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  const testEmail = 'info.reduanahmad@gmail.com';
  const testPassword = 'Admin@123'; // Try this password

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
        isVerified: true,
        emailOtpEnabled: true,
      },
    });

    if (!user) {
      return;
    }

    + '...');
    // Test password
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    if (isPasswordValid) {
      } else {
      const commonPasswords = [
        'Test@123456',
        'Admin@123456',
        'Password@123',
        'Reduan@123',
        'Info@123456',
      ];

      for (const pwd of commonPasswords) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
