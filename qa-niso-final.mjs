import { chromium } from 'playwright'
const APP='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1100}})
const errs=[], bad=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message))
p.on('response',r=>{if(r.status()>=400&&r.url().includes('3001'))bad.push(r.status()+' '+r.url())})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(6000)
for (const s of ['generation-network','regional-integration']) {
  await p.goto(`${APP}/pillars/${s}`,{waitUntil:'networkidle'})
  await p.waitForTimeout(6000)
  await p.screenshot({path:`qa-screenshots/niso-final-${s}.png`,fullPage:true})
  const t=await p.locator('body').innerText()
  const floats=[...new Set(t.match(/\d+\.\d{5,}/g)||[])]
  console.log(s, '| unrounded floats:', floats.length, '| has "Total Transmission Line":', t.includes('Total Transmission Line'), '| has "Cross-Border Transmission Line":', t.includes('Cross-Border Transmission Line'))
}
console.log('console errors:', errs.length?errs.slice(0,3):'none')
console.log('bad responses:', bad.length?bad.slice(0,3):'none')
await b.close()
