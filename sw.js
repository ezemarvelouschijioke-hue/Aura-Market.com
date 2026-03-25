const CACHE_NAME = 'aura-market-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/product-details.html',
    '/bundles.html',
    '/order-history.html',
    '/order-tracking.html',
    '/wishlist.html',
    '/account.html',
    '/login.html',
    '/signup.html',
    '/css/style.css',
    '/js/core/config.js',
    '/js/core/storage.js',
    '/js/core/utils.js',
    '/js/modules/products.js',
    '/js/modules/auth.js',
    '/js/modules/cart.js',
    '/js/modules/wishlist.js',
    '/js/modules/payment.js',
    '/js/modules/coupons.js',
    '/js/modules/rewards.js',
    '/js/pages/home.js',
    '/js/pages/product-details.js',
    '/js/theme.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://js.paystack.co/v1/inline.js'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch from cache, then network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});

// Update service worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle offline fallback
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline.html');
            })
        );
    }
});