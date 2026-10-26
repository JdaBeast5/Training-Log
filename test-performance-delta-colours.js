'use strict';
// v3.322 (owner OK'd the fix flagged in HANDOFF-v59). A lift's weight
// change, the estimated-max trend and the distance trend borrowed bodyweight's
// .w-up (red) / .w-down (green), so getting stronger or going farther showed
// red. They now use .perf-up (green) / .perf-down (muted). Bodyweight keeps
// .w-up/.w-down: there, the colours are unchanged.
const fs = require('fs');
const path = require('path');
const { readIndexSource, extractFunction, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CSS = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const { test, run } = makeRunner('test-performance-delta-colours.js');

function progress(firstW, lastW){
  return runJsdom(`<style>${CSS}</style><div id="exerciseProgress"></div>`, `
    var weightUnit = 'lb';
    const fmtWeight = lb => lb + ' lb', toDisplayWeight = lb => lb;
    const readExCorpus = async () => [1];
    const groupCorpusByExercise = () => [{name:'Bench Press', exDef:{sets:'3×8'}, log:[{sets:[{weight:${firstW}, reps:5}]}, {sets:[{weight:${lastW}, reps:5}]}]}];
    const topSetOf = e => e.sets[0], maxWeightEver = () => ${Math.max(firstW, lastW)}, volumeOf = () => 1000, estimated1RM = () => 200;
    const describeExercisePlaces = () => 'Day 1', reconstructAllPRs = async () => [];
    const renderCollapsibleList = (el, items) => { el.innerHTML = items.join(''); }, icon = () => '';`,
    [extractFunction(src, 'escapeHtml'), extractFunction(src, 'trimUnitNum'), extractFunction(src, 'parseTopRep'), extractFunction(src, 'renderExerciseProgress'),
     'window.__done = renderExerciseProgress();']).window;
}

test('REAL invocation: a heavier lift since the first log is green; a lighter one is muted, not green', async (assert)=>{
  const up = progress(180, 185); await up.__done;
  const upEl = [...up.document.querySelectorAll('#exerciseProgress span')].find(s => /since first log/.test(s.textContent));
  assert.ok(upEl, 'anchor: the real delta line rendered');
  assert.strictEqual(upEl.className, 'perf-up');
  assert.strictEqual(up.getComputedStyle(upEl).color, 'var(--plate-green)');
  const down = progress(185, 180); await down.__done;
  const downEl = [...down.document.querySelectorAll('#exerciseProgress span')].find(s => /since first log/.test(s.textContent));
  assert.strictEqual(downEl.className, 'perf-down');
  assert.strictEqual(down.getComputedStyle(downEl).color, 'var(--text-muted)');
});

test('REAL source: the estimated-max and distance trends use the performance colours; bodyweight keeps red for up', (assert)=>{
  const uses = cls => (src.match(new RegExp(`'${cls}'`, 'g')) || []).length;
  assert.strictEqual(uses('perf-up'), 3, 'exercise progress, estimated max, distance');
  assert.match(src, /const cls = delta > 0 \? 'perf-up'[^\n]*\n\s*chartHtml = `/, 'estimated-max trend');
  assert.match(src, /const deltaClass = distDelta > 0 \? 'perf-up'/, 'distance trend');
  assert.match(src, /const deltaClass = deltaLb > 0 \? 'w-up'/, 'bodyweight trend unchanged');
  assert.match(CSS, /\.w-up\{color:var\(--plate-red\);\}/, 'bodyweight up is still red');
});

run();
