'use strict';
// Behavioral coverage for the new Supplement Recommendations card (Coach
// tab): a goal/profile-grounded one-shot AI request, shaped like Recipe
// Finder's free-text-ask + system-prompt-context pattern, but carrying its
// own stronger safety framing since supplements (unlike a recipe) carry real
// interaction/contraindication risk.
//
// Two things get proven here, both via REAL functions, not reimplementations:
// 1. buildSupplementSystemPrompt actually reacts to profile state (goal,
//    flagged conditions, dietary restrictions) rather than always emitting
//    the same generic text — sabotage-relevant, since a prompt that silently
//    stopped referencing e.g. a flagged pregnancy condition would still
//    "work" (return some JSON) while quietly dropping the one thing that
//    actually matters for safety.
// 2. submitSupplementRequest — the real DOM-facing handler — wires getApiKey,
//    the system prompt, callClaudeChat, and the JSON response into the real
//    #supplementResult markup, with network stubbed at the fetch boundary
//    (the true edge of what this app controls, same as every other AI
//    feature test in this suite).
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-supplement-recommendations.js');

const buildSupplementSystemPromptSrc = extractFunction(src, 'buildSupplementSystemPrompt');
const submitSupplementRequestSrc = extractFunction(src, 'submitSupplementRequest');
const renderSupplementCardsSrc = extractFunction(src, 'renderSupplementCards');
const supplementEvidenceLabelsSrc = extractConst(src, 'SUPPLEMENT_EVIDENCE_LABELS');
const foundationalStackSrc = extractConst(src, 'FOUNDATIONAL_SUPPLEMENT_STACK');
const getFoundationalSupplementStackSrc = extractFunction(src, 'getFoundationalSupplementStack');
const renderFoundationalStackSrc = extractFunction(src, 'renderFoundationalStack');
const callClaudeChatSrc = extractFunction(src, 'callClaudeChat');
const anthropicRequestSrc = extractFunction(src, 'anthropicRequest');
const aiSleepSrc = extractFunction(src, 'aiSleep');
const aiMaxAttemptsSrc = extractConst(src, 'AI_MAX_ATTEMPTS');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const aiKeySetupPromptSrc = extractFunction(src, 'aiKeySetupPrompt');
const getApiKeySrc = extractFunction(src, 'getApiKey');
const describeDietaryFlagsSrc = extractFunction(src, 'describeDietaryFlags');
const activeConditionKeysSrc = extractFunction(src, 'activeConditionKeys');
const goalLabelsSrc = extractConst(src, 'GOAL_LABELS');
const persistentConditionsSrc = extractConst(src, 'PERSISTENT_CONDITIONS');
const wireSupplementAddButtonsSrc = extractFunction(src, 'wireSupplementAddButtons');
const addMySupplementSrc = extractFunction(src, 'addMySupplement');
const loadMySupplementsSrc = extractFunction(src, 'loadMySupplements');
const saveMySupplementsSrc = extractFunction(src, 'saveMySupplements');
const supplementFrequencyMetaSrc = extractConst(src, 'SUPPLEMENT_FREQUENCY_META');

function extractStatement(source, startText){
  const startIdx = source.indexOf(startText);
  if(startIdx === -1) throw new Error(`extractStatement: start text not found: ${startText}`);
  const endIdx = source.indexOf('\n});', startIdx);
  if(endIdx === -1) throw new Error(`extractStatement: no closing '});' found after ${startText}`);
  return source.slice(startIdx, endIdx + 4);
}

const foundationalToggleWiringSrc = extractStatement(src, "document.getElementById('foundationalStackToggle').addEventListener('click'");

