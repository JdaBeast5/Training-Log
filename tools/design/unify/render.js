'use strict';
// Dev tooling for planning/backlog.md UX-52 to UX-60, "unify every screen with Today" (not loaded by the app).
// Renders each gap before and after, from the REAL app: the harness's fixture (Jordan, Strength & Size, Monday
// 2 November 2026, 18:10 New York), the real boot, the real taps. Every "after" is a prototype applied in memory
// only: CSS added to the page (GAPS[].options[].css), and for gap 8 a source patch to the served index.html (each
// anchor asserted to match exactly once). Nothing here changes index.html on disk.
//
// The "after" CSS is a prototype, not the implementation: it uses !important and broad selectors to show the look
// on top of today's rules. The backlog items say how the real change consolidates the rules instead.
//
// Run from the repo root: node tools/design/unify/render.js [gap numbers, e.g. 1 3 9]
// Output: tools/design/unify/renders/unify-<n>.png, one contact sheet per gap (before, then each option; dark above
// light), committed; and renders/cells/<gap>-<scene>-<theme>-<variant>.png at DPR 2, gitignored (about 20 MB).
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const D = __dirname, ROOT = path.resolve(D, '..', '..', '..'), OUT = path.join(D, 'renders');
const FROZEN_NOW = Date.parse('2026-11-02T23:10:00Z');
const TODAY = '2026-11-02';
const NS = 'trainingLog_usr1:';
const PHONE = { width: 402, height: 874 }, DUO = { width: 904, height: 678 };

// ---- Shared prototype pieces --------------------------------------------------------------------------------
// Outside gym mode and off the cover. Today's grammar: the ink rectangle (.cover-go: r-control 14, no glow), the
// secondary control (UX-38: --surface-2, 1 px --rule, r-control), bare 44 pt icons (.cover-icons), ruled rows
// (.finish-next-row), the display face for names and figures (.finish-day, .finish-total-v).
const FIELDS = ':is(input[type=text], input[type=number], input[type=search], input[type=email], input[type=password], input[type=date], input[type=time], input:not([type]), select, textarea)';
const CSS_BUTTONS = `
  body:not(.gym-mode) .save-btn{border-radius:var(--r-control) !important; min-height:52px; box-shadow:none !important; font-size:16px !important;}
  body:not(.gym-mode) .coach-chat-send-btn{min-height:48px; padding:0 20px !important;}
  body:not(.gym-mode) .finish-share{border-radius:var(--r-control) !important;}
  body:not(.gym-mode) :is(.switch-profile-btn, .custom-toggle, .photo-log-btn, .reorder-btn, .settings-jump){
    background:var(--surface-2) !important; border:1px solid var(--rule) !important; border-radius:var(--r-control) !important;
    color:var(--text) !important; box-shadow:none !important; min-height:44px; font-size:15px !important; font-weight:600 !important;}
  body:not(.gym-mode) .reorder-btn{padding:0 14px !important;}
  body:not(.gym-mode) .reorder-btn.active{background:var(--text) !important; color:var(--ground) !important; border-color:var(--text) !important;}`;
const CSS_FIELDS_A = `
  body:not(.gym-mode) .wrap ${FIELDS}:not(.cover *):not(.up-next *),
  body:not(.gym-mode) :is(.sub-modal-sheet, .coach-fab-panel, .user-picker-box) ${FIELDS},
  body:not(.gym-mode) .settings-panel ${FIELDS}:not(select){
    background-color:transparent !important; border:1px solid var(--text-3) !important; border-radius:var(--r-control) !important;
    box-shadow:none !important; min-height:48px; padding:12px 14px !important; color:var(--text) !important; box-sizing:border-box;}
  body:not(.gym-mode) .wrap select:not(#_){padding-right:32px !important;}
  body:not(.gym-mode) :is(.care-label, .exercise-input-label){font-size:13px !important; color:var(--text-2) !important;}`;
