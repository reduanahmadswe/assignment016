import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testActualLogin() {
  const email = 'info.reduanahmad@gmail.com';
  const password = 'Test@123456';

  );
  );

  try {
    // Step 1: Normalize email (exactly as backend does)
    const normalizedEmail = email.trim();
    // Step 2: Find user (exactly as backend does)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        phone: true,
        avatar: true,
        role: { select: { code: true } },
        isVerified: true,
        isActive: true,
        authProvider: { select: { code: true } },
        emailOtpEnabled: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      ');
      await prisma.$disconnect();
      return;
    }

    // Step 3: Check auth provider
    if (user.authProvider.code !== 'local') {
      ');
      await prisma.$disconnect();
      return;
    }
    // Step 4: Check password
    if (!user.password) {
      ');
      await prisma.$disconnect();
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      ');
      await prisma.$disconnect();
      return;
    }
    // Step 5: Check if verified
    if (!user.isVerified) {
      ');
      await prisma.$disconnect();
      return;
    }
    // Step 6: Check if 2FA/OTP required
    const requires2FA = user.role.code !== 'admin' && (user.emailOtpEnabled || user.twoFactorEnabled);
    if (requires2FA) {
      } else {
      ');
      }

    );
    );
    
    if (requires2FA) {
      } else {
      }

  } catch (error: any) {
    } finally {
    await prisma.$disconnect();
  }
}

testActualLogin();
