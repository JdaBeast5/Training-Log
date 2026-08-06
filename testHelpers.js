'use strict';
// Shared test infrastructure for jsdom behavioral tests against index.html.
//
// Line numbers drift with every edit — this project's own history documents
// that as a recurring source of false test confidence. So extraction here is
// done by NAME at test-run time (brace/paren counting over the real file),
// never by hardcoding a line range into a test.
const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, 'index.html');

function readIndexSource(){
  return fs.readFileSync(INDEX_PATH, 'utf8');
}

// Scans forward from `openIdx` (the index of the opening brace/paren) and
// returns the index just past its matching close, respecting '...', "...",
// `...` (with ${...} interpolation nesting) and // and /* */ comments so
// that a brace/paren inside a string or comment never miscounts.
function scanBalanced(src, openIdx, openCh, closeCh){
  let depth = 0;
  let i = openIdx;
  const n = src.length;
  for(; i < n; i++){
    const c = src[i];
    if(c === openCh) depth++;
    else if(c === closeCh){
      depth--;
      if(depth === 0) return i + 1;
    } else if(c === '/' && src[i+1] === '/'){
      const nl = src.indexOf('\n', i);
      i = (nl === -1) ? n : nl;
    } else if(c === '/' && src[i+1] === '*'){
      const end = src.indexOf('*/', i+2);
      i = (end === -1) ? n : end + 1;
    } else if(c === '\'' || c === '"'){
      i = scanQuoted(src, i, c);
    } else if(c === '`'){
      i = scanTemplate(src, i);
    }
  }
  throw new Error(`scanBalanced: never found matching ${closeCh} from index ${openIdx}`);
}

function scanQuoted(src, i, quote){
  i++;
  while(i < src.length){
    if(src[i] === '\\'){ i += 2; continue; }
    if(src[i] === quote) return i;
    i++;
  }
  throw new Error('scanQuoted: unterminated string');
}

// Template literals can contain ${ ... } with arbitrary nested JS, including
// more template literals — handled by recursing into scanBalanced for each
// ${ } span rather than treating the whole template as opaque text.
function scanTemplate(src, i){
  i++;
  while(i < src.length){
    if(src[i] === '\\'){ i += 2; continue; }
    if(src[i] === '`') return i;
    if(src[i] === '$' && src[i+1] === '{'){
      const close = scanBalanced(src, i+1, '{', '}');
      i = close;
      continue;
    }
    i++;
  }
  throw new Error('scanTemplate: unterminated template literal');
}

// Finds `function name(` or `async function name(` at the start of a line
// (ignoring leading whitespace) so a comment or string mentioning the name
// elsewhere can never be picked up instead of the real declaration.
function extractFunction(src, name){
  const re = new RegExp(`^[ \\t]*(?:async\\s+)?function\\s+${name}\\s*\\(`, 'm');
  const m = re.exec(src);
  if(!m) throw new Error(`extractFunction: no top-level declaration found for ${name}`);
  const sigStart = m.index;
  const parenOpen = src.indexOf('(', sigStart);
  const parenClose = scanBalanced(src, parenOpen, '(', ')');
  const braceOpen = src.indexOf('{', parenClose);
  if(braceOpen === -1 || src.slice(parenClose, braceOpen).trim() !== ''){
    throw new Error(`extractFunction: unexpected content between signature and body for ${name}`);
  }
  const braceClose = scanBalanced(src, braceOpen, '{', '}');
  return src.slice(sigStart, braceClose);
}

// Finds `const NAME = ...;` at the start of a line and returns through the
// terminating top-level semicolon (brace/paren/bracket-depth aware, so a
// semicolon inside an object/array literal doesn't cut it short).
function extractConst(src, name){
  const re = new RegExp(`^[ \\t]*const\\s+${name}\\s*=`, 'm');
  const m = re.exec(src);
  if(!m) throw new Error(`extractConst: no top-level declaration found for ${name}`);
  const start = m.index;
  let i = start;
  let depth = 0;
  const n = src.length;
  for(; i < n; i++){
    const c = src[i];
    if(c === '{' || c === '(' || c === '[') depth++;
    else if(c === '}' || c === ')' || c === ']') depth--;
    else if(depth === 0 && c === ';') return src.slice(start, i + 1);
    else if(c === '/' && src[i+1] === '/'){
      const nl = src.indexOf('\n', i);
      i = (nl === -1) ? n : nl;
    } else if(c === '/' && src[i+1] === '*'){
      const end = src.indexOf('*/', i+2);
      i = (end === -1) ? n : end + 1;
    } else if(c === '\'' || c === '"'){
      i = scanQuoted(src, i, c);
    } else if(c === '`'){
      i = scanTemplate(src, i);
    }
  }
  throw new Error(`extractConst: never found terminating ';' for ${name}`);
}

