'use strict';
// Behavioral coverage for a copy-consistency pass found during a review of
// the non-Log tabs: static <button> labels mixed Title Case ("Save Profile",
// "Print Workout Report") with sentence case ("Try again", "Use gym mode")
// with no discernible pattern. Normalized every genuine outlier to sentence
// case (~24 buttons across Settings, food logging, workout logging, History,
// Coach, and the week-archive flow).
//
// This test scans the REAL current index.html source for every static
// <button>...</button> label and flags any word after the first that starts
// uppercase, UNLESS it's a legitimate exception: an all-caps acronym (AI,
// JSON, CSV, PR, RPE...), the pronoun "I", or a whole-phrase proper name
// ("What's New", the update dialog's own title). Scanning the real file
// (not a hardcoded snapshot of the button list) means a future button added
// in Title Case gets caught here too, not just the ones fixed today.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

// Exported implicitly via closure in this file — not a function under test
// in index.html, just this test's own detector, so it's defined directly
// rather than extracted.
const WHOLE_PHRASE_EXCEPTIONS = new Set(["What's New"]);

function findTitleCaseViolations(html){
  const re = /<button[^>]*>([^<{]{2,200})<\/button>/g;
  const violations = [];
  let m;
  while((m = re.exec(html))){
    const raw = m[1];
    if(WHOLE_PHRASE_EXCEPTIONS.has(raw.trim())) continue;
    // Buttons often prefix an emoji/symbol icon before the real text ("🔁 Repeat yesterday").
    const text = raw.replace(/^[^\w]*\s*/, '').trim();
    if(!text) continue;
    const wordRe = /[A-Za-z][A-Za-z']*/g;
    let wm;
    while((wm = wordRe.exec(text))){
      const w = wm[0];
      // A capital immediately after '.', '?', '!', ':', '·' (or at the
      // very start of the label) opens a fresh clause/sentence — a few
      // buttons here are genuinely two sentences concatenated ("Only have
      // limited equipment/time today? Adapt this session"), and each one's
      // own first word is allowed to be capitalized.
      let j = wm.index - 1;
      while(j >= 0 && /\s/.test(text[j])) j--;
      const prevChar = j >= 0 ? text[j] : '';
      if(prevChar === '' || '.?!:·'.includes(prevChar)) continue;
      if(w === 'I') continue;                                  // pronoun
      if(w.length > 1 && w === w.toUpperCase()) continue;       // acronym: AI, JSON, CSV, PR, RPE...
      if(/^[A-Z]/.test(w)){ violations.push(raw); break; }
    }
  }
  return violations;
}

const { test, run } = makeRunner('test-button-label-casing.js');

test('sabotage check: the detector itself actually catches a real Title Case violation', (assert)=>{
  const violations = findTitleCaseViolations('<button id="x">Save Profile</button>');
  assert.deepStrictEqual(violations, ['Save Profile'], 'the detector must flag a genuine Title Case label, or this whole test proves nothing');
});

test('sabotage check: the detector does not false-positive on legitimate acronyms, the pronoun "I", or the named What\'s New dialog', (assert)=>{
  const html = `
    <button id="a">Compare with AI</button>
    <button id="b">Tailor to what I logged</button>
    <button id="c">Export my data (backup as JSON)</button>
    <button id="d">Choose a CSV file</button>
    <button id="e">What's New</button>
  `;
  assert.deepStrictEqual(findTitleCaseViolations(html), []);
});

test('sabotage check: a second-sentence capital is allowed, but a mid-clause capital right after it still gets flagged', (assert)=>{
  const html = '<button id="f">Ready to start? Adapt Your Session now</button>';
  assert.deepStrictEqual(findTitleCaseViolations(html), ['Ready to start? Adapt Your Session now'],
    'the "Adapt" after "?" is a legitimate new sentence, but "Your" and "Session" mid-clause must still be caught');
});

test('no static button label in the real app is Title Case outside the documented exceptions', (assert)=>{
  const src = readIndexSource();
  const violations = findTitleCaseViolations(src);
  assert.deepStrictEqual(violations, [], `found Title Case button label(s) that should be sentence case: ${JSON.stringify(violations)}`);
});

run();
