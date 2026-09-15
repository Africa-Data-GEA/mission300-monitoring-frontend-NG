import { chromium } from 'playwright'
const APP='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(5000)

async function clickNav(label){
  const start=Date.now()
  await p.getByRole('link',{name:label,exact:false}).first().click()
  let peak=0, cleared=null, sawRouteFallback=false
  for(let i=0;i<160;i++){
    const s=await p.evaluate(()=>({n:document.querySelectorAll('[class*="animate-pulse"]').length, rf:!!document.querySelector('[aria-label="Loading page"]')})).catch(()=>({n:0,rf:false}))
    if(s.rf) sawRouteFallback=true
    if(s.n>peak) peak=s.n
    if(peak>0&&s.n===0){cleared=Date.now()-start;break}
    await p.waitForTimeout(50)
  }
  if(peak===0) cleared=Date.now()-start
  return {peak,cleared,sawRouteFallback}
}

const NAV=['KPI Directory','Programs','State & DisCo','Data submissions','Reports & exports','Learning & decision log','Executive Overview']
console.log('FIRST PASS (chunk not yet loaded)')
for(const n of NAV){ const r=await clickNav(n); console.log(`  ${n.padEnd(26)} peak=${String(r.peak).padStart(2)} cleared=${String(r.cleared).padStart(5)}ms routeFallback=${r.sawRouteFallback}`) }
console.log('SECOND PASS (chunks now cached in the SPA)')
for(const n of NAV){ const r=await clickNav(n); console.log(`  ${n.padEnd(26)} peak=${String(r.peak).padStart(2)} cleared=${String(r.cleared).padStart(5)}ms routeFallback=${r.sawRouteFallback}`) }
await b.close()
