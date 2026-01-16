# Team Section - Structure & Theme

## 📍 Location
**File:** `frontend/src/app/about/page.tsx`

## 🎨 Theme Colors Used
The team section uses your project's exact color theme:

- **Primary Blue:** `#004aad` - Used for section subtitle and hover effects
- **Orange:** `#ff7620` - Used for Instagram hover and role highlights  
- **White:** `#ffffff` - Used for text on dark backgrounds
- **Gray-800:** `bg-gray-800` - Section background
- **Gray-900:** `bg-gray-900` - Team member cards

## 📊 Data Structure

The team members are stored in an array called `teamMembers` at the component level:

```typescript
const teamMembers = [
  {
    name: 'Dr. Rauful Alam',
    role: 'Co-founder & Lead Scientist',
    description: 'Staff Scientist (Lead Medicinal Chemist) at University of Chicago, USA...',
    image: 'https://images.unsplash.com/...',
    facebook: '#',
    instagram: '#',
    twitter: '#',
    github: '#'
  },
  // ... more team members
];
```

## ✏️ How to Update Team Members

### Adding a New Team Member
Simply add a new object to the `teamMembers` array:

```typescript
{
  name: 'Your Name',
  role: 'Your Role',
  description: 'Your description here...',
  image: 'https://your-cloudinary-link.com/image.jpg',
  facebook: 'https://facebook.com/yourprofile',
  instagram: 'https://instagram.com/yourprofile',
  twitter: 'https://twitter.com/yourprofile',
  github: 'https://github.com/yourprofile'
}
```

### Updating Existing Members
Just modify the values in the array - no need to change the JSX code!

### Removing a Team Member
Delete the entire object from the array.

## 🎯 Features

✅ **Data-Driven:** All team info in one array  
✅ **Responsive:** 1 column (mobile) → 2 columns (desktop)  
✅ **Dark Theme:** Gray-800/900 background  
✅ **Hover Effects:** Smooth animations and color transitions  
✅ **Social Links:** 4 social media platforms  
✅ **Project Theme:** Uses exact colors from your design system  

## 🖼️ Image Guidelines

- **Recommended Size:** 1170x1170px (square ratio works best)
- **Format:** JPG, PNG, or WebP
- **Upload to:** Cloudinary (like other project images)
- **Aspect Ratio:** Images will be cropped to fit the card (40% width, h-80)

## 🎨 Color Reference

| Element | Color | Hex Code |
|---------|-------|----------|
| Section Background | Gray-800 | `bg-gray-800` |
| Card Background | Gray-900 | `bg-gray-900` |
| Section Subtitle | Blue | `#004aad` |
| Name (Hover) | Blue | `#004aad` |
| Role Text | Gray-400 | `text-gray-400` |
| Description | Gray-500 | `text-gray-500` |
| Facebook Hover | Blue | `#004aad` |
| Instagram Hover | Orange | `#ff7620` |
| Twitter Hover | Twitter Blue | `#1DA1F2` |
| GitHub Hover | White | `#ffffff` |

## 📱 Responsive Breakpoints

- **Mobile (< 768px):** 1 column, stacked layout
- **Tablet (768px - 1024px):** 1 column, horizontal cards
- **Desktop (> 1024px):** 2 columns, horizontal cards
