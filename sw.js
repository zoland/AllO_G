// Service Worker для принудительного обновления
const CACHE_NAME = 'allo-g-v1.1.1';

self.addEventListener('install', (event) => {
    console.log('SW: Установка v1.1.1');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW: Активация v1.1.1');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Удаляем старый кеш', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Всегда загружаем с сервера для получения обновлений
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
