# Newsletter Shareable Links Feature

## Overview
প্রতিটি newsletter এর জন্য একটি unique, SEO-friendly shareable link তৈরি করা হয়েছে। এখন আপনি specific newsletter share করতে পারবেন।

## Features
- ✅ Automatic slug generation from newsletter title
- ✅ Unique shareable URLs for each newsletter
- ✅ SEO-friendly links
- ✅ Automatic view count increment when accessed via slug
- ✅ Duplicate slug prevention

## API Endpoints

### Get Newsletter by Slug (Public)
```
GET /api/newsletters/slug/:slug
```

**Example:**
```bash
curl http://localhost:5000/api/newsletters/slug/oriyet-digest-december-2024-edition
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "ORIYET Digest December 2024 Edition",
    "slug": "oriyet-digest-december-2024-edition",
    "description": "...",
    "thumbnail": "...",
    "pdfLink": "...",
    "views": 125,
    "downloads": 45,
    ...
  }
}
```

### Get Newsletter by ID (Public)
```
GET /api/newsletters/:id
```

## Frontend Usage

### Shareable Link Format
```
http://localhost:3000/newsletters/slug/[slug]
```

### Example Links
- `http://localhost:3000/newsletters/slug/oriyet-digest-december-2024-edition`
- `http://localhost:3000/newsletters/slug/oriyet-newsletter-issue-1-empowering-youth-through-research`

## How It Works

### 1. Creating a Newsletter
যখন একটি নতুন newsletter create করা হয়, automatically একটি unique slug generate হয়:

```typescript
// Title: "ORIYET Digest December 2024 Edition"
// Generated Slug: "oriyet-digest-december-2024-edition"
```

### 2. Slug Generation Rules
- Title lowercase করা হয়
- Special characters remove করা হয়
- Spaces কে hyphens (-) দিয়ে replace করা হয়
- Duplicate slugs এর জন্য counter যোগ করা হয় (e.g., `title-1`, `title-2`)

### 3. Updating Newsletter
যদি newsletter এর title update করা হয়, slug automatically regenerate হয়।

### 4. View Tracking
যখন কেউ slug দিয়ে newsletter access করে, view count automatically increment হয়।

## Database Schema

```prisma
model Newsletter {
  id          Int      @id @default(autoincrement())
  title       String
  slug        String?  @unique // Unique URL-friendly identifier
  description String?  @db.Text
  thumbnail   String?
  pdfLink     String   @map("pdf_link")
  startDate   DateTime? @map("start_date")
  endDate     DateTime? @map("end_date")
  isPublished Boolean  @default(true) @map("is_published")
  views       Int      @default(0)
  downloads   Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("newsletters")
}
```

## Migration

### Populating Slugs for Existing Newsletters

If you have existing newsletters without slugs, run this script to populate them:

```bash
cd backend
npx tsx src/scripts/populate-newsletter-slugs.ts
```

This script will:
- Find all newsletters without slugs
- Generate unique slugs for each
- Update the database
- Prevent duplicate slugs

## Troubleshooting

### Issue: Slug shows as "undefined" in share link

**Cause:** Existing newsletters in the database don't have slugs populated.

**Solution:** 
1. Run the migration script:
   ```bash
   npx tsx src/scripts/populate-newsletter-slugs.ts
   ```
2. Refresh the frontend page to get updated data

### Issue: Share link doesn't work

**Fallback:** The frontend now supports both slug and ID-based URLs:
- Preferred: `/newsletter?slug=newsletter-title`
- Fallback: `/newsletter?id=123`

If a newsletter doesn't have a slug, the share function will automatically use the ID instead.

## Testing

Newsletter links test করতে:

```bash
npx tsx test-newsletter-links.ts
```

## Frontend Integration Example

```typescript
// Fetch newsletter by slug
const response = await fetch(`/api/newsletters/slug/${slug}`);
const { data: newsletter } = await response.json();

// Generate shareable link
const shareableLink = `${window.location.origin}/newsletters/slug/${newsletter.slug}`;

// Share on social media
const shareOnFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`);
};

const shareOnTwitter = () => {
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}&text=${encodeURIComponent(newsletter.title)}`);
};
```

## Benefits

1. **SEO-Friendly**: Search engines can easily index newsletter pages
2. **User-Friendly**: Clean, readable URLs that users can remember
3. **Shareable**: Easy to share on social media and messaging apps
4. **Trackable**: Automatic view count tracking
5. **Unique**: Each newsletter has its own distinct URL

## Example Use Cases

1. **Social Media Sharing**: Share specific newsletters on Facebook, Twitter, LinkedIn
2. **Email Campaigns**: Include direct links in email newsletters
3. **QR Codes**: Generate QR codes for specific newsletters
4. **Analytics**: Track which newsletters are most popular
5. **Bookmarking**: Users can bookmark specific newsletters

---

**Created:** 2026-01-15
**Version:** 1.0.0
