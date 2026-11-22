'use strict';
// v3.618 (MKT-18): pin the bib on your own photo. On the finish sheet, with a
// bib to share, "Pin on a photo" opens the phone's picker
// (<input type="file" accept="image/*">). The picked photo is drawn into the
// 1080×1920 card (cover-fit) with the bib over it at 70%; the object URL is
// revoked once it's drawn; nothing is stored, sent or analysed. The picker's
// change event isn't a tap (iOS shares only from one), so the same button
// becomes "Share the photo" and that tap shares through shareCelebrationCard.
//
// Real invocation: the real #finishSheet markup, the real wireFinishPhoto,
// pinBibOnPhoto, loadPickedImage, waitForShareCardFont, buildShareCardBlob,
// drawStoryCard, drawBibCard and shareCelebrationCard. Stubbed at the
// boundary: File (jsdom's own), Image (loads on src), URL.createObjectURL /
// revokeObjectURL, navigator.share, fetch, window.storage, localStorage,
// indexedDB, and a recording 2D canvas.
//
// Sabotage: persist the photo (window.storage.set of its URL) in
// pinBibOnPhoto, and criterion 2 fails.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-bib-photo.js');

const DATA = ['programs', 'DAY_INKS', 'CUSTOM_PLATES', 'SHARE_CARD_INKS', 'SASH_ORDER', 'APP_NAME', 'PLATE_INKS', 'SHARE_CARD_DISPLAY_FONT'].map(c => extractConst(src, c));
const FNS = ['appSlug', 'dayInk', 'wrapCanvasText', 'drawSashMark', 'drawBibCard', 'drawStoryCard', 'buildShareCardBlob', 'preloadShareCardFont', 'waitForShareCardFont',
  'loadPickedImage', 'pinBibOnPhoto', 'shareCelebrationCard', 'wireFinishPhoto'].map(f => extractFunction(src, f));
FNS.push(extractConst(src, 'ordinalSuffix'));

const STUB = `
var activeProgram = 'strength', activeDay = 'd1', weightUnit = 'lb';
function getTodayKey(){ return '2026-11-22'; }
window.__c = {fetch: 0, storageSet: 0, lsSet: 0, idbOpen: 0, created: [], revoked: [], shares: [], clicks: 0, ops: []};
window.fetch = () => { window.__c.fetch++; return Promise.reject(new Error('no network')); };
window.storage = { set: async () => { window.__c.storageSet++; }, get: async () => null, list: async () => ({keys: []}) };
Storage.prototype.setItem = function(){ window.__c.lsSet++; };
window.indexedDB = { open: () => { window.__c.idbOpen++; return {}; } };
URL.createObjectURL = (f) => { const u = 'blob:photo-' + (window.__c.created.length + 1); window.__c.created.push({u, f}); return u; };
URL.revokeObjectURL = (u) => { window.__c.revoked.push({u, afterOps: window.__c.ops.length}); };
// A 3:4 phone photo; it loads when its src is set.
window.Image = function(){ const img = this; this.naturalWidth = 3024; this.naturalHeight = 4032;
  Object.defineProperty(this, 'src', { set(v){ img._src = v; setTimeout(() => img.onload && img.onload(), 0); }, get(){ return img._src; } }); };
Object.defineProperty(window.navigator, 'canShare', { value: () => true, configurable: true });
Object.defineProperty(window.navigator, 'share', { value: async (d) => { window.__c.shares.push(d); }, configurable: true });
HTMLInputElement.prototype.click = function(){ if(this.type === 'file') window.__c.clicks++; };
function Path2D(d){ this.d = d; }
function makeCtx(ops){
  const st = {fillStyle: '#000', strokeStyle: '#000', font: '', textAlign: 'start', textBaseline: 'alphabetic', lineWidth: 1};
  return new Proxy(st, {
    get(t, k){
      if(k === 'measureText') return (txt) => ({ width: String(txt).length * 0.58 * Number((/(\\d+)px/.exec(st.font) || [0, 34])[1]) });
      if(typeof k === 'string' && /^create/.test(k)) return () => ({ addColorStop(){} });
      if(['drawImage', 'fillRect', 'fillText', 'scale'].includes(k)) return (...a) => ops.push({op: k, a, fill: st.fillStyle});
      if(k in t) return t[k];
      return () => {};
    },
    set(t, k, v){ t[k] = v; return true; },
  });
}
const __ce = document.createElement.bind(document);
document.createElement = (tag) => {
  if(tag !== 'canvas') return __ce(tag);
  return { width: 0, height: 0, getContext: () => makeCtx(window.__c.ops), toBlob: (cb) => setTimeout(() => cb(new Blob(['png'], {type: 'image/png'})), 0) };
};
`;
const BIB = {number: 47, program: 'Strength & Size', week: 4, dateLabel: 'Mon, Nov 2', sets: '18', lifts: '5', minutes: '58',
  lead: {name: 'Bench Press', reps: ['5', '5'], weightLabel: '185 lb', unit: 'lb', note: 'Hold until every set reaches the top of the range.', plates: [45, 25]}};
