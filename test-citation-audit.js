'use strict';
// Automated citation-health check for PROGRAM_SOURCES / STYLE_SOURCES.
//
// Context: every citation in this app lives as free-text prose in an
// entry's `primary` field (e.g. "Starr HM, Sanders B. ... Sports Health.
// 2012;4(4):328-332. doi:10.1177/1941738112443364 — [explanation]"). There
// is no structured {author, year, doi} field anywhere, so this has to parse
// prose with regex, not read structured data.
//
// A full manual citation audit (spot-check, then a full sweep of every
// entry) was done once and found and fixed one real citation error. There
// was no tooling behind that sweep, and the list keeps growing (55 entries
// combined as of this writing). This test is that tooling, for next time.
//
// DESIGN CONSTRAINT — citation AGE is informational only, never a failing
// assertion. Several citations are DELIBERATELY old because they ARE the
// original/foundational source, not because they are stale: McGill's 1998
// spine-stabilization papers (core, rehabLowerback — still current
// practice), the Alfredson 1998 eccentric-loading protocol (rehabAchilles —
// explicitly discussed as the original protocol), etc. A naive "flag
// anything before year X" check would bury real findings under these
// already-reviewed, deliberately-kept-old citations. So the inventory below
// prints oldest-year per entry for a human to read; it never asserts on it.
//
// THE ONE REAL FAILING ASSERTION: every entry either has a recognizable
// citation attempt, or explicitly says it deliberately has none. Getting
// this to zero false positives against the CURRENT, already-reviewed
// content (confirmed by actually running this) required widening
// "recognizable citation attempt" past a literal doi: string, because real,
// legitimate patterns already exist in this exact data that a DOI-only
// check would wrongly flag:
//   - PMID instead of DOI — McGill SM 1998 (Phys Ther) predates DOIs being
//     standard and is cited by PMID: 9672547 instead (core, rehabLowerback).
//   - Container/redirect entries — combat, cycling, yoga, medical,
//     watersports are PROGRAM_SOURCES containers whose own `primary`
//     explicitly defers ("NOW SOURCED PER STYLE") to per-style entries in
//     STYLE_SOURCES rather than carrying a citation of their own. Their
//     intro text also self-identifies as "A container for ... styles".
//   - Real citations to sources that legitimately never carry a DOI or
//     PMID: ACOG Committee Opinions (prenatal, postpartum), an expert
//     systematic-review guideline (bariatricEarly, bariatricRebuilding),
//     and smaller-journal references (muayThai: Walailak J Sci Technol;
//     taekwondo: Kinesiology; pilates: J Bodyw Mov Ther 2007). These are
//     full author/journal/year citations, not placeholders — recognized
//     here by the presence of a plausible publication year, since a
//     citation specific enough to name authors, a journal and a year is a
//     fundamentally different thing from unwritten prose.
//   - The literal "DELIBERATELY NO ... CITATION" marker text (couples
//     yoga's sequencing citation, rehabGeneral's single-protocol citation),
//     plus the "NOT YET SOURCED" convention the STYLE_SOURCES provenance
//     comment documents as a legitimate value (unused today, honored if it
//     ever appears).
//
// None of the above are gaps — every one was read directly, not assumed,
// while building this test (see the exploration this test's design is
// based on). A TRUE gap is an entry with NONE of: DOI, PMID, a plausible
// year, a deliberate-no-citation marker, or container-redirect language.
// That combination does not exist anywhere in the current data (this test
// passes with zero gaps as written) — if one is ever introduced, this is
// what catches it.
//
// Word-boundary note: the deliberate-marker regex requires "NO" as a whole
// word after "DELIBERATELY". A naive substring check for "DELIBERATELY NO"
// falsely matches "DELIBERATELY NOT" (since "not" starts with "no") —
// several container entries say things like "deliberately not summarised
// here", which is NOT a deliberate-no-citation marker and must not be
// treated as one. Caught by testing against real data before trusting this
// check, per this project's own recurring "comment defeats naive count"
// failure mode.

