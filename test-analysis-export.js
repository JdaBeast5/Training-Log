'use strict';
// Behavioral coverage for the Analysis tab export/print (buildAnalysisPrintReport)
// — Tier 2, new feature.
//
// Care has "Save a summary for an appointment" and History has "Print /
// Save as PDF", but Analysis — the densest tab, 19 cards of trends and
// insights — had neither. buildAnalysisPrintReport reads the CURRENTLY
// RENDERED cards rather than re-deriving every metric a second time, the
// same "read the DOM, don't hand-maintain a duplicate list" reasoning
// collectSearchSections and renderAnalysisIndex already use in this file.
//
// Uses the REAL #analysisView markup (all 19 real cards, all 3 real group
// headers) and the REAL extracted buildAnalysisPrintReport plus its real
// dependencies, loaded into an actual jsdom document via a real <script>
// tag. Rather than run the full render pipeline (fetchAllWeightEntries and
// the rest, which this project's own test harness deliberately doesn't
// stand up — see test-analysis-collapse.js's own note on this), each test
// directly sets the .style.display / textContent a real render would have
// produced, then asserts on what buildAnalysisPrintReport does with that
// DOM state — the same "extract real markup and function source" approach
// as every other Tier 2 test here, applied to a state this harness can
// actually construct deterministically.
const { readIndexSource, extractFunction, extractElementById, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const analysisViewHtml = extractElementById(src, 'analysisView');

const scriptChunks = [
  'var userProfile = null;', // real default is a large object this test doesn't need; only .name is read
  extractFunction(src, 'escapeHtml'),
  extractFunction(src, 'getTodayKey'),
  extractFunction(src, 'parseDateKey'),
  extractFunction(src, 'formatDate'),
  extractFunction(src, 'formatShortDate'),
  extractFunction(src, 'buildAnalysisPrintReport'),
];

// Every card under #analysisView starts hidden, so each test opts specific
// cards back in rather than reasoning about ~19 cards' worth of raw-markup
// default visibility (some are display:none by default, most aren't).
function hideAllCards(document){
  document.querySelectorAll('#analysisView > .card').forEach(c=>{ c.style.display = 'none'; });
}

function reportSections(html){
  const scratch = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`).window.document;
  return [...scratch.querySelectorAll('.pr-day')].map(day=>({
    label: (day.querySelector('.pr-day-date') || {}).textContent || null,
    cardTitles: [...day.querySelectorAll('.pr-ex-name')].map(n=> n.textContent),
    bodyText: [...day.querySelectorAll('.pr-note')].map(n=> n.textContent),
  }));
}

const { test, run } = makeRunner('test-analysis-export.js');

test('nothing visible: the empty-analysis message shows, and there are zero .pr-day sections', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  const html = window.buildAnalysisPrintReport();
  assert.match(html, /Nothing to analyse yet/);
  assert.deepStrictEqual(reportSections(html), []);
});

test('a single visible card appears under its real group label, with boilerplate hint text and button text excluded (sabotage-relevant)', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  const card = document.getElementById('goalFeedback').closest('.card');
  card.style.display = '';
  document.getElementById('goalFeedback').innerHTML = 'On track — down 0.4 lb/week toward your 1 lb/week target.';
  const html = window.buildAnalysisPrintReport();
  const sections = reportSections(html);
  assert.strictEqual(sections.length, 1);
  assert.strictEqual(sections[0].label, 'Insights & Program Fit');
  assert.deepStrictEqual(sections[0].cardTitles, ['Goal Progress Check']);
  assert.ok(sections[0].bodyText[0].includes('down 0.4 lb/week'), 'real finding text must be present');
  assert.ok(!sections[0].bodyText[0].includes('Whether your actual weight'), 'the static card description (.history-hint) must be excluded, not just the button');
});

test('a card with a button loses the button\'s own text but keeps its real content', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  const card = document.getElementById('crossInsightsResult').closest('.card');
  card.style.display = '';
  document.getElementById('crossInsightsResult').innerHTML = 'Sleep dropped below 6h on your three hardest sessions this month.';
  const html = window.buildAnalysisPrintReport();
  const sections = reportSections(html);
  assert.strictEqual(sections[0].cardTitles[0], 'AI Cross-Metric Insights');
  assert.ok(sections[0].bodyText[0].includes('Sleep dropped below 6h'));
  assert.ok(!sections[0].bodyText[0].includes('Generate Insights'), 'the button\'s own label text must not leak into the exported body');
});

test('a card that is display:none (autohidden — no real content) is excluded entirely', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  // bodyMetricsCard is display:none by default in the real markup — left
  // untouched here rather than explicitly hidden, so this also proves the
  // function respects the raw markup's own default state, not just states
  // this test sets.
  const card = document.getElementById('bodyMetricsCard');
  assert.strictEqual(card.style.display, 'none', 'precondition: this card is hidden by default in the real markup');
  const html = window.buildAnalysisPrintReport();
  assert.deepStrictEqual(reportSections(html), []);
});

test('analysisFirstRun (the empty-state card) is never exported, even if visible', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  document.getElementById('analysisFirstRun').style.display = '';
  const html = window.buildAnalysisPrintReport();
  assert.deepStrictEqual(reportSections(html), []);
});

test('a group with zero visible cards produces no section for that group', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  // Only a Body & Health Trends card is shown; Insights and Training must
  // not appear as empty sections.
  const card = document.getElementById('bodyMetricsCard');
  card.style.display = '';
  document.getElementById('bodyMetricsContent').innerHTML = 'Waist down 1.2in over the last 6 weeks.';
  const html = window.buildAnalysisPrintReport();
  const sections = reportSections(html);
  assert.strictEqual(sections.length, 1);
  assert.strictEqual(sections[0].label, 'Body & Health Trends');
});

test('multiple visible cards in the same group all appear, in document order', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, '', scriptChunks);
  hideAllCards(document);
  document.getElementById('goalFeedback').closest('.card').style.display = '';
  document.getElementById('goalFeedback').innerHTML = 'Goal finding.';
  document.getElementById('programFitCheck').closest('.card').style.display = '';
  document.getElementById('programFitCheck').innerHTML = 'Program fit finding.';
  const html = window.buildAnalysisPrintReport();
  const sections = reportSections(html);
  assert.strictEqual(sections.length, 1);
  assert.deepStrictEqual(sections[0].cardTitles, ['Goal Progress Check', 'Program Fit Check']);
});

test('the profile name appears in the report header when set', (assert)=>{
  const { document, window } = runJsdom(analysisViewHtml, 'var userProfile = { name: "Jordan" };', scriptChunks.slice(1));
  hideAllCards(document);
  const html = window.buildAnalysisPrintReport();
  assert.match(html, /Jordan/);
});

run();
