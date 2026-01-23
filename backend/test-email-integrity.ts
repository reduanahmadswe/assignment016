import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test script to verify email integrity throughout the registration process
 * This will help identify if dots are being removed from email addresses
 */

async function testEmailIntegrity() {
  );

  const testEmails = [
    'test.user@gmail.com',
    'rauful.alam15@gmail.com',
    'john.doe.test@example.com',
    'user.with.many.dots@test.com',
  ];

  for (const email of testEmails) {
    );

    // Test 1: Check if email has dots
    const hasDots = email.includes('.');
    || []).length}`);

    // Test 2: Simulate trim() operation (what the backend does)
    const trimmedEmail = email.trim();
    : ${trimmedEmail}`);
    === hasDots}`);

    // Test 3: Check database for existing email
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
        select: { email: true, name: true },
      });

      if (existingUser) {
        }`);
        } else {
        `);
      }
    } catch (error) {
      console.error(`❌ Database error:`, error);
    }

    // Test 4: Check pending registrations
    try {
      const pendingReg = await prisma.pendingRegistration.findUnique({
        where: { email: trimmedEmail },
        select: { email: true, name: true },
      });

      if (pendingReg) {
        }`);
      } else {
        }
    } catch (error) {
      console.error(`❌ Database error:`, error);
    }
  }

  );
  // Additional check: Find all emails without dots in local part
  );

  try {
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    for (const user of allUsers) {
      const [localPart, domain] = user.email.split('@');
      const hasDotInLocal = localPart.includes('.');
      const isGmail = domain?.toLowerCase().includes('gmail');

      }`);
      }
  } catch (error) {
    console.error(`❌ Error fetching users:`, error);
  }

  await prisma.$disconnect();
}

// Run the test
testEmailIntegrity()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
