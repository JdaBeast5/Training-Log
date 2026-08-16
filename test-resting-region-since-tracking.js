'use strict';
// Behavioral coverage for a bug found during a dedicated Care audit:
// addRestingRegion/removeRestingRegion wrapped BOTH the read of
// 'resting-regions-since' AND the write that follows it in one try/catch.
// window.storage.get REJECTS (throws "not found") for a key that has never
// been written — it does not resolve null/undefined, the same real
// contract this app's own WHATS_NEW baseline logic already had to learn
// the hard way (see test-whats-new.js's own REGRESSION test for the same
// fact). Since this was the ONLY code path that ever wrote
// 'resting-regions-since', the very first read (before the key existed)
// threw, the catch swallowed it, and the set() that would have CREATED the
// key never ran — meaning the key could never be created at all, for any
// user, ever. getStaleRestingRegionInsight's staleness reminder could
// never have fired for anyone.
//
// Uses a storage stub matching the real buildNamespacedStorage contract
// exactly (get() throws for a never-set key) — a stub that resolved
// null/undefined instead would pass even the broken code, proving nothing.
const { readIndexSource, extractFunction, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-resting-region-since-tracking.js');

const chunks = [
  extractFunction(src, 'getRestingRegions'),
  extractFunction(src, 'setRestingRegions'),
  extractFunction(src, 'addRestingRegion'),
  extractFunction(src, 'removeRestingRegion'),
];

function globalsWithStorageStub(){
  return `
    window = {};
    getTodayKey = ()=> '2026-06-15';
    var __store = {};
    window.storage = {
      get: async (k)=>{ if(!(k in __store)) throw new Error('not found'); return {key:k, value:__store[k]}; },
      set: async (k,v)=>{ __store[k]=v; return {key:k, value:v}; },
    };
  `;
}

test('REAL invocation: marking the FIRST-EVER resting region on a brand-new profile (resting-regions-since never written) actually creates the key with today\'s date', async (assert)=>{
  const captured = await runSandboxAsync(chunks, `
    ${globalsWithStorageStub()}
    await addRestingRegion('Shoulder');
    const raw = await window.storage.get('resting-regions-since');
    __capture.push(JSON.parse(raw.value));
  `);
  assert.deepStrictEqual(captured[0], {Shoulder: '2026-06-15'}, 'the very first region marked resting on a fresh profile must get a real since-date — this is the exact bug: the key could never be created before this fix');
});

test('REAL invocation: a second region added later is appended, and the first region\'s existing date is never overwritten', async (assert)=>{
  const captured = await runSandboxAsync(chunks, `
    ${globalsWithStorageStub()}
    await addRestingRegion('Shoulder');
    getTodayKey = ()=> '2026-06-20'; // time passes
    await addRestingRegion('Knee');
    getTodayKey = ()=> '2026-06-25'; // re-marking an already-resting region must not reset its clock
    await addRestingRegion('Shoulder');
    const raw = await window.storage.get('resting-regions-since');
    __capture.push(JSON.parse(raw.value));
  `);
  assert.deepStrictEqual(captured[0], {Shoulder: '2026-06-15', Knee: '2026-06-20'}, 'Shoulder\'s original start date must survive being re-marked, and Knee must get its own real date');
});

test('REAL invocation: removing a region deletes its since-entry, even when the key had never existed before (no-op, not a throw)', async (assert)=>{
  const captured = await runSandboxAsync(chunks, `
    ${globalsWithStorageStub()}
    // No prior addRestingRegion call at all — resting-regions-since has
    // never been written. Removing a region that was never marked resting
    // must not throw, matching the real UI's ability to call this
    // unconditionally.
    let threw = false;
    try{ await removeRestingRegion('Shoulder'); }catch(e){ threw = true; }
    __capture.push(threw);
  `);
  assert.strictEqual(captured[0], false, 'removing a region must never throw, even against a completely fresh profile');
});

test('REAL invocation: removing one region leaves a real sibling since-date untouched', async (assert)=>{
  const captured = await runSandboxAsync(chunks, `
    ${globalsWithStorageStub()}
    await addRestingRegion('Shoulder');
    await addRestingRegion('Knee');
    await removeRestingRegion('Shoulder');
    const raw = await window.storage.get('resting-regions-since');
    __capture.push(JSON.parse(raw.value));
  `);
  assert.deepStrictEqual(captured[0], {Knee: '2026-06-15'}, 'Shoulder\'s entry must be gone; Knee\'s must be untouched');
});

run();
