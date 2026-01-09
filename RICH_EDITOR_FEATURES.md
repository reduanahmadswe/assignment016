# Rich Text Editor Features - ORIYET Blog

## ✨ New Features Added

### 1. **Text Formatting**
- ✅ Bold (Ctrl+B)
- ✅ Italic (Ctrl+I) 
- ✅ **Underline (Ctrl+U)** - NEW!
- ✅ Strikethrough
- ✅ Headings (H1, H2, H3)
- ✅ Lists (Bullet & Numbered)

### 2. **Color Customization** - NEW!

#### Text Color Picker
- Click the **Palette icon** to change text color
- Select text and choose from:
  - Interactive HexColorPicker wheel
  - 8 preset colors (Black, Red, Green, Blue, Yellow, Magenta, Cyan, Orange)
  - Custom color input

#### Highlight Picker
- Click the **Highlighter icon** to add text highlights
- Choose from:
  - Interactive HexColorPicker wheel
  - 8 preset highlight colors (Yellow, Green, Cyan, Magenta, Orange, Red, Mint, Purple)
  - Custom highlight colors

### 3. **Image Management** - ENHANCED!

#### Option 1: Upload from Computer
- Click the **Upload icon** 
- Select image file (max 5MB)
- Image automatically uploads to Cloudinary
- Add optional caption for figure element
- Automatic optimization (max 1200x630, auto quality)

#### Option 2: Add from URL
- Click the **Image icon**
- Paste image URL
- Image inserted directly

#### Figure Captions
- When uploading images, you'll be prompted for a caption
- Creates semantic HTML: `<figure><img><figcaption>Caption</figcaption></figure>`
- Captions styled in italic gray text below images

### 4. **Text Alignment**
- ✅ Left
- ✅ Center
- ✅ Right
- ✅ Justify

### 5. **Links**
- Add hyperlinks to text
- Opens in same tab (customizable)

### 6. **History**
- Undo changes
- Redo changes

## 🎨 How to Use

### Changing Text Color:
1. Select the text you want to color
2. Click the Palette icon (🎨)
3. Choose a color from:
   - Color wheel (for any custom color)
   - Quick preset buttons
4. Text color applied immediately
5. Click outside to close picker

### Adding Highlight:
1. Select the text to highlight
2. Click the Highlighter icon (🖍️)
3. Pick your highlight color
4. Highlight applied instantly

### Uploading Images with Captions:
1. Click Upload icon (⬆️)
2. Select your image file
3. Wait for upload (spinner appears)
4. Enter caption when prompted (optional)
5. Image inserted with caption below

## 🔧 Technical Details

### Frontend (Next.js + TipTap)
- **Extensions Used:**
  - `@tiptap/extension-underline` - Underline support
  - `@tiptap/extension-highlight` - Multi-color highlighting
  - `@tiptap/extension-color` - Text color
  - `react-colorful` - Color picker UI
  - `@tiptap/extension-image` - Image insertion

### Backend (Express + Cloudinary)
- **Endpoint:** `POST /api/upload/blog-image`
- **Authentication:** Required (Bearer token)
- **File Validation:**
  - Types: jpeg, jpg, png, gif, webp
  - Max size: 5MB
- **Cloudinary Settings:**
  - Folder: `oriyet/blog`
  - Max dimensions: 1200x630
  - Quality: Auto
  - Format: Auto (WebP when supported)

### CSS Styling
- Figure elements centered with shadow
- Figcaptions in gray italic
- Images rounded with responsive sizing
- Highlights with custom colors
- All styles in `globals.css`

## 📸 Example Output

```html
<!-- With Caption -->
<figure>
  <img src="https://res.cloudinary.com/.../image.jpg" alt="My Image" />
  <figcaption>This is my beautiful image caption</figcaption>
</figure>

<!-- Colored Text -->
<p>This is <span style="color: #ff0000">red text</span></p>

<!-- Highlighted Text -->
<p>This is <mark style="background-color: #ffff00">highlighted</mark></p>
```

## 🚀 Usage Tips

1. **Color Combinations:** Use color picker for text and highlights together for emphasis
2. **Figure Captions:** Always add descriptive captions for better SEO and accessibility
3. **File Optimization:** Images auto-optimized by Cloudinary - no manual resizing needed
4. **Quick Colors:** Use preset color buttons for faster workflow
5. **Mobile Support:** All features work on touch devices

## 🛠️ Future Enhancements (Optional)

- [ ] Image resize/crop tool before upload
- [ ] Drag & drop image upload
- [ ] Video embed support
- [ ] Table insertion
- [ ] Code block syntax highlighting
- [ ] Emoji picker
- [ ] Font size selector
- [ ] Line spacing controls

---

**Created for ORIYET Education Platform**  
*Making blog creation beautiful and powerful!* ✨
