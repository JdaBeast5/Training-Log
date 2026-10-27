'use strict';
// Behavioral coverage for a real, previously-unverified fix: Cross-Metric
// Insights used to fail outright on a real device — max_tokens raised twice
// (650, then 1100) and it still failed both times, because claude-sonnet-5
// runs adaptive thinking by default and thinking tokens spend from the same
// ceiling as the reply. The whole budget went to reasoning and the turn
// ended before a single word of the answer; raising max_tokens couldn't fix
// that because it doesn't bound WHAT the extra room gets spent on.
//
// The actual fix (HANDOFF v30, per the comment above callClaudeChat):
// output_config.effort, a real documented lever that constrains reasoning
// depth on top of whatever max_tokens allows. 'medium' is the value used
// for Cross-Metric Insights specifically, and it must NOT be sent for a
// model that doesn't support it (Haiku 4.5 returns a 400 if output_config
// is present at all) — callClaudeChat guards that itself rather than
// leaving every caller to remember which models are effort-capable.
//
// This shipped with no test coverage at all — this file is that coverage,
// not a fix. It proves two things: the payload callClaudeChat actually
// sends (real invocation, network stubbed at the fetch boundary — the true
// edge of what this app controls, same as the rest of its AI call sites do
// implicitly), and that generateCrossMetricInsights really requests
// effort:'medium' rather than leaving it unset by accident.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-ai-cross-metric-effort-fix.js');

const callClaudeChatSrc = extractFunction(src, 'callClaudeChat');
const anthropicRequestSrc = extractFunction(src, 'anthropicRequest');
const aiSleepSrc = extractFunction(src, 'aiSleep');
const aiMaxAttemptsSrc = extractConst(src, 'AI_MAX_ATTEMPTS');
// 2026-10-26 (v3.364): calls to the default model add the refusal fallback,
// so the request path needs its beta name and helper too.
const aiFallbackSrc = [extractConst(src, 'AI_FALLBACK_BETA') + '\n' + extractFunction(src, 'withRefusalFallback'), extractConst(src, 'AI_JSON_SCHEMAS'), extractFunction(src, 'aiOutputConfig')].join('\n');
// 2026-10-26 (v3.365): ...plus the structured-output helper and schemas.
// 2026-10-26 (v3.362): the default model is the AI_MODEL_DEFAULT const now
// (claude-sonnet-5-5), so the harness loads it.
const aiModelDefaultSrc = extractConst(src, 'AI_MODEL_DEFAULT');

// A minimal, real-shaped Claude Messages API response — enough for
// anthropicRequest's own "every text block, joined" logic to resolve a
// plain string, which is all callClaudeChat's callers need back.
function fakeApiResponse(text){
  return { ok: true, json: async ()=> ({ content: [{type:'text', text}] }) };
}

function setupCallClaudeChat(){
  const captured = [];
  const globalsSetup = `
    window.fetch = (url, opts) => {
      __capturedRequests.push(JSON.parse(opts.body));
      return __fakeResponse;
    };
  `;
  const { window } = runJsdom('', globalsSetup, [
    aiModelDefaultSrc, aiFallbackSrc, aiMaxAttemptsSrc, aiSleepSrc, anthropicRequestSrc, callClaudeChatSrc,
    'window.__capturedRequests = [];',
  ]);
  window.__capturedRequests = captured;
  return { window, captured };
}

test('REAL invocation: callClaudeChat attaches output_config.effort for the default model (claude-sonnet-5-5 since v3.362) when effort is passed', async (assert)=>{
  const { window, captured } = setupCallClaudeChat();
  window.__fakeResponse = fakeApiResponse('PUSH\n\nSome analysis.');
  await window.callClaudeChat('fake-key', 'system prompt', [{role:'user', content:'hi'}], 5000, undefined, 'medium');

  assert.strictEqual(captured.length, 1, 'exactly one request must have been sent');
  const body = captured[0];
  assert.strictEqual(body.model, 'claude-sonnet-5-5', 'must default to claude-sonnet-5-5 (v3.362) when no model is passed');
  assert.strictEqual(body.max_tokens, 5000, 'max_tokens must still be the hard ceiling — effort narrows likely usage, it does not replace this');
  // JSON.stringify round-trip, not assert.deepStrictEqual: body.output_config
  // was parsed by jsdom's OWN realm-local JSON.parse (inside window.fetch),
  // so it carries jsdom's Object prototype, not Node's — deepStrictEqual
  // treats that as a different type even with identical shape (same trap
  // testHelpers.js's runSandbox comment documents for vm contexts).
  assert.strictEqual(JSON.stringify(body.output_config), JSON.stringify({effort: 'medium'}), 'output_config.effort must actually be attached — this is the real fix, not a comment describing an intended one');
});

test('sabotage-relevant: callClaudeChat does NOT attach output_config when no effort is passed', async (assert)=>{
  const { window, captured } = setupCallClaudeChat();
  window.__fakeResponse = fakeApiResponse('a plain reply');
  await window.callClaudeChat('fake-key', 'system prompt', [{role:'user', content:'hi'}], 1200, undefined, undefined);

  assert.strictEqual(captured[0].output_config, undefined, 'callers that pass no effort must not get output_config at all, not an effort:undefined key');
});

