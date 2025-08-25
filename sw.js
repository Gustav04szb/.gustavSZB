/* ===========================================
   SERVICE WORKER - PWA FEATURES
   Gustav Schwarzbach Portfolio - 2025
=========================================== */

const CACHE_NAME = 'gustav-portfolio-v1.2.7';
const STATIC_CACHE = 'gustav-static-v1.2.7';
const DYNAMIC_CACHE = 'gustav-dynamic-v1.2.7';

// Critical assets to cache immediately  
const CRITICAL_ASSETS = [
  './index.html',
  './site/styles.css',
  './site/scripts.js',
  './site/config-de.json',
  './site/config-en.json'
];

// Optional assets (cache if available)
const OPTIONAL_ASSETS = [
  './site/icons/icon-192.png',
  './site/icons/icon-512.png',
  './screenshot-desktop.png',
  './screenshot-mobile.png',
  './manifest.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        console.log('SW: Cache opened successfully');
        
        // Test if we can fetch anything at all
        try {
          const testResponse = await fetch('./index.html');
          if (!testResponse.ok) {
            console.warn('SW: Cannot fetch index.html, skipping cache');
            await self.skipWaiting();
            return;
          }
        } catch (error) {
          console.warn('SW: Network unavailable, skipping cache');
          await self.skipWaiting();
          return;
        }
        
        console.log('SW: Starting to cache assets...');
        
        // Cache critical assets first
        const criticalResults = await Promise.allSettled(
          CRITICAL_ASSETS.map(async asset => {
            try {
              // Fetch first to check if resource exists
              const response = await fetch(asset);
              if (response.ok) {
                await cache.put(asset, response);
                console.log(`SW: ✅ Cached ${asset}`);
                return asset;
              } else {
                console.warn(`SW: ❌ ${asset} returned ${response.status}`);
                return null;
              }
            } catch (error) {
              console.warn(`SW: ❌ Failed to cache ${asset}:`, error.message);
              return null;
            }
          })
        );

        // Cache optional assets (don't fail if they don't work)
        const optionalResults = await Promise.allSettled(
          OPTIONAL_ASSETS.map(async asset => {
            try {
              const response = await fetch(asset);
              if (response.ok) {
                await cache.put(asset, response);
                console.log(`SW: ✅ Cached optional ${asset}`);
                return asset;
              } else {
                console.log(`SW: ⚠️ Optional asset ${asset} returned ${response.status}`);
                return null;
              }
            } catch (error) {
              console.log(`SW: ⚠️ Optional asset ${asset} not cached:`, error.message);
              return null;
            }
          })
        );

        const successfulCritical = criticalResults.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`SW: Successfully cached ${successfulCritical}/${CRITICAL_ASSETS.length} critical assets`);
        
        await self.skipWaiting();
        console.log('SW: Installation complete');
        
      } catch (error) {
        console.error('SW: Installation failed:', error);
        // Still skip waiting so the SW activates
        await self.skipWaiting();
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
              console.log('SW: Removing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests, extension requests, and chrome-extension requests
  if (url.origin !== location.origin || request.url.includes('extension') || request.url.startsWith('chrome-extension')) {
    return;
  }
  
  // Handle different types of requests
  if (request.method === 'GET') {
    event.respondWith(handleGetRequest(request));
  }
});

// Handle GET requests with different caching strategies
async function handleGetRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First (for static assets)
    if (isStaticAsset(request)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First (for HTML and API data)
    if (isHTMLRequest(request) || isAPIRequest(request)) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate (for images)
    if (isImageRequest(request)) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Network with cache fallback
    return await networkWithCacheFallback(request);
    
  } catch (error) {
    console.error('SW: Error handling request:', error);
    return await getOfflineFallback(request);
  }
}

// Caching strategy implementations
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      // Clone the response before caching to avoid "body already used" error
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('SW: Cache first failed:', error);
    throw error;
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Clone the response before caching
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  // Start fetch in background without waiting
  const fetchPromise = fetch(request).then(async response => {
    if (response.ok && response.status === 200) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        // Clone the response before caching
        await cache.put(request, response.clone());
      } catch (error) {
        console.warn('SW: Failed to cache response:', error);
      }
    }
    return response;
  }).catch(error => {
    console.warn('SW: Fetch failed in staleWhileRevalidate:', error);
    return cached;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  if (cached) {
    return cached;
  }
  
  return fetchPromise;
}

async function networkWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Clone the response before caching
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Request type helpers
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.webmanifest')
  );
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.json') ||
    url.pathname.includes('/api/')
  );
}

function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  return (
    request.headers.get('accept')?.includes('image') ||
    imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext))
  );
}

// Offline fallback
async function getOfflineFallback(request) {
  if (isHTMLRequest(request)) {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
  }
  
  // Return a generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This content is not available offline'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Background sync for future enhancement
self.addEventListener('sync', event => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('SW: Performing background sync')
    );
  }
});

// Push notifications for future enhancement
self.addEventListener('push', event => {
  console.log('SW: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/site/icons/icon-192.png',
    badge: '/site/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/site/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/site/icons/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Gustav Schwarzbach Portfolio', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('SW: Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling (for communication with main thread)
self.addEventListener('message', event => {
  console.log('SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (for future enhancement)
self.addEventListener('periodicsync', event => {
  console.log('SW: Periodic sync:', event.tag);
  
  if (event.tag === 'portfolio-update') {
    event.waitUntil(
      // Check for portfolio updates
      console.log('SW: Checking for portfolio updates')
    );
  }
});

console.log('SW: Service Worker script loaded'); 

/* ===========================================
   DEBUG HELPERS (Available in Console)
=========================================== */

// Helper to reset service worker completely
self.resetSW = async function() {
  console.log('🔄 Resetting Service Worker...');
  
  // Delete all caches
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('✅ All caches deleted');
  
  // Skip waiting and claim clients
  await self.skipWaiting();
  await self.clients.claim();
  console.log('✅ Service Worker reset complete');
  
  return 'Service Worker has been reset. Reload the page.';
};

// Helper to check cache status
self.checkCaches = async function() {
  const cacheNames = await caches.keys();
  console.log('📦 Current caches:', cacheNames);
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    console.log(`📂 ${name}: ${keys.length} items`);
    keys.forEach(req => console.log(`  - ${req.url}`));
  }
  
  return `Found ${cacheNames.length} caches`;
}; 