const CSS_FIELDS_B = `
  body:not(.gym-mode) .wrap ${FIELDS}:not(.cover *):not(.up-next *),
  body:not(.gym-mode) :is(.sub-modal-sheet, .coach-fab-panel, .user-picker-box) ${FIELDS},
  body:not(.gym-mode) .settings-panel ${FIELDS}:not(select){
    background-color:var(--surface-2) !important; border:1px solid transparent !important; border-radius:var(--r-control) !important;
    box-shadow:none !important; min-height:48px; padding:12px 14px !important; color:var(--text) !important; box-sizing:border-box;}
  body:not(.gym-mode) .wrap select:not(#_){padding-right:32px !important;}
  body:not(.gym-mode) :is(.care-label, .exercise-input-label){font-size:13px !important; color:var(--text-2) !important;}`;
// Sheets: no blue halo under the sheet, the head's Done in the ink (UX-41), the grabber as Settings has it.
const CSS_SHEETS = `
  body:not(.gym-mode) .sub-modal-sheet{box-shadow:0 -20px 50px -20px rgba(0,0,0,.6) !important; border-color:var(--rule) !important;}
  body:not(.gym-mode) .sub-modal-close{color:var(--text) !important;}`;
const UNIFIED = CSS_BUTTONS + CSS_FIELDS_A + CSS_SHEETS; // the recommended pieces, under the later gaps' afters

