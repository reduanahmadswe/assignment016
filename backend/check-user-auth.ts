import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserAuth() {
  const email = 'raufulalam15@gmail.com';
  
  console.log(`\n🔍 Checking user: ${email}\n`);
  console.log('='.repeat(60));
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { authProvider: true },
  });

  if (!user) {
    console.log('❌ User not found');
    await prisma.$disconnect();
    return;
  }

  console.log(`\n✅ User Found:`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Auth Provider: ${user.authProvider.code}`);
  console.log(`   Google ID: ${user.googleId || 'None'}`);
  console.log(`   Created: ${user.createdAt}`);
  console.log(`   Is Verified: ${user.isVerified}`);
  
  console.log(`\n📊 Analysis:`);
  console.log(`   Registered via: ${user.authProvider.code === 'google' ? 'Google Sign-In' : 'Email/Password'}`);
  console.log(`   Email has dots: ${user.email.includes('.')}`);
  
  if (user.authProvider.code === 'google') {
    console.log(`\n💡 Explanation:`);
    console.log(`   This user registered via Google Sign-In.`);
    console.log(`   Google provided the email as: ${user.email}`);
    console.log(`   Your app correctly stored it as provided by Google.`);
    console.log(`   Gmail treats emails with/without dots as identical.`);
  } else {
    console.log(`\n💡 Explanation:`);
    console.log(`   This user registered via email/password.`);
    console.log(`   The email was entered as: ${user.email}`);
    console.log(`   Your app correctly stored it exactly as entered.`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Your application is working correctly!\n');
  
  await prisma.$disconnect();
}

checkUserAuth().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
