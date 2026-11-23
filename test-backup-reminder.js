'use strict';
// v3.627 (BIZ-04): the first backup reminder after 3 sessions, not 10.
// Everything lives in one browser with no second copy, and Safari ignores
// navigator.storage.persist(); three sessions is the first point where a new
// user has a program week worth losing. BACKUP_NUDGE_REPEAT and the copy are
// unchanged.
//
// Real invocation: the real getBackupReminderInsight over the real
// buildNamespacedStorage (which throws 'not found' for a key never written,
// as on the device), with BACKUP_NUDGE_FIRST and BACKUP_NUDGE_REPEAT from the
// source. Sabotage: set BACKUP_NUDGE_FIRST back to 10 and criterion 1 fails.
const { JSDOM } = require('jsdom');
const { makeRunner, readIndexSource, extractFunction, extractConst } = require('./testHelpers.js');

const { test, run } = makeRunner('test-backup-reminder.js');
const src = readIndexSource();

function insight({dates = [], lastBackup = null} = {}){
  const dom = new JSDOM('<!DOCTYPE html><body></body>', {runScripts: 'dangerously', url: 'https://platestep.test/'});
  const w = dom.window;
  const el = w.document.createElement('script');
  el.textContent = [
    `function bumpExCorpusGen(){} function bumpFoodLogGen(){} function bumpWaterGen(){} function bumpWorkoutGen(){}
     function clearStorageSpill(){} function isQuotaError(){ return false; } function noteStorageDegraded(){}
     const __pre = 'trainingLog_usr1:';
     ${dates.length ? `localStorage.setItem(__pre + 'activity-dates', ${JSON.stringify(JSON.stringify(dates))});` : ''}
     ${lastBackup ? `localStorage.setItem(__pre + 'last-backup', ${JSON.stringify(lastBackup)});` : ''}`,
    extractConst(src, 'RAW_PREFIX'), extractFunction(src, 'buildNamespacedStorage'),
    extractConst(src, 'BACKUP_NUDGE_FIRST'), extractConst(src, 'BACKUP_NUDGE_REPEAT'),
    ...['parseDateKey', 'formatDate', 'fmtDayLabel', 'getBackupReminderInsight'].map(f => extractFunction(src, f)),
    `window.storage = buildNamespacedStorage('1');
     window.__go = getBackupReminderInsight();`].join('\n\n');
  w.document.body.appendChild(el);
  return w.__go;
}
const days = (n, from = '2026-10-01') => Array.from({length: n}, (_, i) => new Date(Date.parse(from + 'T12:00:00Z') + i * 86400000).toISOString().slice(0, 10));

test('criterion 1: 3 activity dates and no last-backup: the reminder says "Nothing here is backed up yet"', async (assert)=>{
  const text = await insight({dates: days(3)});
  assert.ok(text, 'a row');
  assert.match(text, /Nothing here is backed up yet/);
  assert.match(text, /3 sessions logged/);
});

test('criterion 2: 2 dates: nothing (and nothing at all logged: nothing, through the real storage\'s "not found")', async (assert)=>{
  assert.strictEqual(await insight({dates: days(2)}), null);
  assert.strictEqual(await insight(), null);
});

test('criterion 3: after a backup, 19 later dates: nothing; 20: the repeat text, unchanged', async (assert)=>{
  const before = days(5, '2026-09-01'), after = days(20, '2026-10-01');
  assert.strictEqual(await insight({dates: before.concat(after.slice(0, 19)), lastBackup: '2026-09-30'}), null);
  const text = await insight({dates: before.concat(after), lastBackup: '2026-09-30'});
  assert.match(text, /^<b>20 sessions since your last backup<\/b> \(/);
  assert.match(text, /Export My Data/);
});

test('the constants: the first nudge at 3, the repeat still 20', (assert)=>{
  assert.match(extractConst(src, 'BACKUP_NUDGE_FIRST'), /=\s*3;/);
  assert.match(extractConst(src, 'BACKUP_NUDGE_REPEAT'), /=\s*20;/);
});

run();
