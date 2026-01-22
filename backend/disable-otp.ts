import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function disableOTP() {
  const email = 'info.reduanahmad@gmail.com';
  
  await prisma.user.update({
    where: { email },
    data: { emailOtpEnabled: false },
  });
  
  console.log(`✅ Email OTP disabled for ${email}`);
  console.log('\n📝 You can now login directly without OTP:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: Test@123456`);
  console.log('\n🌐 Try at: http://localhost:3000/login\n');
  
  await prisma.$disconnect();
}

disableOTP();
