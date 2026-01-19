# DATABASE NORMALIZATION - BACKEND CHANGES REQUIRED

## OVERVIEW
This document outlines ALL backend code changes required due to database normalization.
These changes are MINIMAL and ONLY address structural changes from normalization.
NO business logic, validation rules, or feature behavior is modified.

---

## 1. LOOKUP TABLE HELPER SERVICE

**File:** `src/services/lookup.service.ts` (NEW)
**Reason:** Centralized service to fetch lookup IDs by code for all normalized enums
**Change Type:** NEW FILE - Required for FK lookups

```typescript
import prisma from '../config/db.js';

class LookupService {
  private cache: Map<string, Map<string, number>> = new Map();

  async getUserRoleId(code: string): Promise<number> {
    return this.getLookupId('UserRole', 'user_roles', code);
  }

  async getAuthProviderId(code: string): Promise<number> {
    return this.getLookupId('AuthProvider', 'auth_providers', code);
  }

  async getEventTypeId(code: string): Promise<number> {
    return this.getLookupId('EventType', 'event_types', code);
  }

  async getEventModeId(code: string): Promise<number> {
    return this.getLookupId('EventMode', 'event_modes', code);
  }

  async getEventStatusId(code: string): Promise<number> {
    return this.getLookupId('EventStatus', 'event_statuses', code);
  }

  async getRegistrationStatusId(code: string): Promise<number> {
    return this.getLookupId('RegistrationStatus', 'registration_statuses', code);
  }

  async getEventRegistrationStatusId(code: string): Promise<number> {
    return this.getLookupId('EventRegistrationStatus', 'event_registration_statuses', code);
  }

  async getPaymentStatusId(code: string): Promise<number> {
    return this.getLookupId('PaymentStatus', 'payment_statuses', code);
  }

  async getPaymentGatewayId(code: string): Promise<number> {
    return this.getLookupId('PaymentGateway', 'payment_gateways', code);
  }

  async getBlogStatusId(code: string): Promise<number> {
    return this.getLookupId('BlogStatus', 'blog_statuses', code);
  }

  async getOpportunityStatusId(code: string): Promise<number> {
    return this.getLookupId('OpportunityStatus', 'opportunity_statuses', code);
  }

  async getOpportunityTypeId(code: string): Promise<number> {
    return this.getLookupId('OpportunityType', 'opportunity_types', code);
  }

  async getApplicationStatusId(code: string): Promise<number> {
    return this.getLookupId('ApplicationStatus', 'application_statuses', code);
  }

  async getOtpTypeId(code: string): Promise<number> {
    return this.getLookupId('OtpType', 'otp_types', code);
  }

  async getHostRoleId(code: string): Promise<number> {
    return this.getLookupId('HostRole', 'host_roles', code);
  }

  async getOnlinePlatformId(code: string): Promise<number | null> {
    if (!code) return null;
    return this.getLookupId('OnlinePlatform', 'online_platforms', code);
  }

  private async getLookupId(model: string, table: string, code: string): Promise<number> {
    // Check cache first
    if (!this.cache.has(table)) {
      this.cache.set(table, new Map());
    }
    
    const tableCache = this.cache.get(table)!;
    if (tableCache.has(code)) {
      return tableCache.get(code)!;
    }

    // Fetch from database
    const record = await (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].findUnique({
      where: { code },
      select: { id: true }
    });

    if (!record) {
      throw new Error(`${model} with code '${code}' not found`);
    }

    tableCache.set(code, record.id);
    return record.id;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const lookupService = new LookupService();
```

---

## 2. USER SERVICE CHANGES

**File:** `src/modules/users/user.service.ts`
**Reason:** User creation now requires roleId and authProviderId instead of string values
**Changes:**

### Change 1: Import lookup service
```typescript
import { lookupService } from '../../services/lookup.service.js';
```

### Change 2: Update createUser method
**Before:**
```typescript
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: 'user',
    authProvider: 'local',
  }
});
```

**After:**
```typescript
const roleId = await lookupService.getUserRoleId('user');
const authProviderId = await lookupService.getAuthProviderId('local');

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    roleId,
    authProviderId,
  }
});
```

### Change 3: Update response transformer to include role/authProvider strings
**Add after user queries:**
```typescript
// Transform response to include original string values
const transformUser = (user: any) => ({
  ...user,
  role: user.role?.code,
  authProvider: user.authProvider?.code,
});
```