const { readIndexSource, extractConst, runSandbox, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-citation-audit.js');

const DOI_RE = /\bdoi:\s*10\.\d{4,9}\/\S+/i;
const DOI_CAPTURE_RE = /\bdoi:\s*(10\.\d{4,9}\/\S+)/ig;
const PMID_RE = /\bPMID:?\s*\d{4,9}/i;
// \b after "NO" is what excludes "NOT" — "O" and "T" are both word
// characters, so there is no word boundary between them for \b to match.
const DELIBERATE_NO_CITATION_RE = /\bDELIBERATELY\s+NO\b/i;
const NOT_YET_SOURCED_RE = /\bNOT YET SOURCED\b/i;
const CONTAINER_REDIRECT_RE = /SOURCED PER STYLE/i;
const CONTAINER_INTRO_RE = /container for/i;
const YEAR_RE = /\b(19|20)\d{2}\b/g;
const CURRENT_YEAR = new Date().getFullYear();

function entryText(entry){
  return Object.values(entry).filter(v => typeof v === 'string').join('\n');
}

function findDois(text){
  const out = [];
  let m;
  DOI_CAPTURE_RE.lastIndex = 0;
  while((m = DOI_CAPTURE_RE.exec(text))) out.push(m[1].replace(/[.,;)]+$/, ''));
  return out;
}

function findPlausibleYears(text){
  const years = [...text.matchAll(YEAR_RE)].map(m => parseInt(m[0], 10));
  return years.filter(y => y >= 1900 && y <= CURRENT_YEAR + 1);
}

function isContainerRedirect(entry){
  return CONTAINER_REDIRECT_RE.test(entry.primary || '') || CONTAINER_INTRO_RE.test(entry.intro || '');
}

function isDeliberateNoCitation(text){
  return DELIBERATE_NO_CITATION_RE.test(text) || NOT_YET_SOURCED_RE.test(text);
}

// The one recognized-citation-signal check the failing assertion is built
// on. Returns {ok, reasons[]} rather than a bare boolean so the inventory
// log and the failure message can both explain WHY, not just pass/fail.
function assessEntry(entry){
  const text = entryText(entry);
  const dois = findDois(text);
  const hasPmid = PMID_RE.test(text);
  const years = findPlausibleYears(text);
  const container = isContainerRedirect(entry);
  const deliberate = isDeliberateNoCitation(text);
  const ok = dois.length > 0 || hasPmid || years.length > 0 || container || deliberate;
  return {
    ok,
    dois,
    hasPmid,
    oldestYear: years.length ? Math.min(...years) : null,
    container,
    deliberate,
  };
}

test('every PROGRAM_SOURCES/STYLE_SOURCES entry has a real citation (DOI/PMID/dated reference) or an explicit deliberate-no-citation marker — the one real failing assertion; citation AGE below is informational only', (assert)=>{
  const chunks = [extractConst(src, 'PROGRAM_SOURCES'), extractConst(src, 'STYLE_SOURCES')];
  const [captured] = runSandbox(chunks, `
    __capture.push({ programSources: PROGRAM_SOURCES, styleSources: STYLE_SOURCES });
  `);
  const { programSources, styleSources } = captured;

  const allEntries = [
    ...Object.entries(programSources).map(([key, entry]) => ({ set: 'PROGRAM_SOURCES', key, entry })),
    ...Object.entries(styleSources).map(([key, entry]) => ({ set: 'STYLE_SOURCES', key, entry })),
  ];

  // Sabotage anchor: proves the extraction actually pulled real entries
  // rather than an empty/broken object silently passing an empty loop.
  assert.ok(
    allEntries.length >= 50,
    `expected 50+ combined PROGRAM_SOURCES/STYLE_SOURCES entries, found ${allEntries.length} — extraction likely broke, this isn't entries actually vanishing`
  );

  console.log('\n  == Citation inventory (informational — age/format noted, never asserted on) ==');
  const gaps = [];
  for(const { set, key, entry } of allEntries){
    const a = assessEntry(entry);
    const flags = [];
    if(a.dois.length) flags.push(`${a.dois.length} DOI(s)`);
    if(a.hasPmid) flags.push('PMID');
    if(a.container) flags.push('container-redirect (cited per-style elsewhere)');
    if(a.deliberate) flags.push('explicit deliberate-no-citation marker');
    if(!a.dois.length && !a.hasPmid && !a.container && !a.deliberate && a.oldestYear !== null){
      flags.push('dated reference, no DOI/PMID available');
    }
    console.log(`    ${set}.${key}: oldestYear=${a.oldestYear === null ? 'n/a' : a.oldestYear} | ${flags.join(', ') || 'NONE'}`);
    if(!a.ok) gaps.push(`${set}.${key}`);
  }

  assert.deepStrictEqual(
    gaps,
    [],
    `entries with no DOI/PMID/dated reference AND no deliberate-no-citation marker (a genuine, actionable gap, not an age issue): ${gaps.join(', ')}`
  );
});

run();
