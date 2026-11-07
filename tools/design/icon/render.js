'use strict';
// Dev tooling for the MKT-19 icon options (not loaded by the app). Renders every option on simulated iOS
// home-screen tiles (Default, Dark, Tinted, Grayscale) at 180, 60 and 29 px, in a home-screen row beside
// generic neighbours, as the 20 px header mark beside "Chalklog", on the race-bib story card, and a
// maskable safe-zone preview. Run: node tools/design/icon/render.js
//
// The simulation, and what it can't know:
// - Default: the icon as shipped, corners masked to the iOS continuous-corner shape (approximated as a
//   rounded rect at 22.37% of the size).
// - Dark: a web clip cannot supply a dark variant, so iOS shows the same icon on the dark wallpaper.
// - Tinted: iOS turns the icon to luminance and maps it onto one hue. Modelled as the sRGB-encoded relative
//   luminance Y, multiplied into the tint colour. The real iOS curve is not published; this keeps what it keeps
//   (luminance order) and drops what it drops (hue).
// - Grayscale: luminance only (sRGB-encoded Y).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname;
const OUT = path.join(DIR, 'renders');
const OPTIONS = ['a', 'b', 'c'];
const NAMES = { a: 'A · Sleeve', b: 'B · Sash', c: 'C · Swatch' };
const CARD_MARK = { a: 'mark-a-tile.svg', b: 'mark-b.svg', c: 'mark-c.svg' }; // what each option prints on a day-ink card
const read = f => fs.readFileSync(path.join(DIR, f), 'utf8');
const uri = s => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');
const TINT = [232, 163, 58]; // a warm amber tint; any single hue behaves the same way
const FONT = `@font-face{font-family:'Geist';font-weight:100 900;src:url(${'file://' + path.resolve(DIR, '../../../fonts/geist-latin-wght-normal.woff2')}) format('woff2');}
@font-face{font-family:'Archivo';font-weight:100 900;font-stretch:62% 125%;src:url(${'file://' + path.resolve(DIR, '../fonts/archivo-latin-wdth-wght.woff2')}) format('woff2');}`;

