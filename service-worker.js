self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('expense-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/icons/icon-192x192.png',
                '/icons/icon-512x512.png',
                // 你可以缓存其他静态文件，比如CSS、JS等
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);  // 优先使用缓存
        })
    );
});
