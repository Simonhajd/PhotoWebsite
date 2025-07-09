// Image Configuration for Car Photography Portfolio
// Configure your camera settings and organize photos by car/shoot

window.portfolioConfig = {
    // Your camera settings (will be used as fallback when EXIF data is not available)
    camera: {
        make: 'Sony',
        model: 'A7R III',
        lens: 'Sony 20-70mm f/4 G', // Update this with your lens
        photographer: 'Simon Hajduk' // Update this with your name
    },
    
    // Photo shoots organized by car/location
    // Each shoot can have its own subfolder and cover image
    shoots: [
        {
            id: 'porsche-gt3rs',
            title: 'Porsche 911 GT3 RS',
            folder: 'photos/porsche-gt3rs/', // Subfolder for Porsche shoot
            coverImage: 'hero.jpg', // Use the hero image as cover
            coverColor: 'rgba(143, 143, 143, 0.3)', // Porsche blue tint
            images: [
                'GT3RS-08.jpg',
                'GT3RS-09.jpg',
                'GT3RS-10.jpg',
                'GT3RS-11.jpg',
                'GT3RS-12.jpg',
                'GT3RS-14.jpg',
                'hero.jpg'
            ]
        },
        {
            id: 'audi-a3',
            title: 'Audi A3',
            folder: 'photos/audi-a3/', // Subfolder for Audi shoot
            coverImage: 'hero.jpg', // Use the hero image as cover
            coverColor: 'rgba(143, 143, 143, 0.3)', // Audi red tint
            images: [
                'A3-1.jpg',
                'A3-2.jpg',
                'A3-3.jpg',
                'A3-5.jpg',
                'A3-6.jpg',
                'A3-7.jpg',
                'hero.jpg'
            ]
        }
    ],
    
    // Global settings
    settings: {
        enableMetadataExtraction: true, // Extract real EXIF data from images
        showCaptions: false, // You don't want captions
        showCameraSettings: true, // Show camera settings from EXIF
        groupedLayout: true, // Show photos grouped by shoots
        coverImageStyle: 'tinted' // 'tinted' or 'gradient' overlay style
    }
};
