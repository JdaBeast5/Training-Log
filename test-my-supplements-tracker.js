'use strict';
// Behavioral coverage for "My Supplements" — the new Log-tab tracker for
// self-directed, general supplement use (any name, not just AI-recommended
// ones), agreed as a follow-on to the Coach tab's Supplement Recommendations
// feature. Two axes on purpose: `my-supplements` is a maintained list
// (mirrors Grocery List's own shape/CRUD exactly — see
// test-grocery-render-crud.js, whose bodyHtml/storageGlobals/otherGlobals
// conventions this file reuses directly), while `supplement-taken:{date}` is
// a per-day boolean map keyed by selectedLogDate, resetting every day.
//
// Three things get real, sabotage-relevant coverage here:
// 1. The list and the daily-taken state are genuinely independent — deleting
//    or re-adding an item must never be confused with checking it off, and
//    a taken-state write for one date must never leak into another date's map.
// 2. findKnownSupplementInfo actually looks up the SAME FOUNDATIONAL_SUPPLEMENT_STACK
//    content Supplement Recommendations renders from (case-insensitive name
//    match) — this is what keeps the tracker grounded in real evidence-graded
//    content instead of being a bare checklist, per the user's explicit ask
//    for "elite-level" thoroughness here too.
// 3. The real swipe-to-delete + undo mechanics (makeSwipeable/buildSwipeItem/
//    showUndoToast) work identically to Grocery List's already-tested flow.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const loadMySupplementsSrc = extractFunction(src, 'loadMySupplements');
const saveMySupplementsSrc = extractFunction(src, 'saveMySupplements');
const addMySupplementSrc = extractFunction(src, 'addMySupplement');
const loadSupplementTakenStateSrc = extractFunction(src, 'loadSupplementTakenState');
const toggleMySupplementTakenSrc = extractFunction(src, 'toggleMySupplementTaken');
const findKnownSupplementInfoSrc = extractFunction(src, 'findKnownSupplementInfo');
const supplementInteractionPairsSrc = extractConst(src, 'SUPPLEMENT_INTERACTION_PAIRS');
const findSupplementInteractionNotesSrc = extractFunction(src, 'findSupplementInteractionNotes');
const renderMySupplementsSrc = extractFunction(src, 'renderMySupplements');
const askCoachAboutSupplementSrc = extractFunction(src, 'askCoachAboutSupplement');
const buildSwipeItemSrc = extractFunction(src, 'buildSwipeItem');
const makeSwipeableSrc = extractFunction(src, 'makeSwipeable');
const showUndoToastSrc = extractFunction(src, 'showUndoToast');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const foundationalStackSrc = extractConst(src, 'FOUNDATIONAL_SUPPLEMENT_STACK');
const supplementEvidenceLabelsSrc = extractConst(src, 'SUPPLEMENT_EVIDENCE_LABELS');
const addBtnWiringSrc = extractStatement(src, "document.getElementById('mySupplementAddBtn').addEventListener('click'");

const bodyHtml = `
  <input type="text" id="mySupplementAddInput" class="care-input" placeholder="Add a supplement (e.g. Creatine)" aria-label="Add a supplement" autocomplete="off">
  <button id="mySupplementAddBtn">Add</button>
  <div id="mySupplementsList"></div>
  <div class="undo-toast" id="undoToast" role="status" aria-live="polite">
    <span id="undoToastText"></span>
    <button id="undoToastBtn">Undo</button>
  </div>
  <button id="coachFab"></button>
  <div id="coachFabModal"></div>
  <input type="text" id="floatingChatInput">
`;

// A minimal stand-in for #coachFab's own real open/close behavior (real
// version: test-coach-fab-drag.js) — genuinely TOGGLES (open when closed,
// close when already open), matching the real handler's actual contract,
// so askCoachAboutSupplement's guard against re-clicking an already-open
// fab is tested against behavior that would actually close it if the
// guard were missing — not a stub that only ever opens, which would let
// that guard's absence pass silently. Drag/keyboard/animation-timing
// concerns belong to that other file, not this one.
const coachFabStubSrc = `
  document.getElementById('coachFab').addEventListener('click', ()=>{
    document.getElementById('coachFabModal').classList.toggle('active');
  });
`;

