// sw.js — Training Log
//
// THE ONE RULE: `VERSION` below must match `APP_VERSION` in index.html.
// The cache name is derived from it, so bumping APP_VERSION and forgetting to
// bump this leaves every returning user on the old build with no way to escape
// short of uninstalling the PWA. That failure is silent from the server side —
// the deploy looks fine and simply never arrives.
//
// HANDOFF v6 §6 flagged that APP_VERSION had not moved in five sessions and
// that nobody knew whether sw.js keyed off it. It does now.
const VERSION = '3.12';
const CACHE = 'training-log-v' + VERSION;

// index.html is the entire app; the rest is shell metadata. Everything else the
// app uses (fonts, the Anthropic API, USDA, ZXing) is deliberately NOT
// precached — see the fetch handler.
// SPLIT INTO ESSENTIAL AND OPTIONAL, and this distinction is the whole point.
//
// cache.addAll() is atomic: one 404 rejects the entire promise, the install
// fails, the old worker stays active and NOTHING new caches. That made
// manifest.json — a file that contributes nothing to the app running — able to
// silently block every release. It is exactly the kind of dependency that
// should not be able to fail the thing it decorates.
//
// Essential entries still use addAll, because if index.html can't be fetched
// the install genuinely should fail. Optional entries are fetched individually
// and their failures swallowed.
const PRECACHE_ESSENTIAL = [
  './',
  './index.html',
];

const PRECACHE_OPTIONAL = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './apple-touch-icon-167.png',
  './apple-touch-icon-152.png',
];

self.addEventListener('install', (event)=>{
  event.waitUntil((async ()=>{
    const cache = await caches.open(CACHE);
    // Essential: atomic. If the app shell can't be fetched, failing the install
    // and leaving the old worker in place IS the correct outcome for a broken
    // deploy. cache:'reload' so the install can't populate the new cache from
    // the HTTP cache's copy of the OLD build.
    await cache.addAll(PRECACHE_ESSENTIAL.map(u=> new Request(u, {cache:'reload'})));

    // Optional: best-effort, one at a time, failures ignored. A missing icon or
    // manifest degrades installability — it does not stop the app working, and
    // it must not stop the app UPDATING.
    await Promise.all(PRECACHE_OPTIONAL.map(async (u)=>{
      try{
        const res = await fetch(new Request(u, {cache:'reload'}));
        if(res && res.ok) await cache.put(u, res);
      }catch(e){ /* deliberately swallowed — see above */ }
    }));
  })());
  // NOT self.skipWaiting() here. The new worker waits until the page asks for
  // it (see the message handler), so an update can never swap the app out from
  // under someone mid-set with numbers typed into an input.
});

self.addEventListener('activate', (event)=>{
  event.waitUntil((async ()=>{
    const names = await caches.keys();
    await Promise.all(
      names.filter(n=> n.startsWith('training-log-v') && n !== CACHE)
           .map(n=> caches.delete(n))
    );
    // Take over open pages immediately once activated. Paired with the
    // controllerchange listener in index.html, which does the reload.
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event)=>{
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Tapping the "rest is over" notification should put you back in the app, not
// open a second copy of it in a new window. matchAll with includeUncontrolled
// because a notification can outlive the client that scheduled it.
self.addEventListener('notificationclick', (event)=>{
  event.notification.close();
  event.waitUntil((async ()=>{
    const all = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for(const c of all){
      if('focus' in c) return c.focus();
    }
    if(self.clients.openWindow) return self.clients.openWindow('./');
  })());
});

self.addEventListener('fetch', (event)=>{
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // Diagnostic probes. The App Health Check fetches index.html to compare the
  // served version against the running one; if that response were cached like
  // any other shell request, the check would write 1.8MB back into the cache
  // every time it ran. Measured on a real device: origin storage climbed from
  // 3.7MB to 10.7MB across two checks. A tool that measures storage must not
  // consume it.
  if(url.searchParams.has('__diag')) return;

  // Cross-origin is passed straight through and never cached. The API calls
  // (api.anthropic.com), USDA lookups, barcode library and web fonts all live
  // here, and caching any of them would be wrong in a different way each time:
  // stale API responses, a stale food database, and a cache that grows without
  // bound against the same origin quota the photos and localStorage share.
  if(url.origin !== self.location.origin) return;

  // NETWORK-FIRST for the app shell — this is the important decision in this
  // file. A cache-first worker serves the old index.html forever and is exactly
  // the trap that motivated this rewrite. Network-first means an online user
  // always gets the current build on a reload, and the cache exists purely so
  // the app still opens on a plane or a subway.
  const isShell = req.mode === 'navigate' ||
                  url.pathname.endsWith('/') ||
                  url.pathname.endsWith('/index.html');

  if(isShell){
    event.respondWith((async ()=>{
      try{
        const fresh = await fetch(req);
        // Only successful, non-opaque responses are worth storing.
        if(fresh && fresh.ok){
          const cache = await caches.open(CACHE);
          cache.put('./index.html', fresh.clone());
        }
        return fresh;
      }catch(e){
        const cached = await caches.match('./index.html', {ignoreSearch:true});
        // The literal last resort — offline AND nothing cached. Plain text
        // rather than styled HTML, because if the shell isn't cached then no
        // stylesheet is either and a half-rendered page reads as a crash.
        return cached || new Response(
          'Training Log is offline and no cached copy is available yet. Reconnect once and it will work offline from then on.',
          {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}}
        );
      }
    })());
    return;
  }

  // CACHE-FIRST for same-origin static assets (icons, manifest). These are
  // versioned by the cache name, so a stale one can only survive as long as the
  // build it shipped with.
  event.respondWith((async ()=>{
    const cached = await caches.match(req);
    if(cached) return cached;
    try{
      const fresh = await fetch(req);
      if(fresh && fresh.ok && fresh.type === 'basic'){
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
      }
      return fresh;
    }catch(e){
      return new Response('', {status:504});
    }
  })());
});