// Real markup for the pieces this flow touches, hand-assembled rather than
// extracted — <input> has no closing tag for extractElementById to find,
// and these ids sit inside a larger Coach-tab card whose other siblings
// (the disclaimer text, the history-hint) this flow never reads, matching
// the established pattern in test-weight-log-crud.js. The foundational-
// stack toggle button and its .smooth-toggle wrapper match the REAL
// program-basis-toggle/smooth-toggle shape (see test-program-overview.js
// for that shared component's own open/close coverage — not re-tested
// here) — a real `<div>` single child, since renderFoundationalStack
// targets firstElementChild, not the wrapper itself.
const bodyHtml = `
  <button type="button" class="program-basis-toggle" id="foundationalStackToggle" aria-expanded="false" aria-controls="foundationalStackResult">
    <span class="chev" aria-hidden="true">›</span> View foundational stack
  </button>
  <div class="smooth-toggle" id="foundationalStackResult"><div></div></div>
  <input type="text" id="supplementRequestInput" class="care-input" placeholder="e.g. best for recovery, budget picks, I get GI issues with creatine" autocomplete="off">
  <button class="save-btn" id="supplementRequestSubmit">Get Recommendations</button>
  <div id="supplementResult"></div>
`;

// Shared profile/program state every buildSupplementSystemPrompt test needs.
// A real object shape (matches the userProfile default in index.html), not a
// hand-picked subset — so a field this function reads that isn't declared
// here throws instead of silently reading `undefined`.
function profileSetup(overrides){
  const profile = Object.assign({
    goal: 'gain', bodyGoal: '', conditions: [], dietaryPreference: '', avoidFoods: '', gender: 'other',
    dietaryFlags: {glutenFree:false, dairyFree:false, nutFree:false, halal:false, kosher:false},
  }, overrides || {});
  return `
    var userProfile = ${JSON.stringify(profile)};
    var activeProgram = 'strength';
    var programs = { strength: { label: 'Strength & Size' } };
  `;
}

function setupPromptBuilder(profileOverrides){
  const { window } = runJsdom('', profileSetup(profileOverrides), [
    goalLabelsSrc, persistentConditionsSrc,
    describeDietaryFlagsSrc, activeConditionKeysSrc,
    buildSupplementSystemPromptSrc,
  ]);
  return window;
}

test('REAL invocation: buildSupplementSystemPrompt includes the real goal label and program', (assert)=>{
  const window = setupPromptBuilder({goal:'lose'});
  const prompt = window.buildSupplementSystemPrompt('');
  assert.match(prompt, /Fat Loss/, 'must use the real GOAL_LABELS mapping, not the raw stored key');
  assert.match(prompt, /Strength & Size/, 'must include the real active program label');
});

test('REAL invocation: a specific request is quoted back into the prompt verbatim', (assert)=>{
  const window = setupPromptBuilder({});
  const prompt = window.buildSupplementSystemPrompt('best for recovery on a budget');
  assert.match(prompt, /best for recovery on a budget/, 'the actual request text must reach the prompt');
});

