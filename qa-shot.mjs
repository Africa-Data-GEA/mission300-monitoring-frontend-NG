import { chromium } from 'playwright'
const BASE='http://localhost:5179'
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1500,height:1100}})
await p.goto(`${BASE}/account/login`,{waitUntil:'networkidle'})
await p.locator('input[type="email"]').first().fill('admin@m300.local')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/account/password')
await p.locator('input[name="password"]').first().fill('ChangeMe123!')
await p.locator('button[type="submit"]').first().click(); await p.waitForURL('**/dashboard',{timeout:20000})
await p.waitForTimeout(9000)
const sec = p.locator('text=Priority project delivery status').locator('..').locator('..')
await sec.screenshot({path:'qa-screenshots/exec-projects.png'})
await b.close()
