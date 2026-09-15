import { chromium } from 'playwright'
const APP='http://localhost:4173'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
// give the idle prefetcher room to work, as a real user's first few seconds would
await p.waitForTimeout(9000)

async function clickNav(label){
  const start=Date.now()
  await p.getByRole('link',{name:label,exact:false}).first().click()
  let sawRF=false, cleared=null
  for(let i=0;i<100;i++){
    const s=await p.evaluate(()=>({rf:!!document.querySelector('[aria-label="Loading page"]')})).catch(()=>({rf:false}))
    if(s.rf) sawRF=true
    if(sawRF && !s.rf){ cleared=Date.now()-start; break }
    if(!s.rf && i>3){ cleared=Date.now()-start; break }
    await p.waitForTimeout(50)
  }
  return {sawRF, cleared}
}
console.log('AFTER PREFETCH — first click on each nav item:')
for(const n of ['Reports & exports','State & DisCo','KPI Directory','Programs','Learning & decision log','Data submissions','Executive Overview']){
  const r=await clickNav(n)
  console.log(`  ${n.padEnd(26)} heavy skeleton shown: ${r.sawRF ? 'YES ('+r.cleared+'ms)' : 'no'}`)
}
await b.close()