const SHARE = {icon: 'flag', headline: 'SESSION COMPLETE', kind: 'session', dayId: 'd1', stats: [{value: '18', label: 'SETS'}], bib: BIB};

function mount(share = SHARE){
  const { window } = runJsdom(extractElementById(src, 'finishSheet'), STUB, [...DATA, ...FNS, `wireFinishPhoto(${JSON.stringify(share)});`]);
  return window;
}
const tick = (w, n = 6) => new Promise(r => { let i = 0; const step = () => (++i >= n ? r() : w.setTimeout(step, 5)); step(); });
async function pick(window, files){
  const input = window.document.getElementById('finishPhotoInput');
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new window.Event('change'));
  await tick(window);
}

test('the button: shown with a bib, labelled "Pin on a photo"; the input is the phone\'s own image picker; no bib, no button', (assert)=>{
  const w = mount();
  const btn = w.document.getElementById('finishPhoto'), input = w.document.getElementById('finishPhotoInput');
  assert.strictEqual(btn.hidden, false);
  assert.strictEqual(btn.textContent, 'Pin on a photo');
  assert.strictEqual(input.type, 'file');
  assert.strictEqual(input.getAttribute('accept'), 'image/*');
  btn.click();
  assert.strictEqual(w.__c.clicks, 1, 'the tap opens the picker');
  assert.strictEqual(mount(null).document.getElementById('finishPhoto').hidden, true, 'no share data (a clinical program): no button');
  assert.strictEqual(mount(Object.assign({}, SHARE, {bib: undefined})).document.getElementById('finishPhoto').hidden, true, 'no bib: no button');
});

test('criterion 1: with a stub photo, the canvas gets exactly one drawImage (the photo, cover-fit over 1080×1920), then the bib\'s draw calls at 70%', async (assert)=>{
  const w = mount();
  w.document.getElementById('finishPhoto').click();
  await pick(w, [new w.File(['jpeg'], 'gym.jpg', {type: 'image/jpeg'})]);
  const ops = w.__c.ops;
  const draws = ops.filter(o => o.op === 'drawImage');
  assert.strictEqual(draws.length, 1, 'one drawImage');
  const [img, x, y, dw, dh] = draws[0].a;
  assert.strictEqual(img.naturalWidth, 3024, 'it is the picked photo');
  assert.ok(dw >= 1080 && dh >= 1920 && Math.abs(dw / dh - 3024 / 4032) < 1e-9, `cover-fit, aspect kept (${dw}×${dh})`);
  assert.ok(Math.abs(x + dw / 2 - 540) < 1e-6 && Math.abs(y + dh / 2 - 960) < 1e-6, 'centred');
  const first = ops.indexOf(draws[0]);
  assert.strictEqual(first, 0, 'the photo is drawn first: no ink ground under or over it');
  assert.ok(!ops.some(o => o.op === 'fillRect' && o.a[0] === 0 && o.a[1] === 0 && o.a[2] === 1080), 'no full-card ground fill');
  const after = ops.slice(first + 1);
  assert.ok(after.some(o => o.op === 'scale' && o.a[0] === 0.7 && o.a[1] === 0.7), 'the bib at 70%');
  assert.ok(after.some(o => o.op === 'fillRect' && o.fill === '#FAFAF7'), 'then the bib\'s paper');
  assert.ok(after.some(o => o.op === 'fillText' && o.a[0] === '47'), 'and its number');
  const btn = w.document.getElementById('finishPhoto');
  assert.strictEqual(btn.textContent, 'Share the photo', 'the button is ready to share');
  assert.strictEqual(btn.disabled, false);
});