// Counts real top-level call sites of `name(` in the source — i.e. not the
// declaration itself and not occurrences inside comments/strings. Used for
// sabotage-style anchors: if a refactor is supposed to route N call sites
// through a shared helper, this proves the count, not a guess.
function countCallSites(src, name){
  const re = new RegExp(`\\b${name}\\s*\\(`, 'g');
  let count = 0;
  let m;
  while((m = re.exec(src))){
    // Walk backward from the match to see if it's a function declaration
    // (`function name(`) rather than a call — declarations aren't calls.
    const before = src.slice(Math.max(0, m.index - 20), m.index);
    if(/function\s+$/.test(before)) continue;
    count++;
  }
  return count;
}

let simpleAssert;
function assertMod(){
  if(!simpleAssert) simpleAssert = require('assert');
  return simpleAssert;
}

// Minimal test runner: register cases, run them, print a summary, exit
// non-zero on any failure so `npm test`/check.sh actually catches it.
// `run()` is async so test functions may themselves be async (most of this
// app's storage-reading functions are) — check.sh awaits each test file's
// module load, and Node keeps the process alive until pending promises
// settle, so a plain top-level `run();` call at the bottom of a test file
// still works whether or not any case inside it is async.
function makeRunner(fileLabel){
  const cases = [];
  function test(name, fn){ cases.push({name, fn}); }
  async function run(){
    const assert = assertMod();
    let pass = 0, fail = 0;
    for(const {name, fn} of cases){
      try{
        await fn(assert);
        pass++;
        console.log(`  ok - ${name}`);
      }catch(e){
        fail++;
        console.log(`  FAIL - ${name}`);
        console.log(`    ${e.message}`);
      }
    }
    console.log(`${fileLabel}: ${pass} passed, ${fail} failed`);
    if(fail > 0) process.exitCode = 1;
  }
  return {test, run};
}

// Runs a batch of extracted source chunks + a test body in a fresh vm
// context, all as ONE script (so `var`/function declarations share one
// top-level scope and are guaranteed to be readable back as context
// properties afterward — mixing separate runInContext calls on the same
// context is not reliable for that). `weightUnit`/`equipmentProfile` are
// pre-declared as `var` (not `let`) specifically so the test body can
// reassign them mid-script to flip scenarios. The test body pushes
// whatever it wants to assert on into `__capture`, which this returns.
function runSandbox(sourceChunks, testBody){
  const vm = require('vm');
  const context = vm.createContext({ console });
  const full = [
    "var weightUnit = 'lb';",
    "var equipmentProfile = null;",
    "var __capture = [];",
    ...sourceChunks,
    testBody,
    // Objects/arrays built inside a vm context carry that context's own
    // Object/Array prototypes, not the host's — assert.deepStrictEqual
    // treats those as different types even with identical shape. Round-trip
    // through JSON (host-side) so callers get plain host-realm values.
    "JSON.stringify(__capture);",
  ].join('\n\n');
  const json = vm.runInContext(full, context, { filename: 'sandbox.js' });
  return JSON.parse(json);
}

// Same contract as runSandbox, but for test bodies that need `await` (most
// of this app's storage-reading functions are async). Top-level await isn't
// legal in a classic vm script, so the composed body is wrapped in an async
// IIFE; vm.runInContext then returns a promise the caller awaits.
async function runSandboxAsync(sourceChunks, testBody){
  const vm = require('vm');
  const context = vm.createContext({ console });
  const full = [
    "var weightUnit = 'lb';",
    "var equipmentProfile = null;",
    "var __capture = [];",
    ...sourceChunks,
    "(async () => {",
    testBody,
    "return JSON.stringify(__capture);",
    "})();",
  ].join('\n\n');
  const json = await vm.runInContext(full, context, { filename: 'sandbox-async.js' });
  return JSON.parse(json);
}

