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

run();