// ---- The gaps ------------------------------------------------------------------------------------------------
// scene: {name, view, size, setup(page) in Node, scroll: selector brought to y=top, top}
const GAPS = [
  { n: 1, title: 'Tab headers: bare icons and the display face, as on Today',
    scenes: [{ name: 'food', view: 'log' }, { name: 'progress', view: 'analysis' }],
    options: [{ key: 'after', label: 'After (one option: Today shows it)', css: `
      body:not(.today-cover):not(.gym-mode) header :is(.header-search, .coach-fab, .settings-cog){
        background:none !important; border:0 !important; box-shadow:none !important; color:var(--text) !important;
        width:44px !important; height:44px !important; top:-4px !important;}
      body:not(.today-cover):not(.gym-mode) header .settings-cog{right:-10px !important;}
      body:not(.today-cover):not(.gym-mode) header .header-search{right:34px !important;}
      body:not(.today-cover):not(.gym-mode) header .coach-fab{right:78px !important;}
      body:not(.today-cover):not(.gym-mode) header :is(.header-search, .settings-cog, .coach-fab) svg{width:21px !important; height:21px !important;}
      body:not(.today-cover):not(.gym-mode) .eyebrow{font-size:14px; font-weight:500; color:var(--text-2);}
      body:not(.today-cover):not(.gym-mode) #viewTitle{font-family:var(--font-display); font-stretch:68%; font-weight:800;
        font-size:44px; letter-spacing:-0.01em; line-height:1; margin-top:10px;}` }] },
  { n: 2, title: 'Buttons: the ink rectangle and the secondary control, never a pill',
    scenes: [{ name: 'coach', view: 'coach' }, { name: 'food', view: 'log', scroll: '#saveMealBtn', top: 300 }],
    options: [{ key: 'after', label: 'After (one option: Today\'s Log set and UX-38\'s secondary)', css: CSS_BUTTONS }] },
  { n: 3, title: 'Text fields and pickers',
    scenes: [{ name: 'care', view: 'care' }, { name: 'profile', view: 'today', setup: openProfile }],
    options: [
      { key: 'A', label: 'A, outlined (Today\'s cover fields) · recommended', css: CSS_BUTTONS + CSS_FIELDS_A },
      { key: 'B', label: 'B, filled (--surface-2)', css: CSS_BUTTONS + CSS_FIELDS_B }] },
  { n: 4, title: 'The More sheet: ruled rows, bare icons',
    scenes: [{ name: 'more', view: 'today', setup: p => p.click('#navMore'), wait: '#navMoreOverlay.active' }],
    options: [
      { key: 'A', label: 'A, text face rows (as Then)', css: UNIFIED + CSS_MORE('A') },
      { key: 'B', label: 'B, display face rows (as the tab titles) · recommended', css: UNIFIED + CSS_MORE('B') }] },
  { n: 5, title: 'The coach chat panel',
    scenes: [{ name: 'chat', view: 'today', setup: openChat, wait: '#coachFabModal.active' }],
    options: [
      { key: 'A', label: 'A, a bottom sheet like every other · recommended', css: UNIFIED + CSS_CHAT('A') },
      { key: 'B', label: 'B, the corner card, restyled', css: UNIFIED + CSS_CHAT('B') }] },
  { n: 6, title: 'Exercise history and Search sheets: ruled figures, no mono, no blue box',
    scenes: [{ name: 'exhistory', view: 'today', setup: openExHistory, wait: '#exHistoryOverlay.active' },
      { name: 'search', view: 'today', setup: p => p.evaluate(() => openGlobalSearch()), wait: '#globalSearchOverlay.active' }],
    options: [{ key: 'after', label: 'After (one option: the finish sheet shows it)', css: UNIFIED + CSS_EXH(), focusSheet: true }] },
  { n: 7, title: '"Who\'s training?": the first screen and the profile switcher',
    scenes: [{ name: 'firstrun', firstRun: true }, { name: 'switch', view: 'today', setup: p => p.evaluate(() => showUserPicker()), wait: '#userPickerOverlay.active' }],
    options: [
      { key: 'A', label: 'A, a sheet (the finish sheet\'s frame)', css: UNIFIED + CSS_PICKER('A'), focusSheet: true },
      { key: 'B', label: 'B, a full screen on the ground · recommended for first run', css: UNIFIED + CSS_PICKER('B'), focusSheet: true }] },
  { n: 8, title: 'History\'s month: the empty rows after today',
    scenes: [{ name: 'history', view: 'history' }],
    options: [
      { key: 'A', label: 'A, the rest of the month in faint numerals · recommended', css: UNIFIED + `#historyHeatmapGrid .calendar-cell.future{color:var(--text-3); opacity:.55; pointer-events:none;}`, variant: 'cal-a' },
      { key: 'B', label: 'B, the month ends at this week', css: UNIFIED, variant: 'cal-b' }] },
  { n: 9, title: 'Progress unfolded (904): the lead at phone scale',
    scenes: [{ name: 'progress', view: 'analysis', size: DUO }],
    options: [
      { key: 'A', label: 'A, the lead in two columns · recommended', css: CSS_LEAD('A') },
      { key: 'B', label: 'B, the chart capped at a phone column', css: CSS_LEAD('B') }] },
  { n: 10, title: 'The rest-timer pill (resting, 2:30 of 4:00 left)',
    // UX-29: the pill steps aside while the cover is in view, so it's shown where it really appears: Today scrolled
    // past the cover (the cover's foot still in frame), another tab, and Gym mode (out of scope: unchanged).
    scenes: [{ name: 'today', view: 'today', rest: true, setup: scrollPastCover, wait: '#restTimer.active' },
      { name: 'food', view: 'log', rest: true, wait: '#restTimer.active' },
      { name: 'gym', view: 'today', rest: true, gym: true, wait: 'body.gym-mode' }],
    options: [
      { key: 'A', label: 'A, the rest field (a small rest cover, in the day\'s deep ink) · recommended', css: CSS_FLOAT('A') },
      { key: 'B', label: 'B, the neutral floating surface', css: CSS_FLOAT('B') }] },
  { n: 11, title: 'The undo pill after a set is logged',
    // The real tap: the cover's Log set logs Bench set 3, starts the rest and shows "Logged Bench Press 185×6 · Undo".
    scenes: [{ name: 'logged', view: 'today', setup: logSet, wait: '#undoToast.active' },
      { name: 'logged-scrolled', view: 'today', setup: async p => { await logSet(p); await scrollPastCover(p); await p.evaluate(() => showUndoToast(document.getElementById('undoToastText').textContent, () => {})); }, wait: '#undoToast.active' }],
    options: [
      { key: 'after', label: 'After (one item with gap 10: one floating surface, stacked; the rest pill as A)', css: CSS_FLOAT('A') }] },
];

