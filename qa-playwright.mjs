import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5179'
const OUT_DIR = 'qa-screenshots'
mkdirSync(OUT_DIR, { recursive: true })

const pagesToCheck = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/kpis', name: 'kpi-explorer' },
  { path: '/pillars/last-mile-access', name: 'pillar-last-mile-access' },
  { path: '/pillars/private-sector-participation', name: 'pillar-private-sector' },
  { path: '/programs', name: 'programs' },
  { path: '/state-disco', name: 'state-disco' },
]

const consoleErrors = []
const pageErrors = []
const failedRequests = []

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push({ url: page.url(), text: msg.text() })
})
page.on('pageerror', (err) => {
  pageErrors.push({ url: page.url(), text: err.message })
})
page.on('requestfailed', (req) => {
  failedRequests.push({ url: page.url(), request: req.url(), failure: req.failure()?.errorText })
})
page.on('response', (res) => {
  if (res.status() >= 400 && res.url().includes('localhost:3001')) {
    failedRequests.push({ url: page.url(), request: res.url(), status: res.status() })
  }
})

console.log('--- Navigating to login (step 1: email) ---')
await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.screenshot({ path: `${OUT_DIR}/00-login-email.png`, fullPage: true })

const emailInput = page.locator('input[type="email"], input[name="email"]').first()
await emailInput.fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password', { timeout: 10000 })

console.log('--- Step 2: password ---')
const passwordInput = page.locator('input[name="password"]').first()
await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
await page.screenshot({ path: `${OUT_DIR}/00-login-password.png`, fullPage: true })
await passwordInput.fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()

try {
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  console.log('Login succeeded, landed on:', page.url())
} catch {
  console.log('Login did NOT redirect to /dashboard. Current URL:', page.url())
  await page.screenshot({ path: `${OUT_DIR}/00-login-failed.png`, fullPage: true })
}

for (const { path, name } of pagesToCheck) {
  console.log(`--- Visiting ${path} ---`)
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(6000)
    await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true })
    const bodyText = await page.locator('body').innerText()
    const zeroCount = (bodyText.match(/\b0(\.0)?%/g) || []).length
    console.log(`  screenshot saved. zero-ish values found in visible text: ${zeroCount}`)
  } catch (err) {
    console.log(`  ERROR visiting ${path}:`, err.message)
  }
}

await browser.close()

console.log('\n=== CONSOLE ERRORS ===')
console.log(JSON.stringify(consoleErrors, null, 2))
console.log('\n=== PAGE ERRORS (uncaught exceptions) ===')
console.log(JSON.stringify(pageErrors, null, 2))
console.log('\n=== FAILED / 4xx-5xx REQUESTS (to backend) ===')
console.log(JSON.stringify(failedRequests, null, 2))
