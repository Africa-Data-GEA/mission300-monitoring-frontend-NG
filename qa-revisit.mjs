import { chromium } from 'playwright'
const APP='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(4000)

async function measure(route){
  const start=Date.now(); let peak=0, cleared=null
  await p.goto(`${APP}${route}`,{waitUntil:'commit'})
  for(let i=0;i<200;i++){
    const n=await p.locator('[class*="animate-pulse"]').count().catch(()=>0)
    if(n>peak) peak=n
    if(peak>0&&n===0){cleared=Date.now()-start;break}
    await p.waitForTimeout(50)
  }
  if(peak===0) cleared=Date.now()-start
  return {peak, cleared}
}
for (const r of ['/reports','/state-disco','/dashboard']) {
  const first=await measure(r)
  await p.goto(`${APP}/kpis`,{waitUntil:'networkidle'}); await p.waitForTimeout(800)
  const second=await measure(r)
  console.log(`${r.padEnd(16)} first: peak=${first.peak} ${first.cleared}ms | revisit: peak=${second.peak} ${second.cleared}ms`)
}
await b.close()
