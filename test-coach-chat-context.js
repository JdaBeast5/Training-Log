'use strict';
// What coach chat actually sends to the API (coachChatApiMessages).
//
// v3.370 — The last 10 messages always start on a question. The history
// alternates question/reply and ends on the question just asked, so from the
// sixth question on a plain slice(-10) began with a coach reply; the Messages
// API requires the first message to be the user's.
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

run();