test('criterion 2: the whole flow (pick, draw, share) calls fetch 0 times and persists nothing (window.storage.set, localStorage.setItem, indexedDB.open: 0)', async (assert)=>{
  const w = mount();
  const btn = w.document.getElementById('finishPhoto');
  btn.click();
  await pick(w, [new w.File(['jpeg'], 'gym.jpg', {type: 'image/jpeg'})]);
  btn.click();
  await tick(w);
  assert.strictEqual(w.__c.shares.length, 1, 'anchor: the flow ran to the share');
  assert.strictEqual(JSON.stringify({fetch: w.__c.fetch, storageSet: w.__c.storageSet, lsSet: w.__c.lsSet, idbOpen: w.__c.idbOpen}), JSON.stringify({fetch: 0, storageSet: 0, lsSet: 0, idbOpen: 0}));
});

test('criterion 3: URL.revokeObjectURL is called once, for the created URL, after the photo is drawn', async (assert)=>{
  const w = mount();
  const btn = w.document.getElementById('finishPhoto');
  btn.click();
  await pick(w, [new w.File(['jpeg'], 'gym.jpg', {type: 'image/jpeg'})]);
  btn.click();
  await tick(w);
  assert.strictEqual(w.__c.created.length, 1, 'one URL, for the photo');
  assert.strictEqual(w.__c.created[0].f.name, 'gym.jpg');
  assert.strictEqual(JSON.stringify(w.__c.revoked.map(r => r.u)), JSON.stringify([w.__c.created[0].u]), 'revoked once, that URL');
  assert.ok(w.__c.revoked[0].afterOps > 0, 'after the drawing');
});

test('criterion 4: cancelling the picker leaves the card unchanged and shares nothing', async (assert)=>{
  const w = mount();
  const btn = w.document.getElementById('finishPhoto');
  btn.click();
  await pick(w, []);
  assert.strictEqual(btn.textContent, 'Pin on a photo');
  assert.strictEqual(btn.disabled, false);
  assert.strictEqual(w.__c.created.length, 0, 'no photo read');
  assert.strictEqual(w.__c.ops.length, 0, 'nothing drawn');
  btn.click();
  await tick(w);
  assert.strictEqual(w.__c.shares.length, 0, 'nothing shared');
  assert.strictEqual(w.__c.clicks, 2, 'the next tap opens the picker again');
});

test('the share: the second tap shares the drawn photo card itself, through shareCelebrationCard, as a PNG named for the session', async (assert)=>{
  const w = mount();
  const btn = w.document.getElementById('finishPhoto');
  btn.click();
  await pick(w, [new w.File(['jpeg'], 'gym.jpg', {type: 'image/jpeg'})]);
  const drawn = w.__c.ops.length;
  btn.click();
  await tick(w);
  assert.strictEqual(w.__c.shares.length, 1);
  const f = w.__c.shares[0].files[0];
  assert.strictEqual(f.type, 'image/png');
  assert.match(f.name, /-session-2026-11-22\.png$/);
  assert.strictEqual(w.__c.ops.length, drawn, 'the card isn\'t drawn again (it would need the photo, already released)');
  assert.strictEqual(btn.textContent, 'Pin on a photo', 'one share per pick: back to the picker');
  btn.click();
  assert.strictEqual(w.__c.clicks, 2, 'the next tap picks a new photo');
});

test('a photo that fails (no size, or no card drawn) says so, and a good pick right after isn\'t undone by the old message\'s timer', async (assert)=>{
  const w = mount();
  const btn = w.document.getElementById('finishPhoto');
  const NI = w.Image;
  w.Image = function(){ NI.call(this); this.naturalWidth = 0; this.naturalHeight = 0; };
  btn.click();
  await pick(w, [new w.File(['svg'], 'no-size.svg', {type: 'image/svg+xml'})]);
  assert.strictEqual(btn.textContent, 'Couldn\u2019t use that photo');
  assert.strictEqual(w.__c.ops.filter(o => o.op === 'drawImage').length, 0, 'nothing drawn from it');
  assert.strictEqual(w.__c.revoked.length, 1, 'its URL is still released');
  w.Image = NI;
  await pick(w, [new w.File(['jpeg'], 'gym.jpg', {type: 'image/jpeg'})]);
  assert.strictEqual(btn.textContent, 'Share the photo');
  await new Promise(r => w.setTimeout(r, 2100));
  assert.strictEqual(btn.textContent, 'Share the photo', 'the failed pick\'s reset didn\'t overwrite it');
});

run();
