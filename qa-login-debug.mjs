import { chromium } from 'playwright'

const BASE = 'http://localhost:5179'
const browser = await chromium.launch()
const page = await browser.newPage()

page.on('request', (req) => {
  if (req.url().includes('3001') || req.url().includes('/auth')) {
    console.log('>>', req.method(), req.url())
  }
})
page.on('response', async (res) => {
  if (res.url().includes('3001') || res.url().includes('/auth')) {
    console.log('<<', res.status(), res.url())
  }
})
page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))
page.on('pageerror', (err) => console.log('[pageerror]', err.message))

await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForTimeout(2000)
console.log('URL after email step:', page.url())

const pwInput = page.locator('input[name="password"]').first()
await pwInput.waitFor({ state: 'visible', timeout: 10000 })
await pwInput.fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForTimeout(3000)
console.log('URL after password step:', page.url())

await browser.close()
