import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  const testEmail = 'info.reduanahmad@gmail.com';
  const testPassword = 'Admin@123'; // Try this password

  try {
    console.log('🔍 Testing login for:', testEmail);
    console.log('Password trying:', testPassword);
    console.log('─────────────────────────────────────\n');

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
      console.log('❌ User not found with email:', testEmail);
      return;
    }

    console.log('✅ User found!');
    console.log('ID:', user.id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Active:', user.isActive);
    console.log('Verified:', user.isVerified);
    console.log('Email OTP Enabled:', user.emailOtpEnabled);
    console.log('Password Hash:', user.password.substring(0, 20) + '...');
    console.log('\n─────────────────────────────────────\n');

    // Test password
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    if (isPasswordValid) {
      console.log('✅ PASSWORD CORRECT!');
      console.log('Login should work with this password.');
    } else {
      console.log('❌ PASSWORD INCORRECT!');
      console.log('The password you are trying does not match.');
      console.log('\nTrying other common passwords...\n');

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
          console.log(`✅ FOUND! Correct password is: ${pwd}`);
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