// Gaps 10 and 11 share one floating surface: --r-control (not a 36 px pill), the float shadow, the figure in the
// display face, the ink for actions (no blue), 44 pt targets, and the undo pill stacked above the rest pill when both
// show (today they sit at the same spot and the undo pill covers the timer). Gym mode keeps its own until UX-17.
function CSS_FLOAT(opt){
  const shared = `
    body:not(.gym-mode) :is(.rest-timer, .undo-toast){border-radius:var(--r-control) !important; box-shadow:0 14px 34px -12px rgba(0,0,0,.55) !important;}
    body:not(.gym-mode) .rest-timer{padding:8px 6px 8px 10px !important; width:auto !important;}
    body:not(.gym-mode) .rest-timer-time{font-family:var(--font-display) !important; font-stretch:68%; font-weight:800 !important; font-size:21px !important; letter-spacing:0 !important;}
    body:not(.gym-mode) .undo-toast{background:var(--surface-1) !important; border:1px solid var(--rule-strong) !important; padding:4px 4px 4px 16px !important; gap:8px !important; min-height:52px;}
    body:not(.gym-mode) .undo-toast span{font-size:15px !important; color:var(--text) !important;}
    body:not(.gym-mode) .undo-toast button{color:var(--text) !important; font-size:15px !important; min-height:44px; min-width:64px; padding:0 14px !important; border-left:1px solid var(--rule) !important; border-radius:0;}
    body:not(.gym-mode) .undo-toast span{white-space:nowrap;}
    body:not(.gym-mode):not(.cover-in-view):has(#restTimer.active) .undo-toast{bottom:calc(var(--above-bar) + 12px + 72px + 8px) !important;}
    body:not(.gym-mode) .gym-offer{background:var(--surface-1) !important; border:1px solid var(--rule-strong) !important; border-radius:var(--r-control) !important; box-shadow:0 14px 34px -12px rgba(0,0,0,.55) !important;}
    body:not(.gym-mode) .gym-offer-title{font-family:var(--font-display); font-stretch:68%; font-weight:800 !important; font-size:22px !important;}
    body:not(.gym-mode) .gym-offer-body{color:var(--text-2) !important; font-size:14px !important;}
    body:not(.gym-mode) .gym-offer-yes{background:var(--text) !important; color:var(--ground) !important; border-color:var(--text) !important;}
    body:not(.gym-mode) .gym-offer-no{background:var(--surface-2) !important; color:var(--text) !important; border:1px solid var(--rule) !important;}
    body:not(.gym-mode):has(#undoToast.active) .gym-offer{bottom:calc(var(--above-bar) + 12px + 52px + 8px) !important;}
    body:not(.gym-mode):not(.cover-in-view):has(#restTimer.active):has(#undoToast.active) .gym-offer{bottom:calc(var(--above-bar) + 12px + 72px + 8px + 52px + 8px) !important;}`;
  if(opt === 'A') return shared + `
    body:not(.gym-mode) .rest-timer{background:var(--spot-deep, var(--surface-1)) !important; border:0 !important;}
    body:not(.gym-mode) .rest-timer :is(.rest-timer-time, .rt-add, .rt-close){color:#FFFFFF !important;}
    body:not(.gym-mode) .rest-timer .rest-timer-ring-track{stroke:rgba(255,255,255,.28) !important;}
    body:not(.gym-mode) .rest-timer .rest-timer-ring-progress{stroke:#FFFFFF !important;}`;
  return shared + `
    body:not(.gym-mode) .rest-timer{background:var(--surface-1) !important; border:1px solid var(--rule-strong) !important;}
    body:not(.gym-mode) .rest-timer .rest-timer-time{color:var(--text) !important;}`;
}

