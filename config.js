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
            id: 'light-series',
            title: 'Light Studies',
            folder: 'photos/', // Main folder for this series
            coverImage: 'Light-16.jpg', // Cover image for this group
            coverColor: 'rgba(26, 26, 46, 0.8)', // Tinted overlay color for cover
            images: [
                'Light-16.jpg',
                'Light-17.jpg',
                'Light-18.jpg',
                'Light-19.jpg',
                'Light-20.jpg',
                'Light-21.jpg',
                'Light-22.jpg',
                'Light-23.jpg'
            ]
        },
        // Example shoots with subfolders (uncomment and customize):
        {
            id: 'porsche-gt3rs',
            title: 'Porsche 911 GT3 RS',
            folder: 'photos/porsche-gt3rs/', // Subfolder for Porsche shoot
            coverImage: 'light-1.jpg', // First image will be cover if this doesn't exist
            coverColor: 'rgba(160, 160, 160, 0.8)' // Porsche gray tint
            // images: [] - Will auto-detect all images in the folder
        },
        {
            id: 'audi-a3',
            title: 'Audi A3',
            folder: 'photos/audi-a3/', // Subfolder for Audi shoot
            coverImage: 'Light-1.jpg',
            coverColor: 'rgba(160, 160, 160, 0.8)' // Audi gray tint
            // images: [] - Will auto-detect all images in the folder
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
