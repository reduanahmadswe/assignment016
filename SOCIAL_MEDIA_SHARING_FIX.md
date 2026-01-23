# Blog Social Media Sharing - Troubleshooting Guide

## Current Status
✅ Server-side metadata generation implemented
✅ Google Drive image proxy API created
✅ Open Graph and Twitter Card tags configured

## LinkedIn Post Inspector Steps

### 1. Clear LinkedIn Cache
Visit: https://www.linkedin.com/post-inspector/

Enter your blog URL:
```
https://oriyet.org/blog/why-the-publication-shouldnt-come-before-research-mkpzvnfh
```

Click "Inspect" - this will:
- Clear LinkedIn's cache for this URL
- Show you exactly what meta tags LinkedIn sees
- Display the preview image that will be shown

### 2. Check Meta Tags
The inspector will show you:
- **Title**: Should be your blog title
- **Description**: Should be your blog excerpt
- **Image**: Should be your blog thumbnail (not ORIYET logo)

### 3. If Image Still Doesn't Show

**Option A: Use the Query Parameter Trick**
Add `?v=2` to force new cache:
```
https://oriyet.org/blog/why-the-publication-shouldnt-come-before-research-mkpzvnfh?v=2
```

**Option B: Upload Images to Your Server Instead of Google Drive**

Google Drive has limitations for social media sharing. For best results:

1. Upload blog thumbnails to your backend uploads folder
2. Or use a CDN like Cloudinary
3. Or use direct image hosting services

**Option C: Make Google Drive Images Public**

Ensure your Google Drive image is:
1. Set to "Anyone with the link can view"
2. Not restricted by organization policies
3. Using the correct sharing format

### 4. Test URLs

**Proxy Image URL Format:**
```
https://oriyet.org/api/og-image?url=ENCODED_GOOGLE_DRIVE_URL
```

**Direct Test:**
Open this in browser to verify image loads:
```
https://oriyet.org/api/og-image?url=https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F1l3RAvW44FX_tgf7AQo
```

### 5. Deployment Checklist

- [ ] Code deployed to production
- [ ] Environment variables set (NEXT_PUBLIC_APP_URL)
- [ ] Clear LinkedIn cache using Post Inspector
- [ ] Test with different blog posts
- [ ] Verify image loads in proxy endpoint

### 6. Alternative Solution: Pre-generate OG Images

If Google Drive continues to have issues, consider:

1. **Backend Image Upload**: Store thumbnails in `/uploads/blog-thumbnails/`
2. **Image CDN**: Use Cloudinary (already configured in backend)
3. **Static OG Images**: Generate custom OG images per post

## Quick Fix Instructions

1. **Deploy the latest code** (includes image proxy)
2. **Clear LinkedIn cache** at https://www.linkedin.com/post-inspector/
3. **Share again** - the thumbnail should now appear

## Still Not Working?

If after these steps the thumbnail still doesn't show:

1. Check browser console for errors when accessing `/api/og-image`
2. Verify the Google Drive link is publicly accessible
3. Consider uploading images directly to your server instead

## Contact
If issues persist, the recommended solution is to **upload blog thumbnails directly to your server** rather than using Google Drive links for social media sharing.
