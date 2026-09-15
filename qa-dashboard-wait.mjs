import { chromium } from 'playwright'

const BASE = 'http://localhost:5179'
const browser = await chromium.launch()
const page = await browser.newPage()

page.on('console', (msg) => { if (msg.type() === 'error') console.log('[console error]', msg.text()) })
page.on('pageerror', (err) => console.log('[pageerror]', err.message))
page.on('response', (res) => {
  if (res.url().includes('3001') && res.status() >= 400) console.log('[bad response]', res.status(), res.url())
})

await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password', { timeout: 10000 })
await page.locator('input[name="password"]').first().waitFor({ state: 'visible' })
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 15000 })

console.log('waiting up to 8s for content to settle...')
await page.waitForTimeout(8000)
await page.screenshot({ path: 'qa-screenshots/dashboard-settled.png', fullPage: true })
console.log('done')
await browser.close()
