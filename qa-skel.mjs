import { chromium } from 'playwright'
const APP='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(4000)
await p.goto(`${APP}/reports`,{waitUntil:'commit'})
for (let i=0;i<40;i++){
  const n=await p.locator('[class*="animate-pulse"]').count().catch(()=>0)
  if(n>0){
    const info=await p.evaluate(()=>{
      const els=[...document.querySelectorAll('[class*="animate-pulse"]')]
      return els.slice(0,12).map(e=>{
        const r=e.getBoundingClientRect()
        let path=[]; let n=e
        for(let k=0;k<4&&n&&n!==document.body;k++){ path.unshift(n.tagName.toLowerCase()+(n.className&&typeof n.className==='string'?'.'+n.className.split(/\s+/).slice(0,3).join('.'):'')); n=n.parentElement }
        return { w:Math.round(r.width), h:Math.round(r.height), path:path.join(' > ').slice(0,150) }
      })
    })
    console.log('skeleton count:', n)
    info.forEach(x=>console.log(`  ${x.w}x${x.h}  ${x.path}`))
    break
  }
  await p.waitForTimeout(60)
}
await b.close()
