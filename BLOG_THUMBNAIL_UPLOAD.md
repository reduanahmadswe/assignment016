# Blog Thumbnail Upload - Direct Server Upload

## ✅ Backend Setup Complete

Blog thumbnail upload করার জন্য backend এ file upload support add করা হয়েছে।

### Changes Made:

1. **Blog Routes** - `backend/src/modules/blogs/blog.routes.ts`
   - Added `uploadImage.single('thumbnail')` middleware
   - Create এবং Update routes এ file upload support

2. **Blog Controller** - `backend/src/modules/blogs/blog.controller.ts`
   - `req.file` থেকে uploaded thumbnail file handle করে
   - File automatically `/uploads/images/` folder এ save হয়

3. **Blog Service** - `backend/src/modules/blogs/blog.service.ts`
   - Uploaded file এর URL database এ save করে
   - Update করার সময় old thumbnail delete করে (যদি local file হয়)
   - File URL format: `/uploads/images/unique-filename.jpg`

### How It Works:

#### Backend:
```typescript
// POST /api/blogs
// PUT /api/blogs/:id

// File automatically saved to: backend/uploads/images/
// URL format: /uploads/images/abc123.jpg
```

#### Frontend - Admin Blog Create/Edit Form:

Admin blog create/edit form এ change করতে হবে:

```tsx
// FormData দিয়ে file পাঠাতে হবে
const formData = new FormData();
formData.append('title', title);
formData.append('content', content);
formData.append('excerpt', excerpt);
formData.append('status', status);

// File input থেকে image add করো
if (thumbnailFile) {
  formData.append('thumbnail', thumbnailFile); // File object
}

// API call with FormData
await adminAPI.post('/blogs', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

### File Structure:

```
backend/
  uploads/
    images/              ← Blog thumbnails save হয় এখানে
      abc123.jpg
      def456.png
    avatars/             ← User avatars
    documents/           ← Other files
```

### Benefits:

✅ **No Google Drive dependency** - Direct server upload
✅ **Fast loading** - Local files serve হয় তাড়াতাড়ি
✅ **Social media compatible** - Absolute URLs সবজায়গায় কাজ করে
✅ **Auto cleanup** - Old thumbnails automatically delete হয়
✅ **Size limit** - Max 5MB images

### Image URL Format:

Database এ save হয়:
```
/uploads/images/abc123-uuid.jpg
```

Full URL (production):
```
https://oriyet.org/uploads/images/abc123-uuid.jpg
```

### Next Step for Frontend:

Admin blog form এ file input add করো:
```tsx
<input 
  type="file" 
  accept="image/*"
  onChange={(e) => setThumbnailFile(e.target.files[0])}
/>
```

এখন backend ready! Frontend admin panel এ form update করলেই direct upload কাজ করবে। 🎉
