import { chromium } from 'playwright'
const APP='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(4000)
// warm the reports chunk
await p.goto(`${APP}/reports`,{waitUntil:'networkidle'}); await p.waitForTimeout(2500)
await p.goto(`${APP}/kpis`,{waitUntil:'networkidle'}); await p.waitForTimeout(1500)
// now revisit and sample what is on screen
await p.goto(`${APP}/reports`,{waitUntil:'commit'})
for(let i=0;i<40;i++){
  const r=await p.evaluate(()=>{
    const rf=document.querySelector('[aria-label="Loading page"]')
    const pulses=document.querySelectorAll('[class*="animate-pulse"]').length
    const busy=[...document.querySelectorAll('[aria-busy="true"]')].map(e=>e.getAttribute('aria-label'))
    return { routeFallback: !!rf, pulses, busy }
  })
  if(r.pulses>0){ console.log(`t=${i*50}ms`, JSON.stringify(r)); break }
  await p.waitForTimeout(50)
}
await p.waitForTimeout(1200)
console.log('after 1.2s:', JSON.stringify(await p.evaluate(()=>({routeFallback: !!document.querySelector('[aria-label="Loading page"]'), pulses: document.querySelectorAll('[class*="animate-pulse"]').length}))))
await b.close()