function CSS_MORE(opt){
  return `
    #navMoreOverlay .nav-more-list{background:none !important; border:0 !important; border-radius:0 !important; border-top:1px solid var(--rule) !important; margin-top:8px;}
    #navMoreOverlay .nav-more-item{padding:12px 0 !important; min-height:${opt === 'A' ? 64 : 76}px; border-bottom:1px solid var(--rule) !important;}
    #navMoreOverlay .nav-more-item + .nav-more-item{border-top:0 !important;}
    #navMoreOverlay .nav-more-icon{background:none !important; color:var(--text-2) !important; flex:0 0 24px !important; height:24px !important;}
    #navMoreOverlay .nav-more-icon svg{width:22px !important; height:22px !important;}
    #navMoreOverlay .nav-more-desc{color:var(--text-2) !important; font-size:14px !important;}
    #navMoreOverlay .nav-more-chev{color:var(--text-3) !important;}
    #navMoreOverlay .sub-modal-title{font-family:var(--font-display); font-stretch:68%; font-weight:800; font-size:30px;}
    ${opt === 'A'
      ? '#navMoreOverlay .nav-more-label{font-size:17px !important; font-weight:600 !important;}'
      : '#navMoreOverlay .nav-more-label{font-family:var(--font-display) !important; font-stretch:68%; font-weight:800 !important; font-size:26px !important; line-height:1.05;}'}`;
}
function CSS_CHAT(opt){
  const common = `
    .coach-fab-header{border:0 !important; padding-bottom:4px !important; font-family:var(--font-display); font-stretch:68%; font-weight:800 !important; font-size:30px !important; color:var(--text);}
    .coach-fab-close{color:var(--text) !important; width:44px; height:44px; font-size:22px !important;}
    .coach-fab-panel{background:var(--surface-1) !important; box-shadow:0 -20px 50px -20px rgba(0,0,0,.6) !important;}
    .coach-fab-panel .coach-chat-log{color:var(--text-2);}
    #floatingChatInput:focus{outline:2px solid var(--text) !important; outline-offset:2px; border-color:var(--text) !important;}`;
  if(opt === 'A') return common + `
    .coach-fab-modal{align-items:flex-end !important; justify-content:center !important;}
    .coach-fab-backdrop{background:rgba(0,0,0,.6) !important;}
    .coach-fab-panel{margin:0 !important; width:100% !important; max-width:520px; min-height:62vh; max-height:88vh !important;
      border-radius:var(--r-sheet) var(--r-sheet) 0 0 !important; border:0 !important; border-top:1px solid var(--rule) !important;
      padding:8px 20px calc(20px + env(safe-area-inset-bottom, 0px)) !important;}
    .coach-fab-panel::before{content:''; display:block; flex:0 0 auto; width:38px; height:5px; border-radius:3px; background:var(--rule-strong); margin:0 auto 10px;}`;
  return common + `
    .coach-fab-panel{border-radius:var(--r-sheet) !important; border:1px solid var(--rule) !important;}`;
}
function CSS_EXH(){ return `
  #exHistoryOverlay .exh-stats{display:grid !important; grid-auto-flow:column; grid-auto-columns:1fr; gap:0 !important; border-top:1px solid var(--rule); border-bottom:1px solid var(--rule);}
  #exHistoryOverlay .exh-stats > div{background:none !important; border:0 !important; border-radius:0 !important; padding:12px 0 !important; text-align:left !important;}
  #exHistoryOverlay .exh-stats > div + div{padding-left:12px !important; border-left:1px solid var(--rule) !important;}
  #exHistoryOverlay .exh-stats b{font-family:var(--font-display) !important; font-stretch:84%; font-size:30px !important; font-weight:700 !important; line-height:1.1;}
  #exHistoryOverlay .exh-stats span{font-size:13px !important; color:var(--text-2) !important;}
  #exHistoryTitle{font-family:var(--font-display); font-stretch:68%; font-weight:800; font-size:30px;}
  .exh-section-label{font-size:13px !important; color:var(--text-2) !important;}
  .exh-date{font-size:15px !important;}
  .exh-vol, .exh-sets{font-family:var(--font-sans) !important; font-size:14px !important; color:var(--text-2) !important;}
  .exh-row{border-bottom-color:var(--rule) !important; padding:12px 0 !important;}
  #globalSearchTitle{font-family:var(--font-display); font-stretch:68%; font-weight:800; font-size:30px;}` }
