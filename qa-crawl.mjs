import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const APP = 'http://localhost:5179'
const API = 'http://localhost:3001'
const OUT = 'qa-screenshots/crawl'
mkdirSync(OUT, { recursive: true })

/* Pull real ids so dynamic routes are exercised with live data, not guesses. */
const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@m300.local', password: 'ChangeMe123!' }),
})
const { accessToken } = await login.json()
const H = { Authorization: `Bearer ${accessToken}` }

const programmes = await (await fetch(`${API}/programs?pageSize=5`, { headers: H })).json()
const programmeId = (programmes.programmes?.items ?? programmes.items ?? [])[0]?.id
const projects = programmeId
  ? await (await fetch(`${API}/programs/${programmeId}/projects`, { headers: H })).json()
  : []
const projectId = (projects.items ?? projects)[0]?.id
const kpis = await (await fetch(`${API}/kpi-explorer?pageSize=3`, { headers: H })).json()
const kpiId = kpis.catalogue.items[0]?.id
console.log('ids ->', { programmeId, projectId, kpiId })

const ROUTES = [
  ['/', 'root'],
  ['/progress', 'progress'],
  ['/dashboard', 'dashboard'],
  ['/kpis', 'kpis'],
  [kpiId ? `/kpis?kpi=${kpiId}` : null, 'kpis-profile'],
  ['/pillars', 'pillars-index'],
  ['/pillars/generation-network', 'pillar-generation'],
  ['/pillars/last-mile-access', 'pillar-lastmile'],
  ['/pillars/financially-viable-utilities', 'pillar-utilities'],
  ['/pillars/private-sector-participation', 'pillar-private'],
  ['/pillars/regional-integration', 'pillar-regional'],
  ['/pillars/clean-cooking', 'pillar-cooking'],
  ['/programs', 'programs'],
  ['/programs/new', 'programs-new'],
  [programmeId ? `/programs/${programmeId}` : null, 'programme-detail'],
  ['/programs/projects/new', 'project-new'],
  [projectId ? `/programs/projects/${projectId}` : null, 'project-detail'],
  [projectId ? `/programs/projects/${projectId}/edit` : null, 'project-edit'],
  ['/bottlenecks', 'bottlenecks'],
  ['/stakeholders', 'stakeholders'],
  ['/administration', 'administration'],
  ['/data-submissions', 'data-submissions'],
  ['/reports', 'reports'],
  ['/learning-log', 'learning-log'],
  ['/state-disco', 'state-disco'],
  ['/account/change-password', 'change-password'],
  ['/account/forgot-password', 'forgot-password'],
  ['/definitely-not-a-route', 'not-found'],
].filter(([r]) => r)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } })

let consoleErrors = []
let pageErrors = []
let badResponses = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => pageErrors.push(e.message))
page.on('response', (r) => {
  if (r.status() >= 400 && r.url().includes('3001')) badResponses.push(`${r.status()} ${r.url().replace(API, '')}`)
})

await page.goto(`${APP}/account/login`, { waitUntil: 'networkidle' })
await page.locator('input[type="email"]').first().fill('admin@m300.local')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/account/password')
await page.locator('input[name="password"]').first().fill('ChangeMe123!')
await page.locator('button[type="submit"]').first().click()
await page.waitForURL('**/dashboard', { timeout: 20000 })
console.log('login OK\n')

const results = []
for (const [route, name] of ROUTES) {
  consoleErrors = []; pageErrors = []; badResponses = []
  const row = { route, name, status: 'ok', notes: [] }
  try {
    await page.goto(`${APP}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(6000)
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })

    const text = (await page.locator('body').innerText()).trim()
    const main = await page.locator('main').count()
    const skeletons = await page.locator('[class*="animate-pulse"]').count()

    if (pageErrors.length) { row.status = 'CRASH'; row.notes.push(`uncaught: ${pageErrors[0].slice(0, 120)}`) }
    if (/Something went wrong|Unexpected error|Failed to load|Try again/i.test(text)) {
      row.status = 'ERROR-STATE'; row.notes.push('error boundary / retry UI visible')
    }
    if (text.length < 120 && name !== 'not-found') { row.status = 'BLANK'; row.notes.push(`only ${text.length} chars of text`) }
    if (skeletons > 0) { if (row.status === 'ok') row.status = 'LOADING'; row.notes.push(`${skeletons} skeleton(s) still visible`) }
    if (main === 0 && !route.startsWith('/account')) row.notes.push('no <main> landmark')
    if (badResponses.length) { if (row.status === 'ok') row.status = 'API-ERR'; row.notes.push(...[...new Set(badResponses)].slice(0, 3)) }
    if (consoleErrors.length) row.notes.push(`console: ${[...new Set(consoleErrors)][0].slice(0, 110)}`)
    row.chars = text.length
  } catch (err) {
    row.status = 'NAV-FAIL'
    row.notes.push(err.message.slice(0, 140))
  }
  results.push(row)
  const flag = row.status === 'ok' ? ' ok ' : row.status
  console.log(`[${flag.padEnd(11)}] ${route.padEnd(46)} ${row.notes.join(' | ')}`)
}

await browser.close()

const broken = results.filter((r) => r.status !== 'ok')
console.log(`\n================ ${broken.length} of ${results.length} routes need attention ================`)
for (const r of broken) console.log(`${r.status.padEnd(12)} ${r.route}\n    ${r.notes.join('\n    ')}`)
