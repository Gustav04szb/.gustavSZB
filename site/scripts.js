/* ===========================================
   PORTFOLIO WEBSITE - MODERN JAVASCRIPT
   Gustav Schwarzbach - 2025
=========================================== */

// Global state
let siteConfig = null;
let currentImageIndex = 0;
let allImages = [];
let currentLanguage = 'en'; // Default language
let currentFolderSlug = null; // For routing of fullscreen media
let folderSlugToData = {}; // slug -> { projectId, folderIndex, folder }

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
    setupRoutingHandlers();
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
        const metaDesc = document.getElementById('meta-description');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteConfig.site.description);
        }
    }
    
    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDescription = document.getElementById('twitter-description');
    
    if (siteConfig) {
        const baseTitle = `${siteConfig.site.title} – Portfolio`;
        
        if (ogTitle) {
            ogTitle.setAttribute('content', baseTitle);
        }
        
        if (twitterTitle) {
            twitterTitle.setAttribute('content', baseTitle);
        }
        
        if (ogDescription && siteConfig.content.hero.description) {
            const shortDesc = siteConfig.content.hero.description[0];
            ogDescription.setAttribute('content', shortDesc);
        }
        
        if (twitterDescription && siteConfig.content.hero.description) {
            const shortDesc = siteConfig.content.hero.description[0];
            twitterDescription.setAttribute('content', shortDesc);
        }
    }
}

function populateContent() {
    if (!siteConfig) return;
    
    populateNavigation();
    populateHeroContent();
    populateAboutContent();
    populateContactContent();
    populateContactLinks();
    populateFooterContent();
    populateProjectsContent();  
    populateProjectsDropdown();
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

function populateAboutContent() {
    if (!siteConfig.content.sections || !siteConfig.content.sections.about) return;
    
    const aboutSection = siteConfig.content.sections.about;
    
    // Update About title
    const aboutTitle = document.getElementById('about-title');
    if (aboutTitle) {
        aboutTitle.textContent = aboutSection.title;
    }
    
    // Update About description
    const aboutDescription = document.getElementById('about-description');
    if (aboutDescription) {
        aboutDescription.textContent = aboutSection.description;
    }
    
    // Update Skills grid
    const skillsGrid = document.getElementById('skills-grid');
    if (skillsGrid && aboutSection.skills) {
        skillsGrid.innerHTML = aboutSection.skills
            .map(skill => `
                <div class="skill-item">
                    <h3>${skill.title}</h3>
                    <p>${skill.description}</p>
                </div>
            `)
            .join('');
    }
}

function populateContactContent() {
    if (!siteConfig.content.sections || !siteConfig.content.sections.contact) return;
    
    const contactSection = siteConfig.content.sections.contact;
    
    // Update Contact title
    const contactTitle = document.getElementById('contact-title');
    if (contactTitle) {
        contactTitle.textContent = contactSection.title;
    }
    
    // Update Contact description
    const contactDescription = document.getElementById('contact-description');
    if (contactDescription) {
        contactDescription.textContent = contactSection.description;
    }
    
    // Update Projects title
    const projectsTitle = document.getElementById('projects-title');
    if (projectsTitle && siteConfig.content.sections.projects) {
        projectsTitle.textContent = siteConfig.content.sections.projects.title;
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
            .map(link => {
                const linkType = link.href.replace('#', '');
                return `<a href="#" onclick="openLegalModal('${linkType}')" data-legal="${linkType}">${link.name}</a>`;
            })
            .join('');
    }
}

function populateProjectsContent() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer || !siteConfig.content.projects) return;
    
    // Clear existing content
    projectsContainer.innerHTML = '';
    
    // Create project categories
    // reset slug map each time content is populated
    folderSlugToData = {};
    siteConfig.content.projects.forEach((project, projectIndex) => {
        const categoryElement = createProjectCategory(project, project.id);
        projectsContainer.appendChild(categoryElement);
    });
    
    // Collect all images for fullscreen viewer
    collectAllImages();
    
    // Setup lazy loading for newly added images
    setupLazyLoading();

    // After DOM built, attempt to resolve deep link
    applyInitialRoute();
}