function CSS_PICKER(opt){
  const common = `
    .user-picker-title{font-family:var(--font-display) !important; font-stretch:68%; font-weight:800 !important; letter-spacing:-0.01em !important; line-height:1 !important;}
    .user-picker-box .eyebrow{font-size:14px; color:var(--text-2);}
    .user-picker-promise{color:var(--text) !important; font-size:17px !important; line-height:1.4 !important;}
    .user-picker-list{gap:0 !important; border-top:1px solid var(--rule);}
    .user-pick-btn{background:none !important; border:0 !important; border-bottom:1px solid var(--rule) !important; border-radius:0 !important;
      padding:14px 0 !important; min-height:56px; font-family:var(--font-display) !important; font-stretch:68%; font-weight:800 !important; font-size:26px !important;}
    .user-picker-divider{font-size:13px !important; color:var(--text-2) !important;}
    .user-picker-cancel{font-size:16px !important; color:var(--text) !important; min-height:44px; font-weight:600;}`;
  if(opt === 'A') return common + `
    .user-picker-overlay{align-items:flex-end !important; padding:0 !important; background:rgba(0,0,0,.6) !important;}
    .user-picker-box{max-width:520px !important; border-radius:var(--r-sheet) var(--r-sheet) 0 0 !important; border:0 !important; border-top:1px solid var(--rule) !important;
      box-shadow:0 -20px 50px -20px rgba(0,0,0,.6) !important; padding:10px 20px calc(24px + env(safe-area-inset-bottom, 0px)) !important;}
    .user-picker-box::before{content:''; display:block; width:38px; height:5px; border-radius:3px; background:var(--rule-strong); margin:0 auto 14px;}
    .user-picker-title{font-size:44px !important; margin:4px 0 14px !important;}`;
  return common + `
    .user-picker-overlay{align-items:stretch !important; padding:0 !important; background:var(--ground) !important;}
    .user-picker-box{max-width:520px !important; margin:0 auto; background:none !important; border:0 !important; border-radius:0 !important; box-shadow:none !important;
      display:flex; flex-direction:column; justify-content:flex-end; padding:calc(40px + env(safe-area-inset-top, 0px)) 20px calc(28px + env(safe-area-inset-bottom, 0px)) !important;}
    .user-picker-title{font-size:64px !important; margin:6px 0 16px !important;}`;
}
function CSS_LEAD(opt){
  if(opt === 'A') return `
    @media (min-width:760px) and (min-height:560px){
      .progress-lead{max-width:none !important; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); column-gap:var(--pane-gap); align-items:start;}
      .progress-lead > .pl-lifts{grid-column:1 / -1; grid-row:1;}
      .progress-lead > .pl-label{grid-column:1; grid-row:2;}
      .progress-lead > .pl-answer{grid-column:1; grid-row:3;}
      .progress-lead > .e1rm-chart{grid-column:1; grid-row:4;}
      .progress-lead > .pl-next{grid-column:2; grid-row:2 / span 2; align-self:end; margin:0 0 8px !important;}
      .progress-lead > .muscle-ledger{grid-column:2; grid-row:4; margin-top:0 !important;}
    }`;
  return `
    @media (min-width:760px) and (min-height:560px){
      .progress-lead{max-width:var(--open-col-w) !important;}
    }`;
}

// ---- Source patches (gap 8 only), each anchor asserted to match once ---------------------------------------------
const CAL_ANCHOR = "if(dateKey > todayKey){ cells += `<div class=\"calendar-cell empty\"></div>`; continue; }";
const VARIANTS = {
  'cal-a': [[CAL_ANCHOR, "if(dateKey > todayKey){ cells += `<div class=\"calendar-cell future\" aria-hidden=\"true\">${day}</div>`; continue; }"]],
  'cal-b': [[CAL_ANCHOR, "if(dateKey > todayKey){ if((startWeekday + day - 1) % 7 === 0) break; cells += `<div class=\"calendar-cell empty\"></div>`; continue; }"]],
};
function patched(src, key){
  for(const [from, to] of VARIANTS[key] || []){
    const n = src.split(from).length - 1;
    if(n !== 1) throw new Error(`patch anchor matched ${n} times (want 1): ${from.slice(0, 60)}`);
    src = src.replace(from, () => to);
  }
  return src;
}

// ---- Scene steps (taps a person makes, or the app's own openers) -------------------------------------------------
async function openProfile(page){
  await page.click('#settingsCog');
  await page.waitForSelector('#settingsOverlay.active');
  await settle(page);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#settingsOverlay button, #settingsOverlay [role="button"], #settingsOverlay summary')].find(x => /Your Profile/.test(x.textContent));
    if(!b) throw new Error('no Your Profile row');
    b.click();
  });
  await settle(page);
  await page.evaluate(() => { const f = document.querySelector('#settingsOverlay .settings-panel-body input'); f.scrollIntoView({block: 'start'}); document.querySelector('#settingsOverlay .settings-panel-body').scrollTop -= 60; });
}
async function scrollPastCover(page){
  // The cover's foot stays in frame; the IntersectionObserver on #upNext then lets the pill show.
  await page.evaluate(() => { const up = document.getElementById('upNext'); const r = up.getBoundingClientRect(); window.scrollTo(0, r.bottom + scrollY - 60); });
  await settle(page);
}
async function logSet(page){
  await page.click('#upNextLog');
}
async function openChat(page){ await page.click('#coachFab'); }
async function openExHistory(page){
  await page.evaluate(() => {
    const b = document.querySelector('#exerciseList .exercise-block');
    if(!b.classList.contains('open')) setExerciseBlockOpen(b, true);
  });
  await settle(page);
  await page.click('#exerciseList .exercise-block .ex-history-btn');
}