test('REAL invocation: no request falls back to a general-starting-point instruction, not an empty/undefined line', (assert)=>{
  const window = setupPromptBuilder({});
  const prompt = window.buildSupplementSystemPrompt('');
  assert.match(prompt, /haven't asked about anything specific/, 'must use the real fallback line');
  assert.doesNotMatch(prompt, /undefined/, 'must never leak a literal "undefined" into the prompt text');
});

test('sabotage-relevant: a flagged condition actually reaches the prompt via the real activeConditionKeys/PERSISTENT_CONDITIONS pipeline', (assert)=>{
  const window = setupPromptBuilder({conditions:['prenatal']});
  const prompt = window.buildSupplementSystemPrompt('');
  assert.match(prompt, /Pregnant/, 'the real PERSISTENT_CONDITIONS label for the flagged condition must appear — proves this isn\'t a static string with the pipeline silently disconnected');
});

test('REAL invocation: no flagged conditions omit the conditions line entirely rather than an empty "They have flagged:" line', (assert)=>{
  const window = setupPromptBuilder({conditions:[]});
  const prompt = window.buildSupplementSystemPrompt('');
  assert.doesNotMatch(prompt, /They have flagged:/, 'must not emit a hollow flagged-conditions sentence when nothing is actually flagged');
});

test('REAL invocation: a vegan preference produces the real animal-product substitution instruction', (assert)=>{
  const window = setupPromptBuilder({dietaryPreference:'vegan'});
  const prompt = window.buildSupplementSystemPrompt('');
  assert.match(prompt, /Vegan/, 'must name the real dietary preference label');
  assert.match(prompt, /plant-based or synthetic alternative/, 'must include the real substitution instruction, not just a bare label');
});

test('sabotage-relevant: the dangerous-substance refusal rule is real text in the prompt, not just described in a comment', (assert)=>{
  const window = setupPromptBuilder({});
  const prompt = window.buildSupplementSystemPrompt('what about SARMs');
  assert.match(prompt, /SARMs/, 'the rule against recommending banned/dangerous substances must actually be present in what gets sent to the model');
  assert.match(prompt, /NEVER recommend/, 'the refusal instruction must be a real, present rule');
});

// --- submitSupplementRequest: the real DOM-facing handler -------------------

function fakeApiResponse(text){
  return { ok: true, json: async ()=> ({ content: [{type:'text', text}] }) };
}

function setupSubmit({ apiKey = 'fake-key', profileOverrides = {} } = {}){
  const captured = [];
  const initialStore = apiKey ? {'ai-api-key': apiKey} : {};
  const globalsSetup = `
    ${profileSetup(profileOverrides)}
    window.fetch = (url, opts) => {
      __capturedRequests.push(JSON.parse(opts.body));
      return __fakeResponse;
    };
    window.storage = {
      __store: ${JSON.stringify(initialStore)},
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('not found');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
    };
    // renderMySupplements itself (the My Supplements card) is covered by its
    // own test-my-supplements-tracker.js — stubbed here so addMySupplement's
    // real read-modify-write against window.storage can be exercised without
    // needing that card's markup in this file's bodyHtml too.
    window.renderMySupplements = async ()=>{};
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    aiMaxAttemptsSrc, aiSleepSrc, anthropicRequestSrc, callClaudeChatSrc,
    escapeHtmlSrc, aiKeySetupPromptSrc, getApiKeySrc,
    goalLabelsSrc, persistentConditionsSrc, describeDietaryFlagsSrc, activeConditionKeysSrc,
    supplementEvidenceLabelsSrc, renderSupplementCardsSrc,
    supplementFrequencyMetaSrc, loadMySupplementsSrc, saveMySupplementsSrc, addMySupplementSrc, wireSupplementAddButtonsSrc,
    buildSupplementSystemPromptSrc, submitSupplementRequestSrc,
    'window.__capturedRequests = [];',
    'window.submitSupplementRequest = submitSupplementRequest;',
  ]);
  window.__capturedRequests = captured;
  return { window, document, captured };
}

test('REAL invocation: with no API key, shows the real aiKeySetupPrompt banner and never touches the network', async (assert)=>{
  const { window, document, captured } = setupSubmit({ apiKey: null });
  await window.submitSupplementRequest();

  assert.strictEqual(captured.length, 0, 'no API key must short-circuit before any request');
  assert.match(document.getElementById('supplementResult').innerHTML, /Add your Anthropic API key/, 'must show the real shared setup prompt, not a bespoke message');
});

test('REAL invocation: a real request reaches the API exactly once, using medium effort (the cross-metric-insights fix\'s lesson) and renders real recommendation cards', async (assert)=>{
  const { window, document, captured } = setupSubmit({});
  document.getElementById('supplementRequestInput').value = 'best for recovery';
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [
      { name: 'Creatine Monohydrate', evidence: 'well-established', why: 'Directly supports strength/size goals.', typicalDose: '3-5g daily', timing: 'Any time, consistency matters more than timing', caution: null },
      { name: 'Magnesium', evidence: 'promising', why: 'Often supports sleep quality, which drives recovery.', typicalDose: '200-400mg', timing: 'Evening', caution: 'Can interact with certain blood pressure medications.' },
    ],
    note: 'Sleep and total protein intake matter more than either of these.',
  }));

  await window.submitSupplementRequest();

  assert.strictEqual(captured.length, 1, 'exactly one request must be sent per submit');
  assert.strictEqual(captured[0].messages[0].content, 'best for recovery', 'the real input value must be sent as the user message');
  assert.strictEqual(captured[0].output_config && captured[0].output_config.effort, 'medium', 'must request medium effort, matching the documented cross-metric-insights fix this comment cites');

  const html = document.getElementById('supplementResult').innerHTML;
  assert.match(html, /Creatine Monohydrate/, 'first recommendation name must render');
  assert.match(html, /Magnesium/, 'second recommendation name must render');
  assert.match(html, /3-5g daily/, 'dose must render');
  assert.match(html, /Can interact with certain blood pressure medications\./, 'a present caution must render as its own banner');
  assert.match(html, /Sleep and total protein intake matter more/, 'the closing note must render');
});

test('sabotage-relevant: a recommendation with NO caution renders no caution banner for it (proves caution is conditional, not always-on boilerplate)', async (assert)=>{
  const { window, document } = setupSubmit({});
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [
      { name: 'Vitamin D3', evidence: 'well-established', why: 'Common shortfall, supports general health.', typicalDose: '1000-2000 IU', timing: 'With a meal containing fat', caution: null },
    ],
    note: 'A blood test is the only way to know your actual level.',
  }));

  await window.submitSupplementRequest();

  const html = document.getElementById('supplementResult').innerHTML;
  assert.match(html, /Vitamin D3/);
  assert.doesNotMatch(html, /care-banner-caution/, 'no caution field must mean no caution banner at all, not an empty one');
});

test('REAL invocation: a refusal response (empty recommendations, explanatory note) renders the note without any recommendation cards', async (assert)=>{
  const { window, document } = setupSubmit({});
  document.getElementById('supplementRequestInput').value = 'what SARMs should I take';
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [],
    note: 'SARMs are not something this app can responsibly recommend — they are unregulated and carry real health risk.',
  }));

  await window.submitSupplementRequest();

  const html = document.getElementById('supplementResult').innerHTML;
  assert.match(html, /not something this app can responsibly recommend/, 'the refusal note must render');
  assert.doesNotMatch(html, /photo-result-card/, 'zero recommendations must mean zero rendered cards');
});

test('REAL invocation: a malformed API response is caught and shown as an error banner, not an uncaught exception', async (assert)=>{
  const { window, document } = setupSubmit({});
  window.__fakeResponse = fakeApiResponse('not valid json at all');

  await window.submitSupplementRequest();

  assert.match(document.getElementById('supplementResult').innerHTML, /Couldn't get recommendations/, 'must fall back to the real error banner rather than throwing');
});

// --- Foundational Stack: the new static, no-API-call preset ----------------
// Same shared renderSupplementCards() as the AI path above, but the content
// is a hand-authored table (FOUNDATIONAL_SUPPLEMENT_STACK), keyed off
// userProfile.gender — the real field the Profile tab writes and BODY_GOALS
// already reads. Sabotage-relevant framing: a bug that let one gender's
// additions leak into another's list, or that dropped the gender-specific
// items back to nothing, would still "render something" and look fine at a
// glance — these tests check the actual item sets, not just that some HTML
// came out.

function setupFoundationalStack(profileOverrides){
  const globalsSetup = `
    ${profileSetup(profileOverrides)}
    window.storage = {
      __store: {},
      get: async (key)=>{
        if(Object.prototype.hasOwnProperty.call(window.storage.__store, key)){
          return { value: window.storage.__store[key] };
        }
        throw new Error('not found');
      },
      set: async (key, value)=>{ window.storage.__store[key] = value; },
    };
    window.renderMySupplements = async ()=>{};
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    escapeHtmlSrc, supplementEvidenceLabelsSrc, renderSupplementCardsSrc,
    supplementFrequencyMetaSrc, loadMySupplementsSrc, saveMySupplementsSrc, addMySupplementSrc, wireSupplementAddButtonsSrc,
    activeConditionKeysSrc, foundationalStackSrc, getFoundationalSupplementStackSrc,
    renderFoundationalStackSrc, foundationalToggleWiringSrc,
    'window.getFoundationalSupplementStack = getFoundationalSupplementStack;',
    'window.renderFoundationalStack = renderFoundationalStack;',
  ]);
  return { window, document };
}

