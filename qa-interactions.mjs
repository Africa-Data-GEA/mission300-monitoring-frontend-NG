import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5179'
const OUT = 'qa-screenshots/interactions'
mkdirSync(OUT, { recursive: true })

const findings = []
const record = (sev, area, detail) => { findings.push({ sev, area, detail }); console.log(`[${sev}] ${area}: ${detail}`) }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

const consoleErrors = []
const badResponses = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => record('critical', 'uncaught', e.message))
page.on('response', (r) => {
  if (r.status() >= 400 && r.url().includes('localhost:3001')) badResponses.push(`${r.status()} ${r.url()}`)
})

await page.goto(`${BASE}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password')
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 20000 })
console.log('login OK')

const settle = (ms = 4000) => page.waitForTimeout(ms)

/* ------------------------ KPI profile + dialogs -------------------------- */
await page.goto(`${BASE}/kpis`, { waitUntil: 'networkidle' })
await settle()

// Check the catalogue table is genuinely horizontally scrollable, not clipped.
const scrollInfo = await page.evaluate(() => {
  const el = document.querySelector('[class*="overflow-x-auto"]')
  return el ? { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth } : null
})
console.log('table scroll:', JSON.stringify(scrollInfo))
if (scrollInfo && scrollInfo.scrollWidth <= scrollInfo.clientWidth + 2) {
  console.log('  (table fits, no horizontal scroll needed)')
}

// Search for a KPI we know has real backfilled data.
const search = page.getByPlaceholder(/identifier, name or source/i)
await search.fill('Metering Rate')
await settle(3000)
await page.screenshot({ path: `${OUT}/01-search.png`, fullPage: true })

// Open the profile via the row action (the real affordance).
const profileBtn = page.getByRole('button', { name: /Open profile for/i }).first()
if (await profileBtn.count()) {
  await profileBtn.click()
  await settle(3500)
  await page.screenshot({ path: `${OUT}/02-profile-open.png`, fullPage: true })
  const t = await page.locator('body').innerText()
  if (!/Definition/i.test(t)) record('high', 'kpi-profile', 'Profile drawer opened but no Definition section rendered')

  // Data-quality scan inside the profile (where values/periods live).
  const floats = [...new Set(t.match(/\d+\.\d{5,}/g) || [])]
  if (floats.length) record('high', 'kpi-profile/precision', `Unrounded floats in profile: ${floats.slice(0, 5).join(', ')}`)
  const rawPeriods = [...new Set(t.match(/\bq[1-4]-\d{4}\b/g) || [])]
  if (rawPeriods.length) record('high', 'kpi-profile/period', `Raw period codes: ${rawPeriods.slice(0, 5).join(', ')}`)

  for (const [label, shot] of [['Set current value', '03-set-value'], ['Edit definition', '04-edit-definition']]) {
    const btn = page.getByRole('button', { name: new RegExp(label, 'i') }).first()
    if (await btn.count()) {
      await btn.click()
      await settle(2500)
      await page.screenshot({ path: `${OUT}/${shot}.png`, fullPage: true })
      const dt = await page.locator('body').innerText()
      if (label === 'Edit definition' && !/Pillar/i.test(dt)) {
        record('high', 'edit-dialog', 'Pillar reassignment field missing from the edit dialog')
      }
      if (label === 'Set current value' && !/Reporting period/i.test(dt)) {
        record('high', 'set-value-dialog', 'Reporting period field missing from the set-current-value dialog')
      }
      const cancel = page.getByRole('button', { name: /^cancel$/i }).first()
      if (await cancel.count()) { await cancel.click(); await settle(1500) }
    } else {
      record('high', 'kpi-profile', `Admin action "${label}" not present on the profile`)
    }
  }
  await page.keyboard.press('Escape')
  await settle(1200)
} else {
  record('critical', 'kpis', 'No "Open profile" row action found')
}

/* ------------------------------ filters ---------------------------------- */
await search.fill('')
await settle(2500)
const filtersBtn = page.getByRole('button', { name: /^filters$/i }).first()
if (await filtersBtn.count()) {
  await filtersBtn.click()
  await settle(2000)
  await page.screenshot({ path: `${OUT}/05-filters-open.png`, fullPage: true })

  const combos = page.getByRole('combobox')
  const comboCount = await combos.count()
  console.log('comboboxes in filter panel:', comboCount)
  if (comboCount === 0) record('high', 'kpis/filters', 'Filter panel opened but exposes no combobox controls')

  for (let i = 0; i < Math.min(comboCount, 2); i++) {
    try {
      await combos.nth(i).click()
      await settle(1200)
      const opts = page.getByRole('option')
      const n = await opts.count()
      await page.screenshot({ path: `${OUT}/06-filter-${i}-options.png`, fullPage: true })
      const optionTexts = await opts.allTextContents()
      console.log(`  combobox ${i}: ${n} options ->`, optionTexts.slice(0, 6).join(' | '))
      const rawPeriodOpt = optionTexts.filter((o) => /\bq[1-4]-\d{4}\b/.test(o))
      if (rawPeriodOpt.length) {
        record('high', 'kpis/filters', `Filter options show raw period codes: ${rawPeriodOpt.slice(0, 4).join(', ')}`)
      }
      if (n > 1) {
        await opts.nth(1).click()
        await settle(3000)
        const after = await page.locator('body').innerText()
        const m = after.match(/Showing\s+([\d–\-]+)\s+of\s+(\d+)\s+records/i)
        console.log(`    after selecting option 1 -> ${m ? m[0] : 'count line not found'}`)
        if (m && Number(m[2]) === 0) record('medium', 'kpis/filters', `Filter ${i} option 1 yields 0 records`)
      } else {
        await page.keyboard.press('Escape')
      }
    } catch (e) {
      record('medium', 'kpis/filters', `combobox ${i} interaction failed: ${e.message}`)
    }
  }
  await page.screenshot({ path: `${OUT}/07-filters-applied.png`, fullPage: true })
}

/* --------------------------- Add indicator ------------------------------- */
await page.goto(`${BASE}/kpis`, { waitUntil: 'networkidle' })
await settle()
const addBtn = page.getByRole('button', { name: /add indicator/i }).first()
if (await addBtn.count()) {
  await addBtn.click()
  await settle(2500)
  await page.screenshot({ path: `${OUT}/08-add-indicator.png`, fullPage: true })
  const t = await page.locator('body').innerText()
  for (const field of ['Identifier', 'Name', 'Pillar', 'Unit']) {
    if (!new RegExp(field, 'i').test(t)) record('high', 'add-indicator', `Field "${field}" missing from create form`)
  }
  // Submit empty to confirm validation actually blocks it.
  const submit = page.getByRole('button', { name: /add indicator/i }).last()
  await submit.click()
  await settle(2000)
  await page.screenshot({ path: `${OUT}/09-add-indicator-validation.png`, fullPage: true })
} else {
  record('medium', 'kpis', '"Add indicator" button not found (admin should see it)')
}

await browser.close()

console.log('\n=== console errors ===')
console.log([...new Set(consoleErrors)].slice(0, 10).join('\n') || 'none')
console.log('\n=== bad API responses ===')
console.log([...new Set(badResponses)].join('\n') || 'none')
console.log('\n=== findings ===')
console.log(findings.length ? findings.map((f) => `[${f.sev}] ${f.area}: ${f.detail}`).join('\n') : 'none')
