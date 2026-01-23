import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugLogin() {
  const testEmail = 'info.reduanahmad@gmail.com';
  const testPassword = 'Test@123456';

  );
  );

  // Test 1: Check exact email
  const user1 = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  if (user1) {
    }

  // Test 2: Check with trim
  const trimmedEmail = testEmail.trim();
  const user2 = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });
  // Test 3: Check with lowercase
  const user3 = await prisma.user.findFirst({
    where: {
      email: {
        equals: testEmail,
        mode: 'insensitive',
      },
    },
  });
  // Test 4: List all similar emails
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: 'reduanahmad',
      },
    },
    select: { email: true, name: true },
  });
  :`);
  allUsers.forEach((u, i) => {
    }`);
    .toString('hex')}`);
  });

  // Test 5: Password check
  if (user1 && user1.password) {
    const isMatch = await bcrypt.compare(testPassword, user1.password);
    }

  // Test 6: Check user status
  if (user1) {
    }

  // Test 7: Simulate login validation
  try {
    const normalizedEmail = testEmail.trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        isVerified: true,
        isActive: true,
        authProvider: { select: { code: true } },
      },
    });

    if (!user) {
      } else {
      if (user.authProvider.code !== 'local') {
        } else {
        }

      if (!user.password) {
        } else {
        const isMatch = await bcrypt.compare(testPassword, user.password);
        if (isMatch) {
          } else {
          }
      }

      if (!user.isVerified) {
        } else {
        }

      if (!user.isActive) {
        } else {
        }
    }
  } catch (error: any) {
    }

  );
  );
  
  if (user1 && user1.password) {
    const isMatch = await bcrypt.compare(testPassword, user1.password);
    if (isMatch && user1.isVerified && user1.isActive) {
      } else {
      if (!isMatch) if (!user1.isVerified) if (!user1.isActive) }
  } else {
    }

  await prisma.$disconnect();
}

debugLogin();