---

## 3. AUTH SERVICE CHANGES

**File:** `src/modules/auth/auth.service.ts`
**Reason:** Registration and Google OAuth now require lookup IDs
**Changes:**

### Change 1: Import lookup service
```typescript
import { lookupService } from '../../services/lookup.service.js';
```

### Change 2: Update register method
```typescript
const roleId = await lookupService.getUserRoleId('user');
const authProviderId = await lookupService.getAuthProviderId('local');

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    roleId,
    authProviderId,
    isVerified: true,
  }
});
```

### Change 3: Update Google OAuth handler
```typescript
const roleId = await lookupService.getUserRoleId('user');
const authProviderId = await lookupService.getAuthProviderId('google');

const user = await prisma.user.create({
  data: {
    email,
    name,
    googleId,
    roleId,
    authProviderId,
    isVerified: true,
  }
});
```

### Change 4: Update all user queries to include relations
```typescript
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    role: true,
    authProvider: true,
  }
});
```

---

## 4. EVENT SERVICE CHANGES

**File:** `src/modules/events/event.service.ts`
**Reason:** Event creation/update now requires lookup IDs and guests normalization
**Changes:**

### Change 1: Import lookup service
```typescript
import { lookupService } from '../../services/lookup.service.js';
```

### Change 2: Update createEvent method
**Replace string assignments with ID lookups:**
```typescript
const eventTypeId = await lookupService.getEventTypeId(data.event_type);
const eventModeId = await lookupService.getEventModeId(data.event_mode);
const eventStatusId = await lookupService.getEventStatusId('upcoming');
const registrationStatusId = await lookupService.getRegistrationStatusId('open');
const onlinePlatformId = data.online_platform 
  ? await lookupService.getOnlinePlatformId(data.online_platform)
  : null;

const event = await tx.event.create({
  data: {
    title: data.title,
    slug,
    description: data.description,
    content: data.content,
    thumbnail: data.thumbnail,
    eventTypeId,
    eventModeId,
    onlinePlatformId,
    eventStatusId,
    registrationStatusId,
    // ... rest of fields
  },
});

// Handle guests separately
if (data.guests && data.guests.length > 0) {
  for (const guest of data.guests) {
    const roleId = await lookupService.getHostRoleId(guest.role || 'guest');
    await tx.eventGuest.create({
      data: {
        eventId: event.id,
        name: guest.name,
        email: guest.email,
        bio: guest.bio,
        roleId,
        pictureLink: guest.pictureLink,
        website: guest.website,
        cvLink: guest.cvLink,
      }
    });
  }
}

// Handle signatures separately
if (data.signature1_name) {
  const sig1 = await tx.certificateSignature.create({
    data: {
      name: data.signature1_name,
      title: data.signature1_title!,
      image: data.signature1_image,
    }
  });
  await tx.eventSignature.create({
    data: { eventId: event.id, signatureId: sig1.id, position: 1 }
  });
}

if (data.signature2_name) {
  const sig2 = await tx.certificateSignature.create({
    data: {
      name: data.signature2_name,
      title: data.signature2_title!,
      image: data.signature2_image,
    }
  });
  await tx.eventSignature.create({
    data: { eventId: event.id, signatureId: sig2.id, position: 2 }
  });
}
```

### Change 3: Update getEventById to include relations and transform response
```typescript
const event = await prisma.event.findUnique({
  where: { id: eventId },
  include: {
    eventType: true,
    eventMode: true,
    eventStatus: true,
    registrationStatus: true,
    onlinePlatform: true,
    eventGuests: {
      include: { role: true }
    },
    eventSignatures: {
      include: { signature: true },
      orderBy: { position: 'asc' }
    },
    _count: {
      select: {
        registrations: {
          where: { status: { relation: { code: { not: 'cancelled' } } } },
        },
      },
    },
  },
});

// Transform response
return {
  ...event,
  eventType: event.eventType.code,
  eventMode: event.eventMode.code,
  eventStatus: event.eventStatus.code,
  registrationStatus: event.registrationStatus.code,
  onlinePlatform: event.onlinePlatform?.code,
  guests: event.eventGuests.map(g => ({
    name: g.name,
    email: g.email,
    bio: g.bio,
    role: g.role.code,
    pictureLink: g.pictureLink,
    website: g.website,
    cvLink: g.cvLink,
  })),
  signature1_name: event.eventSignatures[0]?.signature.name,
  signature1_title: event.eventSignatures[0]?.signature.title,
  signature1_image: event.eventSignatures[0]?.signature.image,
  signature2_name: event.eventSignatures[1]?.signature.name,
  signature2_title: event.eventSignatures[1]?.signature.title,
  signature2_image: event.eventSignatures[1]?.signature.image,
  registered_count: event._count.registrations,
};
```

