'use strict';
// Behavioral coverage for a bug found during a continued functional audit of
// Settings' Import/Export: the "Restore backup" confirm dialog explicitly
// promises "This REPLACES everything currently stored on this device for
// this profile ... This can't be undone." But the restore loop only ever
// called window.storage.set() for keys present in the backup file's `data`
// object — it never deleted anything. Any key that existed on the device but
// wasn't in the backup (data logged since the backup was taken, or from a
// different schema shape) silently survived the "replace", directly
// contradicting what the user was just told would happen. The same gap
// existed for progress photos (IndexedDB blobs, tracked separately from
// window.storage): photos not present in the backup's `photos` object were
// never removed either.
//
// Extracted by literal anchor (not hand-copied) so a changed real
// implementation fails this test loudly rather than silently testing stale
// logic, matching the precedent test-program-cycle-start-backfill.js and
// test-sticky-day-header-overlap.js already established for snippets/inline
// event wiring extractFunction can't reach by name.
const { readIndexSource, runSandboxAsync, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-import-backup-full-replace.js');

const HANDLER_START = "document.getElementById('importDataInput').addEventListener('change', async (e)=>{";
const startIdx = src.indexOf(HANDLER_START);
if(startIdx === -1) throw new Error('import handler: start anchor not found');
const bodyStart = startIdx + HANDLER_START.length;
const endIdx = src.indexOf('\n});', bodyStart);
if(endIdx === -1) throw new Error('import handler: closing \'});\' not found');
const HANDLER_BODY = src.slice(bodyStart, endIdx);

test('sabotage-relevant: the extracted snippet is the real import handler and actually clears existing storage/photos before restoring, not the old merge-only shape', (assert)=>{
  assert.match(HANDLER_BODY, /window\.storage\.delete\(key\)/, 'must delete existing keys as part of the restore');
  assert.match(HANDLER_BODY, /photoDelete\(entry\.id\)/, 'must delete existing photo blobs as part of the restore');
  const deleteLoopIdx = HANDLER_BODY.indexOf('window.storage.delete(key)');
  const restoreLoopIdx = HANDLER_BODY.indexOf("Object.entries(parsed.data)");
  assert.ok(deleteLoopIdx !== -1 && restoreLoopIdx !== -1 && deleteLoopIdx < restoreLoopIdx, 'the clearing step must run BEFORE the backup data is written, not after (an after-the-fact clear would wipe out the just-restored data)');
});

function baseGlobals(seedStore, seedPhotoIds){
  return `
    window = {};
    var __store = ${JSON.stringify(seedStore)};
    window.storage = {
      get: async (k)=>{ if(!(k in __store)) throw new Error('not found'); return {key:k, value:__store[k]}; },
      set: async (k,v)=>{ __store[k]=v; return {key:k, value:v}; },
      delete: async (k)=>{ delete __store[k]; return {key:k, deleted:true}; },
      list: async (prefix)=>{ const keys = Object.keys(__store).filter(k=> !prefix || k.startsWith(prefix)); return {keys, prefix}; },
    };
    var __photoIndex = ${JSON.stringify(seedPhotoIds)}.map(id=> ({id}));
    var __deletedPhotoIds = [];
    var __putPhotos = {};
    async function getPhotoIndex(){ return __photoIndex; }
    async function photoDelete(id){ __deletedPhotoIds.push(id); }
    async function photoPut(id, blob){ __putPhotos[id] = blob; }
    function dataUrlToBlob(url){ return {url}; }
    function confirm(msg){ __confirmMsg = msg; return true; }
    var __confirmMsg = null;
    function setTimeout(fn){ fn(); }
    var SCHEMA_VERSION = 7;
    function getTodayKey(){ return '2026-06-15'; }
    var location = { reload: ()=>{ __reloaded = true; } };
    var __reloaded = false;
    var __statusEl = {textContent: ''};
    var document = { getElementById: (id)=> __statusEl };

    async function runImportHandler(e){
      ${HANDLER_BODY}
    }
  `;
}

test('REAL invocation: a key that exists on the device but is ABSENT from the backup is deleted, not left behind — this is the exact bug (the confirm dialog promises a full replace)', async (assert)=>{
  const captured = await runSandboxAsync([], `
    ${baseGlobals({'weight-log': '[{"old":true}]', 'stray-key-not-in-backup': 'should-be-gone', 'workout:something': 'stale-leftover'}, [])}
    var __fakeFile = { text: async ()=> JSON.stringify({schemaVersion:7, exportedAt:'2026-06-01T00:00:00.000Z', profileName:'Test', data:{'weight-log':'[{"new":true}]'}}) };
    await runImportHandler({target:{files:[__fakeFile], value:''}});
    __capture.push({store: __store, reloaded: __reloaded});
  `);
  assert.strictEqual('weight-log' in captured[0].store, true, 'a key present in the backup must still end up restored');
  assert.strictEqual(captured[0].store['weight-log'], '[{"new":true}]', 'the restored value must be the BACKUP\'s value, not the pre-existing one');
  assert.strictEqual('stray-key-not-in-backup' in captured[0].store, false, 'a key that exists on the device but is not in the backup must be gone after a restore that promised to replace everything');
  assert.strictEqual('workout:something' in captured[0].store, false, 'same for any other stray key not present in the backup');
  assert.strictEqual(captured[0].reloaded, true, 'a successful restore must still reload, matching existing behavior');
});

test('REAL invocation: an existing photo NOT present in the backup\'s photos object is deleted; one that IS present is restored', async (assert)=>{
  const captured = await runSandboxAsync([], `
    ${baseGlobals({}, ['old-photo-1', 'old-photo-2'])}
    var __fakeFile = { text: async ()=> JSON.stringify({schemaVersion:7, exportedAt:'2026-06-01T00:00:00.000Z', profileName:'Test', data:{'some-key':'v'}, photos:{'new-photo': 'YmFzZTY0'}}) };
    await runImportHandler({target:{files:[__fakeFile], value:''}});
    __capture.push({deletedPhotoIds: __deletedPhotoIds, putPhotos: __putPhotos});
  `);
  assert.deepStrictEqual(captured[0].deletedPhotoIds.sort(), ['old-photo-1', 'old-photo-2'], 'every photo that existed before the restore must be deleted, since none of them are in this backup');
  assert.ok('new-photo' in captured[0].putPhotos, 'the photo actually present in the backup must be restored');
});

test('regression guard: declining the confirm() prompt leaves storage and photos completely untouched', async (assert)=>{
  const captured = await runSandboxAsync([], `
    ${baseGlobals({'weight-log': '[{"old":true}]'}, ['old-photo-1'])}
    function confirm(msg){ return false; }
    var __fakeFile = { text: async ()=> JSON.stringify({schemaVersion:7, exportedAt:'2026-06-01T00:00:00.000Z', profileName:'Test', data:{'weight-log':'[{"new":true}]'}}) };
    await runImportHandler({target:{files:[__fakeFile], value:''}});
    __capture.push({store: __store, deletedPhotoIds: __deletedPhotoIds, reloaded: __reloaded});
  `);
  assert.strictEqual(captured[0].store['weight-log'], '[{"old":true}]', 'declining the confirm must leave existing data exactly as it was');
  assert.deepStrictEqual(captured[0].deletedPhotoIds, [], 'declining the confirm must not touch photos either');
  assert.strictEqual(captured[0].reloaded, false, 'declining the confirm must never reload');
});

test('regression guard: an invalid (non-JSON) file still bails out before ever touching storage or photos', async (assert)=>{
  const captured = await runSandboxAsync([], `
    ${baseGlobals({'weight-log': '[{"old":true}]'}, ['old-photo-1'])}
    var __fakeFile = { text: async ()=> 'not valid json{{{' };
    await runImportHandler({target:{files:[__fakeFile], value:''}});
    __capture.push({store: __store, deletedPhotoIds: __deletedPhotoIds, statusText: __statusEl.textContent});
  `);
  assert.strictEqual(captured[0].store['weight-log'], '[{"old":true}]', 'a bad file must never touch existing storage');
  assert.deepStrictEqual(captured[0].deletedPhotoIds, [], 'a bad file must never touch existing photos');
  assert.match(captured[0].statusText, /valid JSON/, 'must surface the existing invalid-file message unchanged');
});

run();