function populateProjectsDropdown() {
    const dropdown = document.getElementById('nav-projects-dropdown');
    if (!dropdown || !siteConfig.content.projects) return;
    
    // Clear existing content
    dropdown.innerHTML = '';
    
    // Create dropdown items for each project category
    siteConfig.content.projects.forEach((project) => {
        const dropdownItem = document.createElement('a');
        dropdownItem.href = `#${project.id}`;
        dropdownItem.className = 'nav-projects-dropdown-item';
        dropdownItem.textContent = project.title;
        
        // Add click handler for smooth scrolling
        dropdownItem.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(`[data-category="${project.id}"]`)?.closest('.project-category');
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
        
        dropdown.appendChild(dropdownItem);
    });
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
                                ${(() => {
                                    const slug = makeFolderSlug(folder.title, categoryKey, folderIndex);
                                    // register in map once
                                    if (!folderSlugToData[slug]) {
                                        folderSlugToData[slug] = { projectId: categoryKey, folderIndex, folder };
                                    }
                                    return folder.images.slice(0, 3).map((image, index) => `
                                    <div class="preview-thumb" data-folder-slug="${slug}" data-image-src="${image.type === 'youtube' ? image.src : image.type === 'video' ? toRoot(`site/video/${image.src.replace('../video/','')}`) : toRoot(`site/images/${image.src}`)}" data-folder-images='${JSON.stringify(folder.images.map(img => img.type === 'youtube' ? img.src : img.type === 'video' ? toRoot(`site/video/${img.src.replace('../video/','')}`) : toRoot(`site/images/${img.src}`)))}' data-media-type="${image.type || 'image'}">
                                        ${image.type === 'video' ? `
                                            <video src="${toRoot(`site/video/${image.src.replace('../video/','')}`)}" alt="${image.alt}" muted loop>
                                                <span class="video-icon">▶</span>
                                            </video>
                                        ` : image.type === 'youtube' ? `
                                            <div class="youtube-thumb">
                                                <img src="https://img.youtube.com/vi/${image.src.split('/embed/')[1]?.split('?')[0]}/hqdefault.jpg" alt="${image.alt}" loading="lazy">
                                                <div class="youtube-play-icon">▶</div>
                                            </div>
                                        ` : `
                                            <img src="${toRoot(`site/images/${image.src}`)}" alt="${image.alt}" loading="lazy">
                                        `}
                                    </div>
                                `).join('');
                                })()}
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
        
        // Close menu when clicking on dropdown items
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-projects-dropdown-item')) {
                navMenu.classList.remove('active');
                burger.classList.remove('active');
            }
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
            const mediaType = previewThumb.getAttribute('data-media-type');
            const folderImagesJson = previewThumb.getAttribute('data-folder-images');
            const folderSlug = previewThumb.getAttribute('data-folder-slug');
            
            if (imageSrc && folderImagesJson) {
                try {
                    allImages = JSON.parse(folderImagesJson);
                    currentFolderSlug = folderSlug || null;
                    // Handle different media types
                    if (mediaType === 'video') {
                        openFullscreenVideo(imageSrc);
                    } else if (mediaType === 'youtube') {
                        openFullscreenYoutube(imageSrc);
                    } else {
                    openFullscreenImage(imageSrc);
                    }
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
            
            if (categoryKey && folderIndex >= 0 && siteConfig?.content?.projects) {
                // Find the project by ID in the array
                const project = siteConfig.content.projects.find(p => p.id === categoryKey);
                if (project && project.folders && project.folders[folderIndex]) {
                    const folder = project.folders[folderIndex];
                    openProjectGallery(folder.title, folder);
                }
            }
        }
        
        // Handle gallery image clicks
        const galleryImage = e.target.closest('.gallery-image');
        if (galleryImage) {
            const imageSrc = galleryImage.getAttribute('data-image-src');
            const mediaType = galleryImage.getAttribute('data-media-type');
            const modal = document.getElementById('project-gallery-modal');
            if (modal) {
                const slugEl = modal.querySelector('[data-gallery-slug]');
                if (slugEl) currentFolderSlug = slugEl.getAttribute('data-gallery-slug');
            }
            if (imageSrc) {
                if (mediaType === 'video') {
                    openFullscreenVideo(imageSrc);
                } else if (mediaType === 'youtube') {
                    openFullscreenYoutube(imageSrc);
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
    
    // Reset transform FIRST
    resetImageTransform(image);
    
    // Reset zoom handler BEFORE loading new image
    if (window.resetCurrentImageZoom) {
        window.resetCurrentImageZoom();
    }
    
    // Load image and setup handler when ready
    image.onload = function() {
        // Optimize image display quality
        optimizeImageDisplay(image);
        
        // Setup fresh handler after image loads
        if (window.setupNewImageZoomHandler) {
            window.setupNewImageZoomHandler();
        }
    };
    
    image.src = imageSrc;
    
    // Fallback for cached images that don't trigger onload
    if (image.complete && image.naturalHeight !== 0) {
        setTimeout(() => {
            optimizeImageDisplay(image);
            if (window.setupNewImageZoomHandler) {
                window.setupNewImageZoomHandler();
            }
        }, 0);
    }
    
    // Show modal - force display to override any CSS conflicts
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update URL for shareable link
    updateURLForImage(currentFolderSlug, imageSrc);

    // Update navigation buttons
    updateNavigationButtons();
    
    // Show zoom instruction briefly
    showZoomInstruction();
}

function resetImageTransform(image) {
    // Simple reset like old code
    image.style.transform = 'scale(1) translate(0px, 0px)';
    image.style.cursor = 'grab';
    
    // COMPLETELY clear dataset to prevent value carry-over
    delete image.dataset.scale;
    delete image.dataset.translateX;
    delete image.dataset.translateY;
}

function optimizeImageDisplay(image) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    
    // Reset any previous styling to let CSS handle initial sizing
    image.style.width = '';
    image.style.height = '';
    image.style.maxWidth = '';
    image.style.maxHeight = '';
    image.style.objectFit = '';
    image.style.objectPosition = '';
    image.style.transform = '';
    
    // Initialize zoom data
    image.dataset.scale = '1';
    image.dataset.translateX = '0';
    image.dataset.translateY = '0';
    
    // Let container handle centering naturally
    const container = image.parentElement;
    if (container) {
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.overflow = 'hidden';
    }
}

function showZoomInstruction() {
    const modal = document.getElementById('fullscreen-container');
    if (!modal) return;
    
    // Remove existing instruction if any
    const existingInstruction = modal.querySelector('.zoom-instruction');
    if (existingInstruction) {
        existingInstruction.remove();
    }
    
    // Create zoom instruction
    const instruction = document.createElement('div');
    instruction.className = 'zoom-instruction';
    instruction.textContent = 'Mausrad zum Zoomen • Doppelklick zum Zurücksetzen • Ziehen zum Bewegen';
    
    // Detect if mobile
    if ('ontouchstart' in window) {
        instruction.textContent = 'Zwei Finger zum Zoomen • Doppeltippen zum Zurücksetzen • Ziehen zum Bewegen';
    }
    
    modal.appendChild(instruction);
    
    // Fade out after 3 seconds
    setTimeout(() => {
        instruction.classList.add('fade-out');
        setTimeout(() => instruction.remove(), 300);
    }, 3000);
}

function openFullscreenVideo(videoSrc) {
    const modal = document.getElementById('fullscreen-container');
    const image = document.getElementById('fullscreen-image');
    
    if (!modal || !image) return;
    
    // Replace image with video
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.className = 'fullscreen-image';
    video.id = 'fullscreen-video';
    // Ensure proper type hint for browsers
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    video.appendChild(source);
    
    // Replace image element with video
    image.parentNode.replaceChild(video, image);
    
    // Show modal - force display to override any CSS conflicts
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update URL for shareable link
    updateURLForImage(currentFolderSlug, videoSrc);
}

function openFullscreenYoutube(youtubeSrc) {
    const modal = document.getElementById('fullscreen-container');
    const image = document.getElementById('fullscreen-image');
    
    if (!modal || !image) return;
    
    // Replace image with YouTube iframe
    const youtubeContainer = document.createElement('div');
    youtubeContainer.className = 'fullscreen-youtube-container';
    youtubeContainer.id = 'fullscreen-youtube';
    
    const iframe = document.createElement('iframe');
    iframe.src = youtubeSrc;
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    iframe.className = 'fullscreen-youtube-iframe';
    
    youtubeContainer.appendChild(iframe);
    
    // Replace image element with YouTube container
    image.parentNode.replaceChild(youtubeContainer, image);
    
    // Show modal - force display to override any CSS conflicts
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update URL for shareable link
    updateURLForImage(currentFolderSlug, youtubeSrc);
}

function closeFullscreenImage() {
    const modal = document.getElementById('fullscreen-container');
    
    if (modal) {
        // FORCE hide with inline style (overrides any CSS)
        modal.style.display = 'none';
        modal.classList.remove('active');
        
        document.body.style.overflow = '';
        
        // If there's a video, replace it back with image element
        const video = document.getElementById('fullscreen-video');
        const youtube = document.getElementById('fullscreen-youtube');
        
        if (video) {
            const image = document.createElement('img');
            image.className = 'fullscreen-image';
            image.id = 'fullscreen-image';
            video.parentNode.replaceChild(image, video);
        } else if (youtube) {
            const image = document.createElement('img');
            image.className = 'fullscreen-image';
            image.id = 'fullscreen-image';
            youtube.parentNode.replaceChild(image, youtube);
        }
    }

    // When closing fullscreen, go back to folder URL if available
    if (currentFolderSlug) {
        history.pushState({ view: 'folder', slug: currentFolderSlug }, '', `/${currentFolderSlug}`);
    } else {
        history.pushState({ view: 'root' }, '', '/');
    }
}

function navigateImage(direction) {
    if (allImages.length === 0) return;
    
    // IMPORTANT: Reset zoom handler FIRST before changing image
    if (window.resetCurrentImageZoom) {
        window.resetCurrentImageZoom();
    }
    
    if (direction === 'next') {
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
    } else if (direction === 'prev') {
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    }
    
    const currentSrc = allImages[currentImageIndex];
    
    // Check media type
    const isVideo = currentSrc.includes('.mp4') || currentSrc.includes('.webm') || currentSrc.includes('.mov');
    const isYoutube = currentSrc.includes('youtube.com') || currentSrc.includes('youtu.be');
    
    if (isVideo) {
        openFullscreenVideo(currentSrc);
    } else if (isYoutube) {
        openFullscreenYoutube(currentSrc);
    } else {
        // Ensure we have an image element (replace video/youtube if present)
        let image = document.getElementById('fullscreen-image');
        const video = document.getElementById('fullscreen-video');
        const youtube = document.getElementById('fullscreen-youtube');
        
        if (video) {
            // Replace video with image
            image = document.createElement('img');
            image.className = 'fullscreen-image';
            image.id = 'fullscreen-image';
            video.parentNode.replaceChild(image, video);
            // Need to setup new handler for new element
            setTimeout(() => {
                if (window.setupNewImageZoomHandler) {
                    window.setupNewImageZoomHandler();
                }
            }, 0);
        } else if (youtube) {
            // Replace youtube with image
            image = document.createElement('img');
            image.className = 'fullscreen-image';
            image.id = 'fullscreen-image';
            youtube.parentNode.replaceChild(image, youtube);
            // Need to setup new handler for new element
            setTimeout(() => {
                if (window.setupNewImageZoomHandler) {
                    window.setupNewImageZoomHandler();
                }
            }, 0);
        }
        
        if (image) {
            // Reset transform BEFORE setting new image
            resetImageTransform(image);
            
            // Setup handler after image loads
            image.onload = function() {
                // Optimize image display quality
                optimizeImageDisplay(image);
                
                if (window.setupNewImageZoomHandler) {
                    window.setupNewImageZoomHandler();
                }
            };
            
            image.src = currentSrc;
            
            // Fallback for cached images
            if (image.complete && image.naturalHeight !== 0) {
                setTimeout(() => {
                    optimizeImageDisplay(image);
                    if (window.setupNewImageZoomHandler) {
                        window.setupNewImageZoomHandler();
                    }
                }, 0);
            }
        }
    }
    
    updateNavigationButtons();

    // Update URL to reflect the newly navigated media
    updateURLForImage(currentFolderSlug, currentSrc);
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
        // Remove any existing listeners first
        closeButton.onclick = null;
        
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeFullscreenImage();
        }, { once: false });
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
    
    if (!modal) return;
    
    let imageZoomHandler = null;
    
    // Setup zoom handler for current image
    function setupImageZoomHandler() {
    const image = document.getElementById('fullscreen-image');
        if (!image) return;
        
            // Always destroy and recreate handler for fresh state
    if (imageZoomHandler) {
        imageZoomHandler.destroy();
        imageZoomHandler = null;
    }
    
    // IMMEDIATELY ensure clean state
    const currentImage = document.getElementById('fullscreen-image');
    if (currentImage) {
        resetImageTransform(currentImage);
    }
    
    // Wait a tick to ensure DOM is updated, then create new handler
    setTimeout(() => {
        const freshImage = document.getElementById('fullscreen-image');
        if (freshImage) {
            imageZoomHandler = new ImageZoomHandler(freshImage);
        }
    }, 0);
    }
    
    // Remove zoom handler
    function removeImageZoomHandler() {
        if (imageZoomHandler) {
            imageZoomHandler.destroy();
            imageZoomHandler = null;
        }
    }
    
    // Reset zoom handler for new image
    function resetImageZoomHandler() {
        if (imageZoomHandler) {
            imageZoomHandler.destroy();
            imageZoomHandler = null;
        }
        
        // ALSO reset the actual image transform to prevent zoom-state carry-over
        const currentImage = document.getElementById('fullscreen-image');
        if (currentImage) {
            resetImageTransform(currentImage);
        }
    }
    
    // Make functions globally accessible
    window.resetCurrentImageZoom = resetImageZoomHandler;
    window.setupNewImageZoomHandler = setupImageZoomHandler;
    
    // Setup zoom when image loads/changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if image element changed
                const currentImage = document.getElementById('fullscreen-image');
                if (currentImage && currentImage.src) {
                    // Setup new handler for new image - but only after image loads
                    setupImageZoomHandler();
                }
            }
        });
    });
    
    observer.observe(modal, { childList: true, subtree: true });
    
    // Initial setup
    setupImageZoomHandler();
}

