'use strict';
// v3.634 (BL-50, SAF-9): the AI prompts know the clinical style. Both prompts
// got only "Active program: Medically Modified", never the style, so
// Cross-Metric Insights could tell a prenatal or ACL user to PUSH.
//
// Real invocation: the real buildCrossMetricInsightsContext (its data
// fetchers stubbed to a small log) and the real generateCrossMetricInsights,
// through the real callClaudeChat and anthropicRequest, with fetch stubbed at
// the network boundary (as test-ai-cross-metric-effort-fix.js does), plus the
// real clinicalAiStyle over the real MEDICAL_STYLES and programs. The coach
// chat runs the real buildCoachChatContext. Criterion 2 compares the strength
// prompt with a snapshot taken from v3.633's source (STRENGTH_SNAPSHOT below).
// Sabotage: drop the style from clinicalAiStyle, and criterion 1 fails.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-ai-clinical-context.js');

function harness(source, {program, style, reply = 'MAINTAIN'}){
  const fx = name => extractFunction(source, name);
  const cx = name => extractConst(source, name);
  const has = name => new RegExp(`^(?:async )?function ${name}\\(`, 'm').test(source);
  const { window } = runJsdom('<button id="genCrossInsightsBtn">Generate</button><div id="crossInsightsResult"></div>', `
    window.__requests = [];
    window.fetch = (url, opts) => { window.__requests.push(JSON.parse(opts.body)); return Promise.resolve({ok: true, json: async () => ({content: [{type: 'text', text: ${JSON.stringify(reply)} + '\\n\\nSteady.'}]})}); };
    window.storage = {get: async k => k === 'ai-api-key' ? {value: 'fake-key'} : (() => { throw new Error('not found'); })(), set: async () => {}};
    var activeProgram = ${JSON.stringify(program)}, activeMedicalStyle = ${JSON.stringify(style || 'obesity')};
    var userProfile = {goal: 'maintain'}, weightUnit = 'lb', targets = {cal: 2400, pro: 160};
    function getCoachPersona(){ return 'a strength coach'; }
    // The log: two weigh-ins, three food days (two lines), one PR — four data lines.
    async function fetchAllWeightEntries(){ return [{date: '2026-11-01', weight: 180}, {date: '2026-11-15', weight: 181}]; }
    async function fetchFoodDays(){ return {'2026-11-10': {cal: 2300, pro: 150}, '2026-11-11': {cal: 2400, pro: 160}, '2026-11-12': {cal: 2500, pro: 170}}; }
    async function reconstructAllPRs(){ return [{name: 'Bench Press', weight: 185, reps: 5, date: '2026-11-14'}]; }
    async function fetchSleepEntries(){ throw new Error('none'); } async function fetchWaterDays(){ throw new Error('none'); }
    async function computeWeeklyRpeAvg(){ throw new Error('none'); } async function getInjuryLog(){ throw new Error('none'); }
    async function readWorkoutCorpus(){ throw new Error('none'); } function computeWaterTarget(){ return 96; }`,
    [cx('programs'), cx('MEDICAL_STYLES'), cx('GOAL_LABELS'), cx('AI_MODEL_DEFAULT'), cx('AI_FALLBACK_BETA'), fx('withRefusalFallback'), cx('AI_JSON_SCHEMAS'), fx('aiOutputConfig'),
      cx('AI_MAX_ATTEMPTS'), fx('aiSleep'), fx('anthropicRequest'), fx('callClaudeChat'), cx('AI_PROMPT_VERSION'), fx('aiFingerprint'), fx('aiCachedCall'),
      fx('escapeHtml'), cx('ICONS'), fx('icon'), fx('aiKeySetupPrompt'), fx('getApiKey'),
      fx('trimUnitNum'), fx('toDisplayWeight'), cx('LB_PER_KG'), fx('fmtWeight'),
      ...(has('clinicalAiStyle') ? [fx('clinicalAiStyle')] : []),
      fx('buildCrossMetricInsightsContext'), fx('generateCrossMetricInsights'),
      'window.generateCrossMetricInsights = generateCrossMetricInsights; window.buildCrossMetricInsightsContext = buildCrossMetricInsightsContext;']);
  return window;
}
async function insightsRequest(opts, source = src){
  const w = harness(source, opts);
  await w.generateCrossMetricInsights();
  if(w.__requests.length !== 1) throw new Error('expected one request, got ' + w.__requests.length + ': ' + w.document.getElementById('crossInsightsResult').textContent);
  return w.__requests[0];
}

// The strength-program system prompt at v3.633, for this test's fixed log
// (taken by running the same harness over that version's index.html).
const STRENGTH_SNAPSHOT = require('./test-ai-clinical-context.snapshot.json');

test('criterion 1: hypertension style: the prompt names the style and asks for MAINTAIN or DELOAD, never offering PUSH', async (assert)=>{
  const req = await insightsRequest({program: 'medical', style: 'hypertension'});
  const sys = typeof req.system === 'string' ? req.system : JSON.stringify(req.system);
  assert.ok(sys.includes('Hypertension / Cardiac-Modified'), 'the style label');
  assert.ok(sys.includes('Metabolic & Cardiac: Hypertension / Cardiac-Modified'), 'with its group');
  assert.ok(sys.includes('First line only the word MAINTAIN or DELOAD'));
  assert.ok(!sys.includes('PUSH, MAINTAIN, or DELOAD'), 'the three-way choice is gone');
  assert.ok(!/PUSH if/.test(sys), 'no rule for when to push');
  assert.ok(sys.includes('care team'));
  assert.ok(!JSON.stringify(req.messages).includes('push/'), 'the user turn asks for maintain/deload');
});

