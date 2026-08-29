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

// Real markup for the pieces this flow touches, hand-assembled rather than
// extracted — <input> has no closing tag for extractElementById to find,
// and these three ids sit inside a larger Coach-tab card whose other
// siblings (the disclaimer text, the history-hint) this flow never reads,
// matching the established pattern in test-weight-log-crud.js.
const bodyHtml = `
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
    goal: 'gain', bodyGoal: '', conditions: [], dietaryPreference: '', avoidFoods: '',
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
  const globalsSetup = `
    ${profileSetup(profileOverrides)}
    window.fetch = (url, opts) => {
      __capturedRequests.push(JSON.parse(opts.body));
      return __fakeResponse;
    };
    window.storage = {
      get: async (k)=> k === 'ai-api-key' && ${JSON.stringify(apiKey)}
        ? {key:k, value:${JSON.stringify(apiKey)}}
        : (()=>{ throw new Error('not found'); })(),
    };
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    aiMaxAttemptsSrc, aiSleepSrc, anthropicRequestSrc, callClaudeChatSrc,
    escapeHtmlSrc, aiKeySetupPromptSrc, getApiKeySrc,
    goalLabelsSrc, persistentConditionsSrc, describeDietaryFlagsSrc, activeConditionKeysSrc,
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

run();
