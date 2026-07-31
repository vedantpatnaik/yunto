import { chromium } from 'playwright'; import fs from 'fs';
const routes=fs.readFileSync('/tmp/routes.txt','utf8').trim().split('\n');
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:1024}});
const p=await ctx.newPage();
await p.goto('http://localhost:5173/login',{waitUntil:'networkidle'});
await p.click('button:has-text("Sign in")'); await p.waitForTimeout(2500);

const report=[];
for(const r of routes){
  await p.goto('http://localhost:5173'+r,{waitUntil:'networkidle',timeout:20000}).catch(()=>{});
  await p.waitForTimeout(350);
  // Everything a user would consider clickable.
  const clickables = await p.locator('button, [role="button"], a[href], .cursor-pointer').all();
  let total=clickables.length, dead=0;
  for(const el of clickables.slice(0,40)){
    try{
      const box=await el.boundingBox(); if(!box) continue;
      const before=p.url();
      const html=await el.evaluate(n=>({
        hasOnClick: !!(n.onclick) || !!Object.keys(n).find(k=>k.startsWith('__react')&&false),
        txt:(n.innerText||'').trim().slice(0,24),
      }));
      // React handlers aren't on .onclick; detect via react fiber props instead.
      const wired = await el.evaluate(n=>{
        const k=Object.keys(n).find(k=>k.startsWith('__reactProps$'));
        if(!k) return false;
        const props=n[k];
        return !!(props.onClick||props.onPress||props.onSubmit||props.href);
      });
      const isLink = await el.evaluate(n=>n.tagName==='A' && !!n.getAttribute('href'));
      if(!wired && !isLink) { dead++; }
      void html; void before;
    }catch{}
  }
  report.push({r,total,dead});
}
const bad=report.filter(x=>x.dead>0).sort((a,b)=>b.dead-a.dead);
console.log(`checked ${routes.length} routes`);
console.log(`\n=== routes with clickable elements that have NO handler ===`);
for(const x of bad.slice(0,25)) console.log(`  ${x.r.padEnd(34)} ${x.dead}/${x.total} dead`);
console.log(`\ntotal routes with dead controls: ${bad.length}`);
await b.close();
