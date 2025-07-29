/* ===========================================
   PORTFOLIO WEBSITE - MODERN JAVASCRIPT
   Gustav Schwarzbach - 2025
=========================================== */

// Global state
let siteConfig = null;
let currentImageIndex = 0;
let allImages = [];
let currentLanguage = 'en'; // Default language

/* ===========================================
   INITIALIZATION
=========================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeTheme();
    loadSiteConfig();
    setupNavigation();
    setupImageViewer();
    setupScrollEffects();
});

/* ===========================================
   THEME SYSTEM
=========================================== */

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemPreference;
    
    setTheme(theme);
    setupThemeToggle();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleIcon(theme);
    updateMetaThemeColor(theme);
}

async function updateThemeToggleIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    
    try {
        let iconPath;
        if (theme === 'dark') {
            // Light mode icon (sun) - load from file
            const response = await fetch('site/icons/light_mode_24dp.svg');
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const pathElement = svgDoc.querySelector('path');
            iconPath = pathElement ? pathElement.getAttribute('d') : '';
        } else {
            // Dark mode icon (moon) - load from file
            const response = await fetch('site/icons/dark_mode_24dp.svg');
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const pathElement = svgDoc.querySelector('path');
            iconPath = pathElement ? pathElement.getAttribute('d') : '';
        }
        
        if (iconPath) {
            themeIcon.innerHTML = `<path d="${iconPath}"/>`;
        }
    } catch (error) {
        console.error('Error loading theme icon:', error);
        // Fallback to hardcoded icons
        if (theme === 'dark') {
            themeIcon.innerHTML = '<path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>';
        } else {
            themeIcon.innerHTML = '<path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>';
        }
    }
}

function updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0C0C0C' : '#EFEFEF');
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
}

/* ===========================================
   LANGUAGE SYSTEM
=========================================== */

function detectLanguage() {
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
        return savedLanguage;
    }
    
    // Detect from browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Check if it's German, otherwise default to English
    return langCode === 'de' ? 'de' : 'en';
}

function initializeLanguage() {
    currentLanguage = detectLanguage();
    updateLanguageToggle();
    setupLanguageToggle();
}

function updateLanguageToggle() {
    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = currentLanguage.toUpperCase();
    }
}

function setupLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            const newLanguage = currentLanguage === 'de' ? 'en' : 'de';
            setLanguage(newLanguage);
        });
    }
}

function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('preferred-language', language);
    updateLanguageToggle();
    
    // Reload site content with new language
    loadSiteConfig();
}

/* ===========================================
   CONFIGURATION & CONTENT LOADING
=========================================== */

async function loadSiteConfig() {
    try {
        const configFile = `site/config-${currentLanguage}.json`;
        const response = await fetch(configFile);
        siteConfig = await response.json();
        populateContent();
        updateLanguageAttributes();
    } catch (error) {
        console.error(`Error loading site configuration for language ${currentLanguage}:`, error);
        // Try fallback to German if English fails, or English if German fails
        const fallbackLang = currentLanguage === 'de' ? 'en' : 'de';
        try {
            const fallbackResponse = await fetch(`site/config-${fallbackLang}.json`);
            siteConfig = await fallbackResponse.json();
            populateContent();
            updateLanguageAttributes();
        } catch (fallbackError) {
            console.error('Error loading fallback configuration:', fallbackError);
            populateFallbackContent();
        }
    }
}

function updateLanguageAttributes() {
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update meta description
    if (siteConfig && siteConfig.site && siteConfig.site.description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteConfig.site.description);
        }
    }
}

function populateContent() {
    if (!siteConfig) return;
    
    populateNavigation();
    populateHeroContent();
    populateContactLinks();
    populateFooterContent();
    populateProjectsContent();  
}

function populateNavigation() {
    if (!siteConfig.content.navigation) return;
    
    siteConfig.content.navigation.forEach((navItem, index) => {
        const element = document.getElementById(`nav-${navItem.href.replace('#', '')}`);
        if (element) {
            element.textContent = navItem.name;
        }
    });
}