test('criterion 2: the strength prompt and user turn are byte-identical to v3.633', async (assert)=>{
  const req = await insightsRequest({program: 'strength'});
  assert.strictEqual(JSON.stringify(req.system), JSON.stringify(STRENGTH_SNAPSHOT.system));
  assert.strictEqual(JSON.stringify(req.messages), JSON.stringify(STRENGTH_SNAPSHOT.messages));
  assert.ok(!JSON.stringify(req.system).includes('Clinical style'), 'anchor: nothing clinical');
});

test('criterion 4 alongside: the payload keeps effort medium and max_tokens 5000, one fetch per call, on a clinical style too', async (assert)=>{
  const req = await insightsRequest({program: 'medical', style: 'prenatal'});
  assert.strictEqual(req.max_tokens, 5000);
  assert.strictEqual(JSON.stringify(req.output_config), JSON.stringify({effort: 'medium'}));
});

test('each style reaches the prompt, and a style change is a different cached question', async (assert)=>{
  const acl = await insightsRequest({program: 'medical', style: 'rehabAcl'});
  assert.ok(JSON.stringify(acl.system).includes('Injury Rehab: ACL (Post-Surgical or Non-Surgical)'));
  const w = harness(src, {program: 'medical', style: 'rehabAcl'});
  const ctx = await w.buildCrossMetricInsightsContext();
  assert.match(ctx.split('\n')[0], / Clinical style: Injury Rehab: ACL \(Post-Surgical or Non-Surgical\)\.$/, 'on the header line, which the fingerprint covers');
  const plain = await harness(src, {program: 'strength'}).buildCrossMetricInsightsContext();
  const dataLines = c => c.split('\n').filter(l => l.trim()).length - 1;
  assert.strictEqual(dataLines(ctx), dataLines(plain), 'and it adds no data line (the 3-line gate counts the same)');
});

test('a PUSH that slips through on a clinical style is shown as Maintain; on strength it still shows Push', async (assert)=>{
  const clinical = harness(src, {program: 'medical', style: 'prenatal', reply: 'PUSH'});
  await clinical.generateCrossMetricInsights();
  const shown = clinical.document.getElementById('crossInsightsResult').textContent;
  assert.match(shown, /^Maintain/);
  assert.doesNotMatch(shown, /Push/);
  const strength = harness(src, {program: 'strength', reply: 'PUSH'});
  await strength.generateCrossMetricInsights();
  assert.match(strength.document.getElementById('crossInsightsResult').textContent, /Push — recovery signals support training harder/);
});

// --- the coach chat ---
// The real buildCoachChatContext, its data sources stubbed to empty.
async function coachPrompt(program, style){
  const { window } = runJsdom('', `
    var activeProgram = ${JSON.stringify(program)}, activeMedicalStyle = ${JSON.stringify(style || 'obesity')};
    var userProfile = {goal: 'maintain'}, weightUnit = 'lb', targets = {cal: 2400, pro: 160};
    function getCoachPersona(){ return 'a strength coach.'; }
    const none = async () => { throw new Error('none'); };
    var fetchAllWeightEntries = none, fetchAllMeasurements = none, fetchFoodDays = none, fetchPainDays = none,
        fetchSleepEntries = none, fetchWaterDays = none, reconstructAllPRs = none;
    async function computeStreak(){ return 0; } function describeDietaryFlags(){ return ''; }
    async function getCurrentTrendStatus(){ return null; } async function getDeficitGuardrailInsight(){ return null; }
    function goalVolumeContextLine(){ return ''; }`,
    [extractConst(src, 'programs'), extractConst(src, 'MEDICAL_STYLES'), extractConst(src, 'GOAL_LABELS'), extractConst(src, 'DIET_PREF_LABELS'),
     extractFunction(src, 'trimUnitNum'), extractFunction(src, 'toDisplayWeight'), extractConst(src, 'LB_PER_KG'), extractFunction(src, 'fmtWeight'),
     extractFunction(src, 'clinicalAiStyle'), extractFunction(src, 'buildCoachChatContext'),
     'window.buildCoachChatContext = buildCoachChatContext;']);
  return window.buildCoachChatContext();
}

test('criterion 3: the real coach prompt for a medical style carries the style and "care team" on the program line', async (assert)=>{
  const prompt = await coachPrompt('medical', 'rehabAcl');
  const line = prompt.split('\n').find(l => l.startsWith('- Active program:'));
  assert.ok(line, 'anchor: the program line');
  assert.ok(line.includes('clinical style: Injury Rehab: ACL (Post-Surgical or Non-Surgical)'));
  assert.ok(line.includes('care team'));
  assert.ok(line.includes('beyond that'), 'bounded by what the program prescribes, so it does not forbid the program\'s own progression');
});

test('the coach prompt off the medical program has no clinical note, and its program line is just the program', async (assert)=>{
  const prompt = await coachPrompt('strength');
  assert.ok(prompt.includes('- Active program: Strength & Size\n'));
  assert.ok(!prompt.includes('clinical style'));
  assert.ok(!prompt.includes('care team'));
});

run();