// ---- Seeds, serving, booting (the harness's rules) ---------------------------------------------------------------
const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/visual/fixture.json'), 'utf8'));
const appVersion = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/const APP_VERSION\s*=\s*'([^']+)'/)[1];
function seedOf(view, firstRun, scene = {}){
  if(firstRun) return {};
  const seed = {};
  for(const [k, v] of Object.entries(fixture)) seed[k] = v === '__APP_VERSION__' ? appVersion : v;
  seed[NS + 'active-view'] = view;
  seed[NS + 'weekly-recap-seen'] = TODAY;
  seed[NS + 'week-streak-last-celebrated'] = '8';
  // The harness's rest and gym seeds: resting after Bench set 2 (2:30 of 4:00 left); in the gym for 23 minutes.
  if(scene.rest) seed[NS + 'rest-timer-state'] = JSON.stringify({endsAt: FROZEN_NOW + 150 * 1000, total: 240});
  if(scene.gym) seed[NS + 'gym-session'] = JSON.stringify({date: TODAY, accumMs: 0, startedAt: FROZEN_NOW - 23 * 60 * 1000});
  return seed;
}
function serve(){
  const base = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    let p = decodeURIComponent(u.pathname);
    if(p.endsWith('/')) p += 'index.html';
    if(p === '/index.html'){
      let body;
      try{ body = patched(base, u.searchParams.get('variant')); }catch(e){ res.writeHead(500); return res.end(String(e)); }
      res.writeHead(200, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}); return res.end(body);
    }
    const file = path.join(ROOT, path.normalize(p));
    if(!file.startsWith(ROOT + path.sep)){ res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, buf) => {
      if(err){ res.writeHead(404); return res.end(); }
      const t = {'.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {'content-type': t, 'cache-control': 'no-store'}); res.end(buf);
    });
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}
function initScript({seed}){
  try{
    if(!sessionStorage.getItem('__seeded')){ localStorage.clear(); for(const k of Object.keys(seed)) localStorage.setItem(k, seed[k]); sessionStorage.setItem('__seeded', '1'); }
    sessionStorage.setItem('launch-played', '1');
  }catch(e){}
  let t = 0x5eed;
  Math.random = function(){ t = (t + 0x6D2B79F5) | 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
async function settle(page){
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(res => { let tm; const done = () => { o.disconnect(); res(); }; const o = new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(done, 400); }); o.observe(document.documentElement, {subtree: true, childList: true, attributes: true, characterData: true}); tm = setTimeout(done, 400); setTimeout(done, 8000); }));
  await page.evaluate(() => { for(const a of document.getAnimations()){ try{ const t = a.effect.getComputedTiming(); if(t.endTime === Infinity){ a.pause(); a.currentTime = 0; } else a.finish(); }catch(e){} } });
}

async function shoot(browser, origin, gap, scene, theme, opt){
  const viewport = scene.size || PHONE;
  const ctx = await browser.newContext({viewport, deviceScaleFactor: 2, colorScheme: theme, timezoneId: 'America/New_York', locale: 'en-US', serviceWorkers: 'block', hasTouch: true});
  const blocked = [];
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if(u.origin === origin || u.protocol === 'data:' || u.protocol === 'blob:') return r.continue(); blocked.push(u.href); return r.abort('blockedbyclient'); });
  await ctx.addInitScript(initScript, {seed: seedOf(scene.view || 'today', scene.firstRun, scene)});
  const page = await ctx.newPage();
  await page.clock.setFixedTime(FROZEN_NOW);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  await page.goto(origin + '/index.html' + (opt && opt.variant ? `?variant=${opt.variant}` : ''), {waitUntil: 'load'});
  if(scene.firstRun) await page.waitForSelector('#userPickerOverlay.active', {timeout: 15000});
  else await page.waitForFunction(() => typeof BOOT_MARKS !== 'undefined' && BOOT_MARKS.initEnd, null, {timeout: 30000});
  await settle(page);
  if(opt && opt.css) await page.addStyleTag({content: opt.css});
  if(scene.setup){ await scene.setup(page); }
  if(scene.wait) await page.waitForSelector(scene.wait, {timeout: 10000});
  await settle(page);
  // The proposal for sheets: focus lands on the sheet itself, as the set editor's does (v3.507), so no ring is
  // drawn on open; keyboard and switch users still get the ring on their next move.
  if(opt && opt.focusSheet) await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"]')].find(x => x.matches('.active') || !!x.closest('.active'));
    if(d){ if(!d.hasAttribute('tabindex')) d.setAttribute('tabindex', '-1'); d.focus(); } else if(document.activeElement) document.activeElement.blur();
  });
  if(scene.scroll){
    await page.evaluate(([sel, top]) => { const el = document.querySelector(sel); if(!el) throw new Error('no ' + sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - top); }, [scene.scroll, scene.top || 120]);
    await settle(page);
  }
  const file = path.join(OUT, 'cells', `${gap.n}-${scene.name}-${theme}-${opt ? opt.key : 'before'}.png`);
  await page.screenshot({path: file, animations: 'disabled', caret: 'hide'});
  await ctx.close();
  if(blocked.length || errors.length) throw new Error(`${path.basename(file)}: blocked ${blocked.length}, page errors ${errors.join(' | ')}`);
  return file;
}

