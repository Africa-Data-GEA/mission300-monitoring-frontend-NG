import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = 'http://localhost:5179'
const OUT = 'qa-screenshots/deep'
mkdirSync(OUT, { recursive: true })

const findings = []
const record = (severity, area, detail, extra = {}) => {
  findings.push({ severity, area, detail, ...extra })
  console.log(`[${severity}] ${area}: ${detail}`)
}

/* ---------- data-quality scanners run against rendered page text ---------- */
const SCANS = [
  {
    id: 'raw-float-precision',
    re: /\d+\.\d{5,}/g,
    severity: 'high',
    detail: 'Unrounded float rendered in UI (false precision)',
  },
  {
    id: 'raw-period-code',
    re: /\bq[1-4]-\d{4}\b/g,
    severity: 'high',
    detail: 'Raw internal period code (q1-2025) shown instead of a display label (Q1 2025)',
  },
  {
    // Only SCREAMING_SNAKE with an underscore - single uppercase words like
    // "OPERATIONS" are legitimate UI copy (the sidebar's "DATA OPERATIONS").
    id: 'raw-enum',
    re: /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g,
    severity: 'medium',
    detail: 'Raw SCREAMING_SNAKE enum leaked into UI copy',
  },
  {
    id: 'placeholder-text',
    re: /\b(undefined|null|NaN|\[object Object\])\b/g,
    severity: 'high',
    detail: 'Placeholder/undefined value rendered',
  },
  {
    id: 'to-be-confirmed',
    re: /To be confirmed/g,
    severity: 'low',
    detail: 'Placeholder "To be confirmed" copy visible to users',
  },
]

function scanText(pageName, text) {
  for (const scan of SCANS) {
    const hits = [...new Set(text.match(scan.re) || [])]
    if (hits.length > 0) {
      record(scan.severity, `${pageName} / ${scan.id}`, scan.detail, {
        samples: hits.slice(0, 6),
        occurrences: hits.length,
      })
    }
  }
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()

const consoleErrors = []
const pageErrors = []
const badResponses = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push({ url: page.url(), text: m.text() }) })
page.on('pageerror', (e) => pageErrors.push({ url: page.url(), text: e.message }))
page.on('response', (r) => {
  if (r.status() >= 400 && r.url().includes('localhost:3001')) {
    badResponses.push({ page: page.url(), request: r.url(), status: r.status() })
  }
})

/* ------------------------------- login ---------------------------------- */
await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password', { timeout: 15000 })
await page.locator('input[name="password"]').first().waitFor({ state: 'visible' })
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 20000 })
console.log('login OK ->', page.url())

const settle = async (ms = 5000) => { await page.waitForTimeout(ms) }

/* --------------------------- per-page sweep ------------------------------ */
const ROUTES = [
  ['/dashboard', 'dashboard'],
  ['/kpis', 'kpis'],
  ['/pillars', 'pillars-index'],
  ['/pillars/generation-network', 'pillar-generation'],
  ['/pillars/last-mile-access', 'pillar-lastmile'],
  ['/pillars/financially-viable-utilities', 'pillar-utilities'],
  ['/pillars/private-sector-participation', 'pillar-private'],
  ['/pillars/regional-integration', 'pillar-regional'],
  ['/pillars/clean-cooking', 'pillar-cooking'],
  ['/programs', 'programs'],
  ['/bottlenecks', 'bottlenecks'],
  ['/state-disco', 'state-disco'],
  ['/data-submissions', 'data-submissions'],
  ['/reports', 'reports'],
  ['/learning-log', 'learning-log'],
  ['/stakeholders', 'stakeholders'],
  ['/administration', 'administration'],
]

for (const [route, name] of ROUTES) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    await settle()
    const text = await page.locator('body').innerText()
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })

    if (/Something went wrong|Unexpected error|Failed to load|error boundary/i.test(text)) {
      record('critical', name, 'Error state rendered on page load')
    }
    // A page that is still all-skeleton after settling is a stuck loading state.
    const skeletonCount = await page.locator('[class*="animate-pulse"], [data-testid*="skeleton"]').count()
    if (skeletonCount > 0) {
      record('medium', name, `Still showing ${skeletonCount} skeleton element(s) after ${5}s settle`)
    }
    scanText(name, text)
  } catch (err) {
    record('critical', name, `Navigation failed: ${err.message}`)
  }
}

/* --------------------- interaction: KPI directory ------------------------ */
console.log('--- interacting: KPI directory filters/search/pagination ---')
await page.goto(`${BASE}/kpis`, { waitUntil: 'networkidle' })
await settle()

try {
  const search = page.locator('input[placeholder*="identifier" i], input[placeholder*="Search" i]').first()
  await search.fill('Metering')
  await settle(3000)
  const afterSearch = await page.locator('body').innerText()
  await page.screenshot({ path: `${OUT}/kpis-search-metering.png`, fullPage: true })
  if (!/Metering/i.test(afterSearch)) record('high', 'kpis/search', 'Search for "Metering" returned no matching row text')
  const rowsTextMatch = afterSearch.match(/Showing\s+[\d–\-]+\s+of\s+(\d+)\s+records/i)
  console.log('  search result count line:', rowsTextMatch ? rowsTextMatch[0] : 'not found')
  await search.fill('')
  await settle(2500)
} catch (e) { record('medium', 'kpis/search', `Search interaction failed: ${e.message}`) }

