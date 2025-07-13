const CACHE_NAME = 'geointel-cache-v2';
const APP_SHELL_URLS = [
    '/',
    'index.html',
    'style.css',
    'manifest.json',
    'icon.svg'
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching App Shell');
            return cache.addAll(APP_SHELL_URLS);
        })
    );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// On fetch, use stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(event.request);

            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // If we get a valid response, update the cache
                if (networkResponse.status === 200) {
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(err => {
                // Network request failed, which is expected for offline mode
                console.warn('Service Worker: Fetch failed; returning cached response instead.', err);
                return cachedResponse; // Return cached response if network fails
            });

            // Return the cached response if it exists, and let the fetch happen in the background.
            // If not cached, wait for the network response.
            return cachedResponse || fetchPromise;
        })
    );
});