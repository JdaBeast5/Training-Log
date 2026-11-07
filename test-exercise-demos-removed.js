'use strict';
// v3.514 — The 3D exercise demos (v3.513) are removed (owner: "Let's remove
// them for now and pivot"; the bar sat through the wrist, not in the hand, and
// the direction is being rethought). Technique & focus is the pattern icon,
// the cues and the form-video link again; the open-screen pane is history and
// cues. The demos' files were cached in a long-lived cache of their own that
// releases never cleared, so the service worker now deletes it on activate.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { readIndexSource, extractConst, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');
const src = readIndexSource();
const { test, run } = makeRunner('test-exercise-demos-removed.js');

test('REAL invocation: Technique & focus is the icon, the cues and the video link, with no demo', (assert)=>{
  const { window } = runJsdom('<div id="host"></div>', `
    function getExerciseIcon(){ return '<svg class="pattern-icon"></svg>'; }`,
    [extractFunction(src, 'escapeHtml'), extractConst(src, 'exerciseInfo'), extractFunction(src, 'buildDetailsHtml')]);
  const host = window.document.getElementById('host');
  for(const name of ['Back Squat', 'Bench Press', 'Deadlift']){
    host.innerHTML = window.buildDetailsHtml({ name });
    const body = host.querySelector('details.ex-details .ex-detail-body');
    assert.ok(body, name + ': anchor, the panel built');
    assert.ok(!body.classList.contains('has-demo'), name);
    assert.ok(body.querySelector(':scope > .ex-icon .pattern-icon'), name + ': the icon leads again');
    assert.ok(body.querySelectorAll('.ex-cues li').length >= 3, name + ': cues');
    assert.match(body.querySelector('a.ex-video-link').href, /youtube\.com\/results/, name + ': the video link');
    assert.strictEqual(body.querySelector('figure, canvas, .ex-anatomy'), null, name + ': no demo');
  }
});

test('REAL source: nothing of the demos is left in the app, and their files are gone', (assert)=>{
  for(const gone of ['ANATOMY_LIFTS', 'mountAnatomy', 'buildExerciseDemoHtml', 'loadAnatomyStage', 'ex-anatomy', 'ex-demo-caption', './assets/anatomy']) assert.ok(!src.includes(gone), gone);
  assert.ok(!fs.existsSync(path.join(__dirname, 'assets')), 'assets/ removed');
  const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
  assert.ok(!/ANATOMY_ASSETS|url\.pathname\.includes\('\/assets\/'\)/.test(sw), 'no asset precache or route left');
});

// The real activate handler, run against a stand-in cache store.
function activateWith(keys){
  const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
  const handlers = {}, deleted = [];
  const ctx = {
    self: { addEventListener: (t, f) => { handlers[t] = f; }, clients: { claim: async () => {} }, location: { origin: 'https://x' } },
    caches: { keys: async () => keys.slice(), delete: async n => { deleted.push(n); return true; }, open: async () => ({}) },
    console, URL, Request: function(){}, Response: function(){}, fetch: async () => ({}),
  };
  vm.createContext(ctx);
  vm.runInContext(sw, ctx);
  let waited;
  handlers.activate({ waitUntil: p => { waited = p; } });
  return waited.then(() => ({ deleted, CACHE: vm.runInContext('CACHE', ctx) }));
}
test('REAL sw.js activate: the retired 3D cache is deleted along with old releases; the current cache stays', async (assert)=>{
  const VERSION = /const VERSION = '([^']+)'/.exec(fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8'))[1];
  const current = 'training-log-v' + VERSION;
  const { deleted, CACHE } = await activateWith([current, 'training-log-v3.400', 'training-log-assets-v1', 'some-other-cache']);
  assert.strictEqual(CACHE, current, 'anchor: the cache name');
  assert.deepStrictEqual([...deleted].sort(), ['training-log-assets-v1', 'training-log-v3.400'].sort());
  const none = await activateWith([current]);
  assert.deepStrictEqual([...none.deleted], [], 'nothing else is touched');
});

run();