function populateHeroContent() {
    const titleElement = document.getElementById('hero-title');
    const subtitleElement = document.getElementById('hero-subtitle');
    const descriptionElement = document.getElementById('hero-description');
    
    if (titleElement && siteConfig.content.hero.title) {
        titleElement.textContent = siteConfig.content.hero.title;
    }
    
    if (subtitleElement && siteConfig.content.hero.subtitle) {
        subtitleElement.textContent = siteConfig.content.hero.subtitle;
    }
    
    if (descriptionElement && siteConfig.content.hero.description) {
        descriptionElement.innerHTML = siteConfig.content.hero.description
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    }
    
    // Update button texts
    const viewProjectsBtn = document.getElementById('btn-view-projects');
    const getInTouchBtn = document.getElementById('btn-get-in-touch');
    
    if (viewProjectsBtn && siteConfig.content.hero.buttons && siteConfig.content.hero.buttons.view_projects) {
        viewProjectsBtn.textContent = siteConfig.content.hero.buttons.view_projects;
    }
    
    if (getInTouchBtn && siteConfig.content.hero.buttons && siteConfig.content.hero.buttons.get_in_touch) {
        getInTouchBtn.textContent = siteConfig.content.hero.buttons.get_in_touch;
    }
}

async function populateContactLinks() {
    const contactLinksContainer = document.getElementById('contact-links');
    if (!contactLinksContainer || !siteConfig.contact) return;
    
    // Load SVG icons from files
    const iconData = {};
    
    try {
        // Load LinkedIn icon  
        const linkedinResponse = await fetch('site/icons/linkedin-svgrepo-com.svg');
        const linkedinSvg = await linkedinResponse.text();
        const linkedinParser = new DOMParser();
        const linkedinDoc = linkedinParser.parseFromString(linkedinSvg, 'image/svg+xml');
        const linkedinPath = linkedinDoc.querySelector('path');
        if (linkedinPath) {
            iconData['LinkedIn'] = {
                path: linkedinPath.getAttribute('d'),
                viewBox: '0 0 382 382'
            };
        }
        
        // Load GitHub icon - use simpler approach
        iconData['GitHub'] = {
            path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
            viewBox: '0 0 24 24'
        };
        
        // Load Discord icon
        const discordResponse = await fetch('site/icons/discord-icon-svgrepo-com.svg');
        const discordSvg = await discordResponse.text();
        const discordParser = new DOMParser();
        const discordDoc = discordParser.parseFromString(discordSvg, 'image/svg+xml');
        const discordPath = discordDoc.querySelector('path');
        if (discordPath) {
            iconData['Discord'] = {
                path: discordPath.getAttribute('d'),
                viewBox: '0 -28.5 256 256'
            };
        }
        
        // Load Email icon
        const emailResponse = await fetch('site/icons/mail_24dp.svg');
        const emailSvg = await emailResponse.text();
        const emailParser = new DOMParser();
        const emailDoc = emailParser.parseFromString(emailSvg, 'image/svg+xml');
        const emailPath = emailDoc.querySelector('path');
        if (emailPath) {
            iconData['Email'] = {
                path: emailPath.getAttribute('d'),
                viewBox: '0 -960 960 960'
            };
        }
    } catch (error) {
        console.error('Error loading contact icons:', error);
    }
    
    const contactLinks = [
        { 
            name: 'LinkedIn', 
            url: siteConfig.contact.linkedin
        },
        { 
            name: 'GitHub', 
            url: siteConfig.contact.github
        },
        { 
            name: 'Discord', 
            url: siteConfig.contact.discord
        },
        { 
            name: 'Email', 
            url: siteConfig.contact.email
        }
    ];
    
    contactLinksContainer.innerHTML = contactLinks
        .map(link => {
            const icon = iconData[link.name];
            const iconSvg = icon ? 
                `<svg width="20" height="20" viewBox="${icon.viewBox}" class="contact-icon">
                    <path d="${icon.path}"/>
                </svg>` :
                `<span class="contact-icon-fallback">${link.name[0]}</span>`;
            
            return `
                <a href="${link.url}" class="contact-link" target="_blank" rel="noopener noreferrer">
                    ${iconSvg}
                    ${link.name}
                </a>
            `;
        }).join('');
}

function populateFooterContent() {
    const copyrightElement = document.getElementById('footer-copyright');
    const footerLinksElement = document.getElementById('footer-links');
    
    if (copyrightElement && siteConfig.footer.copyright) {
        copyrightElement.textContent = siteConfig.footer.copyright;
    }
    
    if (footerLinksElement && siteConfig.footer.links) {
        footerLinksElement.innerHTML = siteConfig.footer.links
            .map(link => `<a href="${link.href}">${link.name}</a>`)
            .join('');
    }
}

function populateProjectsContent() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer || !siteConfig.content.projects) return;
    
    // Clear existing content
    projectsContainer.innerHTML = '';
    
    // Create project categories
    Object.entries(siteConfig.content.projects).forEach(([key, project]) => {
        const categoryElement = createProjectCategory(project, key);
        projectsContainer.appendChild(categoryElement);
    });
    
    // Collect all images for fullscreen viewer
    collectAllImages();
    
    // Setup lazy loading for newly added images
    setupLazyLoading();
}

