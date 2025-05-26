const CACHE_NAME = 'grade-calculator-v1'
const urlsToCache = [
  '/',
  '/calculator',
  '/manifest.json',
  // Add other static assets as needed
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background sync for data export/import
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered')
  return Promise.resolve()
}

// Push notifications (for study reminders)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Study Reminder', body: 'Time to study for your finals!', tag: 'default-reminder' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.svg', // Using available SVG icon
      tag: data.tag || 'default-reminder', // Tag can be used to group or replace notifications
      data: data.data || {} // Pass along any additional data from the push
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Default behavior: open the main page or focus an existing window
  let targetUrl = '/calculator'; // Default page to open
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url; // Open specific URL if provided in push data
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if a window with the target URL is already open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }).catch(err => {
      console.error("Error handling notification click: ", err);
      // Fallback if matchAll or openWindow fails
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle message events from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
