const { chromium } = require('playwright'); const fs=require('fs'); const out=process.argv[2]; const [d,lift,yaw,n]=[process.argv[3],process.argv[4],+process.argv[5],+process.argv[6]];
(async()=>{ const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}); const p=await b.newPage({viewport:{width:960,height:720}});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8765/tools/anatomy/study/render-study.html'); await p.waitForFunction(()=>window.__ready,null,{timeout:120000});
 const T=await p.evaluate(l=>window.__tempo(l),lift); fs.mkdirSync(`${out}/${d}-${lift}`,{recursive:true});
 for(let i=0;i<n;i++){ const s=await p.evaluate(([d,l,t,y])=>window.__renderT(d,l,t,y),[d,lift,T*i/n,yaw]); fs.writeFileSync(`${out}/${d}-${lift}/f${String(i).padStart(3,'0')}.png`,Buffer.from(s.split(',')[1],'base64')); }
 console.log(d,lift,'T',T); await b.close(); })();
