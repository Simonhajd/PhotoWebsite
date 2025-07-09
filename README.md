# Premium Car Photography Portfolio

A sophisticated, responsive web portfolio designed for showcasing automotive photography with premium aesthetics and advanced functionality. Features grouped shoots with subfolders, real EXIF metadata extraction, and customizable camera settings.

## ✨ Features

### 🖼️ Portfolio & Gallery
- **Grouped Shoot Layout**: Organize photos by car/shoot with cover images and tinted overlays
- **Dynamic Subfolder Support**: Each car shoot can have its own subfolder
- **Progressive Image Loading**: Thumbnails → Previews → Full resolution for optimal performance
- **Automatic Image Optimization**: Built-in support for thumbnail and preview generation
- **Real EXIF Extraction**: Automatically extracts camera settings from image metadata
- **Responsive Masonry Layout**: Optimized grid display for desktop and mobile
- **Lazy Loading**: Improved performance with intersection observer API
- **Fullscreen Lightbox**: Click any image to view in an elegant lightbox modal
- **Touch/Swipe Navigation**: Mobile-friendly swipe gestures
- **Keyboard Navigation**: Use arrow keys and ESC in lightbox mode

### 🎨 Premium Design
- **Dark Mode by Default**: Elegant dark theme with light mode toggle
- **Modern Typography**: Clean Inter font with perfect hierarchy
- **Smooth Animations**: Subtle fade-ins, hover effects, and transitions
- **Responsive Design**: Pixel-perfect on all devices
- **Sticky Navigation**: Always accessible navigation bar
- **Tinted Cover Images**: Each shoot displays with custom color overlays

### ⚙️ Advanced Functionality
- **Auto-Detection**: Supports JPG, PNG, WebP, and AVIF formats
- **Real EXIF Data**: Extracts camera make, model, lens, settings from image files
- **Configurable Camera Info**: Set fallback camera details in config.js
- **No Captions Mode**: Clean presentation without distracting text overlays
- **Performance Optimized**: Throttled scroll events, debounced interactions
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **SEO Friendly**: Semantic HTML and proper meta tags

## 🚀 Getting Started

### 1. Setup
1. Download all files to your project directory
2. Ensure you have the following structure:
   ```
   your-project/
   ├── index.html
   ├── style.css
   ├── script.js
   ├── config.js
   ├── exif.js
   ├── README.md
   └── photos/
       ├── your-light-series/
       │   ├── Light-16.jpg
       │   └── Light-17.jpg
       ├── ferrari-458/
       │   ├── hero-shot.jpg
       │   ├── exterior-1.jpg
       │   └── interior-1.jpg
       └── porsche-911/
           ├── profile.jpg
           └── front-angle.jpg
   ```

### 2. ⚡ Optimize Your Images (IMPORTANT!)
**For best performance, run image optimization first:**

```bash
# Automatic optimization (recommended)
npm install
npm run optimize
```

**OR use the Windows batch script:**
```bash
optimize-images.bat
```

This creates optimized thumbnails and previews for lightning-fast loading!

### 3. Configure Your Shoots
Edit `config.js` to set up your camera info and organize photos by car/shoot:

```javascript
window.portfolioConfig = {
    // Your camera settings (fallback when EXIF is unavailable)
    camera: {
        make: 'Canon',
        model: 'EOS R5',
        lens: 'RF 24-70mm f/2.8L IS USM',
        photographer: 'Your Name'
    },
    
    // Photo shoots organized by car/location
    shoots: [
        {
            id: 'ferrari-458',
            title: 'Ferrari 458 Italia',
            description: 'Italian excellence captured in perfect light',
            folder: 'photos/ferrari-458/', // Subfolder path
            coverImage: 'hero-shot.jpg',   // Cover image filename
            coverColor: 'rgba(220, 38, 38, 0.8)', // Red tint
            images: ['hero-shot.jpg', 'exterior-1.jpg', 'interior-1.jpg']
        }
        // Add more shoots...
    ],
    
    // Global settings
    settings: {
        enableMetadataExtraction: true, // Extract real EXIF data
        showCaptions: false,           // Hide captions (recommended)
        showCameraSettings: true,      // Show camera settings in lightbox
        groupedLayout: true,          // Use grouped layout
        coverImageStyle: 'tinted'     // Tinted cover overlays
    }
};
```

