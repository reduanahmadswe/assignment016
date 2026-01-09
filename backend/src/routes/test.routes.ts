import { Router } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/test-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('=== TEST LOGIN ===');
        console.log('Email received:', JSON.stringify(email));
        console.log('Password received:', JSON.stringify(password));
        console.log('Email length:', email?.length);
        console.log('Password length:', password?.length);

        const user = await prisma.user.findUnique({
            where: { email: email?.trim() },
        });

        console.log('User found:', !!user);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found',
                debug: {
                    emailSearched: email,
                    emailTrimmed: email?.trim(),
                }
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);

        res.json({
            success: isPasswordValid,
            message: isPasswordValid ? 'Login would succeed!' : 'Password mismatch',
            debug: {
                userEmail: user.email,
                userName: user.name,
                isVerified: user.isVerified,
                isActive: user.isActive,
                authProvider: user.authProvider,
                passwordMatch: isPasswordValid,
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
