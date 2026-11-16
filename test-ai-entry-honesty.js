'use strict';
// v3.582 (BIZ-06): the AI entry points say they need a key, and what each sends
// and to whom, before the tap.
//  - With no key, AI Cross-Metric Insights (the same element, IDs kept) sorts
//    to the end of Training Trends and collapses with it; its button says it
//    needs a key. With a key it is back above Meal Timing and reads "Generate
//    insights". placeAiInsightsCard runs for real over the real #analysisView.
//  - Each entry point (the insights button, Photo, Describe, the coach's empty
//    state, the key prompt) carries a line naming Anthropic.
//  - The insights request is untouched: one real fetch per call with a key.
const { readIndexSource, extractFunction, extractConst, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const { test, run } = makeRunner('test-ai-entry-honesty.js');
const src = readIndexSource();
const ANALYSIS = extractElementById(src, 'analysisView');
const LOG = extractElementById(src, 'logView');

function mountAnalysis(){
  const { window, document } = runJsdom(ANALYSIS, '', [extractFunction(src, 'placeAiInsightsCard'), 'window.place = placeAiInsightsCard;']);
  const view = document.getElementById('analysisView');
  const header = g => view.querySelector(`.analysis-group-header[data-group="${g}"]`);
  const card = () => document.getElementById('genCrossInsightsBtn').closest('.card');
  const groupOf = el => { let n = el.previousElementSibling; while(n && !n.classList.contains('analysis-group-header')) n = n.previousElementSibling; return n && n.dataset.group; };
  const order = () => [...view.children].map(n => n.id || n.dataset.group || n.querySelector('[id]')?.id || n.className);
  return { window, document, view, header, card, groupOf, order, btn: () => document.getElementById('genCrossInsightsBtn') };
}
const precedes = (a, b) => !!(a.compareDocumentPosition(b) & 4); // b follows a

test('criterion 1: with no key, the button says it needs a key, and Training Trends precedes the AI card (it collapses with that group)', (assert)=>{
  const m = mountAnalysis();
  m.header('training').classList.add('collapsed'); // Training Trends is collapsed by default
  m.window.place(false);
  assert.match(m.btn().textContent, /key/i);
  assert.strictEqual(m.btn().textContent, 'Add an AI key to use this');
  assert.ok(precedes(m.header('training'), m.card()), 'Training Trends header comes before the card');
  assert.strictEqual(m.groupOf(m.card()), 'training');
  assert.strictEqual(m.card().nextElementSibling.id, 'analysisExportBtn', 'last in the group, above the print button');
  assert.ok(m.card().classList.contains('group-collapsed'), 'collapsed with its new group');
  assert.ok(m.document.getElementById('crossInsightsResult'), 'the same element moved: its IDs are kept');
});

test('criterion 2: with a key, the button reads "Generate insights" and the order is as in the markup; placing twice moves it back', (assert)=>{
  const fresh = mountAnalysis().order();
  const m = mountAnalysis();
  m.window.place(true);
  assert.strictEqual(m.btn().textContent, 'Generate insights');
  assert.deepStrictEqual(m.order(), fresh);
  m.header('training').classList.add('collapsed');
  m.window.place(false);
  m.window.place(true);
  assert.deepStrictEqual(m.order(), fresh, 'back above Meal Timing in Insights & Program Fit');
  assert.strictEqual(m.groupOf(m.card()), 'insights');
  assert.ok(!m.card().classList.contains('group-collapsed'), 'open with the open Insights group');
});

test('a run in progress keeps its "Analyzing…" label', (assert)=>{
  const m = mountAnalysis();
  m.btn().disabled = true; m.btn().textContent = 'Analyzing…';
  m.window.place(false);
  assert.strictEqual(m.btn().textContent, 'Analyzing…');
});

test('renderAnalysis places the card once, from the real key, before autohide and the jump rail', (assert)=>{
  const body = extractFunction(src, 'renderAnalysis').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.strictEqual((body.match(/\bplaceAiInsightsCard\(/g) || []).length, 1);
  assert.match(body, /placeAiInsightsCard\(!!\(await getApiKey\(\)\)\)/);
  assert.ok(body.indexOf('placeAiInsightsCard(') < body.indexOf('applyAnalysisEmptyState('), 'before autohide, which builds the jump rail');
});

test('disclosure: the insights button and Photo and Describe each point at a line naming Anthropic', (assert)=>{
  const a = mountAnalysis();
  const { document } = runJsdom(LOG, '', []);
  const described = (doc, id) => { const ref = doc.getElementById(id).getAttribute('aria-describedby'); return ref && doc.getElementById(ref) ? doc.getElementById(ref).textContent : ''; };
  assert.match(described(a.document, 'genCrossInsightsBtn'), /to Anthropic using your key/);
  assert.match(described(a.document, 'genCrossInsightsBtn'), /weight, food, water, sleep, effort, pain check-ins and PRs/);
  for(const id of ['photoLogBtn', 'describeFoodBtn']) assert.match(described(document, id), /photo or text to Anthropic using your key/, id);
});

function coach(history, hasKey){
  const { document } = runJsdom('<div id="coachChatLog"></div><div id="floatingChatLog"></div><button id="coachChatClear"></button>',
    `var coachChatHistory = ${JSON.stringify(history)}; function escapeHtml(s){ return String(s); }`,
    [extractFunction(src, 'renderCoachChatLog'), `renderCoachChatLog(${hasKey === undefined ? '' : hasKey});`]);
  return document;
}

test('disclosure: the coach\'s empty state names Anthropic, and starts with the key it needs only when there is none', (assert)=>{
  const none = coach([], false).getElementById('floatingChatLog').textContent;
  assert.ok(none.startsWith('Needs your Anthropic key (Settings).'), none);
  assert.match(none, /Sends your message and a summary of your training to Anthropic using your key\./);
  for(const k of [true, undefined]){
    const t = coach([], k).getElementById('coachChatLog').textContent;
    assert.ok(!/Needs your/.test(t), 'no key line with a key, or when the caller does not know');
    assert.match(t, /to Anthropic using your key/);
  }
  assert.ok(!/Anthropic/.test(coach([{role: 'user', content: 'hi'}], false).getElementById('coachChatLog').textContent), 'a conversation replaces the empty state');
});

test('disclosure: the key prompt keeps its first sentence and adds one naming Anthropic', (assert)=>{
  const { document } = runJsdom('<div id="out"></div>', '', [extractFunction(src, 'escapeHtml'), extractFunction(src, 'aiKeySetupPrompt'),
    'document.getElementById("out").innerHTML = aiKeySetupPrompt("this feature");']);
  const t = document.getElementById('out').textContent.replace(/\s+/g, ' ');
  assert.match(t, /Add your Anthropic API key to use this feature\./);
  assert.match(t, /Each AI feature sends what it needs to Anthropic using your key, straight from this device\./);
});

test('criterion 3: generateCrossMetricInsights with a key makes exactly one real fetch, with the same payload fix (effort medium, 5000 tokens)', async (assert)=>{
  const chunks = [extractConst(src, 'AI_MODEL_DEFAULT'), extractConst(src, 'AI_FALLBACK_BETA'), extractFunction(src, 'withRefusalFallback'), extractConst(src, 'AI_JSON_SCHEMAS'),
    extractFunction(src, 'aiOutputConfig'), extractConst(src, 'AI_MAX_ATTEMPTS'), extractFunction(src, 'aiSleep'), extractFunction(src, 'anthropicRequest'),
    extractFunction(src, 'callClaudeChat'), extractConst(src, 'AI_PROMPT_VERSION'), extractFunction(src, 'aiFingerprint'), extractFunction(src, 'aiCachedCall'),
    extractFunction(src, 'escapeHtml'), extractConst(src, 'ICONS'), extractFunction(src, 'icon'), extractFunction(src, 'aiKeySetupPrompt'), extractFunction(src, 'getApiKey'),
    `async function buildCrossMetricInsightsContext(){ return ${JSON.stringify(['Program: X', 'a', 'b', 'c', 'd'].join('\n'))}; } function getCoachPersona(){ return 'a coach'; }`,
    extractFunction(src, 'generateCrossMetricInsights'), 'window.gen = generateCrossMetricInsights;'];
  const { window } = runJsdom('<button id="genCrossInsightsBtn">Generate insights</button><div id="crossInsightsResult"></div>', `
    window.__req = [];
    window.fetch = async (url, opts) => { window.__req.push(JSON.parse(opts.body)); return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: 'MAINTAIN\\n\\nSteady.' }], stop_reason: 'end_turn' }) }; };
    window.storage = { get: async k => k === 'ai-api-key' ? {value: 'fake-key'} : null, set: async () => {} };
  `, chunks);
  await window.gen();
  assert.strictEqual(window.__req.length, 1, 'one real fetch per call with a key');
  assert.strictEqual(window.__req[0].max_tokens, 5000);
  assert.strictEqual(window.__req[0].output_config.effort, 'medium');
});

run();
