self.addEventListener('install', (event) => {
  // Activate worker immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Become available to all pages
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (message.action === 'UPLOAD') {
    caches.open('builder-images').then((cache) => {
      fetch(message.data).then(res => res.blob()).then((blob) => {
        cache.put(message.url, new Response(blob))
          .then(() => event.ports[0].postMessage({ status: 'OK' }));
      });
    });
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.open('builder-images').then((cache) => {
      return cache.match(request.url).then((cachedResponse) => {
        if (cachedResponse) {
          return fetch(request.url).then((response) => {
            if (response && response.ok) {
              return cache.delete(request.url).then(() => response);
            }

            return cachedResponse;
          });
        }

        return fetch(request);
      });
    })
  )
});