### Change 4: Update status change methods
```typescript
async updateEventStatuses() {
  const now = new Date();
  const ongoingStatusId = await lookupService.getEventStatusId('ongoing');
  const completedStatusId = await lookupService.getEventStatusId('completed');
  const upcomingStatusId = await lookupService.getEventStatusId('upcoming');
  const closedStatusId = await lookupService.getRegistrationStatusId('closed');

  await prisma.event.updateMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
      eventStatusId: upcomingStatusId,
    },
    data: { eventStatusId: ongoingStatusId },
  });

  await prisma.event.updateMany({
    where: {
      endDate: { lt: now },
      eventStatusId: { in: [upcomingStatusId, ongoingStatusId] },
    },
    data: {
      eventStatusId: completedStatusId,
      registrationStatusId: closedStatusId,
    },
  });
}
```

---

## 5. EVENT REGISTRATION SERVICE CHANGES

**File:** `src/modules/events/event.service.ts` (registration methods)
**Reason:** Registration status and payment status now use lookup IDs
**Changes:**

### Update registerForEvent method
```typescript
const confirmedStatusId = await lookupService.getEventRegistrationStatusId('confirmed');
const notRequiredPaymentId = await lookupService.getPaymentStatusId('not_required');

await tx.eventRegistration.create({
  data: {
    eventId,
    userId,
    registrationNumber,
    statusId: confirmedStatusId,
    paymentStatusId: notRequiredPaymentId,
    paymentAmount: 0,
  },
});
```

---

## 6. PAYMENT SERVICE CHANGES

**File:** `src/modules/payments/payment.service.ts`
**Reason:** Payment status and gateway now use lookup IDs
**Changes:**

### Change 1: Import lookup service
```typescript
import { lookupService } from '../../services/lookup.service.js';
```

### Change 2: Update payment creation
```typescript
const pendingStatusId = await lookupService.getPaymentStatusId('pending');
const gatewayId = await lookupService.getPaymentGatewayId('uddoktapay');

const payment = await prisma.paymentTransaction.create({
  data: {
    userId,
    amount,
    currency: 'BDT',
    gatewayId,
    statusId: pendingStatusId,
    invoiceId,
    // ... rest
  }
});
```

### Change 3: Update payment status updates
```typescript
const completedStatusId = await lookupService.getPaymentStatusId('completed');
const failedStatusId = await lookupService.getPaymentStatusId('failed');

await prisma.paymentTransaction.update({
  where: { id: paymentId },
  data: { statusId: completedStatusId, paidAt: new Date() }
});
```

---

## 7. BLOG SERVICE CHANGES

**File:** `src/modules/blogs/blog.service.ts`
**Reason:** Blog status now uses lookup ID, tags normalized to junction table
**Changes:**

### Change 1: Import lookup service
```typescript
import { lookupService } from '../../services/lookup.service.js';
```

### Change 2: Update createBlogPost method
```typescript
const statusId = await lookupService.getBlogStatusId(data.status || 'draft');

const blogPost = await tx.blogPost.create({
  data: {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    thumbnail: data.thumbnail,
    authorId: data.author_id,
    statusId,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    views: 0,
    publishedAt: data.status === 'published' ? new Date() : null,
  },
});

// Handle tags
if (data.tags && data.tags.length > 0) {
  for (const tagName of data.tags) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Find or create tag
    let tag = await tx.tag.findUnique({ where: { slug } });
    if (!tag) {
      tag = await tx.tag.create({
        data: { name: tagName, slug }
      });
    }
    
    // Create junction
    await tx.blogTag.create({
      data: {
        blogPostId: blogPost.id,
        tagId: tag.id,
      }
    });
  }
}
```

