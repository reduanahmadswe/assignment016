# Email Diagnostic Setup

## Quick Setup

### 1. Add Diagnostic Route to Your API

Add this line to your main routes file (usually `backend/src/routes/index.ts` or `backend/src/app.ts`):

\`\`\`typescript
import diagnosticRoutes from './routes/diagnostic.routes.js';

// Add this line with your other routes
app.use('/api/diagnostic', diagnosticRoutes);
\`\`\`

### 2. Test Email Handling

#### Test 1: Check Email Processing

\`\`\`bash
curl -X POST http://localhost:5000/api/diagnostic/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"email": "rauful.alam15@gmail.com"}'
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "Email diagnostic complete",
  "diagnostics": {
    "step1_received": "rauful.alam15@gmail.com",
    "step2_trimmed": "rauful.alam15@gmail.com",
    "step3_hasDots": true,
    "step4_dotCount": 2,
    "step5_localPart": "rauful.alam15",
    "step6_domain": "gmail.com",
    "step7_isGmail": true
  },
  "database": {
    "existsInUsers": true,
    "userEmail": "rauful.alam15@gmail.com",
    "existsInPending": false,
    "pendingEmail": null
  },
  "analysis": {
    "dotsPreserved": true,
    "recommendation": "Gmail ignores dots in email addresses..."
  }
}
\`\`\`

#### Test 2: Analyze All Emails

\`\`\`bash
curl http://localhost:5000/api/diagnostic/emails
\`\`\`

This will show:
- All emails in database
- Which ones have dots
- Statistics about dot usage

### 3. Run Integrity Test Script

\`\`\`bash
cd backend
npx ts-node test-email-integrity.ts
\`\`\`

### 4. Test Fresh Registration

1. Open your frontend: `http://localhost:3000/register`
2. Register with email: `test.dots.user@gmail.com`
3. Check backend console logs for:
   \`\`\`
   📧 [AUTH] Registration - Original email: test.dots.user@gmail.com
   📧 [AUTH] Registration - After trim: test.dots.user@gmail.com
   📧 [SERVICE] Register - Email has dot? true
   📧 [HELPER] createPendingRegistration - Email has dot? true
   📧 [HELPER] createPendingRegistration - Saved to DB: test.dots.user@gmail.com
   \`\`\`
4. Check database:
   \`\`\`sql
   SELECT email FROM pending_registrations WHERE email LIKE '%test.dots%';
   \`\`\`

### 5. Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Register with dotted email
4. Find the POST request to `/api/auth/register`
5. Check Request Payload - does it have dots?

## What to Look For

### ✅ If Dots Are Preserved:
- All logs show email with dots
- Database has email with dots
- Network request has dots in payload
- **Conclusion**: Code is working correctly, issue is elsewhere

### ❌ If Dots Are Missing:
Check where they disappear:
1. **In Network Request**: Frontend issue (input handling)
2. **After Controller Log**: Middleware issue
3. **After Service Log**: Service layer issue
4. **In Database**: Database trigger or Prisma issue

## Common Issues & Solutions

### Issue 1: Gmail Aliasing
**Symptom**: Login works with both `user.name@gmail.com` and `username@gmail.com`
**Cause**: Gmail feature, not a bug
**Solution**: This is expected behavior for Gmail

### Issue 2: Browser Autofill
**Symptom**: Dots missing only when using autofill
**Cause**: Browser normalizing email
**Solution**: Type email manually to test

### Issue 3: Existing Data
**Symptom**: Old users have emails without dots
**Cause**: Manual data entry or migration
**Solution**: Data cleanup script (if needed)

## Data Cleanup Script (If Needed)

If you need to fix existing emails in database:

\`\`\`typescript
// backend/fix-email-dots.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmailDots() {
  // Manual mapping of incorrect emails to correct ones
  const corrections = [
    { wrong: 'raufulalam15@gmail.com', correct: 'rauful.alam15@gmail.com' },
    // Add more corrections as needed
  ];

  for (const { wrong, correct } of corrections) {
    const user = await prisma.user.findUnique({
      where: { email: wrong },
    });

    if (user) {
      console.log(\`Updating: \${wrong} → \${correct}\`);
      await prisma.user.update({
        where: { email: wrong },
        data: { email: correct },
      });
      console.log('✓ Updated');
    } else {
      console.log(\`✗ Not found: \${wrong}\`);
    }
  }

  await prisma.$disconnect();
}

fixEmailDots();
\`\`\`

## Remove Diagnostic Routes (Production)

**Important**: Remove or protect diagnostic routes before deploying to production:

\`\`\`typescript
// Only enable in development
if (process.env.NODE_ENV === 'development') {
  app.use('/api/diagnostic', diagnosticRoutes);
}
\`\`\`

Or add authentication:

\`\`\`typescript
import { authMiddleware, adminOnly } from './middlewares/auth.middleware.js';

app.use('/api/diagnostic', authMiddleware, adminOnly, diagnosticRoutes);
\`\`\`
