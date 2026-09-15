import { chromium } from 'playwright'
const APP='http://localhost:4173'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(10000)   // let prefetch finish

for (const label of ['KPI Directory','State & DisCo','Data submissions']) {
  const js=[]
  const onReq=r=>{ const u=r.url(); if(u.endsWith('.js')&&u.includes('/assets/')) js.push(u.split('/assets/')[1]) }
  p.on('request',onReq)
  await p.getByRole('link',{name:label,exact:false}).first().click()
  await p.waitForTimeout(2500)
  p.off('request',onReq)
  console.log(`${label}: ${js.length?js.join(', '):'(no new chunks fetched)'}`)
}
await b.close()
