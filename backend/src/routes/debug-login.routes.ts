import { Router } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/debug-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔍 DEBUG LOGIN ATTEMPT');
    console.log('Email received:', email);
    console.log('Email type:', typeof email);
    console.log('Email length:', email?.length);
    console.log('Email chars:', email?.split('').map((c: string, i: number) => `${i}: '${c}' (${c.charCodeAt(0)})`).join(', '));
    
    // Try exact match
    const userExact = await prisma.user.findUnique({
      where: { email: email },
      select: { 
        id: true, 
        email: true, 
        name: true,
        password: true
      }
    });
    
    console.log('User found (exact):', !!userExact);
    if (userExact) {
      console.log('DB Email:', userExact.email);
      console.log('DB Email chars:', userExact.email.split('').map((c, i) => `${i}: '${c}' (${c.charCodeAt(0)})`).join(', '));
    }
    
    // Try trimmed
    const userTrimmed = await prisma.user.findUnique({
      where: { email: email?.trim() },
      select: { 
        id: true, 
        email: true, 
        name: true,
        password: true
      }
    });
    
    console.log('User found (trimmed):', !!userTrimmed);
    
    // Try lowercase
    const userLower = await prisma.user.findUnique({
      where: { email: email?.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        name: true,
        password: true
      }
    });
    
    console.log('User found (lowercase):', !!userLower);
    
    // Search by contains
    const userContains = await prisma.user.findMany({
      where: {
        email: {
          contains: email?.split('@')[0] || ''
        }
      },
      select: { id: true, email: true, name: true }
    });
    
    console.log('Users found (contains):', userContains.length);
    userContains.forEach(u => {
      console.log(`  - ${u.email} (${u.name})`);
    });
    
    const user = userExact || userTrimmed || userLower;
    
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        debug: {
          emailSearched: email,
          foundExact: !!userExact,
          foundTrimmed: !!userTrimmed,
          foundLower: !!userLower,
          similarUsers: userContains.map(u => u.email)
        }
      });
    }
    
    // Check password
    const isPasswordValid = password && user.password ? await bcrypt.compare(password, user.password) : false;
    
    res.json({
      success: true,
      passwordMatch: isPasswordValid,
      debug: {
        userEmail: user.email,
        searchedEmail: email,
        emailsMatch: user.email === email,
        hasPassword: !!user.password
      }
    });
    
  } catch (error: any) {
    console.error('Debug login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
