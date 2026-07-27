// Training Log service worker.
//
// The whole app is a single index.html with all CSS/JS inline — there's no
// separate bundle to manage, which makes the offline story simple: cache
// that one file (plus the manifest and icons) and this app works fully
// offline after the first successful load. All actual data (profile,
// workouts, logs) already lives in localStorage via the app's own storage
// layer, completely independent of this service worker — this only ever
// affects whether the PAGE ITSELF can load without a network connection.
//
// Bump CACHE_NAME whenever you want to force everyone onto a fresh copy of
// the shell (e.g. after a significant index.html update) — the activate
// handler below cleans up the old cache automatically.
const CACHE_NAME = 'training-log-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
      // If precaching fails (e.g. first install with no network at all),
      // don't hard-fail the install — the fetch handler's cache-first
      // fallback still works once anything does get cached.
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never intercept writes

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    // App shell (index.html, manifest, icons): cache-first for instant,
    // offline-capable loads, refreshing the cache in the background
    // whenever the network is actually available (stale-while-revalidate).
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => null);
        // Navigation requests specifically should fall back to the cached
        // index.html if the exact URL isn't cached (e.g. a deep link) —
        // this is what actually lets the app open at all while offline.
        if (cached) return cached;
        return network.then((res) => res || caches.match('./index.html'));
      })
    );
  } else {
    // Cross-origin (Google Fonts CSS + font files): prefer the network so
    // font updates aren't stuck on a stale cache, but fall back to
    // whatever's cached if the network is unavailable.
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