function createProjectCategory(project, categoryKey) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'project-category';
    
    categoryDiv.innerHTML = `
        <div class="category-header">
            <h2 class="category-title">${project.title}</h2>
            <p class="category-description">${project.description}</p>
        </div>
        <div class="folders-grid">
            ${project.folders.map((folder, folderIndex) => `
                <div class="project-folder" data-category="${categoryKey}" data-folder="${folderIndex}">
                    <div class="folder-header">
                        <div class="folder-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" class="folder-svg">
                                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                            </svg>
                            <span class="image-count">${folder.images.length}</span>
                        </div>
                        <div class="folder-content">
                            <h3 class="folder-title">${folder.title}</h3>
                            <p class="folder-description">${folder.description}</p>
                            <div class="folder-preview">
                                ${folder.images.slice(0, 3).map((image, index) => `
                                    <div class="preview-thumb" data-image-src="site/images/${image.src}" data-folder-images='${JSON.stringify(folder.images.map(img => `site/images/${img.src}`))}' data-media-type="${image.type || 'image'}">
                                        ${image.type === 'video' ? `
                                            <video src="site/images/${image.src}" alt="${image.alt}" muted loop>
                                                <span class="video-icon">▶</span>
                                            </video>
                                        ` : `
                                            <img src="site/images/${image.src}" alt="${image.alt}" loading="lazy">
                                        `}
                                    </div>
                                `).join('')}
                                ${folder.images.length > 3 ? `<div class="preview-more">+${folder.images.length - 3}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    return categoryDiv;
}

function collectAllImages() {
    allImages = [];
    document.querySelectorAll('.project-item').forEach(item => {
        const imageSrc = item.getAttribute('data-image-src');
        if (imageSrc) {
            allImages.push(imageSrc);
        }
    });
}

function populateFallbackContent() {
    console.warn('Using fallback content');
    // Basic fallback content for when JSON loading fails
    const heroDescription = document.getElementById('hero-description');
    if (heroDescription) {
        heroDescription.innerHTML = `
            <p>Media Informatics student passionate about game design and creative coding.</p>
            <p>Currently exploring the intersection of technology and creativity.</p>
        `;
    }
}

/* ===========================================
   NAVIGATION
=========================================== */

function setupNavigation() {
    setupSmoothScrolling();
    setupMobileMenu();
    setupActiveNavigation();
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupMobileMenu() {
    const burger = document.getElementById('nav-burger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            burger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link or toggle buttons
        document.querySelectorAll('.nav-link, .theme-toggle, .lang-toggle').forEach(element => {
            element.addEventListener('click', () => {
                navMenu.classList.remove('active');
                burger.classList.remove('active');
            });
        });
    }
}

function setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // Initial call
}

/* ===========================================
   IMAGE VIEWER / FULLSCREEN MODAL
=========================================== */

function setupImageViewer() {
    setupImageClickHandlers();
    setupModalControls();
    setupKeyboardNavigation();
    setupTouchGestures();
}

function setupImageClickHandlers() {
    // Handle folder clicks
    document.addEventListener('click', function(e) {
        // Handle preview thumbnail clicks (higher priority)
        const previewThumb = e.target.closest('.preview-thumb');
        if (previewThumb) {
            e.stopPropagation(); // Prevent folder click
            const imageSrc = previewThumb.getAttribute('data-image-src');
            const folderImagesJson = previewThumb.getAttribute('data-folder-images');
            
            if (imageSrc && folderImagesJson) {
                try {
                    allImages = JSON.parse(folderImagesJson);
                    openFullscreenImage(imageSrc);
                } catch (e) {
                    console.error('Error parsing folder images:', e);
                }
            }
            return;
        }
        
        const projectFolder = e.target.closest('.project-folder');
        if (projectFolder) {
            const categoryKey = projectFolder.getAttribute('data-category');
            const folderIndex = parseInt(projectFolder.getAttribute('data-folder'));
            
            if (categoryKey && folderIndex >= 0 && siteConfig?.content?.projects?.[categoryKey]?.folders?.[folderIndex]) {
                const folder = siteConfig.content.projects[categoryKey].folders[folderIndex];
                openProjectGallery(folder.title, folder);
            }
        }
        
        // Handle gallery image clicks
        const galleryImage = e.target.closest('.gallery-image');
        if (galleryImage) {
            const imageSrc = galleryImage.getAttribute('data-image-src');
            const mediaType = galleryImage.getAttribute('data-media-type');
            if (imageSrc) {
                if (mediaType === 'video') {
                    openFullscreenVideo(imageSrc);
                } else {
                    openFullscreenImage(imageSrc);
                }
            }
        }
    });
}

function openFullscreenImage(imageSrc) {
    const modal = document.getElementById('fullscreen-container');
    const image = document.getElementById('fullscreen-image');
    
    if (!modal || !image) return;
    
    // Find current image index
    currentImageIndex = allImages.indexOf(imageSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;
    
    // Load image
    image.src = imageSrc;
    image.style.transform = 'scale(1) translate(0px, 0px)';
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update navigation buttons
    updateNavigationButtons();
}

function openFullscreenVideo(videoSrc) {
    const modal = document.getElementById('fullscreen-container');
    const image = document.getElementById('fullscreen-image');
    
    if (!modal || !image) return;
    
    // Replace image with video
    const video = document.createElement('video');
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.className = 'fullscreen-image';
    video.id = 'fullscreen-video';
    
    // Replace image element with video
    image.parentNode.replaceChild(video, image);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreenImage() {
    const modal = document.getElementById('fullscreen-container');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // If there's a video, replace it back with image element
        const video = document.getElementById('fullscreen-video');
        if (video) {
            const image = document.createElement('img');
            image.className = 'fullscreen-image';
            image.id = 'fullscreen-image';
            video.parentNode.replaceChild(image, video);
        }
    }
}

function navigateImage(direction) {
    if (allImages.length === 0) return;
    
    if (direction === 'next') {
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
    } else if (direction === 'prev') {
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    }
    
    const image = document.getElementById('fullscreen-image');
    if (image) {
        image.src = allImages[currentImageIndex];
        image.style.transform = 'scale(1) translate(0px, 0px)';
    }
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    
    if (prevButton) {
        prevButton.style.display = allImages.length > 1 ? 'flex' : 'none';
    }
    if (nextButton) {
        nextButton.style.display = allImages.length > 1 ? 'flex' : 'none';
    }
}

function setupModalControls() {
    const closeButton = document.getElementById('close-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const modal = document.getElementById('fullscreen-container');
    
    if (closeButton) {
        closeButton.addEventListener('click', closeFullscreenImage);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => navigateImage('prev'));
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => navigateImage('next'));
    }
    
    if (modal) {
        // Close on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFullscreenImage();
            }
        });
    }
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('fullscreen-container');
        if (!modal || !modal.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeFullscreenImage();
                break;
            case 'ArrowLeft':
                navigateImage('prev');
                break;
            case 'ArrowRight':
                navigateImage('next');
                break;
        }
    });
}

function setupTouchGestures() {
    const modal = document.getElementById('fullscreen-container');
    const image = document.getElementById('fullscreen-image');
    
    if (!modal || !image) return;
    
    let startX = 0;
    let startY = 0;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    
    // Touch start
    image.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
    isDragging = true;
        }
    }, { passive: true });
    
    // Touch move
    image.addEventListener('touchmove', function(e) {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging) {
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            translateX += deltaX;
            translateY += deltaY;
            
            image.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }, { passive: false });
    
    // Touch end
    image.addEventListener('touchend', function(e) {
    isDragging = false;
        
        // Simple swipe detection for navigation
        if (Math.abs(translateX) > 100) {
            if (translateX > 0) {
                navigateImage('prev');
            } else {
                navigateImage('next');
            }
        }
        
        // Reset position
        scale = 1;
        translateX = 0;
        translateY = 0;
        image.style.transform = 'scale(1) translate(0px, 0px)';
    }, { passive: true });
    
    // Zoom with wheel
    image.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        const rect = image.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(1, Math.min(3, scale * delta));
        
        image.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }, { passive: false });
}

/* ===========================================
   SCROLL EFFECTS & ANIMATIONS
=========================================== */

function setupScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    function updateNavbarOnScroll() {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });
    
    // Intersection Observer for fade-in animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate in
        document.querySelectorAll('.skill-item, .project-item, .section-title').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Setup lazy loading for images
    setupLazyLoading();
}

/* ===========================================
   LAZY LOADING SYSTEM
=========================================== */

function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers - load all images immediately
        loadAllImages();
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                imageObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px 0px' // Start loading 50px before image enters viewport
    });
    
    // Observe all lazy images
    document.querySelectorAll('.lazy-image').forEach(img => {
        imageObserver.observe(img);
        // Add loading class for shimmer effect
        img.closest('.project-item')?.classList.add('loading');
    });
}

function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;
    
    const projectItem = img.closest('.project-item');
    
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = function() {
        // Image loaded successfully
        img.src = src;
        img.classList.add('loaded');
        projectItem?.classList.remove('loading');
        
        // Fade in effect
        setTimeout(() => {
            img.style.opacity = '1';
        }, 50);
    };
    
    imageLoader.onerror = function() {
        // Image failed to load - show placeholder or error state
        console.warn('Failed to load image:', src);
        projectItem?.classList.remove('loading');
        img.style.opacity = '0.5';
        
        // Optional: Add error class for styling
        img.classList.add('error');
    };
    
    // Start loading the image
    imageLoader.src = src;
}

function loadAllImages() {
    // Fallback for older browsers
    document.querySelectorAll('.lazy-image').forEach(img => {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.style.opacity = '1';
            img.classList.add('loaded');
                    }
                });
            }

/* ===========================================
   PROJECT GALLERY MODAL
=========================================== */

function openProjectGallery(folderTitle, folder) {
    const modal = document.getElementById('project-gallery-modal');
    if (!modal) {
        createProjectGalleryModal();
        return openProjectGallery(folderTitle, folder);
    }
    
    const modalTitle = modal.querySelector('.gallery-modal-title');
    const modalDescription = modal.querySelector('.gallery-modal-description');
    const modalGrid = modal.querySelector('.gallery-grid');
    
    // Update modal content
    modalTitle.textContent = folderTitle;
    modalDescription.textContent = folder.description;
    
    // Create image grid
    modalGrid.innerHTML = folder.images.map((image, index) => `
        <div class="gallery-image" data-image-src="site/images/${image.src}" data-media-type="${image.type || 'image'}">
            <div class="gallery-image-container">
                ${image.type === 'video' ? `
                    <video src="site/images/${image.src}" alt="${image.alt}" controls muted loop>
                        Your browser does not support the video tag.
                    </video>
                ` : `
                    <img src="site/images/${image.src}" alt="${image.alt}" loading="lazy">
                `}
                <div class="gallery-overlay">
                    <div class="gallery-image-info">
                        ${image.title ? `<h4>${image.title}</h4>` : ''}
                        ${image.description ? `<p>${image.description}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update images for fullscreen viewer
    allImages = folder.images.map(img => `site/images/${img.src}`);
}

function closeProjectGallery() {
    const modal = document.getElementById('project-gallery-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function createProjectGalleryModal() {
    const modal = document.createElement('div');
    modal.id = 'project-gallery-modal';
    modal.className = 'gallery-modal';
    
    modal.innerHTML = `
        <div class="gallery-modal-backdrop" onclick="closeProjectGallery()"></div>
        <div class="gallery-modal-content">
            <div class="gallery-modal-header">
                <div class="gallery-modal-info">
                    <h2 class="gallery-modal-title"></h2>
                    <p class="gallery-modal-description"></p>
                </div>
                <button class="gallery-modal-close" onclick="closeProjectGallery()">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <div class="gallery-grid"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProjectGallery();
        }
    });
}