// This codebase wires up several features as `(function name(){ ... })();`
// — a named IIFE, not a function declaration — specifically so the wiring
// runs once at load without polluting the top-level namespace with a
// callable. extractFunction can't find these (its regex requires the line
// to start with `function`/`async function`); this extracts the named
// function expression itself, `function name(){ ... }`, WITHOUT the
// wrapping parens/invocation — the caller appends `name();` to actually run
// it, same as this file already does inline for the extracted body.
function extractIIFE(src, name){
  const re = new RegExp(`^\\(function\\s+${name}\\s*\\(`, 'm');
  const m = re.exec(src);
  if(!m) throw new Error(`extractIIFE: no named IIFE found for ${name}`);
  const fnStart = m.index + 1; // skip the leading '('
  const parenOpen = src.indexOf('(', fnStart);
  const parenClose = scanBalanced(src, parenOpen, '(', ')');
  const braceOpen = src.indexOf('{', parenClose);
  const braceClose = scanBalanced(src, braceOpen, '{', '}');
  return src.slice(fnStart, braceClose);
}

// Finds `id="theId"` (or `id='theId'`), walks back to the start of that
// tag's opening `<tagname`, then scans forward counting nested opens/closes
// of that SAME tag name until it returns to depth 0, returning the full
// `<tagname ...>...</tagname>` substring. Skips quoted attribute values (so
// a `>` inside `alt=">"` can't end a tag early) and HTML comments (so a
// `</div>` mentioned inside `<!-- -->` can't miscount). This is a markup
// analogue of extractFunction — by identity, not by line range, for the
// same reason: line numbers drift with every edit.
function extractElementById(html, id){
  const idRe = new RegExp(`id=["']${id}["']`);
  const idMatch = idRe.exec(html);
  if(!idMatch) throw new Error(`extractElementById: no element with id="${id}" found`);
  const tagStart = html.lastIndexOf('<', idMatch.index);
  if(tagStart === -1) throw new Error(`extractElementById: could not find opening < before id="${id}"`);
  const tagNameMatch = /^<([a-zA-Z0-9-]+)/.exec(html.slice(tagStart));
  if(!tagNameMatch) throw new Error(`extractElementById: could not read tag name at index ${tagStart}`);
  const tagName = tagNameMatch[1];

  const openRe = new RegExp(`<${tagName}(?=[\\s>])`, 'g');
  const closeRe = new RegExp(`</${tagName}\\s*>`, 'g');

  let i = tagStart;
  let depth = 0;
  const n = html.length;
  while(i < n){
    if(html.startsWith('<!--', i)){
      const end = html.indexOf('-->', i + 4);
      i = (end === -1) ? n : end + 3;
      continue;
    }
    closeRe.lastIndex = i;
    openRe.lastIndex = i;
    const closeAt = html.startsWith(`</${tagName}`, i) ? i : -1;
    if(closeAt === i){
      const m = new RegExp(`^</${tagName}\\s*>`).exec(html.slice(i));
      if(m){
        depth--;
        i += m[0].length;
        if(depth === 0) return html.slice(tagStart, i);
        continue;
      }
    }
    const openM = new RegExp(`^<${tagName}(?=[\\s>])`).exec(html.slice(i));
    if(openM){
      // Advance to the end of THIS opening tag (respecting quoted attribute
      // values) to check whether it's self-closed (`... />`) before counting.
      let j = i + openM[0].length;
      let selfClosed = false;
      while(j < n){
        const c = html[j];
        if(c === '"' || c === '\''){
          const end = html.indexOf(c, j + 1);
          j = (end === -1) ? n : end + 1;
          continue;
        }
        if(c === '>'){
          selfClosed = html[j-1] === '/';
          j++;
          break;
        }
        j++;
      }
      depth += selfClosed ? 0 : 1;
      i = j;
      continue;
    }
    i++;
  }
  throw new Error(`extractElementById: never found matching close for <${tagName} id="${id}">`);
}

// For tests that need real DOM behavior (classList, dataset,
// nextElementSibling, querySelectorAll, click events) rather than pure
// logic — builds a jsdom document from real extracted markup, injects
// `window.storage`/other globals as plain assignments (not `var`, so they
// land on jsdom's actual window rather than a script-local shadow — the
// same mistake this suite already made once with a plain vm context), then
// runs the composed script synchronously via a real <script> tag. Returns
// {window, document} for the caller to assert against and to fire further
// events on.
function runJsdom(bodyHtml, globalsSetup, scriptChunks){
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(`<!DOCTYPE html><body>${bodyHtml}</body>`, { runScripts: 'dangerously' });
  const full = [globalsSetup, ...scriptChunks].join('\n\n');
  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = full;
  dom.window.document.body.appendChild(scriptEl);
  return { window: dom.window, document: dom.window.document };
}

module.exports = {
  readIndexSource,
  extractFunction,
  extractConst,
  extractIIFE,
  extractElementById,
  countCallSites,
  makeRunner,
  runSandbox,
  runSandboxAsync,
  runJsdom,
};