// The inner content div renderFoundationalStack actually writes to —
// #foundationalStackResult itself is the animated .smooth-toggle wrapper
// and must keep exactly one child for the grid-row clipping to work.
function foundationalStackContentEl(document){
  return document.getElementById('foundationalStackResult').firstElementChild;
}

test('REAL invocation: getFoundationalSupplementStack for an unset/other gender returns ONLY the base list', (assert)=>{
  const { window } = setupFoundationalStack({gender:'other'});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(names.includes('Vitamin D3') && names.includes('Creatine Monohydrate') && names.includes('Vitamin B12'), 'base items, including the newly-added Vitamin B12, must be present');
  assert.ok(!names.includes('Zinc') && !names.includes('Iron'), 'no gender-specific additions must be guessed for other/unset');
});

test('REAL invocation: every Foundational Stack entry carries a real, recognized frequency', (assert)=>{
  const { window } = setupFoundationalStack({gender:'female'});
  const items = window.getFoundationalSupplementStack();
  items.forEach(item=>{
    assert.ok(['daily','twice-daily','weekly'].includes(item.frequency), `${item.name} must carry a real frequency value, got: ${item.frequency}`);
  });
  const calcium = items.find(i=> i.name === 'Calcium');
  assert.strictEqual(calcium.frequency, 'twice-daily', 'Calcium specifically must be twice-daily, matching its own "split doses absorb better" guidance');
});