### Change 3: Update getBlogPost to include tags
```typescript
const post = await prisma.blogPost.findUnique({
  where: { slug },
  include: {
    author: true,
    status: true,
    blogTags: {
      include: { tag: true }
    }
  }
});

return {
  ...post,
  status: post.status.code,
  tags: post.blogTags.map(bt => bt.tag.name),
};
```

---

## 8. OPPORTUNITY SERVICE CHANGES

**File:** `src/modules/opportunities/opportunity.service.ts`
**Reason:** Opportunity type and status now use lookup IDs
**Changes:**

### Change 1: Import lookup service
```typescript
import { lookupService } from '../../services/lookup.service.js';
```

### Change 2: Update createOpportunity
```typescript
const typeId = await lookupService.getOpportunityTypeId(data.type);
const statusId = await lookupService.getOpportunityStatusId(data.status || 'open');

const opportunity = await prisma.opportunity.create({
  data: {
    title: data.title,
    slug,
    description: data.description,
    typeId,
    location: data.location,
    duration: data.duration,
    deadline: data.deadline,
    statusId,
    banner: data.banner,
  }
});
```

### Change 3: Update application status
```typescript
const statusId = await lookupService.getApplicationStatusId('pending');

await prisma.opportunityApplication.create({
  data: {
    opportunityId,
    name,
    email,
    phone,
    cvLink,
    imageLink,
    portfolioLink,
    statusId,
  }
});
```

---

## 9. HOST SERVICE CHANGES

**File:** `src/modules/hosts/host.service.ts`
**Reason:** Social links normalized to separate table
**Changes:**

### Update createHost method
```typescript
const host = await tx.host.create({
  data: {
    name: data.name,
    email: data.email,
    bio: data.bio,
    profileImage: data.profile_image,
    cvLink: data.cv_link,
    isActive: true,
  }
});

// Handle social links
if (data.social_links && typeof data.social_links === 'object') {
  for (const [platform, url] of Object.entries(data.social_links)) {
    await tx.hostSocialLink.create({
      data: {
        hostId: host.id,
        platform,
        url: url as string,
      }
    });
  }
}
```

### Update getHost to include social links
```typescript
const host = await prisma.host.findUnique({
  where: { id },
  include: {
    hostSocialLinks: true,
  }
});

return {
  ...host,
  social_links: host.hostSocialLinks.reduce((acc, link) => {
    acc[link.platform] = link.url;
    return acc;
  }, {} as Record<string, string>),
};
```

---

## 10. OTP SERVICE CHANGES

**File:** `src/modules/auth/otp.service.ts`
**Reason:** OTP type now uses lookup ID
**Changes:**

```typescript
const typeId = await lookupService.getOtpTypeId(type || 'verification');

await prisma.otpCode.create({
  data: {
    email,
    code,
    typeId,
    expiresAt,
  }
});
```

---

## SUMMARY OF CHANGES

### New Files:
1. `src/services/lookup.service.ts` - Centralized lookup ID resolver

### Modified Files (with minimal changes):
1. `src/modules/users/user.service.ts` - Use roleId, authProviderId
2. `src/modules/auth/auth.service.ts` - Use roleId, authProviderId
3. `src/modules/events/event.service.ts` - Use event-related IDs, normalize guests/signatures
4. `src/modules/payments/payment.service.ts` - Use gatewayId, statusId
5. `src/modules/blogs/blog.service.ts` - Use statusId, normalize tags
6. `src/modules/opportunities/opportunity.service.ts` - Use typeId, statusId
7. `src/modules/hosts/host.service.ts` - Normalize social links
8. `src/modules/auth/otp.service.ts` - Use typeId

### Key Principles Maintained:
✅ NO business logic changes
✅ NO validation rule changes
✅ NO API response structure changes (transformers preserve original format)
✅ NO feature behavior changes
✅ All changes are STRUCTURAL only due to normalization

---

## RESPONSE TRANSFORMATION PATTERN

All services MUST transform database responses back to original string format:

```typescript
// Example pattern used throughout
const transformResponse = (record: any) => ({
  ...record,
  // Convert FK relations back to original string values
  role: record.role?.code,
  status: record.status?.code,
  eventType: record.eventType?.code,
  // ... etc
});
```

This ensures frontend receives IDENTICAL response structure as before normalization.
