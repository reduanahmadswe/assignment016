import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestAccount() {
  const email = 'info.reduanahmad@gmail.com';
  const password = 'Test@123456';
  const name = 'Test User - Reduan Ahmad';
  const phone = '+8801712345678';

  console.log('\n🔧 Creating Test Account\n');
  console.log('='.repeat(60));
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`📱 Phone: ${phone}`);
  console.log('='.repeat(60));

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      console.log('\n⚠️  User already exists!');
      console.log(`   Stored email: ${existingUser.email}`);
      console.log(`   Email has dots: ${existingUser.email.includes('.')}`);
      console.log(`   Dots in local part: ${existingUser.email.split('@')[0].includes('.')}`);
      
      // Delete existing user for fresh test
      console.log('\n🗑️  Deleting existing user for fresh test...');
      await prisma.user.delete({
        where: { email: email.trim() },
      });
      console.log('✅ Deleted successfully');
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
    console.log('\n📊 Email Analysis BEFORE Creation:');
    console.log(`   Original email: ${email}`);
    console.log(`   After trim: ${email.trim()}`);
    console.log(`   Has dots: ${email.includes('.')}`);
    console.log(`   Dot count: ${(email.match(/\./g) || []).length}`);
    console.log(`   Local part: ${email.split('@')[0]}`);
    console.log(`   Dots in local part: ${email.split('@')[0].includes('.')}`);

    // Create user
    console.log('\n🔨 Creating user in database...');
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

    console.log('✅ User created successfully!');

    // Log email details AFTER creating user
    console.log('\n📊 Email Analysis AFTER Creation:');
    console.log(`   Stored email: ${user.email}`);
    console.log(`   Has dots: ${user.email.includes('.')}`);
    console.log(`   Dot count: ${(user.email.match(/\./g) || []).length}`);
    console.log(`   Local part: ${user.email.split('@')[0]}`);
    console.log(`   Dots in local part: ${user.email.split('@')[0].includes('.')}`);

    // Verify by reading from database again
    console.log('\n🔍 Verifying by reading from database...');
    const verifyUser = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: { email: true, name: true },
    });

    if (verifyUser) {
      console.log('✅ Verification successful!');
      console.log(`   Database has: ${verifyUser.email}`);
      console.log(`   Dots preserved: ${verifyUser.email === email.trim()}`);
    }

    // Compare with and without dots
    console.log('\n🎯 Final Proof:');
    console.log(`   Input email:    ${email}`);
    console.log(`   Stored email:   ${user.email}`);
    console.log(`   Match exactly:  ${user.email === email.trim() ? '✅ YES' : '❌ NO'}`);
    console.log(`   Dots preserved: ${user.email.split('@')[0].includes('.') ? '✅ YES' : '❌ NO'}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST ACCOUNT CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n💡 You can also login with: inforeduanahmad@gmail.com');
    console.log('   (Gmail ignores dots, so both work!)');
    console.log('\n🌐 Try it at: http://localhost:3000/login\n');

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