test('sabotage-relevant: a male profile adds the real male-specific item(s) on top of the same base list, and none of the female-specific ones', (assert)=>{
  const { window } = setupFoundationalStack({gender:'male'});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(names.includes('Vitamin D3'), 'base items must still be present');
  assert.ok(names.includes('Zinc'), 'the real male-specific addition must be included');
  assert.ok(!names.includes('Iron') && !names.includes('Calcium'), 'female-specific items must not leak into a male profile');
});

test('sabotage-relevant: a female profile adds the real female-specific items on top of the same base list, and not the male-specific one', (assert)=>{
  const { window } = setupFoundationalStack({gender:'female'});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(names.includes('Vitamin D3'), 'base items must still be present');
  assert.ok(names.includes('Iron') && names.includes('Calcium') && names.includes('Folate (Vitamin B9)'), 'the real female-specific additions must all be included');
  assert.ok(!names.includes('Zinc'), 'the male-specific item must not leak into a female profile');
});

// --- Condition-based additions: the SAME real flagged-condition pipeline ---
// buildSupplementSystemPrompt already reads (activeConditionKeys/
// PERSISTENT_CONDITIONS), not a parallel system invented for this feature.
// bariatricRebuilding is deliberately excluded (it already has its own
// dedicated checklist elsewhere) — proven here as a real negative case, not
// just asserted in a comment.

test('REAL invocation: a flagged osteoporosis condition adds the real Vitamin K2 entry on top of base', (assert)=>{
  const { window } = setupFoundationalStack({conditions:['osteoporosis']});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(names.includes('Vitamin D3'), 'base items must still be present');
  assert.ok(names.includes('Vitamin K2 (MK-7)'), 'the real osteoporosis-specific addition must be included');
});

test('REAL invocation: a flagged diabetes condition adds the real Alpha-Lipoic Acid entry', (assert)=>{
  const { window } = setupFoundationalStack({conditions:['diabetes']});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(names.includes('Alpha-Lipoic Acid'));
});

test('REAL invocation: a flagged hypertension condition adds the real CoQ10 entry', (assert)=>{
  const { window } = setupFoundationalStack({conditions:['hypertension']});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(names.includes('Coenzyme Q10 (CoQ10)'));
});

test('REAL invocation: prenatal and postpartum each add a real Choline entry worded for that condition specifically', (assert)=>{
  const { window: prenatalWin } = setupFoundationalStack({conditions:['prenatal']});
  const prenatalItem = prenatalWin.getFoundationalSupplementStack().find(i=> i.name === 'Choline');
  assert.ok(prenatalItem, 'prenatal must add a real Choline entry');
  assert.match(prenatalItem.why, /pregnancy/i, 'the prenatal wording must actually reference pregnancy, not generic breastfeeding text');

  const { window: postpartumWin } = setupFoundationalStack({conditions:['postpartum']});
  const postpartumItem = postpartumWin.getFoundationalSupplementStack().find(i=> i.name === 'Choline');
  assert.ok(postpartumItem, 'postpartum must add a real Choline entry');
  assert.match(postpartumItem.why, /breastfeeding/i, 'the postpartum wording must actually reference breastfeeding, not the prenatal text verbatim');
});