function storageGlobals(initial){
  return `
    window.storage = {
      __store: ${JSON.stringify(initial || {})},
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('no saved preference');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
    };
  `;
}

// icon() is a leaf presentation concern covered elsewhere (same treatment
// test-grocery-render-crud.js and test-nav-more-panel.js give it).
function otherGlobals(selectedLogDate){
  return `
    var undoToastTimeout = null;
    window.selectedLogDate = ${JSON.stringify(selectedLogDate || '2026-08-20')};
    window.matchMedia = ()=> ({ matches: true }); // reduced-motion: skip the swipe-delete animation timer
    window.icon = (name)=> name === 'check' ? '<span class="check-glyph">CHECK</span>' : (name === 'chat' ? '<span class="chat-glyph">CHAT</span>' : '');
  `;
}

const scriptChunks = [
  escapeHtmlSrc, foundationalStackSrc, supplementEvidenceLabelsSrc,
  loadMySupplementsSrc, saveMySupplementsSrc, addMySupplementSrc,
  loadSupplementTakenStateSrc, toggleMySupplementTakenSrc, findKnownSupplementInfoSrc,
  supplementInteractionPairsSrc, findSupplementInteractionNotesSrc,
  buildSwipeItemSrc, makeSwipeableSrc, showUndoToastSrc,
  coachFabStubSrc, askCoachAboutSupplementSrc,
  renderMySupplementsSrc, addBtnWiringSrc,
];

const { test, run } = makeRunner('test-my-supplements-tracker.js');

// --- Read/render ------------------------------------------------------------

test('renderMySupplements shows the empty state, with a real jump-link to Supplement Recommendations, when nothing has been added', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const html = document.getElementById('mySupplementsList').innerHTML;
  assert.match(html, /Nothing here yet/);
  // data-jump-to is the app's real, existing cross-tab navigation mechanism
  // (jumpToSetting, delegated on document) — this only proves the real
  // markup wires to the real target id; the jump mechanic itself already
  // has its own coverage elsewhere (test-ai-key-prompt-navigation.js).
  assert.match(html, /data-jump-to="supplementRecommendationsCard"/, 'the empty state must link back to the real Supplement Recommendations card id');
});

test('sabotage-relevant: a populated list shows no jump-link to Supplement Recommendations — that CTA is empty-state only', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  assert.doesNotMatch(document.getElementById('mySupplementsList').innerHTML, /data-jump-to/, 'once something is tracked, the empty-state nudge must not still show');
});

test('a name that matches a Foundational Stack entry (case-insensitively) renders its real evidence tier and benefit note', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['creatine monohydrate']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const html = document.getElementById('mySupplementsList').innerHTML;
  assert.match(html, /Well-established/, 'the real evidence tier for Creatine Monohydrate must render');
  assert.match(html, /strength, power output/, 'the real benefit text (from FOUNDATIONAL_SUPPLEMENT_STACK) must render, not a placeholder');
});

test('sabotage-relevant: both a matched and an unmatched row carry the real .supplement-label class on their name element', async (assert)=>{
  // The .done rule (line-through/muted styling) targets .supplement-label,
  // not :last-child — this row now has a THIRD flex child (the ask-coach
  // button), so the name/benefit element is no longer the actual last
  // child, and a class that silently went missing would leave a "done"
  // supplement with no visual confirmation at all despite the JS state
  // being correct underneath.
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine Monohydrate', 'My Custom Blend XYZ']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const rows = [...document.getElementById('mySupplementsList').querySelectorAll('.supplement-row')];
  assert.strictEqual(rows.length, 2, 'precondition: both rows rendered');
  rows.forEach(row=>{
    assert.ok(row.querySelector('.supplement-label'), `every row (matched or not) must carry a real .supplement-label element — row html: ${row.innerHTML}`);
  });
});