class ImageZoomHandler {
    constructor(element) {
        this.element = element;
        
        // FORCE clean state - ignore any existing values
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastTouchDistance = 0;
        this.startX = 0;
        this.startY = 0;
        this.maxScale = 5;
        this.minScale = 1;
        
        // IMMEDIATELY reset element to clean state
        this.element.style.transform = 'scale(1) translate(0px, 0px)';
        this.element.style.transformOrigin = 'center center';
        
        // Clear any dataset values
        delete this.element.dataset.scale;
        delete this.element.dataset.translateX;
        delete this.element.dataset.translateY;
        
        this.setupEventListeners();
        
        // FORCE update once to ensure clean state
        this.updateTransform();
        this.updateCursor();
    }
    

    
    setupEventListeners() {
        // Mouse events for desktop
        this.element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // Touch events for mobile
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Double click/tap to reset
        this.element.addEventListener('dblclick', this.resetZoom.bind(this));
        
        // Prevent context menu
        this.element.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // Mouse wheel zoom (simple like old code)
    handleWheel(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            this.scale *= 1.1; // Zoom in
        } else {
            this.scale /= 1.1; // Zoom out
        }
        
        this.scale = Math.max(this.minScale, Math.min(this.scale, this.maxScale));
        this.constrainTranslation();
        this.updateTransform();
    }
    