test('sabotage-relevant: no flagged conditions means none of the condition-specific additions appear', (assert)=>{
  const { window } = setupFoundationalStack({conditions:[]});
  const names = window.getFoundationalSupplementStack().map(i=>i.name);
  assert.ok(!names.includes('Vitamin K2 (MK-7)') && !names.includes('Alpha-Lipoic Acid') && !names.includes('Coenzyme Q10 (CoQ10)') && !names.includes('Choline'), 'nothing condition-specific must appear when nothing is actually flagged');
});

test('sabotage-relevant: a flagged bariatricRebuilding condition adds nothing here — it already has its own dedicated checklist elsewhere', (assert)=>{
  const plainBaseCount = setupFoundationalStack({conditions:[], gender:'other'}).window.getFoundationalSupplementStack().length;
  const { window } = setupFoundationalStack({conditions:['bariatricRebuilding'], gender:'other'});
  // Exactly the same count as the plain base list, nothing more — proves
  // this condition was left out deliberately rather than by an accidental
  // typo in the conditions map key.
  assert.strictEqual(window.getFoundationalSupplementStack().length, plainBaseCount, 'bariatricRebuilding must add zero items on top of the plain base list');
});

test('REAL invocation: renderFoundationalStack renders every item into the real .smooth-toggle content div with evidence tier and dose', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'female'});
  await window.renderFoundationalStack();
  const html = foundationalStackContentEl(document).innerHTML;
  assert.match(html, /Vitamin D3/);
  assert.match(html, /Iron/);
  assert.match(html, /Well-established/);
  assert.match(html, /1,000-2,000 IU daily/, 'the real typical dose text must render, not a placeholder');
});

// The frequency field has driven My Supplements' dosing-count tracking since
// v3.253, but was never actually shown ON the recommendation card itself —
// a user reading Calcium's card had no way to know it's twice-daily before
// adding it. sabotage-relevant: a card that renders every other field but
// silently drops frequency would still pass every test above this one.
test('REAL invocation: Foundational Stack cards each show their real frequency label, not just dose/timing', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'female'});
  await window.renderFoundationalStack();
  const html = foundationalStackContentEl(document).innerHTML;
  assert.match(html, /Frequency:<\/b>\s*Daily/, 'a plain daily item (e.g. Vitamin D3) must show "Frequency: Daily"');
  assert.match(html, /Frequency:<\/b>\s*Twice daily/, 'Calcium must show "Frequency: Twice daily", matching its own real frequency value, not a guessed/default label');
});

test('REAL invocation: an AI recommendation missing/mistyped frequency still renders a real fallback label (Daily), matching addMySupplement\'s own default', async (assert)=>{
  const { window, document, captured } = setupSubmit({});
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [
      { name: 'Weird Item', evidence: 'promising', why: 'test', typicalDose: '1 unit', timing: 'Any time', caution: null, frequency: 'monthly' },
    ],
    note: '',
  }));
  await window.submitSupplementRequest();
  const html = document.getElementById('supplementResult').innerHTML;
  assert.match(html, /Frequency:<\/b>\s*Daily/, 'an unrecognized frequency value must fall back to the real "Daily" label rather than rendering nothing or the raw invalid string');
  assert.ok(!/Frequency:<\/b>\s*monthly/.test(html), 'must not render the raw unrecognized value verbatim');
});

// The open/close ANIMATION (aria-expanded flip, .open class) is the
// existing generic delegated .program-basis-toggle listener, already
// covered by test-program-overview.js — not re-tested here. What's real
// and unique to this feature is the SECOND, element-specific listener that
// re-renders content only when opening (aria-expanded still reads the
// pre-click state, same convention the generic listener itself relies on).
test('REAL invocation: clicking the toggle while collapsed (aria-expanded=false) renders real content into the content div', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'male'});
  const btn = document.getElementById('foundationalStackToggle');
  assert.strictEqual(btn.getAttribute('aria-expanded'), 'false', 'precondition: real markup starts collapsed');
  assert.strictEqual(foundationalStackContentEl(document).innerHTML, '', 'precondition: nothing rendered yet');

  btn.click();
  await new Promise(r=> setTimeout(r, 20));

  assert.match(foundationalStackContentEl(document).innerHTML, /Zinc/, 'must have actually rendered real content on the click that opens it');
});