test('an unmatched, made-up name renders as a plain row with no benefit subtitle', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['My Custom Blend XYZ']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const html = document.getElementById('mySupplementsList').innerHTML;
  assert.match(html, /My Custom Blend XYZ/);
  assert.doesNotMatch(html, /supplement-name-wrap/, 'no known match must mean no benefit-subtitle wrapper at all');
});

test('sabotage-relevant: findKnownSupplementInfo returns null for a name that is not in FOUNDATIONAL_SUPPLEMENT_STACK', (assert)=>{
  const { window } = runJsdom('', otherGlobals(), [foundationalStackSrc, findKnownSupplementInfoSrc]);
  assert.strictEqual(window.findKnownSupplementInfo('Definitely Not A Real Supplement'), null);
  assert.notStrictEqual(window.findKnownSupplementInfo('vitamin d3'), null, 'precondition: a real, lowercased entry name must still match');
});

// --- Interaction notes: proactive, conservative, pair-based -----------------
// NOT a general drug/supplement interaction checker — this app has no
// business attempting that. Just the two well-established mineral-
// absorption pairs already implicit in Iron/Calcium/Zinc's own `caution`
// fields, surfaced when BOTH members of a pair are actually tracked.

function setupInteractionNotes(){
  const { window } = runJsdom('', otherGlobals(), [supplementInteractionPairsSrc, findSupplementInteractionNotesSrc]);
  return window;
}

test('REAL invocation: tracking both Iron and Calcium produces the real interaction note', (assert)=>{
  const window = setupInteractionNotes();
  const notes = window.findSupplementInteractionNotes(['Creatine', 'Iron', 'Calcium']);
  assert.strictEqual(notes.length, 1);
  assert.match(notes[0], /compete for absorption/);
});

test('sabotage-relevant: tracking only ONE half of a pair produces no note at all', (assert)=>{
  // .length, not deepStrictEqual against a literal [] — the real array
  // comes back from the jsdom window's OWN Array realm, whose prototype
  // differs from Node's host-realm Array even when both are empty (same
  // cross-realm trap testHelpers.js documents elsewhere).
  const window = setupInteractionNotes();
  assert.strictEqual(window.findSupplementInteractionNotes(['Iron', 'Vitamin D3']).length, 0, 'Iron alone, without Calcium or Zinc, must not trigger a note');
  assert.strictEqual(window.findSupplementInteractionNotes(['Calcium']).length, 0);
});

test('REAL invocation: the check is case-insensitive, matching how a person might actually type either name', (assert)=>{
  const window = setupInteractionNotes();
  const notes = window.findSupplementInteractionNotes(['iron', 'CALCIUM']);
  assert.strictEqual(notes.length, 1, 'differing case on both tracked names must still trigger the real pair match');
});

test('REAL invocation: tracking Iron, Calcium, AND Zinc together surfaces BOTH real pair notes, not just one', (assert)=>{
  const window = setupInteractionNotes();
  const notes = window.findSupplementInteractionNotes(['Iron', 'Calcium', 'Zinc']);
  assert.strictEqual(notes.length, 2, 'both real pairs (Iron+Calcium, Iron+Zinc) must each surface their own note');
});

test('REAL invocation: renderMySupplements shows the real interaction banner above the list when both Iron and Calcium are tracked', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Iron', 'Calcium']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const html = document.getElementById('mySupplementsList').innerHTML;
  assert.match(html, /compete for absorption/, 'the real interaction note must render');
  assert.match(html, /care-banner-caution/, 'must use the app\'s real caution-banner styling, not a bespoke one');
});

