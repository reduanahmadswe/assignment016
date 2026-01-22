import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkLoginIssue() {
  const email = 'info.reduanahmad@gmail.com';
  const testPassword = 'Test@123456';

  console.log('\n🔍 Checking Login Issue\n');
  console.log('='.repeat(60));

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
      console.log('❌ User not found in database');
      console.log(`   Email: ${email}`);
      await prisma.$disconnect();
      return;
    }

    console.log('✅ User found in database');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Auth Provider: ${user.authProvider.code}`);
    console.log(`   Is Verified: ${user.isVerified}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);

    if (!user.password) {
      console.log('\n❌ Problem: User has no password!');
      console.log('   This user might have been created via Google Sign-In');
      console.log('   or the password was not set during creation.');
      
      // Fix: Set password
      console.log('\n🔧 Fixing: Setting password...');
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      console.log('✅ Password set successfully!');
      console.log(`   New password: ${testPassword}`);
    } else {
      // Test password
      console.log('\n🔐 Testing password...');
      const isMatch = await bcrypt.compare(testPassword, user.password);
      
      if (isMatch) {
        console.log('✅ Password matches!');
        console.log(`   You can login with: ${testPassword}`);
      } else {
        console.log('❌ Password does NOT match!');
        console.log('   The stored password is different from the test password.');
        
        // Fix: Update password
        console.log('\n🔧 Fixing: Updating password...');
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword },
        });
        console.log('✅ Password updated successfully!');
        console.log(`   New password: ${testPassword}`);
      }
    }

    // Check if user is verified and active
    if (!user.isVerified) {
      console.log('\n⚠️  Warning: User is not verified');
      console.log('   Setting user as verified...');
      await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });
      console.log('✅ User verified');
    }

    if (!user.isActive) {
      console.log('\n⚠️  Warning: User is not active');
      console.log('   Activating user...');
      await prisma.user.update({
        where: { email },
        data: { isActive: true },
      });
      console.log('✅ User activated');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Login should work now!');
    console.log('='.repeat(60));
    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${testPassword}`);
    console.log('\n🌐 Try logging in at: http://localhost:3000/login\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLoginIssue();
