'use strict';
// Behavioral coverage for a real, previously-unverified fix: video form-
// feedback frame extraction hung forever on a real iPhone with a perfectly
// good clip — always on frame 1, which was the tell that nothing was wrong
// with any particular timestamp. Root cause: seeking from `loadedmetadata`
// (readyState 1 — dimensions/duration known, but NOT A SINGLE FRAME
// decoded) made iOS Safari's `seeked` event never fire at all, so the very
// first seek sat until its timeout and the whole extraction failed.
//
// The fix has two required parts, and the code's own comment is explicit
// that both are needed, not either one alone:
//   1. Wait for readyState >= 2 (decoded data available to seek within)
//      before issuing any seek, with its own bounded fallback wait rather
//      than hanging indefinitely if 'loadeddata' itself never fires.
//   2. Actually play() then immediately pause() the video — muted +
//      playsInline autoplay is permitted without a user gesture, and iOS
//      won't reliably serve frames to a canvas from an element it has
//      never played — to "wake the decoder."
// Plus, independently, the per-frame seek listens for BOTH 'seeked' and
// 'timeupdate' (some iOS builds move the playhead and repaint without ever
// dispatching 'seeked' — either event means a frame is actually there to
// grab), backstopped by a real per-frame timeout with the specific,
// user-facing "Got stuck reading frame N of M" error.
//
// jsdom has no real media pipeline — HTMLVideoElement never decodes
// anything, so readyState/seeked/timeupdate can't be driven through a real
// invocation the way this bug actually manifested. Same situation as this
// project's other CSS-layout-dependent fixes: proven at the source level,
// against real extracted code with comments stripped (this function's own
// prose repeatedly discusses "seeked" and "readyState 1" in ways a naive
// substring match could mistake for the real fix), using regexes precise
// enough to match only the actual call sites this fix depends on.
const { readIndexSource, extractFunction, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-video-frame-extraction-ios-fix.js');

const fnSrc = extractFunction(src, 'extractVideoFrames');
// Comments in this function discuss "seeked"/"readyState 1"/"timeupdate" in
// prose that could otherwise defeat a naive assertion — stripped before any
// check below runs, same discipline test-sticky-day-header-overlap.js
// established for the identical trap.
const codeOnly = fnSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

test('sabotage-relevant: extractVideoFrames waits for readyState >= 2 before doing anything else, with its own bounded fallback (not an indefinite hang if loadeddata never fires)', (assert)=>{
  assert.match(codeOnly, /if\(video\.readyState\s*<\s*2\)\{/, 'must gate on readyState < 2 — proceeding at readyState 1 (metadata only, nothing decoded) is the actual root cause this fix addresses');
  assert.match(codeOnly, /video\.addEventListener\('loadeddata',\s*onData\)/, 'must actually wait for a real loadeddata event, not just assume readyState will advance');
  assert.match(codeOnly, /setTimeout\(\(\)=>\{\s*video\.removeEventListener\('loadeddata',\s*onData\);\s*res\(\);\s*\},\s*4000\)/, 'the readyState wait must have its own timeout — an indefinite hang here would just move the original bug earlier');
});

test('sabotage-relevant: extractVideoFrames actually plays and pauses the video to "wake the decoder" before seeking', (assert)=>{
  assert.match(codeOnly, /await video\.play\(\); video\.pause\(\);/, 'the play()/pause() wake-up is the fix\'s own documented second required half — without it, readyState alone was not sufficient (per the comment this test strips, both were needed)');
});

test('sabotage-relevant: each per-frame seek listens for BOTH seeked and timeupdate, not just seeked alone', (assert)=>{
  assert.match(codeOnly, /video\.addEventListener\('seeked',\s*onSeeked\)/, 'must still listen for the normal seeked event');
  assert.match(codeOnly, /video\.addEventListener\('timeupdate',\s*onSeeked\)/, 'must ALSO listen for timeupdate — this is the fallback for iOS builds that move the playhead and repaint without ever dispatching seeked, the exact failure this fix exists for');
});

test('sabotage-relevant: a real, bounded per-frame timeout produces the specific "Got stuck reading frame" error rather than hanging or failing silently', (assert)=>{
  const m = codeOnly.match(/setTimeout\(\(\)=> finish\(\(\)=> rej\(new Error\(\s*`([^`]+)`/);
  assert.ok(m, 'the per-frame timeout must reject with a real, specific Error — not resolve silently or leave the promise pending');
  assert.match(m[1], /Got stuck reading frame \$\{i\+1\} of \$\{times\.length\}/, 'the error must name which frame stalled, not a generic message — that specificity is what made the original bug diagnosable at all ("it always failed on frame 1" was the actual clue)');
  assert.match(codeOnly, /\)\)\),\s*6000\);/, 'the per-frame timeout must be a real, finite duration');
});

test('regression guard: only one of {a real frame event, the timeout} can ever resolve a given frame — both are wired through the same done-flag guard', (assert)=>{
  assert.match(codeOnly, /let done = false;/, 'a real guard flag must exist');
  assert.match(codeOnly, /const finish = \(fn\)=>\{\s*if\(done\) return; done = true;/, 'the guard must actually gate on itself — without this, a seeked/timeupdate race with the timeout could double-resolve or double-reject the same frame promise');
});

run();