    // Mouse drag
    handleMouseDown(e) {
        // SAFETY CHECK: If scale somehow isn't 1 but image looks normal, force reset
        const currentTransform = this.element.style.transform;
        if (this.scale !== 1 && currentTransform === 'scale(1) translate(0px, 0px)') {
            this.scale = 1;
            this.translateX = 0;
            this.translateY = 0;
        }
        
        if (this.scale > 1) {
            e.preventDefault();
            this.isDragging = true;
            this.startX = e.clientX - this.translateX;
            this.startY = e.clientY - this.translateY;
            this.element.style.cursor = 'grabbing';
            // Disable text selection during drag
            document.body.style.userSelect = 'none';
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging && this.scale > 1) {
            e.preventDefault();
            this.translateX = e.clientX - this.startX;
            this.translateY = e.clientY - this.startY;
            this.constrainTranslation();
            this.updateTransform();
        }
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.element.style.cursor = this.scale > 1 ? 'grab' : 'default';
        // Re-enable text selection
        document.body.style.userSelect = '';
    }
    
    // Touch gestures
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            // Single touch - start dragging if zoomed
            if (this.scale > 1) {
                this.isDragging = true;
                this.startX = e.touches[0].clientX - this.translateX;
                this.startY = e.touches[0].clientY - this.translateY;
            }
        } else if (e.touches.length === 2) {
            // Two finger touch - start pinch zoom
            e.preventDefault();
            this.isDragging = false;
            this.lastTouchDistance = this.getTouchDistance(e.touches);
        }
    }
    
    handleTouchMove(e) {
        if (e.touches.length === 1 && this.isDragging && this.scale > 1) {
            // Single finger drag
            e.preventDefault();
            this.translateX = e.touches[0].clientX - this.startX;
            this.translateY = e.touches[0].clientY - this.startY;
            this.constrainTranslation();
            this.updateTransform();
        } else if (e.touches.length === 2) {
            // Pinch zoom (simple like old code)
            e.preventDefault();
            const currentDistance = this.getTouchDistance(e.touches);
            
            if (this.lastTouchDistance > 0) {
                this.scale *= currentDistance / this.lastTouchDistance;
                this.scale = Math.max(this.minScale, Math.min(this.scale, this.maxScale));
                this.constrainTranslation();
                this.updateTransform();
            }
            
            this.lastTouchDistance = currentDistance;
        }
    }
    
    handleTouchEnd(e) {
        if (e.touches.length === 0) {
            this.isDragging = false;
        }
    }
    
    // Helper functions
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    

    
    constrainTranslation() {
        if (this.scale <= 1) {
            this.translateX = 0;
            this.translateY = 0;
            return;
        }
        
        // Simple constraint based on image bounds (like old code)
        const rect = this.element.getBoundingClientRect();
        const scaledWidth = rect.width * this.scale;
        const scaledHeight = rect.height * this.scale;
        
        const maxTranslateX = (scaledWidth - rect.width) / 2;
        const maxTranslateY = (scaledHeight - rect.height) / 2;
        
        this.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, this.translateX));
        this.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, this.translateY));
    }
    
    updateTransform() {
        // Simple transform like the old working code
        this.element.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
        this.element.style.transformOrigin = 'center center';
        
        // Update dataset for consistency
        this.element.dataset.scale = this.scale;
        this.element.dataset.translateX = this.translateX;
        this.element.dataset.translateY = this.translateY;
    }
    
    updateCursor() {
        this.element.style.cursor = this.scale > 1 ? 'grab' : 'default';
    }
    
    resetZoom() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        
        this.updateTransform();
        this.updateCursor();
    }
    
    // Reset method for when new image is loaded
    reset() {
        // Reset all zoom/pan state
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastTouchDistance = 0;
        this.startX = 0;
        this.startY = 0;
        
        // Reset element transform directly (like old code)
        this.element.style.transform = 'scale(1) translate(0px, 0px)';
        this.element.style.cursor = 'default';
        this.element.style.transformOrigin = 'center center';
        
        // Reset dataset
        this.element.dataset.scale = '1';
        this.element.dataset.translateX = '0';
        this.element.dataset.translateY = '0';
        
        // Re-enable text selection if it was disabled
        document.body.style.userSelect = '';
    }
    
    destroy() {
        // Cancel any pending animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            this.pendingUpdate = false;
        }
        
        // Remove all event listeners
        this.element.removeEventListener('wheel', this.handleWheel.bind(this));
        this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.element.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
        this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.element.removeEventListener('dblclick', this.resetZoom.bind(this));
        this.element.removeEventListener('contextmenu', (e) => e.preventDefault());
        
        // Reset styles
        this.element.style.transform = '';
        this.element.style.cursor = '';
        this.element.style.transformOrigin = '';
        this.element.style.willChange = '';
        this.element.style.transformStyle = '';
        this.element.style.backfaceVisibility = '';
    }
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
    
    // Determine slug for this folder and attach to modal for later
    const parentProject = siteConfig.content.projects.find(p => p.folders && p.folders.some(f => f.title === folder.title && f.description === folder.description));
    const categoryKey = parentProject ? parentProject.id : 'folder';
    const folderIndex = parentProject ? parentProject.folders.indexOf(folder) : 0;
    const gallerySlug = makeFolderSlug(folder.title, categoryKey, folderIndex);
    currentFolderSlug = gallerySlug;
    modal.setAttribute('data-gallery-slug', gallerySlug);

    // Create image grid
    modalGrid.innerHTML = folder.images.map((image, index) => `
        <div class="gallery-image" data-image-src="${image.type === 'youtube' ? image.src : image.type === 'video' ? toRoot(`site/video/${image.src.replace('../video/','')}`) : toRoot(`site/images/${image.src}`)}" data-media-type="${image.type || 'image'}">
            <div class="gallery-image-container">
                ${image.type === 'video' ? `
                    <video alt="${image.alt}" controls muted loop playsinline preload="metadata">
                        <source src="${toRoot(`site/video/${image.src.replace('../video/','')}`)}" type="video/mp4">
                    </video>
                ` : image.type === 'youtube' ? `
                    <div class="youtube-container">
                        <iframe src="${image.src}" title="${image.alt}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                ` : `
                    <img src="${toRoot(`site/images/${image.src}`)}" alt="${image.alt}" loading="lazy">
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
    
    // Show modal - force display to override any CSS conflicts
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update images for fullscreen viewer
    allImages = folder.images.map(img => {
        if (img.type === 'youtube') return img.src;
        if (img.type === 'video') return toRoot(`site/video/${img.src.replace('../video/','')}`);
        return toRoot(`site/images/${img.src}`);
    });

    // Update URL for shareable folder link
    history.pushState({ view: 'folder', slug: gallerySlug }, '', `/${gallerySlug}`);
}

