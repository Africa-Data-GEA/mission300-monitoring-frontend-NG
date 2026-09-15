import { chromium } from 'playwright'

const APP = 'http://localhost:5179'
const ROUTES = [
  '/dashboard',
  '/kpis',
  '/pillars/generation-network',
  '/pillars/financially-viable-utilities',
  '/programs',
  '/bottlenecks',
  '/state-disco',
  '/data-submissions',
  '/reports',
  '/learning-log',
  '/stakeholders',
  '/administration',
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

await page.goto(`${APP}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password')
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 20000 })
await page.waitForTimeout(4000)
console.log('login OK\n')
console.log('route                                    skeletonPeak  clearedAt   slowestCall')

for (const route of ROUTES) {
  const calls = []
  const onResponse = async (r) => {
    if (!r.url().includes('3001')) return
    const t = r.request().timing()
    calls.push({ url: r.url().replace('http://localhost:3001', '').split('?')[0], ms: Math.round(t.responseEnd - t.startTime) })
  }
  page.on('response', onResponse)

  const start = Date.now()
  await page.goto(`${APP}${route}`, { waitUntil: 'commit' })

  let peak = 0
  let cleared = null
  // Poll every 100ms for up to 20s: track the most skeletons on screen at
  // once, and the moment the last one disappears.
  for (let i = 0; i < 200; i++) {
    const n = await page.locator('[class*="animate-pulse"]').count().catch(() => 0)
    if (n > peak) peak = n
    if (peak > 0 && n === 0) { cleared = Date.now() - start; break }
    await page.waitForTimeout(100)
  }
  if (peak === 0) cleared = Date.now() - start

  page.off('response', onResponse)
  const slowest = calls.sort((a, b) => b.ms - a.ms)[0]
  console.log(
    `${route.padEnd(40)} ${String(peak).padStart(8)}  ${String(cleared ?? '>20000').padStart(8)}ms  ` +
      `${slowest ? `${slowest.url} ${slowest.ms}ms` : '-'}`,
  )
}

await browser.close()