test('sabotage-relevant: clicking the toggle while already expanded (aria-expanded=true) does NOT re-render', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'male'});
  const btn = document.getElementById('foundationalStackToggle');
  btn.setAttribute('aria-expanded', 'true'); // simulate: already open, this click is the one that closes it
  const contentEl = foundationalStackContentEl(document);
  contentEl.innerHTML = '<div id="sentinel">unchanged</div>';

  btn.click();
  await new Promise(r=> setTimeout(r, 20));

  assert.strictEqual(contentEl.innerHTML, '<div id="sentinel">unchanged</div>', 'a closing click must never trigger a pointless re-render');
});

// --- "+ Add to my supplements" integration ----------------------------------
// The follow-on the earlier design proposal flagged: every card
// renderSupplementCards produces (AI-generated or Foundational Stack) now
// carries a button that sends that item straight into the real My
// Supplements tracker via the real addMySupplement — proven here against
// the real function (test-my-supplements-tracker.js separately covers
// addMySupplement's own dedupe/persistence behavior in depth; this file
// proves the WIRING from a rendered recommendation card into it).

test('REAL invocation: clicking "+ Add to my supplements" on an AI-recommended card calls the real addMySupplement and disables the button', async (assert)=>{
  const { window, document } = setupSubmit({});
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [
      { name: 'Creatine Monohydrate', evidence: 'well-established', why: 'Supports strength.', typicalDose: '3-5g daily', timing: 'Any time', caution: null },
    ],
    note: 'Sleep and protein matter more.',
  }));
  await window.submitSupplementRequest();

  const addBtn = document.querySelector('#supplementResult .supplement-add-btn');
  assert.ok(addBtn, 'precondition: a real add button must have rendered on the card');
  addBtn.click();
  await new Promise(r=> setTimeout(r, 20));

  assert.deepStrictEqual(JSON.parse(window.storage.__store['my-supplements']), [{name:'Creatine Monohydrate', frequency:'daily'}], 'the real name from the recommendation must reach the real my-supplements list (frequency defaults to daily since this fixture response omits one)');
  assert.strictEqual(addBtn.disabled, true, 'the button must disable itself after adding');
  assert.match(addBtn.textContent, /Added/, 'the button label must confirm the add');
});

test('sabotage-relevant: with two recommendation cards, clicking the SECOND card\'s add button adds only that one, not the first', async (assert)=>{
  const { window, document } = setupSubmit({});
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [
      { name: 'Vitamin D3', evidence: 'well-established', why: 'why1', typicalDose: 'd1', timing: 't1', caution: null },
      { name: 'Magnesium', evidence: 'promising', why: 'why2', typicalDose: 'd2', timing: 't2', caution: null },
    ],
    note: 'note',
  }));
  await window.submitSupplementRequest();

  const addBtns = document.querySelectorAll('#supplementResult .supplement-add-btn');
  assert.strictEqual(addBtns.length, 2, 'precondition: two add buttons rendered, one per card');
  addBtns[1].click();
  await new Promise(r=> setTimeout(r, 20));

  assert.deepStrictEqual(JSON.parse(window.storage.__store['my-supplements']), [{name:'Magnesium', frequency:'daily'}], 'only the SECOND card\'s name (Magnesium) must be added — a sabotaged index-0-always bug would add Vitamin D3 instead');
});

test('REAL invocation: clicking "+ Add to my supplements" on a Foundational Stack card adds the real matched item', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'other'});
  await window.renderFoundationalStack();

  const addBtn = document.querySelector('#foundationalStackResult .supplement-add-btn');
  assert.ok(addBtn, 'precondition: a real add button must have rendered');
  addBtn.click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.strictEqual(stored.length, 1);
  assert.ok(window.getFoundationalSupplementStack().some(i=> i.name === stored[0].name), 'the added name must be one of the REAL Foundational Stack entries, not a placeholder');
});

