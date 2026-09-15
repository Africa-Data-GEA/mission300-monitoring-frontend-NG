import { chromium } from 'playwright'
const APP='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1200}})
const errs=[], bad=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message))
p.on('response',r=>{if(r.status()>=400&&r.url().includes('3001'))bad.push(r.status()+' '+r.url().replace('http://localhost:3001',''))})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
for (const [route,name] of [['/data-submissions','landing'],['/data-submissions/obligations','obligations'],['/data-submissions/overdue','overdue']]) {
  await p.goto(`${APP}${route}`,{waitUntil:'networkidle',timeout:30000}); await p.waitForTimeout(6500)
  await p.screenshot({path:`qa-screenshots/tpl-${name}.png`,fullPage:true})
  const t=await p.locator('body').innerText()
  const counts=(t.match(/Showing[^\n]*records/g)||[])
  console.log(`${name.padEnd(12)} | DisCo Energy Received: ${t.includes('DisCo Energy Received')} | counts: ${JSON.stringify(counts.slice(0,2))}`)
}
console.log('console errors:', errs.length?errs.slice(0,3):'none')
console.log('bad responses:', bad.length?[...new Set(bad)].slice(0,3):'none')
await b.close()
