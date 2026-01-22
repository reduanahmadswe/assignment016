import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test script to verify email integrity throughout the registration process
 * This will help identify if dots are being removed from email addresses
 */

async function testEmailIntegrity() {
  console.log('\n🔍 EMAIL INTEGRITY TEST\n');
  console.log('=' .repeat(60));

  const testEmails = [
    'test.user@gmail.com',
    'rauful.alam15@gmail.com',
    'john.doe.test@example.com',
    'user.with.many.dots@test.com',
  ];

  for (const email of testEmails) {
    console.log(`\n📧 Testing email: ${email}`);
    console.log('-'.repeat(60));

    // Test 1: Check if email has dots
    const hasDots = email.includes('.');
    console.log(`✓ Original email has dots: ${hasDots}`);
    console.log(`✓ Dot count: ${(email.match(/\./g) || []).length}`);

    // Test 2: Simulate trim() operation (what the backend does)
    const trimmedEmail = email.trim();
    console.log(`✓ After trim(): ${trimmedEmail}`);
    console.log(`✓ Dots preserved after trim: ${trimmedEmail.includes('.') === hasDots}`);

    // Test 3: Check database for existing email
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
        select: { email: true, name: true },
      });

      if (existingUser) {
        console.log(`⚠️  Email already exists in database: ${existingUser.email}`);
        console.log(`   Stored email has dots: ${existingUser.email.includes('.')}`);
        console.log(`   Stored email matches input: ${existingUser.email === trimmedEmail}`);
      } else {
        console.log(`✓ Email not found in database (available for registration)`);
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
        console.log(`⚠️  Email found in pending registrations: ${pendingReg.email}`);
        console.log(`   Stored email has dots: ${pendingReg.email.includes('.')}`);
      } else {
        console.log(`✓ Email not in pending registrations`);
      }
    } catch (error) {
      console.error(`❌ Database error:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 EMAIL INTEGRITY TEST COMPLETE\n');

  // Additional check: Find all emails without dots in local part
  console.log('\n📊 ANALYZING EXISTING EMAILS IN DATABASE\n');
  console.log('=' .repeat(60));

  try {
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    console.log(`\nTotal users checked: ${allUsers.length}\n`);

    for (const user of allUsers) {
      const [localPart, domain] = user.email.split('@');
      const hasDotInLocal = localPart.includes('.');
      const isGmail = domain?.toLowerCase().includes('gmail');

      console.log(`Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Has dot in local part: ${hasDotInLocal}`);
      console.log(`  Is Gmail: ${isGmail}`);
      console.log(`  Created: ${user.createdAt.toISOString()}`);
      console.log('');
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
