import { chromium } from 'playwright'
const BASE='http://localhost:5179'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
const errs=[]
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message))
await p.goto(`${BASE}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.goto(`${BASE}/pillars/financially-viable-utilities`,{waitUntil:'networkidle'})
await p.waitForTimeout(7000)
const t=await p.locator('body').innerText()
console.log(t.split('\n').filter(l=>/to target|No confirmed target/.test(l)).slice(0,6).join('\n'))
await p.screenshot({path:'qa-screenshots/atcc-card-fixed.png', clip:{x:270,y:150,width:1220,height:180}})
console.log('console errors:', errs.length?errs.slice(0,3):'none')
await b.close()