test('REAL invocation: adding Calcium from the Foundational Stack carries over its real twice-daily frequency, not a default', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'female'});
  await window.renderFoundationalStack();
  const cards = [...document.querySelectorAll('#foundationalStackResult .photo-result-card')];
  const calciumCard = cards.find(c=> c.textContent.includes('Calcium'));
  assert.ok(calciumCard, 'precondition: a real Calcium card must have rendered for a female profile');

  calciumCard.querySelector('.supplement-add-btn').click();
  await new Promise(r=> setTimeout(r, 20));

  const stored = JSON.parse(window.storage.__store['my-supplements']);
  assert.deepStrictEqual(stored, [{name:'Calcium', frequency:'twice-daily'}], 'Calcium\'s real, curated frequency (twice-daily) must reach the tracker automatically, not fall back to daily');
});

// --- "Already tracked" state must be real and persisted, not session-only --
// The gap flagged when the tracker first shipped (HANDOFF v46): the button
// only confirmed a JUST-clicked add, but a fresh render of the SAME card
// (a new AI request, or reopening Foundational Stack) had no memory of it.
// Both render paths now check the real My Supplements list up front.

test('REAL invocation: a Foundational Stack item already in My Supplements renders pre-added and disabled, while an untracked one in the same list does not', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'other'});
  window.storage.__store['my-supplements'] = JSON.stringify(['Vitamin D3']);

  await window.renderFoundationalStack();
  const cards = [...foundationalStackContentEl(document).querySelectorAll('.photo-result-card')];
  const vitDCard = cards.find(c=> c.textContent.includes('Vitamin D3'));
  const creatineCard = cards.find(c=> c.textContent.includes('Creatine Monohydrate'));

  const vitDBtn = vitDCard.querySelector('.supplement-add-btn');
  assert.strictEqual(vitDBtn.disabled, true, 'an already-tracked item must render pre-disabled, not just after a fresh click');
  assert.match(vitDBtn.textContent, /Added/);

  const creatineBtn = creatineCard.querySelector('.supplement-add-btn');
  assert.strictEqual(creatineBtn.disabled, false, 'an UNTRACKED item in the same render must stay a normal, enabled add button');
  assert.match(creatineBtn.textContent, /Add to my supplements/);
});

test('sabotage-relevant: the already-tracked check is case-insensitive, matching addMySupplement\'s own dedupe rule', async (assert)=>{
  const { window, document } = setupFoundationalStack({gender:'other'});
  window.storage.__store['my-supplements'] = JSON.stringify(['vitamin d3']); // lowercase, as a person might have typed it manually

  await window.renderFoundationalStack();
  const cards = [...foundationalStackContentEl(document).querySelectorAll('.photo-result-card')];
  const vitDBtn = cards.find(c=> c.textContent.includes('Vitamin D3')).querySelector('.supplement-add-btn');
  assert.strictEqual(vitDBtn.disabled, true, 'a case-different but otherwise identical stored name must still count as already tracked');
});

test('REAL invocation: an AI-recommended item already in My Supplements renders pre-added and disabled', async (assert)=>{
  const { window, document } = setupSubmit({});
  window.storage.__store['my-supplements'] = JSON.stringify(['Creatine Monohydrate']);
  window.__fakeResponse = fakeApiResponse(JSON.stringify({
    recommendations: [
      { name: 'Creatine Monohydrate', evidence: 'well-established', why: 'why', typicalDose: 'dose', timing: 'time', caution: null },
      { name: 'Fish Oil', evidence: 'well-established', why: 'why2', typicalDose: 'dose2', timing: 'time2', caution: null },
    ],
    note: 'note',
  }));

  await window.submitSupplementRequest();

  const cards = [...document.querySelectorAll('#supplementResult .photo-result-card')];
  const creatineBtn = cards.find(c=> c.textContent.includes('Creatine Monohydrate')).querySelector('.supplement-add-btn');
  const fishOilBtn = cards.find(c=> c.textContent.includes('Fish Oil')).querySelector('.supplement-add-btn');
  assert.strictEqual(creatineBtn.disabled, true, 'an AI recommendation matching an existing tracked item must render pre-added');
  assert.strictEqual(fishOilBtn.disabled, false, 'a different, untracked recommendation in the same response must stay a normal add button');
});

run();