// Generic neighbours: plain shapes in common home-screen colours, no real brands.
const n = (bg, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${bg}"/>${body}</svg>`;
const NEIGHBOURS = [
  ['Mail', n('#2F7CF6', '<rect x="232" y="322" width="560" height="380" rx="48" fill="#fff"/><path d="M262 352 512 552 762 352" fill="none" stroke="#2F7CF6" stroke-width="44"/>')],
  ['Notes', n('#FFFFFF', '<rect width="1024" height="230" fill="#F7C744"/><g stroke="#C9C9CE" stroke-width="22"><path d="M140 400H884M140 540H884M140 680H884M140 820H884"/></g>')],
  ['Messages', n('#34C759', '<ellipse cx="512" cy="490" rx="320" ry="260" fill="#fff"/><path d="M300 660 250 800 420 720Z" fill="#fff"/>')],
  ['Run', n('#FC5200', '<path d="M330 760 512 260 694 760" fill="none" stroke="#fff" stroke-width="96" stroke-linejoin="miter"/>')],
  ['Settings', n('#8E8E93', '<circle cx="512" cy="512" r="300" fill="none" stroke="#E5E5EA" stroke-width="80" stroke-dasharray="70 48"/><circle cx="512" cy="512" r="200" fill="#5A5A5F"/><circle cx="512" cy="512" r="90" fill="#E5E5EA"/>')],
  ['Fitness', n('#000000', '<circle cx="512" cy="512" r="320" fill="none" stroke="#FA114F" stroke-width="80"/><circle cx="512" cy="512" r="210" fill="none" stroke="#A6FF00" stroke-width="80"/><circle cx="512" cy="512" r="100" fill="none" stroke="#00F0FF" stroke-width="80"/>')],
  ['Weather', n('#3A8DDE', '<circle cx="420" cy="420" r="150" fill="#FFD60A"/><ellipse cx="560" cy="620" rx="260" ry="140" fill="#fff"/>')],
];

const PAGE_JS = `
const TINT=${JSON.stringify(TINT)};
function load(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
function enc(y){return y<=0.0031308?12.92*y:1.055*Math.pow(y,1/2.4)-0.055;}
function dec(c){c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
async function tile(src,css,mode,dpr,mask=true){
  const px=Math.round(css*dpr), c=document.createElement('canvas'); c.width=c.height=px;
  c.style.width=c.style.height=css+'px'; const g=c.getContext('2d');
  if(mask){g.beginPath(); g.roundRect(0,0,px,px,px*0.2237); g.clip();}
  g.drawImage(await load(src),0,0,px,px);
  if(mode==='tinted'||mode==='gray'){
    const d=g.getImageData(0,0,px,px), a=d.data;
    for(let i=0;i<a.length;i+=4){
      const L=enc(0.2126*dec(a[i])+0.7152*dec(a[i+1])+0.0722*dec(a[i+2]));
      if(mode==='gray'){a[i]=a[i+1]=a[i+2]=Math.round(L*255);}
      else{a[i]=Math.round(TINT[0]*L);a[i+1]=Math.round(TINT[1]*L);a[i+2]=Math.round(TINT[2]*L);}
    }
    g.putImageData(d,0,0);
  }
  return c;
}
const WALL={default:'linear-gradient(160deg,#7FA6C9 0%,#C7A98A 55%,#6E5A73 100%)',
  dark:'linear-gradient(160deg,#1B2633 0%,#2B2420 55%,#15121A 100%)',
  tinted:'linear-gradient(160deg,#1E1710 0%,#2A1F12 60%,#120E09 100%)',
  gray:'linear-gradient(160deg,#5B5B5B 0%,#8A8A8A 55%,#3F3F3F 100%)'};
`;

async function shot(browser, html, file, viewport, dpr){
  const page = await browser.newPage({ viewport, deviceScaleFactor: dpr });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForFunction('window.__done === true', null, { timeout: 30000 });
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  await page.close();
}

const modes = [['default', 'Default'], ['dark', 'Dark'], ['tinted', 'Tinted'], ['gray', 'Grayscale']];

function variantsHtml(opt){
  // DPR 1: the 180, 60 and 29 px tiles are exactly that many pixels.
  return `<!doctype html><style>${FONT} body{margin:0;font:600 13px Geist,sans-serif;background:#000;color:#fff;}
  .row{display:flex;align-items:center;gap:28px;padding:22px 28px;}
  .lab{width:84px;} h1{font-size:15px;margin:0;padding:16px 28px 0;}</style>
  <h1>Option ${NAMES[opt]} · simulated iOS tiles at 180, 60 and 29 px (true pixels)</h1><div id="r"></div>
  <script>${PAGE_JS}
  (async()=>{const src=${JSON.stringify(uri(read('option-' + opt + '.svg')))};
  for(const [m,label] of ${JSON.stringify(modes)}){
    const row=document.createElement('div'); row.className='row'; row.style.background=WALL[m];
    const l=document.createElement('div'); l.className='lab'; l.textContent=label; row.append(l);
    for(const s of [180,60,29]) row.append(await tile(src,s,m,1));
    document.getElementById('r').append(row);}
  window.__done=true;})();</script>`;
}

function homeHtml(opt){
  // DPR 3, 402 pt wide: an iPhone 16/17 Pro home screen. Two rows of four 60 pt icons; ours is second.
  const icons = [NEIGHBOURS[0], ['Chalklog', read('option-' + opt + '.svg')], ...NEIGHBOURS.slice(1)];
  return `<!doctype html><style>${FONT} body{margin:0;width:402px;font-family:-apple-system,Geist,sans-serif;}
  .p{padding:26px 26px 18px;} .g{display:grid;grid-template-columns:repeat(4,60px);justify-content:space-between;row-gap:22px;}
  .i{display:flex;flex-direction:column;align-items:center;gap:6px;width:60px;}
  .i span{font:500 12px/1 Geist,sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap;}
  .m{font:600 11px Geist,sans-serif;color:rgba(255,255,255,.8);margin-bottom:14px;letter-spacing:.04em;text-transform:uppercase;}</style>
  <div id="r"></div><script>${PAGE_JS}
  (async()=>{const icons=${JSON.stringify(icons.map(([l, s]) => [l, uri(s)]))};
  for(const [m,label] of ${JSON.stringify(modes)}){
    const p=document.createElement('div'); p.className='p'; p.style.background=WALL[m];
    p.innerHTML='<div class="m">'+label+'</div>'; const g=document.createElement('div'); g.className='g';
    for(const [l,src] of icons){const i=document.createElement('div'); i.className='i'; i.append(await tile(src,60,m,3));
      const s=document.createElement('span'); s.textContent=l; i.append(s); g.append(i);}
    p.append(g); document.getElementById('r').append(p);}
  window.__done=true;})();</script>`;
}

function markHtml(){
  // The header mark at 20 px beside the name, all three options, on the app's dark and light grounds, DPR 3.
  const row = (opt, ground, text) => `<div class="h" style="background:${ground};color:${text}">
    <span class="mk">${read('mark-' + opt + '.svg').replace(/<!--[\s\S]*?-->/g, '')}</span><b>Chalklog</b><i>${NAMES[opt]}</i></div>`;
  let body = '';
  for(const opt of OPTIONS) body += row(opt, '#0C0C0D', '#F2F2F0') + row(opt, '#F3F3F1', '#111112');
  return `<!doctype html><style>${FONT} body{margin:0;width:402px;}
  .h{display:flex;align-items:center;gap:8px;height:56px;padding:0 20px;font-family:Geist,sans-serif;}
  .mk svg{width:20px;height:20px;display:block;} b{font-size:20px;font-weight:700;letter-spacing:-.01em;}
  i{margin-left:auto;font-style:normal;font-size:12px;opacity:.6;}</style>${body}<script>window.__done=true;</script>`;
}

function cardHtml(opt){
  // c-card.html with the ring mark swapped for this option. The card mark is the small mark (A and C) or the
  // tile (A's tile variant, B); on the red day the mark sits on red, so a red plate with no edge would vanish.
  let html = read('../directions/c-card.html');
  html = html.replace('href="base.css"', 'href="../../directions/base.css"');
  const mark = read(CARD_MARK[opt]).replace(/<!--[\s\S]*?-->/g, '').replace('<svg ', '<svg aria-hidden="true" ');
  const before = (html.match(/<svg viewBox="0 0 100 100"[\s\S]*?<\/svg>/g) || []).length;
  if(before !== 1) throw new Error('anchor: expected exactly one ring mark in c-card.html, found ' + before);
  html = html.replace(/<svg viewBox="0 0 100 100"[\s\S]*?<\/svg>/, mark);
  html = html.replace('</body>', '<script>document.fonts.ready.then(()=>window.__done=true)</script></body>');
  const file = path.join(DIR, 'cards', 'c-card-option-' + opt + '.html');
  fs.writeFileSync(file, html);
  return 'file://' + file;
}

function inksHtml(){
  // The card foot (mark + name) on every day ink the bib can be printed on, all three options. DPR 2.
  const inks = [['#D42F25', '#fff'], ['#2C5BD8', '#fff'], ['#F2C200', '#0C0C0D'], ['#1E9E4A', '#0C0C0D'], ['#E6E6E2', '#0C0C0D'], ['#3A3A3D', '#fff']];
  let body = '';
  for(const opt of OPTIONS){
    body += `<div class="r"><span class="n">${NAMES[opt]}</span>`;
    for(const [bg, fg] of inks) body += `<div class="c" style="background:${bg};color:${fg}">${read(CARD_MARK[opt]).replace(/<!--[\s\S]*?-->/g, '')}<b>Chalklog</b></div>`;
    body += '</div>';
  }
  return `<!doctype html><style>${FONT} body{margin:0;background:#111;color:#fff;font-family:Geist,sans-serif;padding:12px;width:max-content;}
  .r{display:flex;align-items:center;gap:8px;margin:8px 0;} .n{width:96px;font-size:13px;font-weight:600;}
  .c{display:flex;align-items:center;gap:10px;padding:14px 16px;font-size:22px;} .c svg{width:38px;height:38px;}</style>
  ${body}<script>document.fonts.ready.then(()=>window.__done=true)</script>`;
}

function maskableHtml(){
  // Android maskable: the system may crop to a circle of 80% diameter (the safe zone). Masters as drawn,
  // with that circle overlaid, and cropped to it.
  let body = '';
  for(const opt of OPTIONS){
    const src = uri(read('option-' + opt + '.svg'));
    body += `<div class="r"><span>${NAMES[opt]}</span><div class="s"><img src="${src}"><i></i></div><div class="s crop"><img src="${src}"></div></div>`;
  }
  return `<!doctype html><style>${FONT} body{margin:0;background:#222;color:#fff;font:600 13px Geist,sans-serif;padding:16px;width:max-content;}
  .r{display:flex;align-items:center;gap:24px;margin:10px 0;} .r>span{width:96px;}
  .s{position:relative;width:256px;height:256px;overflow:hidden;} .s img{width:256px;height:256px;display:block;}
  .s i{position:absolute;inset:25.6px;border-radius:50%;box-shadow:0 0 0 2px #fff, 0 0 0 999px rgba(0,0,0,.45);}
  .crop{clip-path:circle(40% at 50% 50%);}</style>${body}<script>window.__done=true;</script>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for(const opt of OPTIONS){
    await shot(browser, variantsHtml(opt), `option-${opt}-tiles.png`, { width: 520, height: 400 }, 1);
    await shot(browser, homeHtml(opt), `option-${opt}-homescreen.png`, { width: 402, height: 400 }, 3);
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto(cardHtml(opt));
    await page.waitForFunction('window.__done === true', null, { timeout: 30000 });
    await page.screenshot({ path: path.join(OUT, `option-${opt}-card.png`) });
    await page.close();
  }
  await shot(browser, markHtml(), 'marks-20px.png', { width: 402, height: 300 }, 3);
  await shot(browser, inksHtml(), 'card-foot-on-day-inks.png', { width: 900, height: 200 }, 2);
  await shot(browser, maskableHtml(), 'maskable-safe-zone.png', { width: 700, height: 600 }, 1);
  await browser.close();
  console.log('rendered to', OUT);
})().catch(e => { console.error(e); process.exit(1); });
