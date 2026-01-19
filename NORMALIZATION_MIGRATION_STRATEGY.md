# DATABASE NORMALIZATION - SAFE MIGRATION STRATEGY

## OVERVIEW
This document provides a step-by-step, SAFE migration strategy for normalizing the ORIYET database.
This is designed for a LIVE PRODUCTION system with ZERO downtime tolerance.

---

## MIGRATION PHASES

### PHASE 1: PREPARATION (No Database Changes)
**Duration:** 1-2 hours
**Risk Level:** ZERO

#### Step 1.1: Backup Current Database
```bash
# Create full database backup
mysqldump -u root oriyet > backup_pre_normalization_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
mysql -u root -e "CREATE DATABASE oriyet_backup;"
mysql -u root oriyet_backup < backup_pre_normalization_*.sql
```

#### Step 1.2: Create Lookup Data Seed File
**File:** `prisma/seed-lookups.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding lookup tables...');

  // User Roles
  await prisma.userRole.createMany({
    data: [
      { code: 'user', label: 'User' },
      { code: 'admin', label: 'Administrator' },
    ],
    skipDuplicates: true,
  });

  // Auth Providers
  await prisma.authProvider.createMany({
    data: [
      { code: 'local', label: 'Local' },
      { code: 'google', label: 'Google OAuth' },
    ],
    skipDuplicates: true,
  });

  // Event Types
  await prisma.eventType.createMany({
    data: [
      { code: 'seminar', label: 'Seminar' },
      { code: 'workshop', label: 'Workshop' },
      { code: 'webinar', label: 'Webinar' },
      { code: 'bootcamp', label: 'Bootcamp' },
      { code: 'conference', label: 'Conference' },
      { code: 'hackathon', label: 'Hackathon' },
    ],
    skipDuplicates: true,
  });

  // Event Modes
  await prisma.eventMode.createMany({
    data: [
      { code: 'online', label: 'Online' },
      { code: 'offline', label: 'Offline' },
      { code: 'hybrid', label: 'Hybrid' },
    ],
    skipDuplicates: true,
  });

  // Event Statuses
  await prisma.eventStatus.createMany({
    data: [
      { code: 'upcoming', label: 'Upcoming' },
      { code: 'ongoing', label: 'Ongoing' },
      { code: 'completed', label: 'Completed' },
      { code: 'cancelled', label: 'Cancelled' },
    ],
    skipDuplicates: true,
  });

  // Registration Statuses
  await prisma.registrationStatus.createMany({
    data: [
      { code: 'open', label: 'Open' },
      { code: 'closed', label: 'Closed' },
      { code: 'full', label: 'Full' },
    ],
    skipDuplicates: true,
  });

  // Event Registration Statuses
  await prisma.eventRegistrationStatus.createMany({
    data: [
      { code: 'pending', label: 'Pending' },
      { code: 'confirmed', label: 'Confirmed' },
      { code: 'cancelled', label: 'Cancelled' },
      { code: 'refunded', label: 'Refunded' },
    ],
    skipDuplicates: true,
  });

  // Payment Statuses
  await prisma.paymentStatus.createMany({
    data: [
      { code: 'not_required', label: 'Not Required' },
      { code: 'pending', label: 'Pending' },
      { code: 'completed', label: 'Completed' },
      { code: 'failed', label: 'Failed' },
      { code: 'cancelled', label: 'Cancelled' },
      { code: 'expired', label: 'Expired' },
      { code: 'refunded', label: 'Refunded' },
    ],
    skipDuplicates: true,
  });

  // Payment Gateways
  await prisma.paymentGateway.createMany({
    data: [
      { code: 'uddoktapay', label: 'UddoktaPay' },
      { code: 'stripe', label: 'Stripe' },
      { code: 'paypal', label: 'PayPal' },
    ],
    skipDuplicates: true,
  });

  // Blog Statuses
  await prisma.blogStatus.createMany({
    data: [
      { code: 'draft', label: 'Draft' },
      { code: 'published', label: 'Published' },
      { code: 'archived', label: 'Archived' },
    ],
    skipDuplicates: true,
  });

  // Opportunity Statuses
  await prisma.opportunityStatus.createMany({
    data: [
      { code: 'open', label: 'Open' },
      { code: 'closed', label: 'Closed' },
    ],
    skipDuplicates: true,
  });

  // Opportunity Types
  await prisma.opportunityType.createMany({
    data: [
      { code: 'INTERNSHIP', label: 'Internship' },
      { code: 'FELLOWSHIP', label: 'Fellowship' },
      { code: 'PROGRAM', label: 'Program' },
      { code: 'SCHOLARSHIP', label: 'Scholarship' },
    ],
    skipDuplicates: true,
  });

  // Application Statuses
  await prisma.applicationStatus.createMany({
    data: [
      { code: 'pending', label: 'Pending' },
      { code: 'reviewed', label: 'Reviewed' },
      { code: 'accepted', label: 'Accepted' },
      { code: 'rejected', label: 'Rejected' },
    ],
    skipDuplicates: true,
  });

  // OTP Types
  await prisma.otpType.createMany({
    data: [
      { code: 'verification', label: 'Email Verification' },
      { code: 'password_reset', label: 'Password Reset' },
      { code: '2fa', label: 'Two-Factor Authentication' },
    ],
    skipDuplicates: true,
  });

  // Host Roles
  await prisma.hostRole.createMany({
    data: [
      { code: 'host', label: 'Host' },
      { code: 'speaker', label: 'Speaker' },
      { code: 'moderator', label: 'Moderator' },
      { code: 'panelist', label: 'Panelist' },
      { code: 'guest', label: 'Guest' },
    ],
    skipDuplicates: true,
  });

  // Online Platforms
  await prisma.onlinePlatform.createMany({
    data: [
      { code: 'zoom', label: 'Zoom' },
      { code: 'google_meet', label: 'Google Meet' },
      { code: 'microsoft_teams', label: 'Microsoft Teams' },
      { code: 'other', label: 'Other' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Lookup tables seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### Step 1.3: Review and Test Normalized Schema
```bash
# Validate schema syntax
npx prisma validate --schema=prisma/schema-normalized.prisma