// 2026-10-26 (v3.363): the model gate this test guarded is gone on purpose.
// Haiku 4.5 (which 400'd on output_config) was replaced by Haiku 5.5, which
// accepts effort and needs it because it thinks by default. The test now
// proves the opposite: the fast model DOES get the effort it is passed.
test('REAL invocation: callClaudeChat attaches output_config.effort for the fast model too (claude-haiku-5-5, v3.363)', async (assert)=>{
  const { window, captured } = setupCallClaudeChat();
  window.__fakeResponse = fakeApiResponse('a plain reply');
  await window.callClaudeChat('fake-key', 'system prompt', [{role:'user', content:'hi'}], 1200, 'claude-haiku-5-5', 'low');

  assert.strictEqual(captured[0].model, 'claude-haiku-5-5');
  assert.strictEqual(JSON.stringify(captured[0].output_config), JSON.stringify({effort: 'low'}));
});

// --- generateCrossMetricInsights: the real call site this fix exists for ---

const generateCrossMetricInsightsSrc = extractFunction(src, 'generateCrossMetricInsights');
const aiCachedCallSrc = extractFunction(src, 'aiCachedCall');
const aiFingerprintSrc = extractFunction(src, 'aiFingerprint');
const aiPromptVersionSrc = extractConst(src, 'AI_PROMPT_VERSION');
const aiKeySetupPromptSrc = extractFunction(src, 'aiKeySetupPrompt');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const getApiKeySrc = extractFunction(src, 'getApiKey');

const bodyHtml = `
  <button class="save-btn" id="genCrossInsightsBtn">✨ Generate insights</button>
  <div id="crossInsightsResult"></div>
`;

// buildCrossMetricInsightsContext/getCoachPersona are real functions with
// large, unrelated storage/program-state dependencies — stubbed here since
// this file is about the effort fix, not about what those functions
// individually compute. dataLineCount controls the exact "not enough data"
// gate this function itself owns (>= 3 real lines after the header).
function contextStub(dataLineCount){
  const header = 'Program: Strength & Size';
  const lines = [];
  for(let i=0;i<dataLineCount;i++) lines.push(`Day ${i+1}: sleep 7.${i}h, RPE ${5+i}`);
  return `
    async function buildCrossMetricInsightsContext(){ return ${JSON.stringify([header, ...lines].join('\n'))}; }
    function getCoachPersona(){ return 'a strength coach'; }
  `;
}

function setupGenerate(dataLineCount){
  const captured = [];
  const globalsSetup = `
    window.fetch = (url, opts) => {
      __capturedRequests.push(JSON.parse(opts.body));
      return __fakeResponse;
    };
    window.storage = {
      get: async (k)=> k === 'ai-api-key' ? {key:k, value:'fake-key'} : (()=>{ throw new Error('not found'); })(),
      set: async ()=>{},
    };
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    aiModelDefaultSrc, aiFallbackSrc, aiMaxAttemptsSrc, aiSleepSrc, anthropicRequestSrc, callClaudeChatSrc,
    aiPromptVersionSrc, aiFingerprintSrc, aiCachedCallSrc,
    escapeHtmlSrc, extractConst(src, 'ICONS'), extractFunction(src, 'icon'), // 2026-10-27 (v3.425): the PUSH banner draws ICONS.check
    aiKeySetupPromptSrc, getApiKeySrc,
    contextStub(dataLineCount),
    generateCrossMetricInsightsSrc,
    'window.__capturedRequests = [];',
    'window.generateCrossMetricInsights = generateCrossMetricInsights;',
  ]);
  window.__capturedRequests = captured;
  return { window, document, captured };
}

test('REAL invocation: with fewer than 3 logged data lines, generateCrossMetricInsights never calls the API at all', async (assert)=>{
  const { window, document, captured } = setupGenerate(2);
  window.__fakeResponse = fakeApiResponse('PUSH\n\nshould never be reached');
  await window.generateCrossMetricInsights();

  assert.strictEqual(captured.length, 0, 'too little data must short-circuit before any network request — this is the free, instant local answer the comment above the gate describes');
  assert.match(document.getElementById('crossInsightsResult').innerHTML, /needs a few logged/, 'must show the real local explanation, not a generic error');
});

test('REAL invocation: with enough data, generateCrossMetricInsights actually requests effort:\'medium\' and max_tokens:5000 — the real fix, exercised through its real call site', async (assert)=>{
  const { window, document, captured } = setupGenerate(5);
  window.__fakeResponse = fakeApiResponse('PUSH\n\nRPE has been climbing while sleep held steady, so recovery looks solid enough to keep progressing.');
  await window.generateCrossMetricInsights();

  assert.strictEqual(captured.length, 1, 'sufficient data must actually reach the API');
  assert.strictEqual(captured[0].output_config && captured[0].output_config.effort, 'medium', 'the real call site must request medium effort, not leave it unset by accident');
  assert.strictEqual(captured[0].max_tokens, 5000);

  const resultHtml = document.getElementById('crossInsightsResult').innerHTML;
  assert.match(resultHtml, /Push — recovery signals support training harder/, 'a real PUSH reply must render the real recommendation banner');
  assert.match(resultHtml, /RPE has been climbing/, 'the real narrative text must render');
});

run();
