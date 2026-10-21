'use strict';
// iPhone Duo support, part 8: gym mode on a short landscape screen — the
// Duo's cover screen turned sideways (~678x466pt) and a slab iPhone turned
// sideways (~874x402pt), both reachable since v3.270 unlocked rotation.
//
// Laid out like a portrait phone, the bottom dock covered the open exercise
// and left one or two set rows usable. Inside
// @media (orientation:landscape) and (max-height:559px) the dock becomes a
// rail down the right edge, the list gets the full height beside it, and the
// rest timer centres on the list area at the bottom.
//
// jsdom evaluates no media queries, so this reads the real gate and real
// formulas from index.html and evaluates them against real device sizes and
// inset pairs. Real-browser result (Chromium, 874x402 with emulated 59/59/21
// insets): exercise 69..669, rail 689..805 (10px inside the right inset),
// timer centred on the list at x=369 and ending 10px above the bottom inset,
// "1:02:33" fits the rail; portrait and open-Duo gym mode pixel-identical to
// before; rotating back restores the portrait layout. See HANDOFF-v51.
const { readIndexSource, makeRunner } = require('./testHelpers.js');

const src = readIndexSource();
const { test, run } = makeRunner('test-duo-gym-short-landscape.js');

function mediaBlocks(){
  const out = [];
  const re = /@media ([^{]+)\{/g;
  let m;
  while((m = re.exec(src))){
    let depth = 0, i = src.indexOf('{', m.index);
    for(; i < src.length; i++){
      if(src[i] === '{') depth++;
      if(src[i] === '}' && --depth === 0) break;
    }
    out.push({ condition: m[1].trim(), raw: src.slice(m.index, i + 1) });
  }
  return out;
}
const blocks = mediaBlocks();
function blockContaining(marker){
  const hits = blocks.filter(b=> b.raw.includes(marker));
  if(hits.length !== 1) throw new Error(`expected one @media containing ${marker}, found ${hits.length}`);
  return { condition: hits[0].condition, raw: hits[0].raw, css: hits[0].raw.replace(/\/\*[\s\S]*?\*\//g, '') };
}
const SHORT = blockContaining('--gym-rail-w:');
const OPEN = blockContaining('.split-primary{');

function rule(block, selector){
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hits = [...block.css.matchAll(new RegExp('(?:^|[\\s}])' + escaped + '\\s*\\{([^}]*)\\}', 'g'))];
  if(hits.length !== 1) throw new Error(`expected one ${selector} rule, found ${hits.length}`);
  return hits[0][1];
}
function decl(body, prop){
  const m = new RegExp('(?:^|[;\\s{])' + prop.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);').exec(body);
  if(!m) throw new Error('no ' + prop);
  return m[1].trim();
}
function px(expr, v){
  let e = expr;
  for(let i = 0; i < 6 && /var\(/.test(e); i++) e = e.replace(/var\((--[\w-]+)\)/g, (_, n)=>{ if(!(n in v)) throw new Error('unresolved ' + n); return '(' + v[n] + ')'; });
  e = e.replace(/env\(safe-area-inset-(\w+),\s*0px\)/g, (_, side)=> String(v.inset[side] || 0))
    .replace(/(\d+(?:\.\d+)?)vw/g, (_, n)=> String(v.vw * n / 100))
    .replace(/(\d+(?:\.\d+)?)px/g, '$1').replace(/\bcalc\(/g, '(').replace(/\bmax\(/g, 'Math.max(').replace(/\bmin\(/g, 'Math.min(');
  if(/[a-z]/i.test(e.replace(/Math\.(max|min)/g, ''))) throw new Error('could not resolve ' + expr + ' -> ' + e);
  return Function('return (' + e + ')')();
}
function vars(vw, inset){
  const body = rule(SHORT, 'body.gym-mode');
  const v = { vw, inset };
  for(const n of ['--gym-rail-w', '--gym-pad-l', '--gym-pad-r']) v[n] = decl(body, n);
  return v;
}
// Gate evaluation supporting exactly orientation / min- / max- height+width.
function matches(condition, w, h){
  return condition.split(/\s+and\s+/).every(f=>{
    const m = /^\((orientation):(landscape|portrait)\)$|^\((min|max)-(width|height):(\d+)px\)$/.exec(f);
    if(!m) throw new Error('unsupported media feature ' + f);
    if(m[1]) return (w > h) === (m[2] === 'landscape');
    const val = m[4] === 'width' ? w : h;
    return m[3] === 'min' ? val >= Number(m[5]) : val <= Number(m[5]);
  });
}

test('the gate catches every short sideways screen — the Duo cover screen included — and nothing upright', (assert)=>{
  for(const [w, h, name] of [[678, 466, 'Duo cover screen, sideways'], [874, 402, 'iPhone Pro, sideways'],
                             [956, 440, 'iPhone Pro Max, sideways'], [667, 375, 'iPhone SE, sideways']]){
    assert.ok(matches(SHORT.condition, w, h), name);
  }
  for(const [w, h, name] of [[466, 678, 'Duo cover screen, upright'], [402, 874, 'slab, upright'],
                             [626, 890, 'Duo open, held rotated'], [890, 626, 'Duo open, natural hold'],
                             // Short but upright (a small window, Slide Over): a rail would squeeze
                             // the list to ~180px, so this keeps the bottom dock.
                             [320, 480, 'short upright window']]){
    assert.ok(!matches(SHORT.condition, w, h), name);
  }
});

test('it can never overlap the open-Duo layout, at any size', (assert)=>{
  for(let w = 300; w <= 1400; w += 10){
    for(let h = 300; h <= 1100; h += 1){
      if(matches(SHORT.condition, w, h) && matches(OPEN.condition, w, h)){
        assert.fail(`both layouts would apply at ${w}x${h}`);
      }
    }
  }
});

test('the rail sits down the right edge, inside the right safe area, top to bottom', (assert)=>{
  const dock = rule(SHORT, 'body.gym-mode .gym-dock');
  assert.equal(decl(dock, 'left'), 'auto');
  assert.equal(decl(dock, 'flex-direction'), 'column');
  for(const inset of [{}, {left:59, right:59, bottom:21}, {left:0, right:47, top:0, bottom:0}]){
    const v = vars(874, inset);
    assert.equal(px(decl(dock, 'right'), v), 10 + (inset.right || 0));
    assert.equal(px(decl(dock, 'width'), v), 116);
    assert.equal(px(decl(dock, 'bottom'), v), 10 + (inset.bottom || 0));
  }
});

test('the list never runs under the rail or the side insets, at any of the real sizes', (assert)=>{
  const body = rule(SHORT, 'body.gym-mode');
  const wrap = rule(SHORT, 'body.gym-mode .wrap');
  for(const [vw, inset] of [[874, {left:59, right:59}], [678, {}], [956, {left:62, right:62}], [667, {}]]){
    const v = vars(vw, inset);
    const contentLeft = px(decl(body, 'padding-left'), v) + px(decl(wrap, 'padding-left'), v);
    const contentRight = vw - px(decl(body, 'padding-right'), v) - px(decl(wrap, 'padding-right'), v);
    const railLeft = vw - 10 - (inset.right || 0) - 116;
    assert.ok(contentLeft >= (inset.left || 0) + 10, `${vw}: content starts inside the left inset`);
    assert.ok(contentRight <= railLeft - 10, `${vw}: content (${contentRight}) runs into the rail (${railLeft})`);
    assert.ok(contentRight - contentLeft >= 340, `${vw}: the list is narrower than a phone's (${contentRight - contentLeft})`);
  }
});

test('the rest timer centres on the list area, fits it, and sits above the bottom inset', (assert)=>{
  const t = rule(SHORT, 'body.gym-mode .rest-timer');
  for(const [vw, inset] of [[874, {left:59, right:59, bottom:21}], [678, {}]]){
    const v = vars(vw, inset);
    const padL = px('var(--gym-pad-l)', v), padR = px('var(--gym-pad-r)', v);
    assert.equal(px(decl(t, 'left'), v), (padL + vw - padR) / 2);
    assert.ok(px(decl(t, 'max-width'), v) >= 320, 'room for the expanded (320px) timer');
    assert.equal(px(decl(t, 'bottom'), v), 10 + (inset.bottom || 0));
  }
});

test('the rail slides in from the side; upright phones keep the slide-up', (assert)=>{
  assert.equal(decl(rule(SHORT, '.gym-dock, body.gym-leaving .gym-dock'), 'transform'), 'translateX(160%)');
  const outside = src.replace(SHORT.raw, '');
  assert.ok(outside.length < src.length);
  assert.match(outside, /\.gym-dock\{\s*opacity:0; transform:translateY\(160%\)/, 'the base (upright) hidden state is untouched');
  for(const re of [/--gym-rail-w/, /flex-direction:column; align-items:stretch; justify-content:space-between/]){
    assert.ok(!re.test(outside), `${re} found outside the short-landscape block — it would apply upright`);
  }
});

test('the longest clock ("9:59:59") fits the rail at the rail font size', (assert)=>{
  // IBM Plex Mono advances 0.6em per glyph. (Chromium measured "1:02:33"
  // with no overflow in the real rail.)
  const size = px(decl(rule(SHORT, 'body.gym-mode .gym-clock'), 'font-size'), vars(874, {}));
  const dock = rule(SHORT, 'body.gym-mode .gym-dock');
  const pad = decl(dock, 'padding').split(/\s+/).map(x=> parseFloat(x));
  const inner = 116 - pad[1] - (pad[3] !== undefined ? pad[3] : pad[1]) - 2; // 1px border each side
  assert.ok(size * 0.6 * 7 <= inner, `"9:59:59" at ${size}px needs ${size * 0.6 * 7}px, rail has ${inner}px`);
});

run();
