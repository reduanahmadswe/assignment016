import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkLoginIssue() {
  const email = 'info.reduanahmad@gmail.com';
  const testPassword = 'Test@123456';

  );

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isVerified: true,
        isActive: true,
        authProvider: { select: { code: true } },
      },
    });

    if (!user) {
      await prisma.$disconnect();
      return;
    }

    if (!user.password) {
      // Fix: Set password
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      } else {
      // Test password
      const isMatch = await bcrypt.compare(testPassword, user.password);
      
      if (isMatch) {
        } else {
        // Fix: Update password
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword },
        });
        }
    }

    // Check if user is verified and active
    if (!user.isVerified) {
      await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });
      }

    if (!user.isActive) {
      await prisma.user.update({
        where: { email },
        data: { isActive: true },
      });
      }

    );
    );
    } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLoginIssue();
