# How to Run Email Integrity Test

## ✅ Correct Command

Your project uses `tsx` (not `ts-node`). Use this command:

\`\`\`bash
cd backend
npm run test:email
\`\`\`

Or directly:

\`\`\`bash
cd backend
npx tsx test-email-integrity.ts
\`\`\`

## 🚀 Quick Test (30 seconds)

\`\`\`bash
# Navigate to backend
cd backend

# Run the email integrity test
npm run test:email
\`\`\`

## 📊 What You'll See

The test will show:

\`\`\`
🔍 EMAIL INTEGRITY TEST
============================================================

📧 Testing email: test.user@gmail.com
------------------------------------------------------------
✓ Original email has dots: true
✓ Dot count: 1
✓ After trim(): test.user@gmail.com
✓ Dots preserved after trim: true
✓ Email not found in database (available for registration)
✓ Email not in pending registrations

📧 Testing email: rauful.alam15@gmail.com
------------------------------------------------------------
✓ Original email has dots: true
✓ Dot count: 2
✓ After trim(): rauful.alam15@gmail.com
✓ Dots preserved after trim: true
⚠️  Email already exists in database: rauful.alam15@gmail.com
   Stored email has dots: true  ← THIS IS KEY!
   Stored email matches input: true

📊 ANALYZING EXISTING EMAILS IN DATABASE
============================================================
Email: rauful.alam15@gmail.com
  Name: Rauful Alam
  Has dot in local part: true  ← DOTS ARE PRESERVED!
  Is Gmail: true
  Created: 2025-01-22T10:30:00.000Z
\`\`\`

## 🎯 What to Look For

### ✅ If You See This:
\`\`\`
✓ Dots preserved after trim: true
   Stored email has dots: true
   Has dot in local part: true
\`\`\`

**Conclusion**: Your code is working correctly! Dots are preserved.

### ❌ If You See This:
\`\`\`
✗ Dots preserved after trim: false
   Stored email has dots: false
   Has dot in local part: false
\`\`\`

**Conclusion**: There's an issue. Check the logs to see where dots are removed.

## 🔍 Alternative: Test Fresh Registration

1. **Start backend:**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

2. **Start frontend:**
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

3. **Register with dotted email:**
   - Open: http://localhost:3000/register
   - Use email: `test.dots.check@gmail.com`
   - Password: `Test@123456`

4. **Check backend console for logs:**
   \`\`\`
   📧 [AUTH] Registration - Original email: test.dots.check@gmail.com
   📧 [AUTH] Registration - After trim: test.dots.check@gmail.com
   📧 [SERVICE] Register - Email has dot? true
   📧 [HELPER] createPendingRegistration - Email has dot? true
   📧 [HELPER] createPendingRegistration - Saved to DB: test.dots.check@gmail.com
   \`\`\`

5. **Check database:**
   \`\`\`sql
   SELECT email FROM pending_registrations 
   WHERE email LIKE '%test.dots%';
   \`\`\`

   **Expected**: `test.dots.check@gmail.com` (with dots!)

## 🔧 Troubleshooting

### Error: "Cannot find module"
\`\`\`bash
# Install dependencies
cd backend
npm install
\`\`\`

### Error: "Database connection failed"
\`\`\`bash
# Check your .env file
# Make sure DATABASE_URL is correct
\`\`\`

### Error: "Prisma Client not generated"
\`\`\`bash
cd backend
npx prisma generate
\`\`\`

## 📝 Next Steps After Running Test

### If Dots Are Preserved (Most Likely):
✅ Your code is correct!
✅ The issue is Gmail's email aliasing
✅ No code changes needed

**Explanation**: Gmail ignores dots in email addresses. Both `rauful.alam15@gmail.com` and `raufulalam15@gmail.com` deliver to the same inbox. This is a Gmail feature, not a bug.

### If Dots Are Missing:
❌ Check where they disappear:
1. Browser network request
2. Backend controller log
3. Service layer log
4. Database storage

## 🎓 Understanding the Results

### Gmail's Behavior:
- `user.name@gmail.com` = `username@gmail.com` (same inbox)
- Gmail ignores dots in the local part (before @)
- This is intentional Gmail behavior
- Your app should store the email exactly as entered

### Your App's Behavior:
- ✅ Store: `rauful.alam15@gmail.com` (with dots)
- ✅ Allow login with: `rauful.alam15@gmail.com`
- ✅ Gmail handles aliasing on their end

## 📞 Need Help?

If you see unexpected results, share:
1. Output of `npm run test:email`
2. Backend console logs (📧 emoji lines)
3. Database query results
4. Browser network request payload

This will help identify the exact issue.
