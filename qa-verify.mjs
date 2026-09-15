import { chromium } from 'playwright'
const BASE = 'http://localhost:5179'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } })
const errs = [], bad = []
page.on('console', m => { if (m.type()==='error') errs.push(m.text()) })
page.on('pageerror', e => errs.push('PAGEERROR: '+e.message))
page.on('response', r => { if (r.status()>=400 && r.url().includes('3001')) bad.push(r.status()+' '+r.url()) })

await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password')
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 20000 })
await page.waitForTimeout(9000)
await page.screenshot({ path: 'qa-screenshots/verify-exec-overview.png', fullPage: true })

// State & DisCo
await page.goto(`${BASE}/state-disco`, { waitUntil: 'networkidle' })
await page.waitForTimeout(8000)
await page.screenshot({ path: 'qa-screenshots/verify-state-disco.png', fullPage: true })
const sd = await page.locator('body').innerText()
const atcc = sd.match(/ATC&C[^\n]*\n?([\d.]+%)/)
console.log('state-disco ATC&C text match:', atcc ? atcc[1] : 'not parsed')

console.log('console errors:', errs.length ? errs.slice(0,5) : 'none')
console.log('bad responses:', bad.length ? bad.slice(0,5) : 'none')
await browser.close()