try {
  const filterBtn = page.getByRole('button', { name: /filters/i }).first()
  if (await filterBtn.count()) {
    await filterBtn.click()
    await settle(1500)
    await page.screenshot({ path: `${OUT}/kpis-filters-open.png`, fullPage: true })
    const selects = page.locator('select')
    const n = await selects.count()
    console.log('  native selects found in filter panel:', n)
    for (let i = 0; i < Math.min(n, 3); i++) {
      const opts = await selects.nth(i).locator('option').allTextContents()
      if (opts.length > 1) {
        await selects.nth(i).selectOption({ index: 1 })
        await settle(2500)
      }
    }
    await page.screenshot({ path: `${OUT}/kpis-filters-applied.png`, fullPage: true })
    const t = await page.locator('body').innerText()
    if (/Showing\s+0\b|No indicators|No results/i.test(t)) {
      record('medium', 'kpis/filters', 'Applying the first option of each filter produced an empty result set')
    }
    scanText('kpis-filtered', t)
  } else {
    record('low', 'kpis/filters', 'No "Filters" button found on KPI directory')
  }
} catch (e) { record('medium', 'kpis/filters', `Filter interaction failed: ${e.message}`) }

/* ------------- interaction: KPI profile drill-down + dialogs -------------- */
console.log('--- interacting: KPI profile drill-down ---')
try {
  await page.goto(`${BASE}/kpis`, { waitUntil: 'networkidle' })
  await settle()
  const firstRow = page.locator('table tbody tr').first()
  if (await firstRow.count()) {
    await firstRow.click()
    await settle(3000)
    await page.screenshot({ path: `${OUT}/kpi-profile-dialog.png`, fullPage: true })
    const dlgText = await page.locator('body').innerText()
    scanText('kpi-profile', dlgText)

    for (const label of ['Set current value', 'Edit definition']) {
      const btn = page.getByRole('button', { name: new RegExp(label, 'i') }).first()
      if (await btn.count()) {
        await btn.click()
        await settle(2000)
        await page.screenshot({ path: `${OUT}/dialog-${label.replace(/\s+/g, '-').toLowerCase()}.png`, fullPage: true })
        const t = await page.locator('body').innerText()
        scanText(`dialog-${label}`, t)
        const cancel = page.getByRole('button', { name: /cancel/i }).first()
        if (await cancel.count()) { await cancel.click(); await settle(1200) }
      } else {
        record('medium', 'kpi-profile', `Button "${label}" not found on the KPI profile (admin should see it)`)
      }
    }
  } else {
    record('high', 'kpis', 'No table rows found on KPI directory')
  }
} catch (e) { record('medium', 'kpi-profile', `Drill-down interaction failed: ${e.message}`) }

/* ---------------------- interaction: Programs page ----------------------- */
console.log('--- interacting: Programs ---')
try {
  await page.goto(`${BASE}/programs`, { waitUntil: 'networkidle' })
  await settle()
  const t = await page.locator('body').innerText()
  await page.screenshot({ path: `${OUT}/programs-detail.png`, fullPage: true })
  if (!/Energizing Education/i.test(t)) {
    record('high', 'programs', 'Ingested REA programme "Energizing Education Programme (EEP) Phase III" not visible on Programs page')
  }
  scanText('programs', t)
} catch (e) { record('medium', 'programs', `Programs interaction failed: ${e.message}`) }

/* ------------------------- 404 / error handling -------------------------- */
try {
  await page.goto(`${BASE}/this-route-does-not-exist`, { waitUntil: 'networkidle', timeout: 20000 })
  await settle(2500)
  const t = await page.locator('body').innerText()
  await page.screenshot({ path: `${OUT}/not-found.png`, fullPage: true })
  if (!/not found|404|doesn.t exist/i.test(t)) {
    record('medium', 'routing', 'Unknown route did not render a recognisable 404/not-found state')
  }
} catch (e) { record('medium', 'routing', `404 check failed: ${e.message}`) }

await browser.close()

/* ------------------------------- report ---------------------------------- */
for (const c of consoleErrors) record('high', 'console', c.text, { page: c.url })
for (const e of pageErrors) record('critical', 'uncaught-exception', e.text, { page: e.url })
for (const r of badResponses) record('high', 'api', `${r.status} from ${r.request}`, { page: r.page })

const order = { critical: 0, high: 1, medium: 2, low: 3 }
findings.sort((a, b) => order[a.severity] - order[b.severity])
writeFileSync('qa-findings.json', JSON.stringify(findings, null, 2))

console.log('\n================ QA SUMMARY ================')
console.log('total findings:', findings.length)
for (const sev of ['critical', 'high', 'medium', 'low']) {
  const list = findings.filter((f) => f.severity === sev)
  if (!list.length) continue
  console.log(`\n--- ${sev.toUpperCase()} (${list.length}) ---`)
  for (const f of list) {
    console.log(`  ${f.area}: ${f.detail}${f.samples ? ' | e.g. ' + f.samples.join(', ') : ''}`)
  }
}
