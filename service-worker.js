/* self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('pwa-cache').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/icon-192x192.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  
  ------------------------------ */
  
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('pwa-cache').then(cache => {
        return cache.addAll([
          '',                        // Página principal
          '/project/index.html',              // HTML
          '/project/icon-192x192.png',        // Ícono
          '/project/styles/app.css',          // CSS
          '/project/scripts/app.js',          // Aquí añades el JS compilado de Vue
          '/project/scripts/vendor.js',       // Si tienes otros archivos JS, agrégales también
          // Agrega más archivos estáticos si es necesario
        ]);
      })
    );
  });
  
  // Manejo del evento 'fetch' para responder con caché o red
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open('pwa-cache').then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/project/service-worker.js')
        .then((reg) => console.log('Service Worker registrado:', reg))
        .catch((err) => console.log('Error en SW:', err));
    });
  }
  