### 4. Add Your Photos
1. Create subfolders in `photos/` for each car/shoot
2. Place photos in the appropriate subfolder
3. Update the `config.js` file to list your actual image filenames
4. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`

### 5. Launch
- Open `index.html` in your web browser
- For best results, serve from a local web server:
  ```bash
  # Using Python 3
  python -m http.server 8000
  
  # Using Node.js (if you have http-server installed)
  npx http-server
  
  # Using PHP
  php -S localhost:8000
  ```

## 📁 File Structure

```
project/
├── index.html          # Main HTML file with semantic structure
├── style.css           # Premium CSS with dark/light themes
├── script.js           # Main portfolio functionality
├── config.js           # Configuration for shoots and camera settings
├── exif.js             # Real EXIF metadata extractor
├── test.html           # Image detection test tool
├── debug.html          # Debug and configuration tool
├── .htaccess           # Apache server configuration
├── README.md           # This documentation
└── photos/             # Your car photography organized by shoots
    ├── light-series/   # Example: artistic lighting studies
    │   ├── Light-16.jpg
    │   ├── Light-17.jpg
    │   └── ...
    ├── ferrari-458/    # Example: Ferrari 458 Italia shoot
    │   ├── hero-shot.jpg (cover image)
    │   ├── exterior-1.jpg
    │   ├── interior-1.jpg
    │   └── detail-1.jpg
    └── porsche-911/    # Example: Porsche 911 shoot
        ├── profile.jpg (cover image)
        ├── front-angle.jpg
        ├── rear-view.jpg
        └── cockpit.jpg
    └── ...
```

## 🚗 Organizing Car Shoots

### Recommended Folder Structure
```
photos/
├── ferrari-458/
│   ├── hero-shot.jpg      # Main cover image (wide angle)
│   ├── exterior-front.jpg # Front 3/4 view
│   ├── exterior-rear.jpg  # Rear 3/4 view
│   ├── profile-side.jpg   # Clean side profile
│   ├── interior-dash.jpg  # Dashboard/cockpit
│   ├── detail-wheel.jpg   # Wheel/brake detail
│   ├── detail-badge.jpg   # Logo/badge closeup
│   └── action-rolling.jpg # Rolling/action shot
├── porsche-911/
│   ├── profile.jpg        # Cover image
│   ├── front-angle.jpg
│   ├── rear-spoiler.jpg
│   └── interior-seats.jpg
└── lamborghini-huracan/
    ├── dramatic-low.jpg   # Cover image
    ├── scissor-doors.jpg
    └── engine-bay.jpg
```

### Cover Image Guidelines
- **Aspect Ratio**: 16:9 or 3:2 works best for cover images
- **Composition**: Wide shots that show the car's character
- **Lighting**: Dramatic or hero shots that represent the shoot
- **Quality**: High resolution (1920px+ width recommended)

## 📸 EXIF Metadata Features

### What Gets Extracted
The portfolio automatically reads real camera data from your images:
- **Camera**: Make and model (e.g., "Canon EOS R5")
- **Lens**: Lens information if available
- **Settings**: Aperture, shutter speed, ISO, focal length
- **Date**: When the photo was taken

### Camera Configuration
Set your camera details in `config.js` as a fallback:
```javascript
camera: {
    make: 'Canon',           // Your camera brand
    model: 'EOS R5',         // Your camera model  
    lens: 'RF 24-70mm f/2.8L IS USM', // Your primary lens
    photographer: 'Your Name' // Your name/studio
}
```

### EXIF Display
- **Lightbox**: Camera settings appear when viewing images fullscreen
- **Real Data**: Uses actual EXIF when available
- **Fallback**: Uses your configured camera info when EXIF is missing
- **Clean Display**: No captions overlay the images for clean presentation

## 🎯 Shoot Configuration Tips

### Color Themes by Car Brand
```javascript
// Ferrari - Red tint
coverColor: 'rgba(220, 38, 38, 0.8)'

