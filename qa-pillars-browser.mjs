import { chromium } from 'playwright'
const BASE='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1100}})
const errs=[], bad=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message))
p.on('response',r=>{if(r.status()>=400&&r.url().includes('3001'))bad.push(r.status()+' '+r.url())})
await p.goto(`${BASE}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
for (const s of ['generation-network','last-mile-access','financially-viable-utilities','private-sector-participation','regional-integration','clean-cooking']) {
  await p.goto(`${BASE}/pillars/${s}`,{waitUntil:'networkidle',timeout:30000})
  await p.waitForTimeout(6000)
  await p.screenshot({path:`qa-screenshots/pillar-${s}.png`,fullPage:true})
  const t=await p.locator('body').innerText()
  const floats=[...new Set(t.match(/\d+\.\d{5,}/g)||[])]
  const raw=[...new Set(t.match(/\bq[1-4]-\d{4}\b/g)||[])]
  const bad2=[...new Set(t.match(/\b(undefined|NaN|\[object Object\])\b/g)||[])]
  const err=/Something went wrong|Failed to load/i.test(t)
  console.log(`${s.padEnd(32)} floats:${floats.length} rawPeriods:${raw.length} badVals:${bad2.length} errorState:${err}`)
}
console.log('console errors:', errs.length?errs.slice(0,4):'none')
console.log('bad responses:', bad.length?bad.slice(0,4):'none')
await b.close()
