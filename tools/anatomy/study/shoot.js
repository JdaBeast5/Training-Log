const { chromium } = require('playwright'); const fs=require('fs'); const out=process.argv[2];
const jobs = JSON.parse(process.argv[3]);
(async()=>{ const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}); const p=await b.newPage({viewport:{width:960,height:720}});
 p.on('console',m=>{ if(m.type()!=='log') console.log('page:',m.type(),m.text().slice(0,300)); }); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8765/tools/anatomy/study/render-study.html'); await p.waitForFunction(()=>window.__ready,null,{timeout:120000});
 for(const [name,d,lift,u,yaw] of jobs){ const s=await p.evaluate(([d,l,u,y])=>window.__render(d,l,u,y),[d,lift,u,yaw]); fs.writeFileSync(`${out}/${name}.png`,Buffer.from(s.split(',')[1],'base64')); }
 await b.close(); })();
