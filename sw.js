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
//
// v3.53: THIS IS NO LONGER CHECKED BY HAND. `./check.sh` compares this constant
// against APP_VERSION and fails if they disagree, which is the only automated
// gate on a failure mode that is completely invisible from the server side.
// Before it existed, this file sat at 3.46 while the app reached 3.53 — seven
// versions of work that would have reached nobody who already had the app
// installed. Run check.sh before every deploy and this line stops mattering.
//
// v3.57: two bugs fixed in index.html this bump — an unescaped custom-program
// day-label in the History day-card render, and a timezone bug in mondayOf()
// that silently shifted week boundaries a day early for anyone east of
// Greenwich. Neither touches this file directly; the version still has to move
// so those fixes actually reach a returning user instead of sitting uncached.
//
// v3.58: fetchDayStatuses, fetchWorkoutDates, fetchWaterDays, fetchFoodDays,
// and the Cross-Metric Insights workout scan each ran their own independent
// storage.list() + per-key read+parse pass over workout:/foodlog:/water:.
// Opening the Calendar modal alone fired three full scans in one Promise.all.
// All five now share one cached, generation-invalidated pass per namespace —
// same architecture readExCorpus already used for ex:. Still doesn't touch
// this file directly, but the version still has to move.
//
// v3.59: seven overlays (exercise substitution, exercise history, exercise
// editor, global search, calendar picker, photo lightbox, barcode scanner,
// profile picker) used display:none as their closed state — which cannot be
// transitioned, so removing .active snapped them away instantly instead of
// playing their own defined fade/slide-out. All converted to the
// always-display:flex + opacity/visibility/pointer-events pattern Settings
// and Coach chat already used correctly; those two were also retrofitted
// with the same visibility gate, closing a latent gap where a closed
// overlay's buttons stayed reachable by keyboard Tab even though invisible.
// Doesn't touch this file directly, but the version still has to move.
//
// v3.60: page <title> had a hardcoded personal name ("Training Log — Jason")
// that every user, not just the original tester, would see in their browser
// tab and bookmarks — removed. Also removed two dead <link> tags pointing to
// a nonexistent icons/ subfolder that duplicated and conflicted with the
// real, working icon links. Doesn't touch this file directly, but the
// version still has to move.
//
// v3.61: started replacing emoji-as-iconography (✅⚠️❌ and ~65 others) with
// a hand-authored inline SVG icon set — emoji render as different art at
// different weight depending on the OS's emoji font and can't be color-
// matched to this file's own --plate-red/--plate-yellow/etc palette. First
// conversion: diagRow's three status icons, the single function behind
// every row in the App Health Check panel. The other ~65 emoji throughout
// the app are unconverted — this establishes the ICONS/icon() pattern a
// later pass would extend, not a full sweep. Doesn't touch this file
// directly, but the version still has to move.
//
// v3.62: added a Print / Save as PDF report to the History tab — builds a
// clean static report from logged history and calls window.print(), which
// on iOS Safari's share sheet offers "Save to Files" as a PDF. No new
// dependency: the browser's own print engine does the layout, gated behind
// a dedicated #printReportContent element and an @media print block that
// hides the rest of the app. Doesn't touch this file directly, but the
// version still has to move.
//
// v3.63: micronutrient tracking (sodium/fiber/calcium/iron/folate/potassium)
// already existed for the Medically Modified program's nutrient-target bars,
// fed by real USDA data — but scaleFoodItem() only scaled cal/pro/fat/carb
// by quantity, so logging 2x of a food with real sodium data silently
// reported only 1x worth in the bars. Fixed, with null preserved as null
// rather than coerced to 0 (null means USDA had no value, not a verified
// zero). Also extended the Describe/Snap-a-Meal AI prompts and Open Food
// Facts barcode lookup to supply sodium/fiber too, so the bars get real data
// regardless of which logging method is used, not just USDA text search.
// Doesn't touch this file directly, but the version still has to move.
//
// v3.64: added a Share button to the celebration banner for PR and
// streak-milestone moments — draws a branded 1080×1080 card on canvas
// (same gold theme the banner itself already uses) and hands it to
// navigator.share() when file-sharing is supported, falling back to
// opening the image in a new tab otherwise. The banner was pointer-events:
// none by design (a pure glanceable toast); fixed narrowly for .big.active
// only, since that's the only state that now has anything to tap. Streak
// milestones are now "big" celebrations too, matching their actual
// significance now that they carry a share action. Doesn't touch this file
// directly, but the version still has to move.
//
// v3.65: added hand-drawn start/end position diagrams for the four most
// fundamental compound lifts (Squat, Deadlift, Bench Press, Overhead Press)
// to the Exercise Library — 4 of 200 exercises, not a full sweep. Side-
// profile stick figures, crossfading between positions via CSS animation
// (respects prefers-reduced-motion). Wired into buildExerciseSearchResultHtml,
// the single render function behind Learn's Exercise Library search —
// deliberately not the 16 separate places elsewhere in the app that render
// a "Watch form video" link, which would have been far riskier to touch
// individually. Doesn't touch this file directly, but the version still has
// to move.
//
// v3.66: two more diagrams — Barbell Row and Romanian Deadlift. RDL got its
// own geometry rather than reusing Deadlift's: visibly straighter knee, bar
// stopping around mid-shin instead of the floor. Reusing the Deadlift
// diagram would have taught the wrong range of motion for a hip-hinge
// movement that never reaches the ground. Doesn't touch this file directly,
// but the version still has to move.
//
// v3.67: exercise form diagrams removed entirely, per direct feedback that
// they didn't add enough value to justify the feature. EXERCISE_FORM_DIAGRAMS,
// EXERCISE_FORM_DIAGRAM_NAMES, buildExerciseFormDiagramHtml, and the
// associated CSS are gone; buildExerciseSearchResultHtml is back to exactly
// its pre-diagram form (verified against the original). Doesn't touch this
// file directly, but the version still has to move.
//
// v3.68: converted 5 more emoji checkmarks to the icon system — day-done
// badge, exercise substitution selection, onboarding checklist, grocery
// list, supplement tracker. All 5 were HTML template literals (safe for
// SVG) rather than textContent assignments (which can't hold markup) —
// the ~25 other checkmark instances in the app are inline text flourishes
// in ephemeral status messages and were left as plain text on purpose.
// Doesn't touch this file directly, but the version still has to move.
//
// v3.69: added a Program Sheet print export (Settings → Print My Program) —
// a printable full-week view of the active program, distinct from the
// existing History export (that one is retrospective/what you logged; this
// one is prospective/what the program calls for). Reuses the same .pr-*
// print CSS as the History report rather than adding new styles. Doesn't
// touch this file directly, but the version still has to move.
//
// v3.70: added a "Week Complete" share card to archiveCurrentWeek() (the
// "Save This Week & Start Fresh" flow) — a stats-table layout (workouts,
// program, sleep/weight/calories) rather than the single headline+detail
// format PR/streak cards use. buildShareCardBlob() now supports both
// layouts; the original path is unchanged when cardData.stats is absent.
// Found and fixed a real bug before shipping: a long program name collided
// with its label with no size limit — added shrink-to-fit text sizing,
// verified against the actual failing case. The share button couldn't live
// in #archiveWeekStatus (a status-msg element hardcoded to height:16px, not
// built to hold a button) — added a dedicated sibling container instead,
// and extended the auto-reset delay so there's actually time to tap it.
// Doesn't touch this file directly, but the version still has to move.
//
// v3.71: shareCelebrationCard() hardcoded a lookup of #celebrateShareBtn,
// so the Week Complete button added in 3.70 was silently updating an
// unrelated, hidden button on click instead of itself — no loading state,
// no error feedback, nothing, on the button someone actually tapped. Also
// fixed: share text for stats-table cards read literally "WEEK COMPLETE —
// undefined" since it referenced cardData.detail unconditionally, which
// stats-based cards don't have. Both found by auditing this session's own
// work, not reported externally. Doesn't touch this file directly, but the
// version still has to move.
//
// v3.72: added aria-label to 9 icon-only buttons that had no accessible
// name at all — 2 bare "+" buttons (barcode/food-search add-to-log, would
// announce as just "plus" with zero context on what's being added) and 7
// water/rest-timer adjustment buttons whose only content was symbolic
// text like "+15s". Confirmed via a broader re-scan that these were the
// complete set — everything else flagged by the wider search already had
// real descriptive text alongside its icon. Doesn't touch this file
// directly, but the version still has to move.
//
// v3.161: global search's "Go to"/"Techniques" groups now show a "Showing N
// of M" hint past their result cap (matching the Exercises group), and
// opening a masterclass now re-renders Learn's masterclass index immediately
// instead of leaving it stale until the tab is re-entered. Doesn't touch this
// file directly, but the version still has to move.
//
// v3.163: quick-add labels no longer clip at 375px, macro "current / target"
// values stay on one line instead of wrapping, and the app's one date input
// now renders its native calendar chrome in dark instead of the browser's
// default light scheme. Doesn't touch this file directly, but the version
// still has to move.
//
// v3.164: extended the existing 44px hit-area-extension pattern to the
// working-set row's plate/voice/drop/note buttons, Care's "stop resting" ✕,
// and the Settings/Coach panel close buttons — no visual change, just a
// bigger invisible tap area on controls that were previously exactly as
// small as they look. Doesn't touch this file directly, but the version
// still has to move.
//
// v3.168: History's Day-by-Day Log card is now collapsible (reuses the
// existing nutrition-header/expand-wrap collapsible-card pattern and
// PERSISTENT_CARDS storage, defaulting open), and the "Last 30/90 days ·
// Last year · All time" dropdown above it now scopes the visible
// month-by-month list, not just the printed report — composes with the
// existing exercise-name search filter. Doesn't touch this file directly,
// but the version still has to move.
//
// v3.171: H2.2 — extended the H2.1/v3.92 --plate-*-rgb rgba() token
// consolidation from box-shadow-only literals to a bounded batch of
// background/border/gradient rgba() literals (red/green/orange/teal/purple).
// Purely internal (same computed colors); doesn't touch this file directly,
// but the version still has to move.
const VERSION = '3.266';
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
  './icon-512-monochrome.png',
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
