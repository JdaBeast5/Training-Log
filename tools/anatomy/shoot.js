const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}); const p=await b.newPage({viewport:{width:480,height:640}});
 p.on('console',m=>console.log('page:',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8799/view.html'); await p.waitForFunction(()=>window.__ready,null,{timeout:60000});
 const poses={stand:{torso:2,thigh:0,shin:0,shoulder:0,armDown:44}, mid:{torso:20,thigh:52,shin:20,shoulder:50,armDown:44}, bottom:{torso:34,thigh:100,shin:30,shoulder:85,armDown:44}};
 for(const [k,po] of Object.entries(poses)) for(const v of ['side','front']){ const d=await p.evaluate(([po,v])=>{window.__pose(po); return window.__shot(v);},[po,v]); fs.writeFileSync(`sq-${k}-${v}.png`,Buffer.from(d.split(',')[1],'base64')); }
 await b.close(); })();
