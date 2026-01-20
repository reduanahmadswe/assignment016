import prisma from './src/config/db.js';
import bcrypt from 'bcryptjs';

async function debugLogin() {
  try {
    console.log('\n🔍 ===== LOGIN DEBUG =====\n');
    
    // Test emails
    const testEmails = [
      'rauful.alam15@gmail.com',      // With dots
      'raufulalam15@gmail.com',       // Without dots
    ];
    
    for (const email of testEmails) {
      console.log(`\n📧 Testing: "${email}"`);
      console.log('─'.repeat(50));
      
      // Try to find user
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: { 
          id: true, 
          email: true, 
          name: true,
          password: true,
          isVerified: true,
          isActive: true
        }
      });
      
      if (user) {
        console.log('✅ User FOUND!');
        console.log('   ID:', user.id);
        console.log('   Email in DB:', user.email);
        console.log('   Name:', user.name);
        console.log('   Verified:', user.isVerified);
        console.log('   Active:', user.isActive);
        console.log('   Has Password:', !!user.password);
        
        // Test password
        if (user.password) {
          const testPassword = 'Letsbuildthenation@2026!';
          const isMatch = await bcrypt.compare(testPassword, user.password);
          console.log(`   Password "${testPassword}" matches:`, isMatch);
        }
      } else {
        console.log('❌ User NOT found');
      }
    }
    
    // List all users with similar email
    console.log('\n\n📋 All users containing "rauful":');
    console.log('─'.repeat(50));
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'rauful'
        }
      },
      select: { id: true, email: true, name: true }
    });
    
    if (allUsers.length > 0) {
      allUsers.forEach(u => {
        console.log(`   • ${u.email} (${u.name})`);
      });
    } else {
      console.log('   No users found');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
