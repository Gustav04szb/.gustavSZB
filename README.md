# Gustav Schwarzbach - Portfolio Website

A modern, responsive portfolio for Media Informatics projects featuring multilingual support, dark mode, progressive web app capabilities, and professional design.

## Features

### Multilingual Support
- **German/English Interface**: Complete bilingual implementation with automatic language detection
- **Language Toggle**: Manual language switching with localStorage persistence
- **Localized Content**: All sections, navigation, and legal documents in both languages
- **SEO Optimization**: Language-specific meta tags and social media previews

### Design & User Experience
- **Modern Design**: Clean, minimalistic design inspired by Apple/Samsung aesthetics
- **Light/Dark Mode**: Automatic theme switching based on system preferences with manual toggle
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Fluid transitions and micro-interactions
- **CSS Custom Properties**: Consistent design tokens for easy theming

### Core Functionality
- **Single Page Application**: Scrollable sections with smooth navigation
- **JSON-based Configuration**: Centralized content management in language-specific config files
- **Project Gallery System**: Folder-based organization with modal galleries
- **Fullscreen Media Viewer**: Advanced image and video display with zoom, pan, and navigation
- **Touch Gestures**: Mobile-optimized interactions with swipe support

### Progressive Web App
- **Service Worker**: Intelligent caching strategies for offline functionality
- **App Installation**: Installable on all devices with proper manifest
- **Background Sync**: Ready for future offline features
- **Performance Optimization**: Lazy loading and optimized asset delivery

### Legal Compliance
- **GDPR Compliant**: Privacy policy and imprint in German and English
- **Modal System**: Professional legal document presentation
- **Cookie-Free**: No tracking or data collection without consent

## Project Structure

```
.gustavSZB/
├── index.html                    # Main HTML file
├── sw.js                        # Service Worker for PWA features
├── manifest.webmanifest         # PWA manifest
├── site/
│   ├── config-de.json          # German language configuration
│   ├── config-en.json          # English language configuration
│   ├── styles.css              # Modern CSS with custom properties
│   ├── scripts.js              # JavaScript for all functionality
│   ├── images/                 # Original images and media
│   │   ├── first_sem/          # First semester projects
│   │   ├── second_sem/         # Second semester projects
│   │   ├── third_sem/          # Third semester projects
│   │   └── video/              # Video assets
│   └── icons/                  # PWA icons and assets
├── screenshot-desktop.png       # Desktop PWA screenshot
├── screenshot-mobile.png        # Mobile PWA screenshot
└── README.md                   # This file
```

## Technology Stack

- **HTML5**: Semantic markup with modern web standards
- **CSS3**: Custom properties, Grid, Flexbox, advanced animations
- **Vanilla JavaScript**: ES6+ features without external dependencies
- **Service Worker API**: PWA features and advanced caching
- **JSON Configuration**: Structured content management
- **Progressive Enhancement**: Works across all modern browsers

## Design System

### Color Palette

**Light Theme (Blanc de Blanc)**
- Primary Background: `#EFEFEF`
- Secondary Background: `#f5f5f5`
- Tertiary Background: `#e8e8e8`
- Primary Text: `#000000`
- Secondary Text: `#2a2a2a`
- Accent Primary: `#1e40af`

**Dark Theme (Oil Black)**
- Primary Background: `#0C0C0C`
- Secondary Background: `#1a1a1a`
- Tertiary Background: `#2a2a2a`
- Primary Text: `#ffffff`
- Secondary Text: `#e5e5e5`
- Accent Primary: `#2563eb`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive Scale**: Fluid typography from mobile to desktop
- **Line Height**: 1.6 for optimal readability

## Responsive Breakpoints

- **Mobile**: 480px and below
- **Tablet**: 768px and below
- **Desktop**: 769px and above

## Development Setup

### Local Development
1. Clone the repository
2. Start a local server (e.g., Live Server in VS Code)
3. Navigate to `http://localhost:PORT`
4. Use browser dev tools for testing responsive design

### Content Management
1. Edit `site/config-de.json` for German content
2. Edit `site/config-en.json` for English content
3. Add new images to appropriate folders in `site/images/`
4. Update project configurations in JSON files