/* ===========================================
   UTILITY FUNCTIONS
=========================================== */

function debounce(func, wait) {
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

// Performance optimization for scroll events
const debouncedScrollHandler = debounce(() => {
    // Any scroll-based updates can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

/* ===========================================
   ERROR HANDLING & FALLBACKS
=========================================== */

window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could implement user-friendly error messaging here
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

/* ===========================================
   SERVICE WORKER DEBUG HELPERS
=========================================== */

// Debug function to reset service worker (call from console)
window.resetServiceWorker = async function() {
    if ('serviceWorker' in navigator) {
        console.log('🔄 Resetting Service Worker...');
        
        // Unregister all service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('✅ Service Worker unregistered');
        
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ All caches cleared');
        
        console.log('🔄 Please reload the page to re-register the Service Worker');
        return 'Service Worker reset complete. Reload the page.';
    } else {
        return 'Service Worker not supported';
    }
};

// Debug function to check service worker status
window.checkServiceWorker = async function() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        console.log('📱 Service Worker Registration:', registration);
        
        const cacheNames = await caches.keys();
        console.log('📦 Available Caches:', cacheNames);
        
        for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            console.log(`📂 ${name}: ${keys.length} items`);
        }
        
        return `SW Status: ${registration ? 'Active' : 'Not registered'}`;
    } else {
        return 'Service Worker not supported';
    }
};

console.log('🛠️ Debug helpers available: resetServiceWorker(), checkServiceWorker()');

