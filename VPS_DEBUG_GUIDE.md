# 🚀 VPS Login Debug Guide

## Problem
- ✅ Localhost e login kaj kore
- ❌ oriyet.org e login kaj kore na
- Frontend theke correct email/password pathacche
- Backend 401 error dicche

## Root Cause Analysis

### Issue: VPS Database ≠ Localhost Database

Tomar localhost database e `info.reduanahmad@gmail.com` ache, kintu VPS database e:
1. Email ta nai
2. Ba email ache kintu password different
3. Ba account inactive/unverified

## Solution Steps

### Step 1: SSH into VPS
```bash
ssh your-user@your-vps-ip
# or
ssh your-user@oriyet.org
```

### Step 2: Navigate to Backend Directory
```bash
cd /path/to/your/backend
# Example: cd /var/www/oriyet-backend
```

### Step 3: Check Database for Email
```bash
npx tsx check-exact-email.ts
```

This will show if `info.reduanahmad@gmail.com` exists in VPS database.

### Step 4: Check Backend Logs
```bash
# If using PM2
pm2 logs backend

# If using systemd
journalctl -u your-backend-service -f

# If using screen/tmux
# Attach to the screen/tmux session
```

Look for the console logs:
```
🔐 [VALIDATOR] Login attempt
📧 Email received: info.reduanahmad@gmail.com
❌ [VALIDATOR] User not found with email: info.reduanahmad@gmail.com
```

### Step 5: Create Account on VPS Database

If email doesn't exist on VPS, create it:

```bash
npx tsx create-test-account.ts
```

Or manually create via SQL:

```sql
-- Connect to your VPS database
mysql -u your_user -p your_database

-- Check if email exists
SELECT id, email, name, isActive, isVerified 
FROM users 
WHERE email = 'info.reduanahmad@gmail.com';

-- If not exists, you need to register via frontend
-- Or copy from localhost database
```

## Quick Fix Options

### Option A: Register New Account on VPS
1. Go to https://oriyet.org/register
2. Register with `info.reduanahmad@gmail.com`
3. Verify email
4. Login

### Option B: Copy Database from Localhost to VPS

**Export from Localhost:**
```bash
# On localhost
cd backend
mysqldump -u root -p your_database users > users_backup.sql
```

**Import to VPS:**
```bash
# Copy file to VPS
scp users_backup.sql your-user@your-vps:/tmp/

# On VPS
mysql -u your_user -p your_database < /tmp/users_backup.sql
```

### Option C: Create Test Account Directly on VPS

**SSH into VPS and run:**
```bash
cd /path/to/backend

# Create the script if not exists
cat > create-vps-test-account.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAccount() {
  const email = 'info.reduanahmad@gmail.com';
  const password = 'Admin@123';
  const name = 'Reduan Ahmad';

  try {
    // Check if exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('✅ User already exists:', email);
      console.log('Updating password...');
      
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isVerified: true,
          isActive: true,
          emailOtpEnabled: false,
        },
      });
      
      console.log('✅ Password updated!');
      return;
    }

    // Get role and auth provider IDs
    const userRole = await prisma.role.findUnique({
      where: { code: 'user' },
    });

    const localProvider = await prisma.authProvider.findUnique({
      where: { code: 'local' },
    });

    if (!userRole || !localProvider) {
      throw new Error('Role or AuthProvider not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: userRole.id,
        authProviderId: localProvider.id,
        isVerified: true,
        isActive: true,
        emailOtpEnabled: false,
      },
    });

    console.log('✅ Account created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccount();
EOF

# Run the script
npx tsx create-vps-test-account.ts
```

## Verification

After creating account, test login:

```bash
# On VPS
curl -X POST https://api.oriyet.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info.reduanahmad@gmail.com",
    "password": "Admin@123"
  }'
```

Expected response:
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Common VPS Issues

### Issue 1: Different Database
- Localhost uses local MySQL
- VPS uses different MySQL instance
- Databases are NOT synced

**Solution:** Create account on VPS database

### Issue 2: Environment Variables
Check VPS `.env` file:
```bash
cat /path/to/backend/.env | grep DATABASE_URL
```

Make sure it points to correct database.

### Issue 3: Backend Not Running
```bash
# Check if backend is running
pm2 status
# or
systemctl status your-backend-service
```

### Issue 4: CORS Issues
Check backend CORS settings in VPS:
```typescript
// backend/src/server.ts
app.use(cors({
  origin: ['https://oriyet.org', 'https://www.oriyet.org'],
  credentials: true,
}));
```

## Debug Checklist

- [ ] SSH into VPS
- [ ] Check if backend is running
- [ ] Check backend logs for errors
- [ ] Verify database connection
- [ ] Check if email exists in VPS database
- [ ] Verify password hash matches
- [ ] Check account is active and verified
- [ ] Test login via curl
- [ ] Check CORS settings
- [ ] Verify API URL in frontend .env

## Quick Commands

```bash
# SSH into VPS
ssh user@oriyet.org

# Check backend status
pm2 status
pm2 logs backend --lines 50

# Check database
mysql -u user -p database_name
SELECT * FROM users WHERE email LIKE '%reduan%';

# Restart backend
pm2 restart backend

# Check environment
cat .env | grep -E "DATABASE_URL|PORT|NODE_ENV"
```

## Expected Flow

```
User → oriyet.org/login
    ↓
Frontend sends: info.reduanahmad@gmail.com + Admin@123
    ↓
API call: https://api.oriyet.org/api/auth/login
    ↓
VPS Backend receives request
    ↓
VPS Backend checks VPS Database ← THIS IS WHERE IT FAILS
    ↓
If user not found → 401 Error
```

## Solution Summary

**The problem is:** Localhost database ≠ VPS database

**Fix:** Create the account on VPS database using one of the options above.

**Recommended:** Use Option C (create account directly on VPS via script)
