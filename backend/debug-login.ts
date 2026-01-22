import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugLogin() {
  const testEmail = 'info.reduanahmad@gmail.com';
  const testPassword = 'Test@123456';

  console.log('\n🔍 DEBUG LOGIN ISSUE\n');
  console.log('='.repeat(60));
  console.log(`Testing with: ${testEmail}`);
  console.log('='.repeat(60));

  // Test 1: Check exact email
  console.log('\n📧 Test 1: Exact Email Match');
  const user1 = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  console.log(`   Result: ${user1 ? '✅ Found' : '❌ Not found'}`);
  if (user1) {
    console.log(`   Stored email: "${user1.email}"`);
    console.log(`   Input email:  "${testEmail}"`);
    console.log(`   Exact match: ${user1.email === testEmail ? '✅ Yes' : '❌ No'}`);
    console.log(`   Email length: ${user1.email.length} vs ${testEmail.length}`);
  }

  // Test 2: Check with trim
  console.log('\n📧 Test 2: With Trim');
  const trimmedEmail = testEmail.trim();
  const user2 = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });
  console.log(`   Trimmed email: "${trimmedEmail}"`);
  console.log(`   Result: ${user2 ? '✅ Found' : '❌ Not found'}`);

  // Test 3: Check with lowercase
  console.log('\n📧 Test 3: Case Insensitive Search');
  const user3 = await prisma.user.findFirst({
    where: {
      email: {
        equals: testEmail,
        mode: 'insensitive',
      },
    },
  });
  console.log(`   Result: ${user3 ? '✅ Found' : '❌ Not found'}`);

  // Test 4: List all similar emails
  console.log('\n📧 Test 4: All Similar Emails');
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: 'reduanahmad',
      },
    },
    select: { email: true, name: true },
  });
  console.log(`   Found ${allUsers.length} user(s):`);
  allUsers.forEach((u, i) => {
    console.log(`   ${i + 1}. "${u.email}" - ${u.name}`);
    console.log(`      Length: ${u.email.length}`);
    console.log(`      Has dots: ${u.email.includes('.')}`);
    console.log(`      Bytes: ${Buffer.from(u.email).toString('hex')}`);
  });

  // Test 5: Password check
  if (user1 && user1.password) {
    console.log('\n🔐 Test 5: Password Verification');
    const isMatch = await bcrypt.compare(testPassword, user1.password);
    console.log(`   Password matches: ${isMatch ? '✅ Yes' : '❌ No'}`);
  }

  // Test 6: Check user status
  if (user1) {
    console.log('\n👤 Test 6: User Status');
    console.log(`   Is Verified: ${user1.isVerified ? '✅ Yes' : '❌ No'}`);
    console.log(`   Is Active: ${user1.isActive ? '✅ Yes' : '❌ No'}`);
    console.log(`   Has Password: ${user1.password ? '✅ Yes' : '❌ No'}`);
  }

  // Test 7: Simulate login validation
  console.log('\n🔐 Test 7: Simulate Login Validation');
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
      console.log('   ❌ User not found');
    } else {
      console.log('   ✅ User found');
      
      if (user.authProvider.code !== 'local') {
        console.log(`   ❌ Wrong auth provider: ${user.authProvider.code}`);
      } else {
        console.log('   ✅ Auth provider is local');
      }

      if (!user.password) {
        console.log('   ❌ No password set');
      } else {
        const isMatch = await bcrypt.compare(testPassword, user.password);
        if (isMatch) {
          console.log('   ✅ Password matches');
        } else {
          console.log('   ❌ Password does not match');
        }
      }

      if (!user.isVerified) {
        console.log('   ❌ User not verified');
      } else {
        console.log('   ✅ User is verified');
      }

      if (!user.isActive) {
        console.log('   ❌ User not active');
      } else {
        console.log('   ✅ User is active');
      }
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 CONCLUSION');
  console.log('='.repeat(60));
  
  if (user1 && user1.password) {
    const isMatch = await bcrypt.compare(testPassword, user1.password);
    if (isMatch && user1.isVerified && user1.isActive) {
      console.log('✅ Login SHOULD work!');
      console.log('\n📝 Credentials:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log('\n💡 If login still fails, check:');
      console.log('   1. Backend server is running');
      console.log('   2. Frontend is pointing to correct API URL');
      console.log('   3. CORS is configured correctly');
      console.log('   4. Check browser console for errors');
    } else {
      console.log('❌ Login will NOT work because:');
      if (!isMatch) console.log('   - Password does not match');
      if (!user1.isVerified) console.log('   - User not verified');
      if (!user1.isActive) console.log('   - User not active');
    }
  } else {
    console.log('❌ Login will NOT work - User not found or no password');
  }

  console.log('\n');
  await prisma.$disconnect();
}

debugLogin();
