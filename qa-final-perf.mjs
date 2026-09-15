import { chromium } from 'playwright'
const APP='http://localhost:4173'
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1500,height:1000}})
await p.goto(`${APP}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(10000)

const NAV=['Reports & exports','State & DisCo','KPI Directory','Programs','Data submissions','Learning & decision log','Executive Overview']
let flashes=0
for(const label of NAV){
  const start=Date.now()
  await p.getByRole('link',{name:label,exact:false}).first().click()
  let sawGrey=false, settled=null
  for(let i=0;i<120;i++){
    const s=await p.evaluate(()=>({
      grey: document.querySelectorAll('[aria-label="Loading page"] [class*="animate-pulse"]').length,
      busy: !!document.querySelector('[aria-label="Loading page"]'),
    })).catch(()=>({grey:0,busy:false}))
    if(s.grey>0) sawGrey=true
    if(!s.busy){ settled=Date.now()-start; break }
    await p.waitForTimeout(25)
  }
  if(sawGrey) flashes++
  console.log(`  ${label.padEnd(26)} greySkeleton=${sawGrey?'YES':'no '}  settled=${settled??'>3000'}ms`)
}
console.log(`\ngrey-skeleton flashes: ${flashes} of ${NAV.length}`)
await b.close()
