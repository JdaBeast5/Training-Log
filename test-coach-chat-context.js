'use strict';
// What coach chat actually sends to the API (coachChatApiMessages).
//
// v3.370 — The last 10 messages always start on a question. The history
// alternates question/reply and ends on the question just asked, so from the
// sixth question on a plain slice(-10) began with a coach reply; the Messages
// API requires the first message to be the user's.
// v3.371 — The app's own notices (no key, couldn't reach the coach) are marked
// notice:true: shown in the chat, never sent as if the coach had said them.
const { readIndexSource, extractFunction, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-coach-chat-context.js');
const fnSrc = extractFunction(src, 'coachChatApiMessages');

function chat(n){
  const h = [];
  for(let i = 1; i <= n; i++){ h.push({ role: 'user', content: `q${i}` }); if(i < n) h.push({ role: 'assistant', content: `a${i}` }); }
  return h;
}
const send = history => runSandbox([fnSrc], `__capture.push(coachChatApiMessages(${JSON.stringify(history)}));`)[0];

test('anchor (v3.370): sendCoachChatMessage sends coachChatApiMessages(coachChatHistory), one real call', (assert)=>{
  const body = extractFunction(src, 'sendCoachChatMessage');
  assert.strictEqual((body.match(/coachChatApiMessages\(coachChatHistory\)/g) || []).length, 1);
  assert.doesNotMatch(body, /coachChatHistory\.slice\(/, 'no second, unguarded window');
});

test('REAL invocation (v3.370): every conversation length sends a window that starts with a question and ends with the newest one', (assert)=>{
  for(let n = 1; n <= 12; n++){
    const msgs = send(chat(n));
    assert.strictEqual(msgs[0].role, 'user', `${n} questions: first message is the user's`);
    assert.strictEqual(msgs[msgs.length - 1].content, `q${n}`, `${n} questions: the newest question is last`);
    assert.ok(msgs.length <= 10);
  }
});

test('REAL invocation (v3.370): the sixth question is where slice(-10) broke, and now drops the stray reply', (assert)=>{
  const h = chat(6);
  assert.strictEqual(h.slice(-10)[0].role, 'assistant', 'anchor: the old window really started on a reply');
  const msgs = send(h);
  assert.deepStrictEqual(msgs.map(m => m.content), ['q2', 'a2', 'q3', 'a3', 'q4', 'a4', 'q5', 'a5', 'q6']);
});

test('anchor (v3.371): both notice pushes in sendCoachChatMessage are marked notice:true, and the reply is not', (assert)=>{
  const body = extractFunction(src, 'sendCoachChatMessage');
  const pushes = body.match(/coachChatHistory\.push\(\{[^}]*/g);
  assert.strictEqual(pushes.length, 4, 'anchor: no-key notice, question, reply, error notice');
  assert.strictEqual(pushes.filter(p => /notice:true/.test(p)).length, 2);
  assert.ok(pushes.some(p => /content: reply\.trim\(\)/.test(p) && !/notice/.test(p)), 'a real reply is sent back as context');
});

test('REAL invocation (v3.371): a failed question, its notice and the retry send as question, question — no fake coach reply', (assert)=>{
  const h = [
    { role: 'user', content: 'q1' }, { role: 'assistant', content: 'a1' },
    { role: 'user', content: 'q2' }, { role: 'assistant', notice: true, content: "Couldn't reach the coach: timeout. Check your API key and connection, then try again." },
    { role: 'user', content: 'q2 again' },
  ];
  const msgs = send(h);
  assert.deepStrictEqual(msgs.map(m => m.content), ['q1', 'a1', 'q2', 'q2 again']);
  assert.ok(msgs.every(m => !('notice' in m)), 'only role and content go to the API');
});

test('REAL invocation (v3.371): a chat that is only a no-key notice and a question sends just the questions', (assert)=>{
  const msgs = send([{ role: 'user', content: 'hi' }, { role: 'assistant', notice: true, content: 'Add your Anthropic API key' }, { role: 'user', content: 'hi' }]);
  assert.deepStrictEqual(msgs.map(m => m.role), ['user', 'user']);
});

// ---- v3.542 (BL-65): the coach's volume line matches the program gate.
// Real invocation of goalVolumeContextLine with the real goalVolumeAdjustment,
// volumeModifiersApply, VOLUME_MODIFIER_PROGRAMS and isCustomProgramKey.
const { extractConst } = require('./testHelpers.js');
const lineOf = (goal, program) => runSandbox([extractConst(src, 'VOLUME_MODIFIER_PROGRAMS'), extractConst(src, 'CUSTOM_PROGRAM_PREFIX'),
  ...['isCustomProgramKey', 'volumeModifiersApply', 'goalVolumeAdjustment', 'goalVolumeContextLine'].map(f => extractFunction(src, f))],
  `__capture.push(goalVolumeContextLine(${JSON.stringify(goal)}, ${JSON.stringify(program)}));`)[0];
// v3.518's lines, copied as the snapshot.
const HYP_V3518 = 'Training volume: the app is adding one set per exercise to their sessions because their goal is muscle gain (ACSM 2026 guidance — hypertrophy is driven mainly by weekly volume, ~10+ sets per muscle group). Factor that in rather than suggesting they add more volume on top without reason.';
const LOSE_V3518 = "Training volume: deliberately left unchanged despite the deficit. Cutting training volume while eating less is the common instinct and the evidence points the other way — maintaining the stimulus is what protects lean mass. Don't advise reducing volume just because they're cutting.";

test('BL-65 criterion 1: on a gated program (oly, medical, climbing) the line says the program keeps its written sets, never "adding one set"', (assert)=>{
  for(const [g, p] of [['gain', 'oly'], ['gain', 'medical'], ['performance', 'climbing'], ['leanbulk', 'running']]){
    const l = lineOf(g, p);
    assert.match(l, /keeps its written set counts/, g + '/' + p);
    assert.doesNotMatch(l, /adding one set|capping|caps compound/, g + '/' + p);
  }
});

test('BL-65 criterion 2: gain on Strength & Size, and on a custom program, is byte-identical to v3.518', (assert)=>{
  assert.strictEqual(lineOf('gain', 'strength'), HYP_V3518);
  assert.strictEqual(lineOf('gain', 'custom:abc'), HYP_V3518);
});

test('BL-65 criterion 3: performance on Strength & Size names the hypertrophy-range cap and that heavy work keeps its sets', (assert)=>{
  const l = lineOf('performance', 'strength');
  assert.match(l, /caps compound lifts prescribed above about 5 reps at 3 working sets/);
  assert.match(l, /Heavy work \(about 5 reps or fewer\) keeps its written sets/);
  // Review fix: on Powerlifting and Powerbuilding nothing is capped, so no cap is described.
  for(const p of ['powerlifting', 'powerbuilding']){
    const pl = lineOf('performance', p);
    assert.match(pl, /keeps every written set count/, p);
    assert.doesNotMatch(pl, /caps compound/, p);
  }
});

test('BL-65 criterion 4: lose and recomp equal v3.518 on any program; maintain is empty', (assert)=>{
  for(const p of ['strength', 'oly', 'medical', 'custom:x']){
    assert.strictEqual(lineOf('lose', p), LOSE_V3518, p);
    assert.strictEqual(lineOf('recomp', p), LOSE_V3518, p);
  }
  assert.strictEqual(lineOf('maintain', 'strength'), '');
});

test('BL-65 criterion 5: buildCoachChatContext makes exactly one goalVolumeContextLine call, with activeProgram, and has no volume literal of its own (comments stripped)', (assert)=>{
  const body = extractFunction(src, 'buildCoachChatContext').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.strictEqual((body.match(/goalVolumeContextLine\(/g) || []).length, 1);
  assert.strictEqual((body.match(/goalVolumeContextLine\(userProfile\?\.goal, activeProgram\)/g) || []).length, 1);
  assert.doesNotMatch(body, /adding one set/);
  assert.doesNotMatch(body, /goalVolumeAdjustment\(/);
});

run();
