import { chromium } from 'playwright'
const BASE = 'http://localhost:5179'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password')
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 20000 })
await page.waitForTimeout(7000)
const trendTab = page.getByRole('tab', { name: /trend/i }).first()
if (await trendTab.count()) {
  await trendTab.click()
  await page.waitForTimeout(3000)
  console.log('clicked Trend tab')
} else {
  const btn = page.getByRole('button', { name: /^trend$/i }).first()
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(3000); console.log('clicked Trend button') }
  else console.log('no Trend control found')
}
const section = page.locator('text=National performance and target progress').locator('..').locator('..')
await section.screenshot({ path: 'qa-screenshots/trend-tab-fixed.png' })
const t = await page.locator('body').innerText()
console.log('unrounded floats:', [...new Set(t.match(/\d+\.\d{5,}/g) || [])].slice(0,5))
console.log('raw periods:', [...new Set(t.match(/\bq[1-4]-\d{4}\b/g) || [])].slice(0,5))
console.log('pp trends found:', [...new Set(t.match(/[+-][\d.]+ pp vs [^\n]{0,12}/g) || [])].slice(0,6))
await browser.close()
