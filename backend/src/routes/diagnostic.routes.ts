import { Router, Request, Response } from 'express';
import prisma from '../config/db.js';

const router = Router();

/**
 * Diagnostic endpoint to test email handling
 * POST /api/diagnostic/test-email
 */
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Log the email at each step
    const diagnostics = {
      step1_received: email,
      step2_trimmed: email.trim(),
      step3_hasDots: email.includes('.'),
      step4_dotCount: (email.match(/\./g) || []).length,
      step5_localPart: email.split('@')[0],
      step6_domain: email.split('@')[1],
      step7_isGmail: email.toLowerCase().includes('gmail.com'),
    };

    // Check if email exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: { email: true, name: true },
    });

    const pendingReg = await prisma.pendingRegistration.findUnique({
      where: { email: email.trim() },
      select: { email: true, name: true },
    });

    res.json({
      success: true,
      message: 'Email diagnostic complete',
      diagnostics,
      database: {
        existsInUsers: !!existingUser,
        userEmail: existingUser?.email,
        existsInPending: !!pendingReg,
        pendingEmail: pendingReg?.email,
      },
      analysis: {
        dotsPreserved: email.trim() === email && email.includes('.'),
        recommendation: email.toLowerCase().includes('gmail.com')
          ? 'Gmail ignores dots in email addresses. Both versions deliver to same inbox.'
          : 'Email should be stored exactly as entered.',
      },
    });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    res.status(500).json({
      success: false,
      message: 'Diagnostic failed',
      error: error.message,
    });
  }
});

/**
 * Get all emails with analysis
 * GET /api/diagnostic/emails
 */
router.get('/emails', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const analysis = users.map((user) => {
      const [localPart, domain] = user.email.split('@');
      return {
        ...user,
        analysis: {
          hasDotInLocalPart: localPart.includes('.'),
          dotCount: (localPart.match(/\./g) || []).length,
          isGmail: domain?.toLowerCase().includes('gmail'),
          localPartLength: localPart.length,
        },
      };
    });

    const stats = {
      total: users.length,
      withDots: analysis.filter((u) => u.analysis.hasDotInLocalPart).length,
      withoutDots: analysis.filter((u) => !u.analysis.hasDotInLocalPart).length,
      gmailUsers: analysis.filter((u) => u.analysis.isGmail).length,
    };

    res.json({
      success: true,
      stats,
      users: analysis,
    });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message,
    });
  }
});

export default router;