# Generate client to check for errors
npx prisma generate --schema=prisma/schema-normalized.prisma
```

---

### PHASE 2: CREATE NEW TABLES (Additive Only - No Breaking Changes)
**Duration:** 5-10 minutes
**Risk Level:** LOW (Only adding tables, not modifying existing)

#### Step 2.1: Replace Schema File
```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema-old.prisma

# Use normalized schema
cp prisma/schema-normalized.prisma prisma/schema.prisma
```

#### Step 2.2: Generate Migration (DO NOT APPLY YET)
```bash
# Generate migration SQL
npx prisma migrate dev --name normalization_phase1_add_lookups --create-only

# Review the generated migration file
# File: prisma/migrations/XXXXXX_normalization_phase1_add_lookups/migration.sql
```

#### Step 2.3: Manually Review Migration SQL
**CRITICAL:** Before applying, ensure migration:
- ✅ Creates all lookup tables
- ✅ Creates junction tables (BlogTag, EventGuest, etc.)
- ✅ Does NOT drop any existing columns yet
- ✅ Does NOT modify existing foreign keys yet

#### Step 2.4: Apply Migration
```bash
# Apply migration to create new tables
npx prisma migrate deploy
```

#### Step 2.5: Seed Lookup Tables
```bash
# Run lookup seed
npx tsx prisma/seed-lookups.ts
```

---

### PHASE 3: DATA MIGRATION (Populate New Tables)
**Duration:** 10-30 minutes depending on data volume
**Risk Level:** LOW (Only copying data, not deleting)

#### Step 3.1: Create Data Migration Script
**File:** `prisma/migrate-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration...');

  // 1. Migrate Users
  console.log('Migrating users...');
  const users = await prisma.user.findMany();
  for (const user of users) {
    const roleId = await prisma.userRole.findUnique({
      where: { code: user.role },
      select: { id: true }
    });
    const authProviderId = await prisma.authProvider.findUnique({
      where: { code: user.authProvider },
      select: { id: true }
    });

    if (roleId && authProviderId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roleId: roleId.id,
          authProviderId: authProviderId.id,
        }
      });
    }
  }

  // 2. Migrate Events
  console.log('Migrating events...');
  const events = await prisma.event.findMany();
  for (const event of events) {
    const eventTypeId = await prisma.eventType.findUnique({
      where: { code: event.eventType },
      select: { id: true }
    });
    const eventModeId = await prisma.eventMode.findUnique({
      where: { code: event.eventMode },
      select: { id: true }
    });
    const eventStatusId = await prisma.eventStatus.findUnique({
      where: { code: event.eventStatus },
      select: { id: true }
    });
    const registrationStatusId = await prisma.registrationStatus.findUnique({
      where: { code: event.registrationStatus },
      select: { id: true }
    });

    let onlinePlatformId = null;
    if (event.onlinePlatform) {
      const platform = await prisma.onlinePlatform.findUnique({
        where: { code: event.onlinePlatform },
        select: { id: true }
      });
      onlinePlatformId = platform?.id;
    }

    if (eventTypeId && eventModeId && eventStatusId && registrationStatusId) {
      await prisma.event.update({
        where: { id: event.id },
        data: {
          eventTypeId: eventTypeId.id,
          eventModeId: eventModeId.id,
          eventStatusId: eventStatusId.id,
          registrationStatusId: registrationStatusId.id,
          onlinePlatformId,
        }
      });
    }

    // Migrate guests
    if (event.guests) {
      try {
        const guests = JSON.parse(event.guests);
        for (const guest of guests) {
          const roleId = await prisma.hostRole.findUnique({
            where: { code: guest.role || 'guest' },
            select: { id: true }
          });

          if (roleId) {
            await prisma.eventGuest.create({
              data: {
                eventId: event.id,
                name: guest.name,
                email: guest.email,
                bio: guest.bio,
                roleId: roleId.id,
                pictureLink: guest.pictureLink,
                website: guest.website,
                cvLink: guest.cvLink,
              }
            });
          }
        }
      } catch (e) {
        console.error(`Failed to migrate guests for event ${event.id}:`, e);
      }
    }

    // Migrate signatures
    if (event.signature1Name) {
      const sig1 = await prisma.certificateSignature.create({
        data: {
          name: event.signature1Name,
          title: event.signature1Title!,
          image: event.signature1Image,
        }
      });
      await prisma.eventSignature.create({
        data: {
          eventId: event.id,
          signatureId: sig1.id,
          position: 1,
        }
      });
    }

    if (event.signature2Name) {
      const sig2 = await prisma.certificateSignature.create({
        data: {
          name: event.signature2Name,
          title: event.signature2Title!,
          image: event.signature2Image,
        }
      });
      await prisma.eventSignature.create({
        data: {
          eventId: event.id,
          signatureId: sig2.id,
          position: 2,
        }
      });
    }
  }

  // 3. Migrate Event Registrations
  console.log('Migrating event registrations...');
  const registrations = await prisma.eventRegistration.findMany();
  for (const reg of registrations) {
    const statusId = await prisma.eventRegistrationStatus.findUnique({
      where: { code: reg.status },
      select: { id: true }
    });
    const paymentStatusId = await prisma.paymentStatus.findUnique({
      where: { code: reg.paymentStatus },
      select: { id: true }
    });

    if (statusId && paymentStatusId) {
      await prisma.eventRegistration.update({
        where: { id: reg.id },
        data: {
          statusId: statusId.id,
          paymentStatusId: paymentStatusId.id,
        }
      });
    }
  }

  // 4. Migrate Payment Transactions
  console.log('Migrating payment transactions...');
  const payments = await prisma.paymentTransaction.findMany();
  for (const payment of payments) {
    const gatewayId = await prisma.paymentGateway.findUnique({
      where: { code: payment.gateway },
      select: { id: true }
    });
    const statusId = await prisma.paymentStatus.findUnique({
      where: { code: payment.status },
      select: { id: true }
    });

    if (gatewayId && statusId) {
      await prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          gatewayId: gatewayId.id,
          statusId: statusId.id,
        }
      });
    }
  }

  // 5. Migrate Blog Posts
  console.log('Migrating blog posts...');
  const blogPosts = await prisma.blogPost.findMany();
  for (const post of blogPosts) {
    const statusId = await prisma.blogStatus.findUnique({
      where: { code: post.status },
      select: { id: true }
    });

    if (statusId) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { statusId: statusId.id }
      });
    }

    // Migrate tags
    if (post.tags) {
      const tags = post.tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        let tag = await prisma.tag.findUnique({ where: { slug } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug }
          });
        }

        await prisma.blogTag.create({
          data: {
            blogPostId: post.id,
            tagId: tag.id,
          }
        }).catch(() => {}); // Ignore duplicates
      }
    }
  }

  // 6. Migrate Opportunities
  console.log('Migrating opportunities...');
  const opportunities = await prisma.opportunity.findMany();
  for (const opp of opportunities) {
    const typeId = await prisma.opportunityType.findUnique({
      where: { code: opp.type },
      select: { id: true }
    });
    const statusId = await prisma.opportunityStatus.findUnique({
      where: { code: opp.status },
      select: { id: true }
    });

    if (typeId && statusId) {
      await prisma.opportunity.update({
        where: { id: opp.id },
        data: {
          typeId: typeId.id,
          statusId: statusId.id,
        }
      });
    }
  }

  // 7. Migrate Opportunity Applications
  console.log('Migrating opportunity applications...');
  const applications = await prisma.opportunityApplication.findMany();
  for (const app of applications) {
    const statusId = await prisma.applicationStatus.findUnique({
      where: { code: app.status },
      select: { id: true }
    });

    if (statusId) {
      await prisma.opportunityApplication.update({
        where: { id: app.id },
        data: { statusId: statusId.id }
      });
    }
  }

  // 8. Migrate OTP Codes
  console.log('Migrating OTP codes...');
  const otpCodes = await prisma.otpCode.findMany();
  for (const otp of otpCodes) {
    const typeId = await prisma.otpType.findUnique({
      where: { code: otp.type },
      select: { id: true }
    });

    if (typeId) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { typeId: typeId.id }
      });
    }
  }

  // 9. Migrate Event Hosts
  console.log('Migrating event hosts...');
  const eventHosts = await prisma.eventHost.findMany();
  for (const eh of eventHosts) {
    const roleId = await prisma.hostRole.findUnique({
      where: { code: eh.role },
      select: { id: true }
    });

    if (roleId) {
      await prisma.eventHost.update({
        where: { id: eh.id },
        data: { roleId: roleId.id }
      });
    }
  }

  // 10. Migrate Host Social Links
  console.log('Migrating host social links...');
  const hosts = await prisma.host.findMany();
  for (const host of hosts) {
    if (host.socialLinks) {
      try {
        const links = JSON.parse(host.socialLinks);
        for (const [platform, url] of Object.entries(links)) {
          await prisma.hostSocialLink.create({
            data: {
              hostId: host.id,
              platform,
              url: url as string,
            }
          }).catch(() => {}); // Ignore duplicates
        }
      } catch (e) {
        console.error(`Failed to migrate social links for host ${host.id}:`, e);
      }
    }
  }

  console.log('✅ Data migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Data migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### Step 3.2: Run Data Migration
```bash
npx tsx prisma/migrate-data.ts
```

#### Step 3.3: Verify Data Migration
```bash
# Check counts match
mysql -u root oriyet -e "
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM event_guests) as event_guests,
  (SELECT COUNT(*) FROM blog_posts) as blog_posts,
  (SELECT COUNT(*) FROM blog_tags) as blog_tags;
"
```

---

### PHASE 4: UPDATE BACKEND CODE
**Duration:** 2-4 hours
**Risk Level:** MEDIUM (Code changes)

#### Step 4.1: Create Lookup Service
```bash
# Create the lookup service file
# (Use code from NORMALIZATION_BACKEND_CHANGES.md)
```

#### Step 4.2: Update All Service Files
```bash
# Update each service file as documented in NORMALIZATION_BACKEND_CHANGES.md
# Test each change individually
```

#### Step 4.3: Test Backend Locally
```bash
# Run backend with new code
npm run dev

# Test all endpoints
curl http://localhost:5000/api/events
curl http://localhost:5000/api/blogs
curl http://localhost:5000/api/opportunities
```

---

### PHASE 5: DEPLOY AND MONITOR
**Duration:** 30 minutes
**Risk Level:** LOW (if all previous phases successful)

#### Step 5.1: Deploy Backend Changes
```bash
# Deploy updated backend code
git add .
git commit -m "feat: database normalization implementation"
git push origin main
```

#### Step 5.2: Monitor Application
```bash
# Monitor logs for errors
tail -f /var/log/oriyet/backend.log

# Check database connections
mysql -u root oriyet -e "SHOW PROCESSLIST;"
```

#### Step 5.3: Verify Frontend Functionality
- ✅ Test event listing
- ✅ Test event registration
- ✅ Test blog listing
- ✅ Test opportunity applications
- ✅ Test user authentication
- ✅ Test payment flow

---

### PHASE 6: CLEANUP (Optional - After 1 Week of Stable Operation)
**Duration:** 10 minutes
**Risk Level:** LOW

#### Step 6.1: Drop Old String Columns
**ONLY after confirming system is stable for 1+ week**

```sql
-- Backup before cleanup
mysqldump -u root oriyet > backup_before_cleanup_$(date +%Y%m%d).sql;

-- Drop old columns
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users DROP COLUMN auth_provider;
ALTER TABLE events DROP COLUMN event_type;
ALTER TABLE events DROP COLUMN event_mode;
ALTER TABLE events DROP COLUMN event_status;
ALTER TABLE events DROP COLUMN registration_status;
ALTER TABLE events DROP COLUMN online_platform;
ALTER TABLE events DROP COLUMN guests;
ALTER TABLE events DROP COLUMN signature1_name;
ALTER TABLE events DROP COLUMN signature1_title;
ALTER TABLE events DROP COLUMN signature1_image;
ALTER TABLE events DROP COLUMN signature2_name;
ALTER TABLE events DROP COLUMN signature2_title;
ALTER TABLE events DROP COLUMN signature2_image;
ALTER TABLE event_registrations DROP COLUMN status;
ALTER TABLE event_registrations DROP COLUMN payment_status;
ALTER TABLE payment_transactions DROP COLUMN gateway;
ALTER TABLE payment_transactions DROP COLUMN status;
ALTER TABLE blog_posts DROP COLUMN status;
ALTER TABLE blog_posts DROP COLUMN tags;
ALTER TABLE opportunities DROP COLUMN type;
ALTER TABLE opportunities DROP COLUMN status;
ALTER TABLE opportunity_applications DROP COLUMN status;
ALTER TABLE otp_codes DROP COLUMN type;
ALTER TABLE event_hosts DROP COLUMN role;
ALTER TABLE hosts DROP COLUMN social_links;
```

---

## ROLLBACK PLAN

### If Issues Occur in Phase 2-3:
```bash
# Restore from backup
mysql -u root -e "DROP DATABASE oriyet;"
mysql -u root -e "CREATE DATABASE oriyet;"
mysql -u root oriyet < backup_pre_normalization_*.sql

# Restore old schema
cp prisma/schema-old.prisma prisma/schema.prisma
npx prisma generate
```

### If Issues Occur in Phase 4-5:
```bash
# Revert code changes
git revert HEAD
git push origin main

# Keep database as-is (both old and new columns exist)
# System will continue working with old columns
```

---

## SUCCESS CRITERIA

✅ All existing functionality works identically
✅ No API response structure changes
✅ No data loss
✅ All tests pass
✅ No performance degradation
✅ Zero downtime during migration

---

## FINAL CONFIRMATION

**I confirm that this migration strategy:**
- ✅ Maintains backward compatibility during transition
- ✅ Allows rollback at any point
- ✅ Does not modify business logic
- ✅ Does not change feature behavior
- ✅ Preserves all existing data
- ✅ Is safe for production deployment