test('sabotage-relevant: renderMySupplements shows NO interaction banner when only one of the pair is tracked', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Iron', 'Vitamin D3']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  assert.doesNotMatch(document.getElementById('mySupplementsList').innerHTML, /compete for absorption/, 'Iron without its interacting partner must never show the pair note');
});

// --- Create: addMySupplement, including dedupe -----------------------------

test('REAL invocation: addMySupplement appends a new name and re-renders', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  await window.addMySupplement('Creatine');
  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Creatine']);
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 1, 'the freshly-added item must appear in the re-rendered DOM');
});

test('sabotage-relevant: adding a name that already exists (case-insensitively) is a no-op, not a duplicate row', async (assert)=>{
  const { window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine']),
  }) + otherGlobals(), scriptChunks);
  await window.addMySupplement('creatine');
  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Creatine'], 'the list must still have exactly one entry, not two');
});

test('REAL invocation: typing a name and clicking Add renders it and clears the input (end-to-end UI path)', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({}) + otherGlobals(), scriptChunks);
  document.getElementById('mySupplementAddInput').value = '  Magnesium  ';
  document.getElementById('mySupplementAddBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Magnesium'], 'the value must be trimmed before saving');
  assert.strictEqual(document.getElementById('mySupplementAddInput').value, '', 'input must clear after a successful add');
});

// --- Update: the real per-day taken toggle ----------------------------------

test('REAL invocation: clicking a row toggles it to taken in both storage (dated) and the DOM', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Fish Oil']),
  }) + otherGlobals('2026-08-20'), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.supplement-row').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['supplement-taken:2026-08-20']);
  assert.deepStrictEqual(stored, {Creatine: true}, 'must be written under the dated key, and only the clicked item flips');
  const updatedRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(updatedRows[0].querySelector('.supplement-row').classList.contains('done'), true);
  assert.strictEqual(updatedRows[1].querySelector('.supplement-row').classList.contains('done'), false, 'Fish Oil must stay untouched');
});

test('sabotage-relevant: taken state for one date never leaks into another date\'s map', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine']),
    'supplement-taken:2026-08-19': JSON.stringify({Creatine: true}),
  }) + otherGlobals('2026-08-20'), scriptChunks);

  // Today (Aug 20) must render as NOT taken, even though yesterday's map says true.
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows[0].querySelector('.supplement-row').classList.contains('done'), false, 'a different date\'s taken state must not bleed into today');

  // Toggling today must not touch yesterday's stored map at all.
  rows[0].querySelector('.supplement-row').click();
  await new Promise(r=> setTimeout(r, 20));
  assert.deepStrictEqual(JSON.parse(window.storage.__store['supplement-taken:2026-08-19']), {Creatine: true}, 'yesterday\'s map must be byte-for-byte untouched');
  assert.deepStrictEqual(JSON.parse(window.storage.__store['supplement-taken:2026-08-20']), {Creatine: true}, 'today\'s own map must have been written');
});

// --- Ask your coach: the bridge from a tracked row to the real chat --------
// Shares the SAME floating chat every tab reaches (#coachFab/#floatingChatInput,
// coachChatHistory) rather than opening a separate conversation — see the
// comment above askCoachAboutSupplement itself. The real open/close
// animation is #coachFab's own job (test-coach-fab-drag.js); what's proven
// here is askCoachAboutSupplement's own guard (never re-click an already-
// open fab, which would close it) and that the row wiring reaches it with
// the right name, without also toggling that row's taken state.

test('REAL invocation: askCoachAboutSupplement pre-fills the real input and opens the fab when it starts closed', (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals(), scriptChunks);
  assert.strictEqual(document.getElementById('coachFabModal').classList.contains('active'), false, 'precondition: fab starts closed');

  window.askCoachAboutSupplement('Creatine');

  assert.strictEqual(document.getElementById('floatingChatInput').value, 'What should I know about Creatine?');
  assert.strictEqual(document.getElementById('coachFabModal').classList.contains('active'), true, 'a closed fab must actually open');
});

