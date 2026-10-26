'use strict';
// Every AI feature moved onto the current Claude API and models, one
// increment at a time (owner: "confirm and enhance all the AI features we
// have in it so far, improve it with current capabilities"). Network is
// stubbed at fetch, the edge of what the app controls; every request the real
// functions build is captured and asserted on. None of this has been checked
// against the live API (no key in the test environment).
//
// v3.361 — anthropic-version 2026-10-21 on both endpoints the app calls
// (/v1/messages and the /v1/models key check). Its four changes (sampling
// params, documents in assistant turns, citations in user turns, Admin API
// fields) don't touch anything this app sends.
// v3.362 — Claude Sonnet 5 -> Sonnet 5.5 (same price) for every call that
// doesn't name a model, via one AI_MODEL_DEFAULT const.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-ai-current-api.js');

function ok(content, extra){ return { ok: true, status: 200, headers: { get: ()=> null }, json: async ()=> Object.assign({ content, stop_reason: 'end_turn' }, extra || {}) }; }
function err(status, message){ return { ok: false, status, headers: { get: ()=> null }, json: async ()=> ({ error: { message } }) }; }

// A harness running the real request path: queue responses, capture requests.
function harness(extraChunks){
  const { window } = runJsdom('', `
    window.__sent = []; window.__queue = [];
    window.fetch = async (url, opts) => {
      window.__sent.push({ url, headers: opts.headers, body: opts.body ? JSON.parse(opts.body) : null });
      const next = window.__queue.shift();
      return next || { ok: true, status: 200, headers: { get: ()=> null }, json: async ()=> ({ content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn' }) };
    };
  `, [extractConst(src, 'AI_MODEL_DEFAULT'), extractConst(src, 'AI_RETRY_STATUSES'), extractConst(src, 'AI_MAX_ATTEMPTS'), extractFunction(src, 'aiSleep'),
      extractFunction(src, 'anthropicRequest'), extractFunction(src, 'callClaudeChat'), extractFunction(src, 'callClaudeVision'),
      extractFunction(src, 'validateApiKey'), ...(extraChunks || [])]);
  const sent = () => JSON.parse(JSON.stringify(window.__sent));
  return { window, sent, queue: r => window.__queue.push(r) };
}

test('REAL invocation (v3.361): chat, vision and the key check all send anthropic-version 2026-10-21', async (assert)=>{
  const h = harness();
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000);
  await h.window.callClaudeVision('k', ['AAAA'], 'look', 1000);
  await h.window.validateApiKey('k');
  const reqs = h.sent();
  assert.strictEqual(reqs.length, 3, 'anchor: three real requests');
  assert.deepStrictEqual(reqs.map(r => r.url), ['https://api.anthropic.com/v1/messages', 'https://api.anthropic.com/v1/messages', 'https://api.anthropic.com/v1/models']);
  for(const r of reqs) assert.strictEqual(r.headers['anthropic-version'], '2026-10-21');
  assert.strictEqual((src.match(/2023-06-01/g) || []).length, 0, 'no call left on the old version');
});

test('REAL invocation (v3.361): no request carries a field 2026-10-21 rejects', async (assert)=>{
  const h = harness();
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000, undefined, 'medium');
  await h.window.callClaudeVision('k', ['AAAA', 'BBBB'], 'look', 1000);
  for(const { body } of h.sent()){
    for(const f of ['temperature', 'top_p', 'top_k']) assert.ok(!(f in body), `${f} is a 400 on 2026-10-21`);
    for(const m of body.messages) assert.notStrictEqual(m.role, 'assistant', 'no prefill (400 on current models)');
  }
});

test('REAL invocation (v3.362): chat and vision default to claude-sonnet-5-5, with effort attached when asked', async (assert)=>{
  const h = harness();
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000, undefined, 'medium');
  await h.window.callClaudeVision('k', ['AAAA'], 'look', 1000);
  const [chat, vision] = h.sent().map(r => r.body);
  assert.strictEqual(chat.model, 'claude-sonnet-5-5');
  assert.strictEqual(vision.model, 'claude-sonnet-5-5');
  assert.strictEqual(chat.output_config.effort, 'medium');
  assert.strictEqual((src.match(/'claude-sonnet-5'/g) || []).length, 0, 'no call left on Sonnet 5');
});

run();
