/* ==========================================================================
   Premium Car Photography Portfolio JavaScript
   Modern, modular code with advanced features and performance optimizations
   ========================================================================== */

class CarPhotographyPortfolio {
    constructor() {
        this.images = [];
        this.shoots = [];
        this.currentImageIndex = 0;
        this.isLightboxOpen = false;
        this.intersectionObserver = null;
        this.isLoading = false;
        this.exifExtractor = null;
        
        // Supported image formats
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
        
        // Initialize the application
        this.init();
    }

    async init() {
        // Initialize EXIF extractor if available
        if (window.ExifExtractor) {
            this.exifExtractor = new ExifExtractor();
        }
        
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.loadThemePreference();
        await this.loadImages();
        this.updatePhotoCount();
        this.setupKeyboardNavigation();
    }

    /* ==========================================================================
       Event Listeners Setup
       ========================================================================== */

    setupEventListeners() {
        // Theme toggle
        document.querySelectorAll('.theme-toggle').forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
                mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
                mobileMenu.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const mobileMenu = document.querySelector('.mobile-menu');
                    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });

        // Lightbox event listeners
        this.setupLightboxListeners();

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            
            if (mobileMenu && mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 150);
        });
    }

    setupLightboxListeners() {
        const lightbox = document.getElementById('lightbox');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxDownload = document.querySelector('.lightbox-download');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        const lightboxOverlay = document.querySelector('.lightbox-overlay');

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        if (lightboxDownload) {
            lightboxDownload.addEventListener('click', () => this.downloadCurrentImage());
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => this.previousImage());
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => this.nextImage());
        }

        if (lightboxOverlay) {
            lightboxOverlay.addEventListener('click', () => this.closeLightbox());
        }

        // Touch/swipe support for mobile
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const lightboxContent = document.querySelector('.lightbox-content');
        if (!lightboxContent) return;

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        lightboxContent.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        lightboxContent.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        }, { passive: true });

        lightboxContent.addEventListener('touchend', () => {
            if (!startX || !startY) return;

            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Only trigger swipe if horizontal movement is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextImage(); // Swipe left - next image
                } else {
                    this.previousImage(); // Swipe right - previous image
                }
            }

            // Reset values
            startX = 0;
            startY = 0;
            currentX = 0;
            currentY = 0;
        }, { passive: true });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isLightboxOpen) return;

            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextImage();
                    break;
            }
        });
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    this.intersectionObserver.unobserve(img);
                }
            });
        }, options);
    }

    /* ==========================================================================
       Image Loading and Gallery Management
       ========================================================================== */

    async loadImages() {
        const loadingIndicator = document.getElementById('loading');
        const galleryGrid = document.getElementById('gallery-grid');
        const noImagesMessage = document.getElementById('no-images');

        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        if (galleryGrid) galleryGrid.style.display = 'none';
        if (noImagesMessage) noImagesMessage.style.display = 'none';

        try {
            this.isLoading = true;
            
            // Simulate fetching images from photos/ folder
            // In a real implementation, this would involve a server-side script
            const imageList = await this.fetchImageList();
            
            if (imageList.length === 0) {
                this.showNoImagesMessage();
                return;
            }

            this.images = imageList;
            await this.renderGallery();
            
        } catch (error) {
            console.error('Error loading images:', error);
            this.showNoImagesMessage();
        } finally {
            this.isLoading = false;
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    async fetchImageList() {
        const imageList = [];
        this.shoots = [];
        
        // Use new grouped configuration if available
        if (window.portfolioConfig && window.portfolioConfig.shoots) {
            console.log('Using grouped portfolio configuration...');
            
            for (const shoot of window.portfolioConfig.shoots) {
                const shootImages = [];
                
                // If images are explicitly configured, use them (no auto-detection)
                let imagesToProcess = [];
                
                if (shoot.images && shoot.images.length > 0) {
                    // Use provided images list - no auto-detection needed
                    imagesToProcess = shoot.images;
                    console.log(`✅ Using ${imagesToProcess.length} configured images for ${shoot.title} (skipping auto-detection)`);
                } else {
                    // Only auto-detect if no images are configured
                    console.log(`No images configured for ${shoot.title}, auto-detecting...`);
                    imagesToProcess = await this.autoDetectImagesInFolder(shoot.folder);
                }
                
                for (const filename of imagesToProcess) {
                    const imagePath = shoot.folder + filename;
                    
                    try {
                        const imageExists = await this.checkImageExists(imagePath);
                        if (imageExists) {
                            const imageData = {
                                src: imagePath,  // Original full-res image
                                thumbnail: this.getOptimizedImagePath(imagePath, 'thumb'),  // Thumbnail for gallery
                                preview: this.getOptimizedImagePath(imagePath, 'prev'),    // Preview for lightbox
                                name: this.formatImageName(filename),
                                filename: filename,
                                shootId: shoot.id,
                                shootTitle: shoot.title
                            };
                            
                            // Extract real EXIF data if enabled
                            if (window.portfolioConfig.settings?.enableMetadataExtraction && this.exifExtractor) {
                                try {
                                    const exifData = await this.exifExtractor.extractExifData(imagePath);
                                    imageData.exifData = exifData;
                                    console.log(`✓ EXIF extracted for ${filename}:`, exifData);
                                } catch (error) {
                                    console.log(`⚠ Could not extract EXIF for ${filename}:`, error);
                                }
                            }
                            
                            imageList.push(imageData);
                            shootImages.push(imageData);
                            console.log(`✓ Loaded: ${filename} (${shoot.title})`);
                        } else {
                            console.log(`✗ Could not load: ${filename}`);
                        }
                    } catch (error) {
                        console.log(`✗ Error loading ${filename}:`, error);
                        continue;
                    }
                }
                
                if (shootImages.length > 0) {
                    // Find cover image data more reliably
                    let coverImageData = shootImages.find(img => img.filename === shoot.coverImage);
                    if (!coverImageData) {
                        // If specified cover image not found, try variations
                        coverImageData = shootImages.find(img => 
                            img.filename.toLowerCase().includes('hero') || 
                            img.filename.toLowerCase().includes('cover')
                        ) || shootImages[0];
                    }
                    
                    console.log(`📸 Cover image for ${shoot.title}:`, coverImageData?.filename || 'Not found');
                    
                    this.shoots.push({
                        ...shoot,
                        images: shootImages,
                        coverImageData: coverImageData
                    });
                }
            }
            
            if (imageList.length > 0) {
                console.log(`✅ Successfully loaded ${imageList.length} images from configuration`);
                return imageList;
            }
        }

        // Fallback to old configuration method
        if (window.portfolioConfig && window.portfolioConfig.images) {
            console.log('Using legacy portfolio configuration...');
            for (const filename of window.portfolioConfig.images) {
                const imagePath = 'photos/' + filename;
                
                try {
                    const imageExists = await this.checkImageExists(imagePath);
                    if (imageExists) {
                        const imageData = {
                            src: imagePath,
                            name: this.formatImageName(filename),
                            filename: filename,
                            shootId: 'default',
                            shootTitle: 'Portfolio',
                            shootDescription: 'Automotive Photography'
                        };
                        imageList.push(imageData);
                        console.log(`✓ Loaded: ${filename}`);
                    }
                } catch (error) {
                    console.log(`✗ Error loading ${filename}:`, error);
                    continue;
                }
            }
            
            if (imageList.length > 0) {
                // Create a default shoot for legacy config
                this.shoots.push({
                    id: 'default',
                    title: 'Portfolio',
                    description: 'Automotive Photography',
                    folder: 'photos/',
                    coverImage: imageList[0].filename,
                    coverColor: '#1a1a2e',
                    images: imageList
                });
                return imageList;
            }
        }

        console.log('⚠️ No configured images found, skipping fallback to prevent 404s');
        console.log(`Total images found: ${imageList.length}`);
        console.log(`Total shoots: ${this.shoots.length}`);
        return imageList;
    }

    async checkImageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                console.log(`✓ Image loaded successfully: ${imagePath}`);
                resolve(true);
            };
            img.onerror = () => {
                console.log(`✗ Image failed to load: ${imagePath}`);
                resolve(false);
            };
            img.src = imagePath;
            
            // Reduced timeout to prevent hanging and reduce failed requests
            setTimeout(() => {
                console.log(`⏱ Timeout for image: ${imagePath}`);
                resolve(false);
            }, 2000); // Reduced from 5000ms to 2000ms
        });
    }

    async scanForCustomImages() {
        // This is a simplified approach - in a real application,
        // you'd need a server-side script to scan the directory
        const customImages = [];
        const photoFolder = 'photos/';
        
        // Try common patterns
        const patterns = [
            'car1', 'car2', 'car3', 'car4', 'car5',
            'photo1', 'photo2', 'photo3', 'photo4', 'photo5',
            'img1', 'img2', 'img3', 'img4', 'img5',
            'image1', 'image2', 'image3', 'image4', 'image5'
        ];

        for (const pattern of patterns) {
            for (const format of this.supportedFormats) {
                const filename = `${pattern}.${format}`;
                const imagePath = photoFolder + filename;
                
                try {
                    const imageExists = await this.checkImageExists(imagePath);
                    if (imageExists) {
                        const imageData = {
                            src: imagePath,
                            name: this.formatImageName(filename),
                            filename: filename,
                            caption: this.generateCaption(filename)
                        };
                        customImages.push(imageData);
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        return customImages;
    }

    formatImageName(filename) {
        return filename
            .replace(/\.(jpg|jpeg|png|webp|avif)$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    generateCaption(filename) {
        const name = this.formatImageName(filename);
        const captions = {
            'Ferrari 458': 'Italian masterpiece in motion',
            'Lamborghini Huracan': 'Bull from Sant\'Agata Bolognese',
            'Porsche 911': 'Timeless sports car icon',
            'Mclaren 720s': 'British engineering excellence',
            'Aston Martin Db11': 'Elegant British grand tourer',
            'Bmw M4': 'Bavarian performance machine',
            'Mercedes Amg Gt': 'Stuttgart\'s finest',
            'Audi R8': 'German precision and power',
            
            // Your photos
            'Light 16': 'Automotive excellence captured in perfect light',
            'Light 17': 'Masterful composition and lighting',
            'Light 18': 'Engineering beauty through the lens',
            'Light 19': 'Artistic vision meets automotive design',
            'Light 20': 'Premium photography showcasing luxury',
            'Light 21': 'Professional automotive artistry',
            'Light 22': 'Stunning details in perfect focus',
            'Light 23': 'Capturing the essence of automotive excellence'
        };
        
        return captions[name] || 'Automotive excellence captured';
    }

    async renderGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        // Check if we should use grouped layout
        const useGroupedLayout = window.portfolioConfig?.settings?.groupedLayout && this.shoots.length > 0;

        if (useGroupedLayout) {
            // Render shoots with cover images and grouped photos
            this.shoots.forEach((shoot, shootIndex) => {
                // Create shoot section
                const shootSection = this.createShootSection(shoot, shootIndex);
                galleryGrid.appendChild(shootSection);
            });
        } else {
            // Render flat gallery (original style)
            this.images.forEach((image, index) => {
                const galleryItem = this.createGalleryItem(image, index);
                galleryGrid.appendChild(galleryItem);
            });
        }

        // Show gallery with fade-in effect
        galleryGrid.style.display = 'block';
        
        // Trigger reflow to ensure styles are applied
        galleryGrid.offsetHeight;
        
        setTimeout(() => {
            galleryGrid.classList.add('loaded');
        }, 100);

        // Add staggered animation for gallery items
        const items = galleryGrid.querySelectorAll('.gallery-item, .shoot-section');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('loaded');
            }, index * 100);
        });
    }

    createShootSection(shoot, shootIndex) {
        const section = document.createElement('div');
        section.className = 'shoot-section';
        section.dataset.shootId = shoot.id;

        // Create cover image
        const coverContainer = document.createElement('div');
        coverContainer.className = 'shoot-cover';
        
        const coverImage = document.createElement('img');
        // Use the cover image data source, fallback to first image, then to original
        coverImage.src = shoot.coverImageData?.src || shoot.images[0]?.src || '';
        coverImage.alt = shoot.title;
        coverImage.loading = 'lazy';
        
        // Add error handling for failed image loads
        coverImage.onerror = () => {
            console.warn(`Failed to load cover image for ${shoot.title}, trying fallback`);
            // Try the raw filename path as fallback
            if (shoot.coverImage && !coverImage.src.includes(shoot.coverImage)) {
                coverImage.src = shoot.folder + shoot.coverImage;
            }
        };

        const overlay = document.createElement('div');
        overlay.className = 'shoot-overlay';
        overlay.style.backgroundColor = shoot.coverColor || 'rgba(26, 26, 46, 0.8)';

        const title = document.createElement('h3');
        title.className = 'shoot-title';
        title.textContent = shoot.title;

        const expandButton = document.createElement('button');
        expandButton.className = 'shoot-expand-btn';
        expandButton.innerHTML = `
            <span>View Collection</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
        `;

        overlay.appendChild(title);
        overlay.appendChild(expandButton);

        coverContainer.appendChild(coverImage);
        coverContainer.appendChild(overlay);

        // Create images grid (initially hidden)
        const imagesGrid = document.createElement('div');
        imagesGrid.className = 'shoot-images-grid';
        imagesGrid.style.display = 'none';

        shoot.images.forEach((image, index) => {
            const globalIndex = this.images.findIndex(img => img.src === image.src);
            const galleryItem = this.createGalleryItem(image, globalIndex);
            galleryItem.classList.add('shoot-image-item');
            imagesGrid.appendChild(galleryItem);
        });

        section.appendChild(coverContainer);
        section.appendChild(imagesGrid);

        // Add expand/collapse functionality with better mobile support
        let isExpanded = false;
        
        const toggleExpand = (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                imagesGrid.style.display = 'grid';
                expandButton.innerHTML = `
                    <span>Collapse</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18,15 12,9 6,15"></polyline>
                    </svg>
                `;
                section.classList.add('expanded');
                
                // Animate images in
                setTimeout(() => {
                    const shootImages = imagesGrid.querySelectorAll('.gallery-item');
                    shootImages.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('loaded');
                        }, index * 50);
                    });
                }, 100);
                
                // Scroll to the expanded section on mobile
                if (window.innerWidth <= 767) {
                    setTimeout(() => {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                }
            } else {
                imagesGrid.style.display = 'none';
                expandButton.innerHTML = `
                    <span>View Collection</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                `;
                section.classList.remove('expanded');
            }
        };
        
        // Add both click and touch events for better mobile support
        expandButton.addEventListener('click', toggleExpand);
        expandButton.addEventListener('touchend', toggleExpand);
        
        // iOS Safari: prevent double-tap zoom on button
        expandButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });

        return section;
    }

    createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${image.name} in fullscreen`);

        const img = document.createElement('img');
        // Use thumbnail for gallery display, not full image
        img.dataset.src = image.thumbnail || image.src;
        img.alt = image.name;
        img.loading = 'lazy';
        
        // Set up intersection observer for lazy loading
        this.intersectionObserver.observe(img);

        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'gallery-download';
        downloadBtn.setAttribute('aria-label', `Download ${image.name}`);
        downloadBtn.setAttribute('title', 'Download image');
        downloadBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        `;
        
        // Add download functionality
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening lightbox
            this.downloadImage(image);
        });

        // Only add overlay if not disabled in settings
        const showCaptions = window.portfolioConfig?.settings?.showCaptions !== false;
        
        if (showCaptions) {
            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            
            const title = document.createElement('h4');
            title.textContent = image.name;
            
            // Show shoot info instead of caption
            if (image.shootTitle && image.shootTitle !== 'Portfolio') {
                const shootInfo = document.createElement('p');
                shootInfo.textContent = image.shootTitle;
                overlay.appendChild(title);
                overlay.appendChild(shootInfo);
            } else {
                overlay.appendChild(title);
            }
            
            item.appendChild(overlay);
        }
        
        item.appendChild(img);
        item.appendChild(downloadBtn);

        // Add click and keyboard event listeners with better mobile support
        const openLightbox = (event) => {
            event?.preventDefault();
            this.openLightbox(index);
        };
        
        item.addEventListener('click', openLightbox);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox();
            }
        });
        
        // iOS Safari: Better touch handling
        item.addEventListener('touchend', (e) => {
            e.preventDefault();
            openLightbox();
        });
        
        // Prevent double-tap zoom on iOS Safari
        item.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        });

        return item;
    }

    loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    }

    showNoImagesMessage() {
        const loadingIndicator = document.getElementById('loading');
        const galleryGrid = document.getElementById('gallery-grid');
        const noImagesMessage = document.getElementById('no-images');

        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (galleryGrid) galleryGrid.style.display = 'none';
        if (noImagesMessage) noImagesMessage.style.display = 'block';
    }

    /* ==========================================================================
       Lightbox Functionality
       ========================================================================== */

    openLightbox(index) {
        this.currentImageIndex = index;
        this.isLightboxOpen = true;
        
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxMeta = document.getElementById('lightbox-meta');
        const lightboxCounter = document.getElementById('lightbox-counter');

        if (!lightbox || !this.images[index]) return;

        const image = this.images[index];

        // Set image and metadata
        lightboxImage.src = image.src;
        lightboxImage.alt = image.name;
        
        if (lightboxTitle) lightboxTitle.textContent = image.name;
        
        // Show shoot info instead of captions (since you don't want captions)
        if (lightboxMeta) {
            if (image.shootTitle && image.shootTitle !== 'Portfolio') {
                lightboxMeta.textContent = image.shootTitle;
            } else {
                lightboxMeta.textContent = '';
            }
        }
        
        if (lightboxCounter) {
            // Show position within the current shoot, not all images
            const shootImages = this.images.filter(img => img.shootId === image.shootId);
            const currentShootIndex = shootImages.findIndex(img => img.src === image.src);
            lightboxCounter.textContent = `${currentShootIndex + 1} / ${shootImages.length}`;
        }
        
        // Update shoot name indicator
        const lightboxShootName = document.getElementById('lightbox-shoot-name');
        if (lightboxShootName && image.shootTitle) {
            lightboxShootName.textContent = image.shootTitle;
        }

        // Update navigation buttons
        this.updateLightboxNavigation();

        // Try to load EXIF data
        this.loadExifData(image);

        // Show lightbox
        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management
        lightboxImage.focus();

        // Preload adjacent images
        this.preloadAdjacentImages();
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        this.isLightboxOpen = false;
        
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to the gallery item
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems[this.currentImageIndex]) {
            galleryItems[this.currentImageIndex].focus();
        }
    }

    previousImage() {
        if (this.images.length === 0) return;
        
        const currentImage = this.images[this.currentImageIndex];
        if (!currentImage) return;
        
        // Get all images from the same shoot
        const shootImages = this.images.filter(img => img.shootId === currentImage.shootId);
        if (shootImages.length === 0) return;
        
        // Find current position within the shoot
        const currentShootIndex = shootImages.findIndex(img => img.src === currentImage.src);
        
        // Navigate to previous image in the same shoot
        const nextShootIndex = currentShootIndex > 0 
            ? currentShootIndex - 1 
            : shootImages.length - 1;
            
        // Find the global index of the previous image in the shoot
        const previousImage = shootImages[nextShootIndex];
        this.currentImageIndex = this.images.findIndex(img => img.src === previousImage.src);
        
        this.updateLightboxContent();
    }

    nextImage() {
        if (this.images.length === 0) return;
        
        const currentImage = this.images[this.currentImageIndex];
        if (!currentImage) return;
        
        // Get all images from the same shoot
        const shootImages = this.images.filter(img => img.shootId === currentImage.shootId);
        if (shootImages.length === 0) return;
        
        // Find current position within the shoot
        const currentShootIndex = shootImages.findIndex(img => img.src === currentImage.src);
        
        // Navigate to next image in the same shoot
        const nextShootIndex = currentShootIndex < shootImages.length - 1 
            ? currentShootIndex + 1 
            : 0;
            
        // Find the global index of the next image in the shoot
        const nextImage = shootImages[nextShootIndex];
        this.currentImageIndex = this.images.findIndex(img => img.src === nextImage.src);
        
        this.updateLightboxContent();
    }

    async updateLightboxContent() {
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxMeta = document.getElementById('lightbox-meta');
        const lightboxCounter = document.getElementById('lightbox-counter');

        const image = this.images[this.currentImageIndex];
        if (!image) return;

        // Update image with fade effect
        if (lightboxImage) {
            lightboxImage.style.opacity = '0';
            
            // Get appropriate image size for lightbox (preview, not full resolution)
            const previewSrc = await this.getDisplayImageSrc(image, 'preview');
            
            setTimeout(() => {
                lightboxImage.src = previewSrc;
                lightboxImage.alt = image.name;
                lightboxImage.style.opacity = '1';
            }, 150);
        }

        if (lightboxTitle) lightboxTitle.textContent = image.name;
        
        if (lightboxMeta) {
            if (image.shootTitle && image.shootTitle !== 'Portfolio') {
                lightboxMeta.textContent = image.shootTitle;
            } else {
                lightboxMeta.textContent = '';
            }
        }
        
        if (lightboxCounter) {
            // Show position within the current shoot, not all images
            const currentImage = this.images[this.currentImageIndex];
            if (currentImage) {
                const shootImages = this.images.filter(img => img.shootId === currentImage.shootId);
                const currentShootIndex = shootImages.findIndex(img => img.src === currentImage.src);
                lightboxCounter.textContent = `${currentShootIndex + 1} / ${shootImages.length}`;
            } else {
                lightboxCounter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
            }
        }
        
        // Update shoot name indicator
        const lightboxShootName = document.getElementById('lightbox-shoot-name');
        if (lightboxShootName && image.shootTitle) {
            lightboxShootName.textContent = image.shootTitle;
        }

        this.updateLightboxNavigation();
        this.loadExifData(image);
        this.preloadAdjacentImages();
    }

    updateLightboxNavigation() {
        const prevButton = document.querySelector('.lightbox-prev');
        const nextButton = document.querySelector('.lightbox-next');

        // Check if we have images in the current shoot
        const currentImage = this.images[this.currentImageIndex];
        if (!currentImage) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            return;
        }
        
        const shootImages = this.images.filter(img => img.shootId === currentImage.shootId);
        
        if (shootImages.length <= 1) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
        } else {
            if (prevButton) prevButton.style.display = 'flex';
            if (nextButton) nextButton.style.display = 'flex';
        }
    }

    preloadAdjacentImages() {
        const currentImage = this.images[this.currentImageIndex];
        if (!currentImage) return;
        
        // Get images from the same shoot
        const shootImages = this.images.filter(img => img.shootId === currentImage.shootId);
        const currentShootIndex = shootImages.findIndex(img => img.src === currentImage.src);
        
        // Determine adjacent indexes within the shoot
        const adjacentShootIndexes = [
            currentShootIndex - 1,
            currentShootIndex + 1
        ];

        adjacentShootIndexes.forEach(shootIndex => {
            if (shootIndex >= 0 && shootIndex < shootImages.length) {
                const img = new Image();
                img.src = shootImages[shootIndex].src;
            }
        });
    }

    downloadCurrentImage() {
        if (this.images.length === 0 || this.currentImageIndex < 0) return;
        
        const currentImage = this.images[this.currentImageIndex];
        if (!currentImage) return;

        // Create a temporary link element for download
        const link = document.createElement('a');
        link.href = currentImage.src;
        link.download = currentImage.filename || 'image.jpg';
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`📥 Downloaded: ${currentImage.filename}`);
    }

    downloadImage(image) {
        if (!image) return;

        // Create a temporary link element for download
        const link = document.createElement('a');
        link.href = image.src;
        link.download = image.filename || 'image.jpg';
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`📥 Downloaded: ${image.filename}`);
    }

    async loadExifData(image) {
        const lightboxExif = document.getElementById('lightbox-exif');
        if (!lightboxExif) return;

        // Use real EXIF data if available
        if (image.exifData && this.exifExtractor) {
            const cameraConfig = window.portfolioConfig?.camera || {
                make: 'Canon',
                model: 'EOS R5',
                lens: 'RF 24-70mm f/2.8L IS USM',
                photographer: 'Photographer'
            };
            
            const formattedExif = this.exifExtractor.formatExifData(image.exifData, cameraConfig);
            
            if (Object.keys(formattedExif).length > 0) {
                lightboxExif.innerHTML = Object.entries(formattedExif)
                    .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                    .join('');
                return;
            }
        }

        // Fallback to camera config or simulated data
        const cameraConfig = window.portfolioConfig?.camera;
        if (cameraConfig) {
            const fallbackExif = {
                'Camera': `${cameraConfig.make} ${cameraConfig.model}`,
                'Lens': cameraConfig.lens,
                'Photographer': cameraConfig.photographer
            };
            
            lightboxExif.innerHTML = Object.entries(fallbackExif)
                .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                .join('');
        } else {
            // Generate simulated EXIF data
            const exifData = this.generateExifData(image.name);
            if (exifData) {
                lightboxExif.innerHTML = Object.entries(exifData)
                    .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                    .join('');
            } else {
                lightboxExif.innerHTML = '';
            }
        }
    }

    generateExifData(imageName) {
        // Simulate realistic EXIF data for car photography
        const baseExif = {
            'Camera': 'Canon EOS R5',
            'Lens': 'RF 24-70mm f/2.8L IS USM',
            'ISO': Math.floor(Math.random() * 800) + 100,
            'Aperture': `f/${(Math.random() * 4 + 1.4).toFixed(1)}`,
            'Shutter': `1/${Math.floor(Math.random() * 1000) + 60}`,
            'Focal Length': `${Math.floor(Math.random() * 50) + 24}mm`
        };

        // Add car-specific data based on image name
        if (imageName.toLowerCase().includes('ferrari')) {
            return { ...baseExif, 'Subject': 'Ferrari 458 Italia', 'Location': 'Maranello, Italy' };
        } else if (imageName.toLowerCase().includes('porsche')) {
            return { ...baseExif, 'Subject': 'Porsche 911 Turbo S', 'Location': 'Stuttgart, Germany' };
        } else if (imageName.toLowerCase().includes('lamborghini')) {
            return { ...baseExif, 'Subject': 'Lamborghini Huracán', 'Location': 'Sant\'Agata Bolognese, Italy' };
        }

        return baseExif;
    }

    /* ==========================================================================
       Theme Management
       ========================================================================== */

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            this.updateThemeIcons('☀️', 'Light Mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            this.updateThemeIcons('🌙', 'Dark Mode');
            localStorage.setItem('theme', 'dark');
        }
    }

    updateThemeIcons(icon, text) {
        document.querySelectorAll('.theme-icon').forEach(element => {
            element.textContent = icon;
        });
        
        document.querySelectorAll('.theme-text').forEach(element => {
            element.textContent = text;
        });
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            this.updateThemeIcons('☀️', 'Light Mode');
        } else {
            this.updateThemeIcons('🌙', 'Dark Mode');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.body.classList.remove('light-theme');
                    document.body.classList.add('dark-theme');
                    this.updateThemeIcons('🌙', 'Dark Mode');
                } else {
                    document.body.classList.remove('dark-theme');
                    document.body.classList.add('light-theme');
                    this.updateThemeIcons('☀️', 'Light Mode');
                }
            }
        });
    }

    /* ==========================================================================
       Utility Functions
       ========================================================================== */

    updatePhotoCount() {
        const photoCountElement = document.getElementById('photo-count');
        if (photoCountElement) {
            const count = this.images.length;
            photoCountElement.textContent = count.toString();
            
            // Animate the number change
            photoCountElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                photoCountElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    handleResize() {
        // Handle any resize-specific logic
        if (this.isLightboxOpen) {
            // Adjust lightbox content if needed
            const lightboxImage = document.getElementById('lightbox-image');
            if (lightboxImage) {
                // Force re-calculation of max dimensions
                lightboxImage.style.maxHeight = '70vh';
            }
        }
    }

    /* ==========================================================================
       Performance Optimizations
       ========================================================================== */

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    async autoDetectImagesInFolder(folderPath) {
        console.log(`🔍 Auto-detecting images in folder: ${folderPath}`);
        const detectedImages = [];
        
        // Folder-specific patterns based on your actual images
        let patterns = [];
        
        if (folderPath.includes('audi-a3')) {
            // Known Audi A3 images from your folder
            patterns = ['A3-1', 'A3-2', 'A3-3', 'A3-5', 'A3-6', 'A3-7', 'hero'];
        } else if (folderPath.includes('porsche-gt3rs')) {
            // Known Porsche GT3RS images from your folder
            patterns = ['GT3RS-08', 'GT3RS-09', 'GT3RS-10', 'GT3RS-11', 'GT3RS-12', 'GT3RS-14', 'hero'];
        } else {
            // Minimal fallback patterns for unknown folders
            patterns = [
                'hero', 'cover', 'main',
                // Only try first few common patterns
                '1', '2', '3', '4', '5',
                'img1', 'img2', 'img3', 'img4', 'img5',
                'photo1', 'photo2', 'photo3', 'photo4', 'photo5'
            ];
        }

        // Try different formats for each pattern
        for (const pattern of patterns) {
            for (const format of this.supportedFormats) {
                const filename = `${pattern}.${format}`;
                const imagePath = folderPath + filename;
                
                try {
                    const exists = await this.checkImageExists(imagePath);
                    if (exists) {
                        detectedImages.push(filename);
                        console.log(`✓ Auto-detected: ${filename}`);
                    }
                } catch (error) {
                    // Silently continue to next image
                    continue;
                }
            }
        }
        
        console.log(`📋 Auto-detected ${detectedImages.length} images in ${folderPath}:`, detectedImages);
        return detectedImages;
    }

    /* ==========================================================================
       Image Optimization Helpers
       ========================================================================== */

    getOptimizedImagePath(originalPath, type) {
        // Extract path parts
        const pathParts = originalPath.split('/');
        const filename = pathParts.pop();
        const folder = pathParts.join('/');
        const [name, ext] = filename.split('.');
        
        // Try different optimization strategies
        const strategies = [
            // Strategy 1: thumbnails/previews subfolders (most common)
            `${folder}/${type}s/${filename}`,
            // Strategy 2: _thumb / _prev suffixes in same folder
            `${folder}/${name}_${type}.${ext}`,
            // Strategy 3: global optimization folders
            `photos/${type}s/${pathParts.slice(1).join('/')}/${filename}`
        ];
        
        // Return the first strategy (subfolder approach that you're using)
        return strategies[0];
    }

    async getDisplayImageSrc(imageData, displayType = 'thumbnail') {
        // displayType: 'thumbnail' | 'preview' | 'original'
        let imageSrc;
        
        switch (displayType) {
            case 'thumbnail':
                imageSrc = imageData.thumbnail;
                break;
            case 'preview':
                imageSrc = imageData.preview;
                break;
            case 'original':
            default:
                imageSrc = imageData.src;
                break;
        }
        
        // Check if optimized version exists, fallback to original
        try {
            const exists = await this.checkImageExists(imageSrc);
            if (exists) {
                return imageSrc;
            } else {
                console.log(`⚠️ Optimized image not found: ${imageSrc}, falling back to original`);
                return imageData.src;
            }
        } catch (error) {
            console.log(`⚠️ Error checking optimized image: ${imageSrc}, falling back to original`);
            return imageData.src;
        }
    }
}

/* ==========================================================================
   Application Initialization
   ========================================================================== */

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CarPhotographyPortfolio();
});

// Add some additional functionality for enhanced user experience
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.about-section, .contact-section').forEach(el => {
        observer.observe(el);
    });

    // Add navbar scroll effect
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (navbar) {
            if (currentScrollY > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.98)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        }
        
        lastScrollY = currentScrollY;
    };

    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 16); // ~60fps
        }
    }, { passive: true });
});