test('sabotage-relevant: askCoachAboutSupplement never re-clicks an ALREADY-open fab (which would close it) — it still pre-fills the input', (assert)=>{
  const { document, window } = runJsdom(bodyHtml, otherGlobals(), scriptChunks);
  document.getElementById('coachFabModal').classList.add('active'); // simulate: already open

  window.askCoachAboutSupplement('Magnesium');

  assert.strictEqual(document.getElementById('coachFabModal').classList.contains('active'), true, 'must still be open — re-clicking #coachFab while open would have closed it, which is exactly the bug this guards against');
  assert.strictEqual(document.getElementById('floatingChatInput').value, 'What should I know about Magnesium?', 'the input must still be pre-filled even when the fab was already open');
});

test('REAL invocation: clicking a row\'s ask-coach button reaches the real function with THAT row\'s name, and does not also toggle taken state', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Fish Oil']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');

  rows[1].querySelector('.supplement-ask-btn').click(); // Fish Oil, not Creatine
  await new Promise(r=> setTimeout(r, 20));

  assert.strictEqual(document.getElementById('floatingChatInput').value, 'What should I know about Fish Oil?', 'clicking the SECOND row\'s button must reach that row\'s own name, not the first');
  const updatedRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(updatedRows[1].querySelector('.supplement-row').classList.contains('done'), false, 'clicking the ask button must never also mark the row as taken');
});

// --- Delete: real makeSwipeable-driven removal, independent of taken state --

test('REAL invocation: swipe-delete removes the item from the maintained list but does not touch other items\' taken state', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Magnesium', 'Fish Oil']),
    'supplement-taken:2026-08-20': JSON.stringify({Creatine: true, Magnesium: true, 'Fish Oil': true}),
  }) + otherGlobals('2026-08-20'), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(rows.length, 3, 'precondition: three rows');
  rows[1].querySelector('.swipe-delete-bg').click(); // deletes Magnesium
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, ['Creatine', 'Fish Oil'], 'Magnesium must be gone; the others survive in order');
  const remainingRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(remainingRows.length, 2);
  assert.strictEqual(remainingRows[0].querySelector('.supplement-row').classList.contains('done'), true, 'Creatine\'s taken state must survive an unrelated deletion');
  assert.strictEqual(remainingRows[1].querySelector('.supplement-row').classList.contains('done'), true, 'Fish Oil\'s taken state must survive too');
});

test('REAL invocation: the Undo toast after a delete restores the exact removed item at its original position', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['Creatine', 'Magnesium']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  const rows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  rows[0].querySelector('.swipe-delete-bg').click(); // deletes Creatine
  await new Promise(r=> setTimeout(r, 20));
  assert.deepStrictEqual(JSON.parse(window.storage.__store['my-supplements']), ['Magnesium']);
  assert.match(document.getElementById('undoToastText').textContent, /Creatine removed/);

  document.getElementById('undoToastBtn').click();
  await new Promise(r=> setTimeout(r, 20));

  const restored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(restored, ['Creatine', 'Magnesium'], 'undo must restore Creatine at its original position');
  const restoredRows = document.getElementById('mySupplementsList').querySelectorAll('.swipe-item');
  assert.strictEqual(restoredRows.length, 2);
});

test('an item name with HTML-significant characters is escaped, not injected as markup', async (assert)=>{
  const { document, window } = runJsdom(bodyHtml, storageGlobals({
    'my-supplements': JSON.stringify(['<script>alert(1)</script>']),
  }) + otherGlobals(), scriptChunks);
  await window.renderMySupplements();
  assert.strictEqual(document.querySelectorAll('#mySupplementsList script').length, 0, 'a raw <script> tag in a supplement name must never become a real DOM element');
  assert.match(document.getElementById('mySupplementsList').textContent, /<script>alert\(1\)<\/script>/, 'the text must still be visible as literal text');
});

run();
