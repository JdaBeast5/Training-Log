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
// v3.363 — Claude Haiku 4.5 -> Haiku 5.5 on the six quick calls, via
// AI_MODEL_FAST. Haiku 5.5 thinks by default and thinking spends from
// max_tokens, so each call sends effort 'low' and a raised ceiling (>= 1024).
// v3.364 — Sonnet 5.5 calls send fallbacks:'default' (beta
// server-side-fallback-2026-07-01) so a classifier decline can be re-run on
// another model; Haiku 5.5 has no server-side fallback and never gets it. A
// refusal is checked before content is read, so partial text is never shown
// as an answer. If the API rejects the beta field, the request is sent once
// more without it.
// v3.365+ — Structured outputs (output_config.format, json_schema) on the five
// JSON features, one per version, from one AI_JSON_SCHEMAS object. The API
// then guarantees the reply parses and has every field. Schemas are checked
// against the API's own rules (additionalProperties:false everywhere, no
// numeric/length constraints) and against each prompt's documented empty
// reply, so a schema can't drift from its prompt.
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
  `, [extractConst(src, 'AI_MODEL_DEFAULT'), extractConst(src, 'AI_MODEL_FAST'), extractConst(src, 'AI_FALLBACK_BETA'), extractFunction(src, 'withRefusalFallback'), extractConst(src, 'AI_JSON_SCHEMAS'), extractFunction(src, 'aiOutputConfig'), extractConst(src, 'AI_RETRY_STATUSES'), extractConst(src, 'AI_MAX_ATTEMPTS'), extractFunction(src, 'aiSleep'),
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

test('sabotage anchor (v3.363): exactly six real calls name AI_MODEL_FAST, each with low effort and a ceiling >= 1024', (assert)=>{
  // Line-based: a comment that quotes a call can't count as one.
  const code = src.split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');
  const calls = [...code.matchAll(/callClaude(Chat|Vision)\(([^;]*?), (\d+), AI_MODEL_FAST(?:, '(\w+)')?(?:, AI_JSON_SCHEMAS\.\w+)?\)/g)];
  assert.strictEqual(calls.length, 6, 'daily nudge, describe-a-meal, label photo, food photos, two weekly check-ins');
  for(const c of calls){
    assert.strictEqual(c[4], 'low', `effort on ${c[0].slice(0, 60)}`);
    assert.ok(Number(c[3]) >= 1024, `max_tokens ${c[3]} leaves room for thinking`);
  }
  assert.strictEqual((src.match(/claude-haiku-4-5/g) || []).length, 0, 'no call left on Haiku 4.5');
});

test('REAL invocation (v3.363): chat and vision send claude-haiku-5-5 with effort when called the way the fast call sites call them', async (assert)=>{
  const h = harness();
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1500, h.window.eval('AI_MODEL_FAST'), 'low');
  await h.window.callClaudeVision('k', ['AAAA'], 'read the label', 2048, h.window.eval('AI_MODEL_FAST'), 'low');
  await h.window.callClaudeVision('k', ['AAAA'], 'compare', 400);
  const [chat, vision, plain] = h.sent().map(r => r.body);
  for(const b of [chat, vision]){
    assert.strictEqual(b.model, 'claude-haiku-5-5');
    assert.strictEqual(b.output_config.effort, 'low');
  }
  assert.strictEqual(plain.output_config, undefined, 'a vision call that passes no effort sends no output_config');
});

test('REAL invocation (v3.364): Sonnet calls carry fallbacks:default and the beta header; Haiku calls carry neither', async (assert)=>{
  const h = harness();
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000, undefined, 'medium');
  await h.window.callClaudeVision('k', ['AAAA'], 'look', 1000);
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1500, 'claude-haiku-5-5', 'low');
  await h.window.callClaudeVision('k', ['AAAA'], 'label', 2048, 'claude-haiku-5-5', 'low');
  const [chat, vision, fastChat, fastVision] = h.sent();
  for(const r of [chat, vision]){
    assert.strictEqual(r.body.fallbacks, 'default');
    assert.strictEqual(r.headers['anthropic-beta'], 'server-side-fallback-2026-07-01');
  }
  for(const r of [fastChat, fastVision]){
    assert.ok(!('fallbacks' in r.body), 'Haiku 5.5: a fallback list is a 400 and default does nothing');
    assert.ok(!('anthropic-beta' in r.headers));
  }
});

test('REAL invocation (v3.364): a refusal with partial text is an error, not an answer', async (assert)=>{
  const h = harness();
  h.queue(ok([{ type: 'text', text: 'Here is how to' }], { stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'general_harms' } }));
  let msg = '';
  try{ await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000); }catch(e){ msg = e.message; }
  assert.match(msg, /declined/);
  assert.strictEqual(h.sent().length, 1, 'a refusal is not retried by the client');
});

test('REAL invocation (v3.364): if the API rejects the fallback field, the same request goes once more without it', async (assert)=>{
  const h = harness();
  h.queue(err(400, 'fallbacks: Extra inputs are not permitted'));
  h.queue(ok([{ type: 'text', text: 'the answer' }]));
  const reply = await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000, undefined, 'medium');
  assert.strictEqual(reply, 'the answer');
  const [first, second] = h.sent();
  assert.strictEqual(first.body.fallbacks, 'default');
  assert.ok(!('fallbacks' in second.body) && !('anthropic-beta' in second.headers), 'second try has neither');
  assert.strictEqual(second.body.output_config.effort, 'medium', 'everything else unchanged');
});

test('REAL invocation (v3.364): any other 400 is still an error, with no extra request', async (assert)=>{
  const h = harness();
  h.queue(err(400, 'messages: text content blocks must be non-empty'));
  let msg = '';
  try{ await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000); }catch(e){ msg = e.message; }
  assert.match(msg, /non-empty/);
  assert.strictEqual(h.sent().length, 1);
});

// A small JSON-schema checker for exactly the keywords these schemas use.
function validates(schema, v){
  if(schema.anyOf) return schema.anyOf.some(s => validates(s, v));
  if(schema.enum && !schema.enum.includes(v)) return false;
  switch(schema.type){
    case 'object':
      if(!v || typeof v !== 'object' || Array.isArray(v)) return false;
      if(!(schema.required || []).every(k => k in v)) return false;
      if(Object.keys(v).some(k => !(k in schema.properties))) return false;
      return Object.entries(v).every(([k, x]) => validates(schema.properties[k], x));
    case 'array': return Array.isArray(v) && v.every(x => validates(schema.items, x));
    case 'string': return typeof v === 'string';
    case 'number': return typeof v === 'number';
    case 'null': return v === null;
    default: return true;
  }
}
function apiRuleViolations(schema, path){
  const out = [];
  for(const bad of ['minimum', 'maximum', 'multipleOf', 'minLength', 'maxLength', 'exclusiveMinimum', 'exclusiveMaximum', 'minItems', 'maxItems']){
    if(bad in schema) out.push(`${path}: ${bad} is not supported`);
  }
  if(schema.type === 'object'){
    if(schema.additionalProperties !== false) out.push(`${path}: additionalProperties must be false`);
    const keys = Object.keys(schema.properties || {}).sort().join();
    if((schema.required || []).slice().sort().join() !== keys) out.push(`${path}: every property is required`);
    for(const [k, s] of Object.entries(schema.properties || {})) out.push(...apiRuleViolations(s, `${path}.${k}`));
  }
  if(schema.items) out.push(...apiRuleViolations(schema.items, `${path}[]`));
  for(const s of schema.anyOf || []) out.push(...apiRuleViolations(s, path));
  return out;
}
const SCHEMAS = (()=>{ const h = harness(); return JSON.parse(JSON.stringify(h.window.eval('AI_JSON_SCHEMAS'))); })();
// The real call line(s) inside a named function, comments excluded.
const callLines = (fn, needle) => extractFunction(src, fn).split('\n').filter(l => l.includes(needle) && !/^\s*\/\//.test(l));

test('REAL source (v3.365): every schema follows the structured-output rules', (assert)=>{
  assert.ok(Object.keys(SCHEMAS).length >= 1, 'anchor');
  for(const [name, schema] of Object.entries(SCHEMAS)) assert.deepStrictEqual(apiRuleViolations(schema, name), []);
});

test('REAL invocation (v3.365): a schema rides in output_config.format next to effort, on chat and vision', async (assert)=>{
  const h = harness();
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'eggs' }], 2048, 'claude-haiku-5-5', 'low', h.window.eval('AI_JSON_SCHEMAS.foodItems'));
  await h.window.callClaudeVision('k', ['AAAA'], 'meal', 3000, 'claude-haiku-5-5', undefined, h.window.eval('AI_JSON_SCHEMAS.foodItems'));
  await h.window.callClaudeChat('k', 'sys', [{ role: 'user', content: 'hi' }], 1000);
  const [chat, vision, plain] = h.sent().map(r => r.body);
  assert.strictEqual(chat.output_config.effort, 'low');
  assert.deepStrictEqual(chat.output_config.format, { type: 'json_schema', schema: SCHEMAS.foodItems });
  assert.deepStrictEqual(vision.output_config, { format: { type: 'json_schema', schema: SCHEMAS.foodItems } }, 'no effort key when none is passed');
  assert.strictEqual(plain.output_config, undefined, 'a call with neither sends no output_config');
});

test('sabotage anchor (v3.365): describe-a-meal sends the foodItems schema, and its prompt\'s empty reply fits it', (assert)=>{
  const lines = callLines('submitFoodDescription', 'callClaudeChat(');
  assert.strictEqual(lines.length, 1);
  assert.match(lines[0], /AI_MODEL_FAST, 'low', AI_JSON_SCHEMAS\.foodItems\)/);
  assert.ok(validates(SCHEMAS.foodItems, { items: [] }), 'the prompt\'s "nothing edible" reply');
  assert.ok(validates(SCHEMAS.foodItems, { items: [{ name: 'Eggs', cal: 140, pro: 12, fat: 10, carb: 1, sodium: 140, fiber: 0 }] }));
  assert.ok(!validates(SCHEMAS.foodItems, { items: [{ name: 'Eggs', cal: 140 }] }), 'a missing field fails');
});

test('sabotage anchor (v3.366): food photos send the same foodItems schema, one request per photo', (assert)=>{
  const lines = callLines('handlePhotoLogUpload', 'callClaudeVision(');
  assert.strictEqual(lines.length, 1);
  assert.match(lines[0], /AI_MODEL_FAST, 'low', AI_JSON_SCHEMAS\.foodItems\)/);
  assert.ok(validates(SCHEMAS.foodItems, { items: [] }), 'the prompt\'s "nothing edible" reply');
});

test('sabotage anchor (v3.367): the label scan sends the nutritionLabel schema, which keeps null distinct from 0', (assert)=>{
  const lines = src.split('\n').filter(l => /callClaudeVision\(apiKey, \[base64\], prompt, 2048,/.test(l) && !/^\s*\/\//.test(l));
  assert.strictEqual(lines.length, 1, 'the one label call');
  assert.match(lines[0], /AI_MODEL_FAST, 'low', AI_JSON_SCHEMAS\.nutritionLabel\)/);
  const unreadable = { name: '', cal: 0, pro: 0, fat: 0, carb: 0, sodium: null, fiber: null, calcium: null, iron: null, potassium: null, folate: null };
  assert.ok(validates(SCHEMAS.nutritionLabel, unreadable), 'the prompt\'s "can\'t read it" reply');
  assert.ok(validates(SCHEMAS.nutritionLabel, Object.assign({}, unreadable, { name: 'Oats', cal: 150, sodium: 0, fiber: 4 })), 'a real 0 is allowed');
  assert.ok(!validates(SCHEMAS.nutritionLabel, Object.assign({}, unreadable, { cal: null })), 'the four core numbers are never null');
});

test('sabotage anchor (v3.368): the recipe finder sends the recipes schema', (assert)=>{
  const lines = callLines('submitRecipeSearch', 'callClaudeChat(');
  assert.strictEqual(lines.length, 1);
  assert.match(lines[0], /undefined, 'medium', AI_JSON_SCHEMAS\.recipes\)/);
  assert.ok(validates(SCHEMAS.recipes, { recipes: [] }), 'the prompt\'s "incompatible with your diet" reply');
  assert.ok(validates(SCHEMAS.recipes, { recipes: [{ name: 'Teriyaki chicken', description: 'Leaner, baked.', cal: 520, pro: 45, fat: 14, carb: 50, ingredients: ['chicken thighs', 'soy sauce'] }] }));
  assert.ok(!validates(SCHEMAS.recipes, { recipes: [{ name: 'x', description: '', cal: 1, pro: 1, fat: 1, carb: 1, ingredients: [3] }] }), 'ingredients are strings');
});

test('sabotage anchor (v3.369): supplement recommendations send the supplements schema, its enums match the app\'s own tables', (assert)=>{
  const lines = callLines('submitSupplementRequest', 'callClaudeChat(');
  assert.strictEqual(lines.length, 1);
  assert.match(lines[0], /undefined, 'medium', AI_JSON_SCHEMAS\.supplements\)/);
  const tables = runJsdom('', '', [extractConst(src, 'SUPPLEMENT_EVIDENCE_LABELS'), extractConst(src, 'SUPPLEMENT_FREQUENCY_META'),
    'window.__keys = JSON.stringify([Object.keys(SUPPLEMENT_EVIDENCE_LABELS), Object.keys(SUPPLEMENT_FREQUENCY_META)]);']).window;
  const [evidence, frequency] = JSON.parse(tables.__keys);
  const rec = SCHEMAS.supplements.properties.recommendations.items.properties;
  assert.deepStrictEqual(rec.evidence.enum, evidence, 'every evidence level the app can label, and no other');
  assert.deepStrictEqual(rec.frequency.enum, frequency, 'every frequency My Supplements can track, and no other');
  assert.ok(validates(SCHEMAS.supplements, { recommendations: [], note: 'Not something this app can responsibly recommend.' }), 'the prompt\'s refusal reply');
  assert.ok(!validates(SCHEMAS.supplements, { recommendations: [{ name: 'Creatine', evidence: 'strong', why: '', typicalDose: '3-5 g', timing: 'any', frequency: 'daily', caution: null }], note: '' }), 'an evidence level the app has no label for fails');
});

run();