### Adding New Projects
1. Create folder structure in `site/images/`
2. Add images/videos to the folder
3. Update corresponding config file with project metadata
4. Include thumbnails and descriptions

## Configuration Structure

### Language-specific Configuration Files

Each language has its own configuration file with the following structure:

```json
{
  "site": {
    "title": "Gustav Schwarzbach",
    "description": "Multilingual portfolio description",
    "author": "Gustav Schwarzbach",
    "url": "https://gustavszb.com/",
    "email": "me@gustavSZB.com"
  },
  "content": {
    "hero": {
      "title": "Main Title",
      "subtitle": "Subtitle",
      "description": ["Paragraph 1", "Paragraph 2"],
      "buttons": {
        "view_projects": "View Projects",
        "get_in_touch": "Get in Touch"
      }
    },
    "sections": {
      "about": {
        "title": "About Me",
        "description": "About section description",
        "skills": [
          {"title": "Skill Category", "description": "Skill details"}
        ]
      }
    },
    "projects": {
      "semester_name": {
        "title": "Semester Title",
        "description": "Semester description",
        "folders": [
          {
            "title": "Project Folder",
            "description": "Project description",
            "images": [
              {
                "src": "path/to/image.jpg",
                "alt": "Image description",
                "title": "Image title",
                "description": "Detailed description"
              }
            ]
          }
        ]
      }
    }
  },
  "legal": {
    "imprint": {
      "title": "Imprint",
      "content": [/* Legal content structure */]
    },
    "privacy": {
      "title": "Privacy Policy", 
      "content": [/* Privacy content structure */]
    }
  }
}
```

## Performance Optimizations

- **Lazy Loading**: Images and videos load on demand
- **Service Worker Caching**: Intelligent caching with versioning
- **Critical Resource Prioritization**: Important assets load first
- **Cumulative Layout Shift Prevention**: Stable layouts during loading
- **Passive Event Listeners**: Improved scroll performance
- **Font Loading Optimization**: Preloaded critical fonts

## PWA Features

- **Offline Functionality**: Full website works without internet connection
- **App Installation**: Native app-like installation on all platforms
- **Proper Manifest**: Complete PWA manifest with icons and screenshots
- **Service Worker**: Advanced caching and offline strategies
- **Update Management**: Automatic updates with user notification

## SEO & Accessibility

- **Semantic HTML**: Proper document structure for screen readers
- **Meta Tags**: Optimized for search engines and social media
- **Language Attributes**: Proper language declarations
- **Alt Texts**: Descriptive alternative text for all images
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators and management
- **WCAG Compliance**: Meets accessibility guidelines

## Browser Support

- **Chrome**: Version 80 and above
- **Firefox**: Version 75 and above
- **Safari**: Version 13 and above
- **Edge**: Version 80 and above
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+

## Deployment

### GitHub Pages
1. Push repository to GitHub
2. Enable GitHub Pages in repository settings
3. Select source branch and folder
4. Custom domain configuration available

### Alternative Hosting
- **Netlify**: Direct GitHub integration
- **Vercel**: Zero-configuration deployment
- **Cloudflare Pages**: Global CDN integration

## Legal & Compliance

- **GDPR Compliant**: Full privacy policy and data protection
- **German Legal Requirements**: TMG-compliant imprint
- **Cookie-Free Design**: No tracking without explicit consent
- **Data Minimization**: Minimal data collection and processing

## Performance Metrics

- **Lighthouse Score**: Optimized for 90+ scores across all categories
- **Core Web Vitals**: Excellent LCP, FID, and CLS scores
- **Progressive Enhancement**: Works on all browsers with graceful degradation
- **Mobile Performance**: Optimized for mobile-first experience

## License

Copyright 2025 Gustav Schwarzbach. All rights reserved.

## Contact

- **Website**: [gustavszb.com](https://gustavszb.com/)
- **LinkedIn**: [gustavszb](https://www.linkedin.com/in/gustavszb/)
- **GitHub**: [Gustav04szb](https://github.com/Gustav04szb)
- **Email**: me@gustavSZB.com
