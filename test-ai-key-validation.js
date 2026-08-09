'use strict';
// Behavioral coverage for validating a pasted Anthropic API key before
// saving it (AI Features Setup, Settings) — Tier 2, new feature.
//
// Previously "Save Key" saved unconditionally and showed "Connected" no
// matter what was typed; a typo only surfaced later, mid-workout, when Get
// Form Feedback or Snap a Meal silently failed. validateApiKey() hits
// GET /v1/models (an auth-only check, no completion) rather than
// POST /v1/messages — deliberately, since a max_tokens-limited chat call on
// claude-sonnet-5 risks the exact "adaptive thinking ate the budget before
// any text came back" failure this project already documents elsewhere
// (anthropicRequest's own comment on the ceiling covering thinking AND the
// answer), which would report a perfectly good key as invalid.
//
// Uses the REAL aiSettingsCard markup and the REAL extracted
// validateApiKey/getApiKey/saveApiKey/showApiKeyConnected/showApiKeySetup/
// handleAiApiKeySave, loaded into an actual jsdom document via a real
// <script> tag, with `fetch` and `window.storage` stubbed so no real
// network/storage call ever happens.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const aiSettingsCardHtml = extractElementById(src, 'aiSettingsCard');

const scriptChunks = [
  extractFunction(src, 'getApiKey'),
  extractFunction(src, 'saveApiKey'),
  extractFunction(src, 'showApiKeyConnected'),
  extractFunction(src, 'showApiKeySetup'),
  extractFunction(src, 'validateApiKey'),
  extractFunction(src, 'handleAiApiKeySave'),
];

function storageGlobals(){
  return `
    window.storage = {
      __setCalls: [],
      get: async ()=>{ throw new Error('no saved preference'); },
      set: (key, value)=>{ window.storage.__setCalls.push([key, value]); },
    };
  `;
}

// kind controls what the stubbed fetch does, so each test drives
// validateApiKey/handleAiApiKeySave through a specific real HTTP outcome
// without ever making a real network call.
function fetchGlobals(kind){
  const body = {
    ok:            'return { ok: true, status: 200 };',
    unauthorized:  'return { ok: false, status: 401 };',
    servererror:   'return { ok: false, status: 500 };',
    networkerror:  "throw new Error('network down');",
  }[kind];
  return `
    ${storageGlobals()}
    window.__fetchCalls = [];
    window.fetch = async (url, opts)=>{
      window.__fetchCalls.push({ url, headers: (opts && opts.headers) || {} });
      ${body}
    };
  `;
}

const tick = ()=> new Promise((resolve)=> setTimeout(resolve, 10));

const { test, run } = makeRunner('test-ai-key-validation.js');

test('validateApiKey resolves without throwing on a 200, and hits the real auth-only endpoint with the given key', async (assert)=>{
  const { window } = runJsdom(aiSettingsCardHtml, fetchGlobals('ok'), scriptChunks);
  await window.validateApiKey('sk-ant-real-key');
  assert.strictEqual(window.__fetchCalls.length, 1);
  assert.strictEqual(window.__fetchCalls[0].url, 'https://api.anthropic.com/v1/models', 'must check auth via /v1/models, not /v1/messages');
  assert.strictEqual(window.__fetchCalls[0].headers['x-api-key'], 'sk-ant-real-key');
});

test('validateApiKey throws a rejection message on 401', async (assert)=>{
  const { window } = runJsdom(aiSettingsCardHtml, fetchGlobals('unauthorized'), scriptChunks);
  await assertRejects(assert, window.validateApiKey('bad-key'), /rejected/i);
});

test('validateApiKey throws a friendly message when the network itself fails', async (assert)=>{
  const { window } = runJsdom(aiSettingsCardHtml, fetchGlobals('networkerror'), scriptChunks);
  await assertRejects(assert, window.validateApiKey('sk-ant-real-key'), /could not reach/i);
});

test('validateApiKey throws a generic message on an unrelated server error', async (assert)=>{
  const { window } = runJsdom(aiSettingsCardHtml, fetchGlobals('servererror'), scriptChunks);
  await assertRejects(assert, window.validateApiKey('sk-ant-real-key'), /could not verify/i);
});

test('handleAiApiKeySave with an empty input: shows a prompt and never touches storage or the network', async (assert)=>{
  const { document, window } = runJsdom(aiSettingsCardHtml, fetchGlobals('ok'), scriptChunks);
  document.getElementById('aiApiKeyInput').value = '   ';
  await window.handleAiApiKeySave();
  assert.strictEqual(document.getElementById('aiApiKeyStatus').textContent, 'Enter a key first');
  assert.strictEqual(window.storage.__setCalls.length, 0, 'must not save on an empty key');
  assert.strictEqual(window.__fetchCalls.length, 0, 'must not even check an empty key');
});

test('handleAiApiKeySave: while the check is in flight, the button is disabled and status shows "Checking key…"', async (assert)=>{
  const { document, window } = runJsdom(aiSettingsCardHtml, fetchGlobals('ok'), scriptChunks);
  document.getElementById('aiApiKeyInput').value = 'sk-ant-real-key';
  const pending = window.handleAiApiKeySave();
  assert.strictEqual(document.getElementById('aiApiKeySave').disabled, true, 'button must disable immediately, before the network call resolves');
  assert.strictEqual(document.getElementById('aiApiKeyStatus').textContent, 'Checking key…');
  await pending;
  assert.strictEqual(document.getElementById('aiApiKeySave').disabled, false, 'must re-enable once the check settles');
});

test('handleAiApiKeySave: a valid key gets saved, input cleared, and the UI switches to connected', async (assert)=>{
  const { document, window } = runJsdom(aiSettingsCardHtml, fetchGlobals('ok'), scriptChunks);
  document.getElementById('aiApiKeyInput').value = 'sk-ant-real-key';
  await window.handleAiApiKeySave();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(window.storage.__setCalls)), [['ai-api-key', 'sk-ant-real-key']]);
  assert.strictEqual(document.getElementById('aiApiKeyInput').value, '');
  assert.strictEqual(document.getElementById('aiApiKeyStatus').textContent, '');
  assert.strictEqual(document.getElementById('aiKeyConnectedState').style.display, 'flex');
  assert.strictEqual(document.getElementById('aiKeySetupState').style.display, 'none');
});

test('handleAiApiKeySave: a rejected key is never saved, and the UI stays on the setup state with the error shown', async (assert)=>{
  const { document, window } = runJsdom(aiSettingsCardHtml, fetchGlobals('unauthorized'), scriptChunks);
  document.getElementById('aiApiKeyInput').value = 'bad-key';
  await window.handleAiApiKeySave();
  assert.strictEqual(window.storage.__setCalls.length, 0, 'a rejected key must never be saved');
  assert.match(document.getElementById('aiApiKeyStatus').textContent, /rejected/i);
  assert.strictEqual(document.getElementById('aiApiKeyInput').value, 'bad-key', 'the typed key stays visible so it can be corrected, not silently cleared');
  assert.notStrictEqual(document.getElementById('aiKeyConnectedState').style.display, 'flex');
});

async function assertRejects(assert, promise, messagePattern){
  let threw = false;
  try{ await promise; }
  catch(err){ threw = true; assert.match(err.message, messagePattern); }
  assert.ok(threw, 'expected the promise to reject');
}

run();