async function contact(browser, gap, cells){
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const wide = gap.scenes.some(s => s.size === DUO);
  const w = wide ? 680 : 402;
  const cols = [{key: 'before', label: 'Before (v' + appVersion + ')'}, ...gap.options];
  const rows = [];
  for(const scene of gap.scenes) for(const theme of ['dark', 'light']) rows.push({scene, theme});
  const html = `<!doctype html><html><head><style>
    *{box-sizing:border-box;margin:0} body{background:#16161a;color:#e8e8ec;font:15px/1.35 "DejaVu Sans",sans-serif;padding:24px;width:${48 + cols.length * (w + 16)}px}
    h1{font-size:26px;font-weight:700;margin-bottom:4px} .meta{color:#a0a0aa;margin-bottom:16px;font-size:14px}
    .row{display:flex;gap:16px;margin-bottom:18px} figure{width:${w}px} figcaption{font-size:14px;color:#d0d0d8;margin-bottom:6px;font-weight:600;min-height:38px}
    img{display:block;width:${w}px;border:1px solid #33333a;border-radius:4px}
  </style></head><body><h1>${gap.n}. ${esc(gap.title)}</h1>
  <div class="meta">Rendered from the real app (fixture: Jordan, Mon 2 Nov 2026) with a prototype patch applied in memory · tools/design/unify/render.js</div>
  ${rows.map(r => `<div class="row">${cols.map(c => `<figure><figcaption>${esc(c.label)}<br><span style="font-weight:400;color:#a0a0aa">${esc(r.scene.name)} · ${r.theme}${r.scene.size === DUO ? ' · 904×678' : ' · 402×874'}</span></figcaption><img src="data:image/png;base64,${fs.readFileSync(cells[`${r.scene.name}-${r.theme}-${c.key}`]).toString('base64')}"></figure>`).join('')}</div>`).join('')}
  </body></html>`;
  const ctx = await browser.newContext({viewport: {width: 1200, height: 900}, deviceScaleFactor: 1});
  await ctx.route('**/*', r => r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const pg = await ctx.newPage();
  await pg.setContent(html, {waitUntil: 'load'});
  await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
  const file = path.join(OUT, `unify-${gap.n}.png`);
  await pg.screenshot({path: file, fullPage: true});
  await ctx.close();
  return file;
}

async function main(){
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  fs.mkdirSync(path.join(OUT, 'cells'), {recursive: true});
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars', '--disable-lcd-text']});
  try{
    for(const gap of GAPS){
      if(only.length && !only.includes(gap.n)) continue;
      const cells = {};
      for(const scene of gap.scenes) for(const theme of ['dark', 'light']){
        cells[`${scene.name}-${theme}-before`] = await shoot(browser, origin, gap, scene, theme, null);
        for(const opt of gap.options) cells[`${scene.name}-${theme}-${opt.key}`] = await shoot(browser, origin, gap, scene, theme, opt);
      }
      console.log(path.relative(ROOT, await contact(browser, gap, cells)));
    }
  }finally{ await browser.close(); server.close(); }
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