// Porsche - Blue tint  
coverColor: 'rgba(59, 130, 246, 0.8)'

// Lamborghini - Green tint
coverColor: 'rgba(34, 197, 94, 0.8)'

// McLaren - Orange tint
coverColor: 'rgba(249, 115, 22, 0.8)'

// Aston Martin - British Racing Green
coverColor: 'rgba(5, 150, 105, 0.8)'

// BMW M - Blue/White
coverColor: 'rgba(37, 99, 235, 0.8)'
```

### Shoot Descriptions
- Keep descriptions concise (1-2 lines)
- Focus on the unique aspect of that shoot
- Examples: "Italian excellence captured in perfect light"
- Avoid generic phrases; be specific to each car

## 🎯 Image Naming Tips

For best results, name your images descriptively:
- `hero-shot.jpg` → Cover image for the shoot
- `exterior-front.jpg` → Front exterior view
- `interior-dash.jpg` → Dashboard/interior shot
- `detail-wheel.jpg` → Detail shots

The portfolio automatically:
- Formats filenames into readable titles
- Extracts real EXIF metadata from images
- Groups photos by car/shoot with tinted covers
- No captions for clean presentation

## 🛠️ Customization

### Colors & Themes
Edit CSS variables in `style.css`:
```css
:root {
  --color-accent: #3b82f6;        /* Primary accent color */
  --color-background: #0a0a0a;    /* Dark theme background */
  /* ... more variables ... */
}
```

### Typography
Change the font by updating the Google Fonts link in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Content
- **Portfolio Title**: Edit the `<h1>` in the navbar
- **Hero Section**: Update titles and taglines in the hero section
- **About Section**: Customize your bio and statistics
- **Contact Info**: Update email, phone, and location

## 🔧 Technical Details

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Performance Features
- Intersection Observer for lazy loading
- Throttled scroll events
- Debounced resize handlers
- Image preloading for smooth navigation
- CSS containment for better rendering

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support
- Reduced motion preferences

## 📱 Mobile Experience

- **Responsive Grid**: Adapts from 1-column (mobile) to 4-columns (desktop)
- **Touch Gestures**: Swipe left/right in lightbox to navigate
- **Mobile Menu**: Collapsible hamburger navigation
- **Optimized Images**: Proper sizing for mobile viewports

## 🌐 Deployment

### GitHub Pages
1. Create a GitHub repository
2. Upload all files
3. Enable GitHub Pages in repository settings
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop your project folder to [Netlify](https://netlify.com)
2. Your site will be live instantly with a custom URL

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts for instant deployment

## 💡 Pro Tips

1. **Image Optimization**: Use WebP format for better compression
2. **File Naming**: Use descriptive names for better SEO
3. **Image Sizes**: Aim for 1920px width for best quality/performance balance
4. **Aspect Ratios**: Mixed ratios create more interesting layouts
5. **Color Grading**: Consistent color grading across photos enhances the professional look

## 🎨 Design Philosophy

This portfolio embodies the principles of:
- **Minimalism**: Clean, uncluttered interface that puts your photography first
- **Premium Feel**: Every element designed to convey professionalism and quality
- **Performance**: Fast loading and smooth interactions
- **Accessibility**: Inclusive design that works for everyone
- **Responsiveness**: Perfect experience on any device

## 📞 Support

For questions or customization help:
- Check the code comments for detailed explanations
- All functions are modular and well-documented
- CSS variables make theming straightforward
- JavaScript classes provide clean, maintainable code

---

**Built with passion for automotive photography enthusiasts.**
*Every line of code crafted for premium presentation.*
