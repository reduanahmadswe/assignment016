import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testActualLogin() {
  const email = 'info.reduanahmad@gmail.com';
  const password = 'Test@123456';

  console.log('\n🔐 TESTING ACTUAL LOGIN FLOW\n');
  console.log('='.repeat(60));
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('='.repeat(60));

  try {
    // Step 1: Normalize email (exactly as backend does)
    const normalizedEmail = email.trim();
    console.log('\n✅ Step 1: Normalize Email');
    console.log(`   Input: "${email}"`);
    console.log(`   Normalized: "${normalizedEmail}"`);

    // Step 2: Find user (exactly as backend does)
    console.log('\n✅ Step 2: Find User');
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
      console.log('   ❌ FAIL: User not found');
      console.log('   Error: Invalid email or password (401)');
      await prisma.$disconnect();
      return;
    }

    console.log('   ✅ User found');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);

    // Step 3: Check auth provider
    console.log('\n✅ Step 3: Check Auth Provider');
    if (user.authProvider.code !== 'local') {
      console.log(`   ❌ FAIL: Wrong auth provider: ${user.authProvider.code}`);
      console.log('   Error: Please use Google login for this account (400)');
      await prisma.$disconnect();
      return;
    }
    console.log('   ✅ Auth provider is local');

    // Step 4: Check password
    console.log('\n✅ Step 4: Verify Password');
    if (!user.password) {
      console.log('   ❌ FAIL: No password set');
      console.log('   Error: Invalid email or password (401)');
      await prisma.$disconnect();
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('   ❌ FAIL: Password does not match');
      console.log('   Error: Invalid email or password (401)');
      await prisma.$disconnect();
      return;
    }
    console.log('   ✅ Password matches');

    // Step 5: Check if verified
    console.log('\n✅ Step 5: Check Verification');
    if (!user.isVerified) {
      console.log('   ❌ FAIL: User not verified');
      console.log('   Error: Please verify your email (403)');
      await prisma.$disconnect();
      return;
    }
    console.log('   ✅ User is verified');

    // Step 6: Check if 2FA/OTP required
    console.log('\n✅ Step 6: Check 2FA/OTP');
    const requires2FA = user.role.code !== 'admin' && (user.emailOtpEnabled || user.twoFactorEnabled);
    if (requires2FA) {
      console.log('   ⚠️  2FA/OTP is required');
      console.log(`   Email OTP: ${user.emailOtpEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`   Authenticator: ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}`);
      console.log('   Response: requiresOTP: true');
    } else {
      console.log('   ✅ No 2FA/OTP required (admin or disabled)');
      console.log('   Response: Direct login with tokens');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 LOGIN VALIDATION PASSED!');
    console.log('='.repeat(60));
    
    if (requires2FA) {
      console.log('\n📧 Next Step: Enter OTP sent to your email');
    } else {
      console.log('\n✅ Login successful - tokens would be generated');
    }

  } catch (error: any) {
    console.log('\n❌ ERROR:', error.message);
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}

testActualLogin();
