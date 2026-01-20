import prisma from './src/config/db.js';

async function checkAndFixEmail() {
  try {
    console.log('🔍 Checking for rauful email...\n');
    
    // Check for email with dots
    const userWithDot = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'rauful'
        }
      },
      select: { id: true, email: true, name: true }
    });
    
    if (userWithDot) {
      console.log('✅ Found user:');
      console.log('   Email:', userWithDot.email);
      console.log('   Name:', userWithDot.name);
      console.log('   ID:', userWithDot.id);
      
      // Check if email has dots
      if (userWithDot.email.includes('.')) {
        const emailWithoutDots = userWithDot.email.replace(/\./g, '');
        console.log('\n📝 Email has dots. Options:');
        console.log('   1. Current email:', userWithDot.email);
        console.log('   2. Without dots:', emailWithoutDots);
        console.log('\n💡 To login, use:', userWithDot.email, '(with dots)');
      } else {
        console.log('\n✅ Email already without dots');
      }
    } else {
      console.log('❌ No user found with "rauful" in email');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixEmail();