function closeProjectGallery() {
    const modal = document.getElementById('project-gallery-modal');
    if (modal) {
        // FORCE hide with inline style (same fix as fullscreen modal)
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Return to root URL when folder gallery is closed
    history.pushState({ view: 'root' }, '', '/');
    currentFolderSlug = null;
}

// Make sure function is globally accessible
window.closeProjectGallery = closeProjectGallery;

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
    
    // Add backup event listener for close button (in case onclick fails)
    const closeButton = modal.querySelector('.gallery-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeProjectGallery();
        });
    }
    
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

/* ===========================================
   LEGAL MODALS (IMPRINT & PRIVACY)
=========================================== */

function setupLegalModals() {
    // Setup close buttons
    document.getElementById('imprint-close')?.addEventListener('click', () => closeLegalModal('imprint'));
    document.getElementById('privacy-close')?.addEventListener('click', () => closeLegalModal('privacy'));
    
    // Setup backdrop clicks to close
    document.getElementById('imprint-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'imprint-modal') closeLegalModal('imprint');
    });
    
    document.getElementById('privacy-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'privacy-modal') closeLegalModal('privacy');
    });
    
    // Setup escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLegalModal('imprint');
            closeLegalModal('privacy');
        }
    });
}

function openLegalModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    const titleElement = document.getElementById(`${type}-title`);
    const contentElement = document.getElementById(`${type}-content`);
    
    if (!modal || !siteConfig.legal || !siteConfig.legal[type]) return;
    
    const legalData = siteConfig.legal[type];
    
    // Set title
    if (titleElement) {
        titleElement.textContent = legalData.title;
    }
    
    // Set content
    if (contentElement) {
        contentElement.innerHTML = legalData.content
            .map(section => `
                <h3>${section.heading}</h3>
                ${section.paragraphs.map(p => `<p>${p}</p>`).join('')}
            `)
            .join('');
    }
    
    // Show modal - force display to override any CSS conflicts
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLegalModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    if (modal) {
        // FORCE hide with inline style (same fix as other modals)
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Add legal modal setup to main initialization
document.addEventListener('DOMContentLoaded', function() {
    setupLegalModals();
});

/* ===========================================
   ROUTING (History API): folders and images
=========================================== */

// Normalize relative asset paths to absolute-from-root so they work on all routes
function toRoot(path) {
    if (!path) return '/';
    try {
        const cleaned = String(path).replace(/^[\/]+/, '');
        return `/${cleaned}`;
    } catch (_) {
        return '/';
    }
}

function slugify(text) {
    return (text || '')
        .toString()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

function makeFolderSlug(folderTitle, projectId, folderIndex) {
    const base = slugify(folderTitle);
    // Ensure uniqueness by prefixing project id if needed
    const candidate = base || `folder-${folderIndex}`;
    const key = `${projectId}:${folderIndex}`;
    // Map registration happens in createProjectCategory
    return candidate;
}

function getBasenameFromSrc(src) {
    try {
        const cleaned = src.split('?')[0];
        const parts = cleaned.split('/');
        return parts[parts.length - 1];
    } catch (_) {
        return encodeURIComponent(src);
    }
}

function updateURLForImage(folderSlug, src) {
    // Keep URL at folder level only; no-op for image deep-links
}

function setupRoutingHandlers() {
    window.addEventListener('popstate', (e) => {
        const path = location.pathname.replace(/^\/+/, '');
        if (!path) {
            // root: close modals
            closeFullscreenImage();
            closeProjectGallery();
            currentFolderSlug = null;
            return;
        }
        const segments = path.split('/').filter(Boolean);
        const slug = segments[0];
        const media = segments[1];
        handleRoute(slug, media);
    });
}

function applyInitialRoute() {
    const path = location.pathname.replace(/^\/+/, '');
    if (!path) return;
    const parts = path.split('/').filter(Boolean);
    const slug = parts[0];
    const media = parts[1];
    handleRoute(slug, media);
}

function handleRoute(slug, mediaId) {
    if (!slug) return;
    // find folder by slug
    let folderData = folderSlugToData[slug];
    if (!folderData) {
        // Try to lazily build map from DOM if missing
        const anyThumb = document.querySelector(`.preview-thumb[data-folder-slug="${slug}"]`);
        if (anyThumb) {
            // Already registered via createProjectCategory
            folderData = folderSlugToData[slug];
        }
    }
    if (!folderData) return;

    const { folder } = folderData;
    // Open gallery only; ignore mediaId and normalize URL
    openProjectGallery(folder.title, folder);
    if (mediaId) {
        history.replaceState({ view: 'folder', slug }, '', `/${slug}`);
    }
}

