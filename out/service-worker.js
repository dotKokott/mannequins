const CACHE_NAME = 'mannequins-cache-v1'
const STATIC_CACHE = 'static-cache-v1'
const DYNAMIC_CACHE = 'dynamic-cache-v1'

// Cache essential static assets that are needed for the app shell
const staticAssets = ['/', '/index.html', '/index.js']

// Install the service worker and cache initial static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(staticAssets)
    }),
  )
})

// Determine if an asset should be cached
function shouldCache(url) {
  // Define patterns for cacheable content
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
  const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf']
  const assetExtensions = ['.css', '.js']
  const allCacheableExtensions = [
    ...imageExtensions,
    ...fontExtensions,
    ...assetExtensions,
  ]

  // Check if URL ends with any of the cacheable extensions
  return (
    allCacheableExtensions.some((ext) => url.toLowerCase().endsWith(ext)) ||
    // Or if it contains common asset path patterns
    url.includes('/assets/') ||
    url.includes('/images/') ||
    url.includes('/media/')
  )
}

// Fetch resources from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (
    !event.request.url.startsWith(self.location.origin) &&
    !event.request.url.includes('fonts.cdnfonts.com')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request)
        .then((response) => {
          // Return the response if invalid
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the response if it matches our criteria
          if (shouldCache(event.request.url)) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // When offline and resource not in cache
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }

          // For image requests, you could return a fallback image
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
            return new Response('', {
              // Or return a placeholder image
              status: 200,
              headers: { 'Content-Type': 'image/svg+xml' },
            })
          }

          return new Response('', {
            status: 408,
            statusText: 'Offline - Resource not available',
          })
        })
    }),
  )
})

// Clean up old caches when new service worker activates
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE]

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})
