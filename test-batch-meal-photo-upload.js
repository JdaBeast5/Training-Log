'use strict';
// Behavioral coverage for batch Snap-a-Meal photo uploads (v3.239).
//
// Before this change, #photoLogInput took exactly one file and the change
// handler analyzed it with a single callClaudeVision call. The user asked
// for multiple-photo-at-once upload with extraction from each. The fix:
// the input gained the `multiple` attribute, the inline change handler was
// pulled out into a standalone, testable handlePhotoLogUpload(files) (same
// precedent as handleAiApiKeySave), and each photo gets its OWN
// callClaudeVision call — not one call carrying every image — via
// Promise.allSettled, so a bad photo in the batch can't sink the others and
// the portion-size visual cues the prompt relies on stay specific to one
// photo at a time. Results from every photo in the batch are merged into
// one flat photoLogParsedItems list, matching how "Add All" already adds
// everything at once regardless of source.
//
// Real invocation throughout, fetch stubbed at the network boundary (the
// true edge of what this app controls, same convention as
// test-ai-cross-metric-effort-fix.js) and URL.createObjectURL stubbed since
// jsdom doesn't implement it at all.
const { readIndexSource, extractFunction, extractConst, runJsdom, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-batch-meal-photo-upload.js');

// --- markup: the input itself must actually accept more than one file ---

test('the real #photoLogInput markup carries the multiple attribute', (assert)=>{
  // <input> is a void element (no closing tag) — testHelpers' tag-identity
  // extractors are built around matching open/close pairs, so this pulls
  // the single self-contained opening tag directly instead.
  const m = /<input[^>]*id="photoLogInput"[^>]*>/.exec(src);
  assert.ok(m, 'the real #photoLogInput element must exist');
  assert.match(m[0], /\bmultiple\b/, 'without this attribute the native file picker only ever allows selecting one photo, regardless of what the JS below can handle');
});

// --- behavioral: handlePhotoLogUpload / renderPhotoLogResult / renderPhotoPreviewRow ---

const aiMaxAttemptsSrc = extractConst(src, 'AI_MAX_ATTEMPTS');
const aiRetryStatusesSrc = extractConst(src, 'AI_RETRY_STATUSES');
const aiSleepSrc = extractFunction(src, 'aiSleep');
const anthropicRequestSrc = extractFunction(src, 'anthropicRequest');
const callClaudeVisionSrc = extractFunction(src, 'callClaudeVision');
const fileToBase64Src = extractFunction(src, 'fileToBase64');
const getApiKeySrc = extractFunction(src, 'getApiKey');
const escapeHtmlSrc = extractFunction(src, 'escapeHtml');
const aiKeySetupPromptSrc = extractFunction(src, 'aiKeySetupPrompt');
const foodMacroFieldsSrc = extractConst(src, 'FOOD_MACRO_FIELDS');
const foodQtyMaxSrc = extractConst(src, 'FOOD_QTY_MAX');
const foodRowTotalTextSrc = extractFunction(src, 'foodRowTotalText');
const buildFoodResultRowsSrc = extractFunction(src, 'buildFoodResultRows');
const buildFoodResultRowSrc = extractFunction(src, 'buildFoodResultRow');
const wireFoodResultRowsSrc = extractFunction(src, 'wireFoodResultRows');
const renderPhotoPreviewRowSrc = extractFunction(src, 'renderPhotoPreviewRow');
const renderPhotoLogResultSrc = extractFunction(src, 'renderPhotoLogResult');
const handlePhotoLogUploadSrc = extractFunction(src, 'handlePhotoLogUpload');

// itemViolatesPreferences is buildFoodResultRow's real dependency, but its
// own dietary-matching chain is unrelated to this feature (already covered
// end to end by test-food-result-row-dietary-flag.js) — stubbed to a plain
// "never violates" here so this file stays focused on the batch-upload
// behavior it exists to prove, same license test-ai-cross-metric-effort-fix.js
// took stubbing out buildCrossMetricInsightsContext/getCoachPersona.
const stubs = `
  function itemViolatesPreferences(){ return null; }
  function logDayLabel(){ return "Today's"; }
  var customFoods = [];
`;

const bodyHtml = `
  <div id="mealSuggestions"></div>
  <div id="photoLogResult"></div>
  <div id="barcodeResult"></div>
  <div id="describeFoodResult"></div>
  <div id="recipeFinderResult"></div>
`;

function fakeApiResponse(itemsJson){
  return { ok: true, json: async ()=> ({ content: [{type:'text', text: JSON.stringify({items: itemsJson})}] }) };
}
function fakeApiError(status, message){
  return { ok: false, status, headers: { get: ()=> null }, json: async ()=> ({error:{message}}) };
}

// Keyed by the file's own text content (the "photo data") so the fetch stub
// can answer each of the N real, independent requests with the response
// that belongs to THAT photo — proving results don't get scrambled across
// photos in the batch, not just that N responses came back from somewhere.
function setup(responsesByPhotoData){
  const captured = [];
  const globalsSetup = `
    window.URL.createObjectURL = (file) => 'preview:' + file.__photoData;
    window.fetch = (url, opts) => {
      const body = JSON.parse(opts.body);
      // The real request carries base64-encoded image bytes (fileToBase64,
      // exercised for real here) — decode back to the original tag so the
      // stub can answer with THAT photo's response.
      const imgData = atob(body.messages[0].content[0].source.data);
      __capturedRequests.push(body);
      const resp = __responsesByPhotoData[imgData];
      if(!resp) throw new Error('test setup error: no stubbed response for ' + imgData);
      return resp;
    };
    window.storage = {
      get: async (k)=> k === 'ai-api-key' ? {key:k, value:'fake-key'} : (()=>{ throw new Error('not found'); })(),
      set: async ()=>{},
    };
  `;
  const { window, document } = runJsdom(bodyHtml, globalsSetup, [
    stubs,
    aiMaxAttemptsSrc, aiRetryStatusesSrc, aiSleepSrc, anthropicRequestSrc, callClaudeVisionSrc,
    fileToBase64Src, getApiKeySrc, escapeHtmlSrc, aiKeySetupPromptSrc,
    foodMacroFieldsSrc, foodQtyMaxSrc, foodRowTotalTextSrc,
    buildFoodResultRowsSrc, buildFoodResultRowSrc, wireFoodResultRowsSrc,
    renderPhotoPreviewRowSrc, renderPhotoLogResultSrc, handlePhotoLogUploadSrc,
    "function clearOtherQuickAddResults(exceptId){ ['mealSuggestions','photoLogResult','barcodeResult','describeFoodResult','recipeFinderResult'].forEach(id=>{ if(id!==exceptId) document.getElementById(id).innerHTML=''; }); }",
    'window.__capturedRequests = [];',
    'window.__responsesByPhotoData = {};',
    'window.handlePhotoLogUpload = handlePhotoLogUpload;',
    'window.renderPhotoPreviewRow = renderPhotoPreviewRow;',
  ]);
  window.__capturedRequests = captured;
  window.__responsesByPhotoData = responsesByPhotoData;
  return { window, document, captured };
}

// jsdom's real File/Blob/FileReader implementation base64-encodes whatever
// bytes the File was built from — tagging each File with __photoData too
// (a plain property jsdom leaves alone) lets the fetch stub above and the
// test assertions identify which real photo a given request/response came
// from without re-deriving base64 by hand.
function makeFile(window, name, textContent){
  const file = new window.File([textContent], name, {type:'image/jpeg'});
  file.__photoData = textContent;
  return file;
}

test('REAL invocation: three photos in one batch produce exactly three independent callClaudeVision requests, each carrying exactly ONE image', async (assert)=>{
  const { window, captured } = setup({
    photoA: fakeApiResponse([{name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}]),
    photoB: fakeApiResponse([{name:'Banana', cal:100, pro:1, fat:0, carb:27}, {name:'Coffee', cal:5, pro:0, fat:0, carb:1}]),
    photoC: fakeApiResponse([{name:'Toast', cal:150, pro:5, fat:3, carb:25}]),
  });
  const files = [
    makeFile(window, 'a.jpg', 'photoA'),
    makeFile(window, 'b.jpg', 'photoB'),
    makeFile(window, 'c.jpg', 'photoC'),
  ];
  await window.handlePhotoLogUpload(files);

  assert.strictEqual(captured.length, 3, 'a batch of 3 photos must dispatch 3 independent API requests — bundling every image into one request would leave this at 1');
  captured.forEach(body=>{
    assert.strictEqual(body.messages[0].content.length, 2, 'each request must carry exactly one image block plus the text prompt, not multiple images stacked into a single call');
    assert.strictEqual(body.messages[0].content[0].type, 'image');
  });
  const sentImages = captured.map(b=> Buffer.from(b.messages[0].content[0].source.data, 'base64').toString()).sort();
  assert.deepStrictEqual(sentImages, ['photoA','photoB','photoC'], 'each request must actually carry that specific photo\'s own data, not a shared/wrong one');
});

test('REAL invocation: items detected across all photos in the batch merge into one flat, rendered list', async (assert)=>{
  const { window, document } = setup({
    photoA: fakeApiResponse([{name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}]),
    photoB: fakeApiResponse([{name:'Banana', cal:100, pro:1, fat:0, carb:27}, {name:'Coffee', cal:5, pro:0, fat:0, carb:1}]),
  });
  const files = [makeFile(window, 'a.jpg', 'photoA'), makeFile(window, 'b.jpg', 'photoB')];
  await window.handlePhotoLogUpload(files);

  const resultEl = document.getElementById('photoLogResult');
  const rows = resultEl.querySelectorAll('.food-result-row');
  assert.strictEqual(rows.length, 3, 'all 3 items across both photos must appear as real rows in one merged list');
  assert.match(resultEl.innerHTML, /Found 3 items/);
  const names = Array.from(resultEl.querySelectorAll('.frr-name-input')).map(i=> i.value).sort();
  assert.deepStrictEqual(names, ['Banana','Coffee','Oatmeal'], 'the merged list must contain every item from every photo, not just the last photo\'s');
});

test('REAL invocation: one bad photo in a batch does not discard the results from the photos that succeeded', async (assert)=>{
  const { window, document } = setup({
    photoA: fakeApiResponse([{name:'Oatmeal', cal:300, pro:10, fat:5, carb:50}]),
    photoB: fakeApiError(500, 'server exploded'),
    photoC: fakeApiResponse([{name:'Toast', cal:150, pro:5, fat:3, carb:25}]),
  });
  const files = [makeFile(window, 'a.jpg', 'photoA'), makeFile(window, 'b.jpg', 'photoB'), makeFile(window, 'c.jpg', 'photoC')];
  await window.handlePhotoLogUpload(files);

  const resultEl = document.getElementById('photoLogResult');
  const rows = resultEl.querySelectorAll('.food-result-row');
  assert.strictEqual(rows.length, 2, 'the two successful photos\' items must still render even though the middle photo failed');
  const names = Array.from(resultEl.querySelectorAll('.frr-name-input')).map(i=> i.value).sort();
  assert.deepStrictEqual(names, ['Oatmeal','Toast']);
  assert.match(resultEl.innerHTML, /Couldn.t analyze 1 of your photos/, 'a partial failure must be surfaced, not silently swallowed');
});

test('REAL invocation: every photo in the batch failing shows the real error, not a fake empty success', async (assert)=>{
  const { window, document } = setup({
    photoA: fakeApiError(500, 'server exploded'),
    photoB: fakeApiError(500, 'server exploded'),
  });
  const files = [makeFile(window, 'a.jpg', 'photoA'), makeFile(window, 'b.jpg', 'photoB')];
  await window.handlePhotoLogUpload(files);

  const resultEl = document.getElementById('photoLogResult');
  assert.strictEqual(resultEl.querySelectorAll('.food-result-row').length, 0);
  assert.match(resultEl.innerHTML, /Couldn.t analyze/, 'total failure of the batch must surface a real error banner');
});

test('REAL invocation: with no API key saved, a batch upload shows the key-setup prompt and never calls the network', async (assert)=>{
  const { window, document, captured } = setup({});
  window.storage.get = async ()=>{ throw new Error('not found'); };
  const files = [makeFile(window, 'a.jpg', 'photoA')];
  await window.handlePhotoLogUpload(files);

  assert.strictEqual(captured.length, 0, 'missing key must short-circuit before any photo is analyzed');
  assert.match(document.getElementById('photoLogResult').innerHTML, /AI Features Setup|api key|API key/i);
});

test('REAL invocation: renderPhotoPreviewRow renders a single photo the same way it always has (one plain .photo-preview, no wrapping row)', (assert)=>{
  const { window } = setup({});
  const html = window.renderPhotoPreviewRow(['preview:one']);
  const dom = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`);
  assert.strictEqual(dom.window.document.querySelectorAll('.photo-preview-row').length, 0, 'a single-photo upload must not get the multi-photo row wrapper — the existing single-photo look stays unchanged');
  assert.strictEqual(dom.window.document.querySelectorAll('.photo-preview').length, 1);
});

test('REAL invocation: renderPhotoPreviewRow wraps multiple photos in one .photo-preview-row of thumbnails', (assert)=>{
  const { window } = setup({});
  const html = window.renderPhotoPreviewRow(['preview:one', 'preview:two', 'preview:three']);
  const dom = new (require('jsdom').JSDOM)(`<!DOCTYPE html><body>${html}</body>`);
  const row = dom.window.document.querySelectorAll('.photo-preview-row');
  assert.strictEqual(row.length, 1);
  assert.strictEqual(row[0].querySelectorAll('.photo-preview').length, 3, 'every photo in the batch must get its own thumbnail inside the row');
});

run();
