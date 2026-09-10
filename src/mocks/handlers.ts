import { http, HttpResponse, delay } from './local-router'
import { PILLARS } from '@/api/schemas/common'
import { buildExecutiveOverview, buildProjectStatusSummary } from './data/executive-overview'
import { filterOptions } from './data/filters'
import {
  administrationAuditLog,
  administrationFilterOptions,
  administrationOverview,
  administrationScopeAssignments,
  administrationUsers,
} from './data/administration'
import {
  stakeholderCustodians,
  stakeholderFilters,
  stakeholderInstitutions,
} from './data/stakeholders'
import {
  createKpi,
  getKpiProfile,
  kpiExplorerCatalogue,
  kpiExplorerFilterOptions,
  kpiExplorerOverview,
  setKpiActive,
  updateKpiMetadata,
} from './data/kpi-explorer'
import {
  createKpiRequestSchema,
  setKpiActiveRequestSchema,
  updateKpiMetadataRequestSchema,
} from '@/api/schemas/kpi-explorer'
import { getLiveBackendUrl } from './live-backend'

/**
 * The KPIs with a real backend behind them. Their rows/profiles are fetched
 * live and spliced in where the mock would otherwise serve a static one;
 * every other KPI is untouched. Failures fall back to the static mock row
 * rather than breaking the page if the backend is down.
 */
const LIVE_KPI_IDS = new Set(['M300-P3-004', 'M300-P3-006'])

async function fetchLiveKpiProfile(backendUrl: string, id: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${backendUrl}/api/kpi-explorer/kpis/${id}`)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function fetchLiveKpiCatalogue(backendUrl: string): Promise<{ id: string }[]> {
  try {
    const response = await fetch(`${backendUrl}/api/kpi-explorer/catalogue`)
    if (!response.ok) return []
    return (await response.json()) as { id: string }[]
  } catch {
    return []
  }
}
import type { UserAccount } from '@/api/schemas/administration'
import type {
  AuditEvent,
  RoleDefinition,
  ScopeAssignment,
} from '@/api/schemas/administration'
import type { ExecutiveOverview, OngoingProject } from '@/features/dashboard/types'
import { bottlenecksHandlers } from './handlers/bottlenecks'
import { brandingHandlers } from './handlers/branding'
import { dataSubmissionHandlers } from './handlers/data-submissions'
import { learningLogHandlers } from './handlers/learning-log'
import { pillarDashboardHandlers } from './handlers/pillar-dashboard'
import { programsHandlers } from './handlers/programs'
import { reportsHandlers } from './handlers/reports'
import { stateDiscoHandlers } from './handlers/state-disco'

/**
 * MSW request handlers — the executable API contract.
 *
 * These handlers ARE the specification handed to the gApp backend team: each
 * documents a path, method, accepted query parameters and exact response
 * shape. Keep them in sync with docs/API.md and the feature type definitions.
 */

/**
 * Applies the Compact pillar filter, demonstrating the dynamic pillar
 * behaviour the specification requires:
 *
 *   "All Pillars shows the four default headline cards. When a pillar is
 *    selected, the delivery card recalculates for that pillar, the middle two
 *    cards change to the most important metrics for the selected pillar, and
 *    the escalation card filters to that pillar."
 *
 * This mock implements the narrowing that can be derived from the base
 * payload — Section C and D filter to the pillar, and the delivery card
 * recalculates from that pillar's record counts. Swapping the middle two
 * headline cards for pillar-specific metrics needs data the mock does not
 * carry, so those stay as the national figures; the real implementation must
 * substitute them. Called out in docs/API.md as an open contract item.
 */
function applyPillarFilter(
  payload: ExecutiveOverview,
  pillar: string,
): ExecutiveOverview {
  if (!pillar || pillar === 'all') return payload

  // Unknown pillar: return the payload untouched rather than an empty page.
  if (!PILLARS.some((entry) => entry === pillar)) return payload

  const exceptions = payload.deliveryStatus.exceptions.filter((exception) =>
    exception.institution.length > 0,
  )
  const ongoingProjects = payload.deliveryStatus.ongoingProjects.filter(
    (project) => project.pillar === pillar,
  )

  return {
    ...payload,
    appliedPillar: pillar,
    nationalPerformance: payload.nationalPerformance.filter(
      (metric) => metric.pillar === pillar,
    ),
    deliveryStatus: {
      ...payload.deliveryStatus,
      ongoingProjects,
      statusSummary: buildProjectStatusSummary(ongoingProjects),
      exceptions,
    },
  }
}

const PERIOD_FACTORS: Record<string, number> = {
  'q1-2025': 0.9,
  'q2-2025': 0.95,
  'q3-2025': 1,
  'fy-2025': 1.04,
}

const PERIOD_PROJECT_STATUSES: Record<string, readonly OngoingProject['currentStatus'][]> = {
  'q1-2025': ['blocked', 'blocked', 'at-risk', 'delayed', 'delayed', 'at-risk'],
  'q2-2025': ['delayed', 'blocked', 'on-track', 'at-risk', 'delayed', 'on-track'],
  'q3-2025': ['delayed', 'blocked', 'on-track', 'at-risk', 'delayed', 'on-track'],
  'fy-2025': ['at-risk', 'at-risk', 'on-track', 'on-track', 'at-risk', 'on-track'],
}

function formatMetricValue(id: string, value: number) {
  if (id === 'metering-rate') return `${value.toFixed(0)}%`
  if (id === 'renewable-share' || id === 'atcc-losses' || id === 'market-remittance') {
    return `${value.toFixed(1)}%`
  }
  if (id === 'tariff-shortfall') return `₦${(value / 1000).toFixed(2)}tn`
  if (id === 'private-capital') return `$${(value / 1000).toFixed(1)}B`
  return String(value)
}

/**
 * Turns a period filter slug into the label a reader sees: q3-2025 → "Q3 2025",
 * fy-2025 → "FY 2025".
 *
 * The slug is a URL value, not display text. Uppercasing it produced "Q3-2025",
 * which sat on the Executive Overview beside "Q4 2025" from real KPI data — two
 * formats for the same idea, one of them a URL fragment. Anything the API hands
 * back as `reportingPeriod` is a label, and that has to hold on the real backend
 * too, not just here.
 */
function formatPeriodLabel(slug: string): string {
  return slug
    .split('-')
    .map((part, index) => (index === 0 ? part.toUpperCase() : part))
    .join(' ')
}

function applyPeriodFilter(payload: ExecutiveOverview, period: string): ExecutiveOverview {
  const factor = PERIOD_FACTORS[period]
  if (!factor) return payload

  const projectStatuses = PERIOD_PROJECT_STATUSES[period] ?? PERIOD_PROJECT_STATUSES['q3-2025']!
  const ongoingProjects = payload.deliveryStatus.ongoingProjects.map((project, index) => ({
    ...project,
    currentStatus: projectStatuses[index] ?? project.currentStatus,
  }))

  const peopleCurrent = Math.round(payload.headlineCards.peopleWithElectricityAccess.current * factor * 10) / 10
  const cookingCurrent = Math.min(100, Math.round(payload.headlineCards.cleanCookingAccess.current * factor * 10) / 10)
  const availableMw = Math.round(payload.headlineCards.generationCapacity.availableMw * factor)

  return {
    ...payload,
    headlineCards: {
      ...payload.headlineCards,
      peopleWithElectricityAccess: {
        ...payload.headlineCards.peopleWithElectricityAccess,
        current: peopleCurrent,
        value: `${peopleCurrent.toFixed(1)}M`,
        reportingPeriod: formatPeriodLabel(period),
      },
      accessRate: {
        ...payload.headlineCards.accessRate,
        rawValue: Math.round(payload.headlineCards.accessRate.rawValue * factor * 10) / 10,
        // One decimal, matching clean cooking access. Dividing by 10 drops a
        // trailing zero, so 70.0 rendered as "70%" beside "26.0%" — two
        // precisions for two percentages sitting side by side.
        value: `${(Math.round(payload.headlineCards.accessRate.rawValue * factor * 10) / 10).toFixed(1)}%`,
      },
      generationCapacity: {
        ...payload.headlineCards.generationCapacity,
        availableMw,
        value: `${(availableMw / 1000).toFixed(1)} GW`,
        availabilityRatio:
          Math.round((availableMw / payload.headlineCards.generationCapacity.installedMw) * 1000) / 10,
      },
      cleanCookingAccess: {
        ...payload.headlineCards.cleanCookingAccess,
        current: cookingCurrent,
        value: `${cookingCurrent.toFixed(1)}%`,
        reportingPeriod: formatPeriodLabel(period),
      },
    },
    accessDelivery: payload.accessDelivery.map((channel) => {
      const rawValue = Math.round(channel.rawValue * factor)
      return {
        ...channel,
        rawValue,
        value: new Intl.NumberFormat('en-US').format(rawValue),
        percentComplete: channel.target
          ? Math.round((rawValue / channel.target) * 1000) / 10
          : null,
      }
    }),
    nationalPerformance: payload.nationalPerformance.map((metric) => {
      const adjusted = metric.direction === 'lower-is-better'
        ? metric.current / factor
        : metric.current * factor
      const current = Math.min(metric.scaleMax, Math.max(metric.scaleMin, Math.round(adjusted * 10) / 10))
      const adjustedExpected = metric.expected === null
        ? null
        : metric.direction === 'lower-is-better'
          ? metric.expected / factor
          : metric.expected * factor
      const expected = adjustedExpected === null
        ? null
        : Math.min(metric.scaleMax, Math.max(metric.scaleMin, Math.round(adjustedExpected * 10) / 10))
      return { ...metric, current, expected, value: formatMetricValue(metric.id, current) }
    }),
    deliveryStatus: {
      ...payload.deliveryStatus,
      ongoingProjects,
      statusSummary: buildProjectStatusSummary(ongoingProjects),
    },
  }
}

const INSTITUTION_TERMS: Record<string, readonly string[]> = {
  fmop: ['federal ministry of power', 'fmop'],
  fmof: ['federal ministry of finance', 'fmof'],
  nerc: ['nerc'],
  rea: ['rural electrification agency', 'rea'],
  tcn: ['transmission company of nigeria', 'tcn'],
  niso: ['nigerian independent system operator', 'niso'],
  nbet: ['nigerian bulk electricity trading', 'nbet'],
}

const METRIC_INSTITUTIONS: Record<string, readonly string[]> = {
  'renewable-share': ['fmop'],
  'metering-rate': ['nerc'],
  'atcc-losses': ['nerc'],
  'market-remittance': ['nerc', 'nbet'],
  'tariff-shortfall': ['nerc', 'fmof'],
  'private-capital': ['fmop', 'fmof', 'rea'],
}

const CHANNEL_INSTITUTIONS: Record<string, readonly string[]> = {
  'grid-connections': ['tcn', 'fmop'],
  'mini-grid-connections': ['rea'],
  'solar-home-systems': ['rea'],
  'clean-cooking': ['rea'],
}

function institutionMatches(value: string, institution: string) {
  const normalized = value.toLocaleLowerCase()
  return (INSTITUTION_TERMS[institution] ?? []).some((term) => normalized.includes(term))
}

function applyInstitutionFilter(
  payload: ExecutiveOverview,
  institution: string,
): ExecutiveOverview {
  if (!institution || institution === 'all' || !INSTITUTION_TERMS[institution]) return payload

  const ongoingProjects = payload.deliveryStatus.ongoingProjects.filter((project) =>
    institutionMatches(project.owner, institution),
  )

  return {
    ...payload,
    accessDelivery: payload.accessDelivery.filter((channel) =>
      CHANNEL_INSTITUTIONS[channel.id]?.includes(institution),
    ),
    nationalPerformance: payload.nationalPerformance.filter((metric) =>
      METRIC_INSTITUTIONS[metric.id]?.includes(institution),
    ),
    deliveryStatus: {
      ...payload.deliveryStatus,
      ongoingProjects,
      statusSummary: buildProjectStatusSummary(ongoingProjects),
      exceptions: payload.deliveryStatus.exceptions.filter((exception) =>
        institutionMatches(exception.institution, institution),
      ),
    },
  }
}

/**
 * Which delivery channel each technology narrows to. Generation
 * technologies (hydro, solar, gas) have no access-delivery channel of their
 * own, so they narrow the section to nothing rather than silently ignoring
 * the selection.
 */
const TECHNOLOGY_CHANNELS: Record<string, readonly string[]> = {
  grid: ['grid-connections'],
  'mini-grid': ['mini-grid-connections'],
  shs: ['solar-home-systems'],
  'clean-cooking': ['clean-cooking'],
  hydro: [],
  solar: [],
  gas: [],
}

function applyTechnologyFilter(
  payload: ExecutiveOverview,
  technology: string,
): ExecutiveOverview {
  const channels = TECHNOLOGY_CHANNELS[technology]
  if (!technology || technology === 'all' || !channels) return payload

  return {
    ...payload,
    accessDelivery: payload.accessDelivery.filter((channel) => channels.includes(channel.id)),
  }
}

function applyExecutiveFilters(
  payload: ExecutiveOverview,
  filters: { period: string; pillar: string; institution: string; technology: string },
) {
  return applyTechnologyFilter(
    applyInstitutionFilter(
      applyPillarFilter(applyPeriodFilter(payload, filters.period), filters.pillar),
      filters.institution,
    ),
    filters.technology,
  )
}

const INSTITUTIONS: Record<string, string> = {
  fmop: 'Federal Ministry of Power',
  fmof: 'Federal Ministry of Finance',
  nerc: 'NERC',
  rea: 'Rural Electrification Agency',
  tcn: 'Transmission Company of Nigeria',
  niso: 'Nigerian Independent System Operator',
  emrc: 'EMRC',
}

const MODULES: Record<string, string> = {
  'executive-overview': 'Executive Overview',
  'kpi-explorer': 'KPI Explorer',
  'implementation-register': 'Implementation Register',
  'data-submissions': 'Data Submissions & Validation',
  reports: 'Reports & Exports',
  administration: 'User Access & Administration',
}

function matchesInstitution(user: UserAccount, institution: string) {
  if (institution === 'all') return true
  if (institution === 'disco') return user.institution.endsWith('DisCo')
  return user.institution === INSTITUTIONS[institution]
}

function roleReachesModule(role: RoleDefinition, module: string) {
  if (module === 'all') return true
  if (role.modules.includes('All modules')) return true

  const label = MODULES[module]
  return role.modules.some(
    (entry) =>
      entry === label ||
      (entry === 'All monitoring modules' &&
        module !== 'data-submissions' &&
        module !== 'reports' &&
        module !== 'administration'),
  )
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requestedPage, pageCount)
  const offset = (page - 1) * pageSize

  return {
    items: items.slice(offset, offset + pageSize),
    page,
    pageSize,
    total: items.length,
  }
}

function auditCutoff(period: string) {
  if (period === 'all-time') return null

  const days =
    period === 'last-7-days' ? 7 : period === 'last-90-days' ? 90 : 30
  const cutoff = new Date(administrationOverview.lastUpdated)
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  return cutoff
}

const invitedUsers: UserAccount[] = []

export const handlers = [
  ...bottlenecksHandlers,
  ...brandingHandlers,
  ...dataSubmissionHandlers,
  ...learningLogHandlers,
  ...pillarDashboardHandlers,
  ...programsHandlers,
  ...reportsHandlers,
  ...stateDiscoHandlers,
  http.get('/api/health', () =>
    HttpResponse.json({ status: 'ok', version: 'mock' }),
  ),

  /**
   * GET /api/kpi-explorer/filters
   *
   * The KPI Explorer's own eight filters, per its specification.
   */
  http.get('/api/kpi-explorer/filters', () =>
    HttpResponse.json(kpiExplorerFilterOptions),
  ),

  /**
   * GET /api/kpi-explorer/kpis/:id
   *
   * Full profile for one indicator (Section C). Separate from the catalogue
   * list so the heavy profile payload is only fetched on drill-down.
   */
  http.get('/api/kpi-explorer/kpis/:id', async ({ params }) => {
    const id = String(params.id)
    const liveBackend = getLiveBackendUrl()
    if (liveBackend && LIVE_KPI_IDS.has(id)) {
      const live = await fetchLiveKpiProfile(liveBackend, id)
      if (live) return HttpResponse.json(live)
    }

    await delay(200)
    const profile = getKpiProfile(id)

    if (!profile) {
      return HttpResponse.json(
        { message: `No indicator found with id ${id}` },
        { status: 404 },
      )
    }

    return HttpResponse.json(profile)
  }),

  /**
   * PATCH /api/kpi-explorer/kpis/:id
   *
   * Updates a KPI's definition metadata — methodology, baseline, target,
   * source. Never touches `current`/`history`, which only change through a
   * published data submission (see the decisions handler in
   * data-submissions.ts). No auth/role enforcement server-side in this mock
   * — the frontend gates the edit UI to system-administrator; see
   * canRoleReachModule and the real backend's own auth layer, once it has
   * one, should enforce this for real.
   */
  http.patch('/api/kpi-explorer/kpis/:id', async ({ request, params }) => {
    await delay(200)
    const id = String(params.id)
    const body = await request.json()
    const result = updateKpiMetadataRequestSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: result.error.issues[0]?.message ?? 'Invalid KPI metadata.' },
        { status: 400 },
      )
    }
    const updated = updateKpiMetadata(id, result.data)
    if (!updated) {
      return HttpResponse.json({ message: `No indicator found with id ${id}` }, { status: 404 })
    }
    return HttpResponse.json(updated)
  }),

  /**
   * POST /api/kpi-explorer/kpis — registers a new indicator.
   *
   * Review asked for the ability to add extra KPIs, not only edit existing
   * ones (docs/M300 Monitoring Platform Feedback.pptx, slide 15). The new
   * indicator carries no value: numbers only ever arrive via an approved
   * data submission.
   */
  http.post('/api/kpi-explorer/kpis', async ({ request }) => {
    await delay(200)
    const result = createKpiRequestSchema.safeParse(await request.json())
    if (!result.success) {
      return HttpResponse.json(
        { message: result.error.issues[0]?.message ?? 'Invalid indicator.' },
        { status: 400 },
      )
    }
    const row = createKpi(result.data)
    if (!row) {
      return HttpResponse.json(
        { message: `An indicator with id ${result.data.id} already exists.` },
        { status: 409 },
      )
    }
    return HttpResponse.json(
      { row, message: `${row.name} added to the registry. It will show a value once a submission is approved.` },
      { status: 201 },
    )
  }),

  /**
   * PATCH /api/kpi-explorer/kpis/:id/active — retires or restores an
   * indicator. Never deletes: published values must stay traceable.
   */
  http.patch('/api/kpi-explorer/kpis/:id/active', async ({ request, params }) => {
    await delay(200)
    const result = setKpiActiveRequestSchema.safeParse(await request.json())
    if (!result.success) {
      return HttpResponse.json(
        { message: result.error.issues[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    const row = setKpiActive(String(params.id), result.data.active)
    if (!row) {
      return HttpResponse.json({ message: `No indicator found with id ${params.id}` }, { status: 404 })
    }
    return HttpResponse.json({
      row,
      message: result.data.active ? `${row.name} restored.` : `${row.name} retired from the registry.`,
    })
  }),

  /**
   * GET /api/kpi-explorer
   *
   * Query (all optional): search, pillar, category, readiness,
   * validationStatus, sourceInstitution, reportingPeriod, geography, page,
   * pageSize.
   *
   * The mock applies search, pillar, category, readiness and validationStatus
   * to the catalogue table so the filtering contract is demonstrable. The
   * summary cards and distributions describe the FULL catalogue, not the
   * filtered slice — the specification frames them as catalogue readiness, not
   * a response to the current filter.
   */
  http.get('/api/kpi-explorer', async ({ request }) => {
    await delay(300)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const pillar = params.get('pillar') ?? 'all'
    const category = params.get('category') ?? 'all'
    const readiness = params.get('readiness') ?? 'all'
    const validationStatus = params.get('validationStatus') ?? 'all'

    const filtered = kpiExplorerCatalogue.filter((row) => {
      // Retired indicators are hidden from the catalogue but never deleted —
      // `?includeRetired=true` brings them back for an admin reviewing what
      // has been taken out of service. `active` absent means active.
      if (row.active === false && params.get('includeRetired') !== 'true') return false
      const matchesSearch =
        !search ||
        [row.id, row.name, row.sourceInstitution].some((field) =>
          field.toLowerCase().includes(search),
        )
      const matchesPillar = pillar === 'all' || row.pillar === pillar
      const matchesCategory = category === 'all' || row.category === category
      const matchesReadiness = readiness === 'all' || row.readiness === readiness
      const matchesStatus =
        validationStatus === 'all' || row.validationStatus === validationStatus

      return (
        matchesSearch &&
        matchesPillar &&
        matchesCategory &&
        matchesReadiness &&
        matchesStatus
      )
    })

    const liveBackend = getLiveBackendUrl()
    if (liveBackend) {
      const liveRows = await fetchLiveKpiCatalogue(liveBackend)
      for (const liveId of LIVE_KPI_IDS) {
        const live = liveRows.find((row) => row.id === liveId)
        const index = filtered.findIndex((row) => row.id === liveId)
        if (live && index !== -1) filtered[index] = live as (typeof filtered)[number]
      }
    }

    const page = positiveInteger(params.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 25))

    return HttpResponse.json({
      ...kpiExplorerOverview,
      catalogue: paginate(filtered, page, pageSize),
    })
  }),

  http.post('/api/auth/identify', async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as { email?: string }
    const user = administrationUsers.find(
      (entry) => entry.email.toLowerCase() === body.email?.trim().toLowerCase(),
    )

    if (!user || user.status !== 'active') {
      return HttpResponse.json(
        { message: 'We could not find an active account for that email.' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      email: user.email,
      displayName: user.name,
      institution: user.institution,
    })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(250)
    const body = (await request.json()) as {
      email?: string
      password?: string
    }
    const user = administrationUsers.find(
      (entry) => entry.email.toLowerCase() === body.email?.trim().toLowerCase(),
    )

    if (!user || user.status !== 'active' || body.password !== 'M300demo!') {
      return HttpResponse.json(
        { message: 'The password you entered is incorrect.' },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      accessToken: `mock-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }),

  http.post('/api/auth/forgot-password', async () => {
    await delay(250)

    // Always return the same response so this endpoint cannot be used to
    // discover which email addresses have accounts.
    return HttpResponse.json({
      message:
        'If an active account exists for that email, reset instructions have been sent.',
    })
  }),

  /**
   * GET /api/filters
   *
   * Option lists for the global filter bar. Separate from any page payload so
   * the bar does not depend on which module happens to be open.
   */
  http.get('/api/filters', () => HttpResponse.json(filterOptions)),

  http.get('/api/stakeholders', async ({ request }) => {
    await delay(250)
    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const institutionType = params.get('institutionType') ?? 'all'
    const role = params.get('role') ?? 'all'
    const status = params.get('status') ?? 'all'
    const dataset = params.get('dataset') ?? 'all'
    const programme = params.get('programme') ?? 'all'
    const coverage = params.get('coverage') ?? 'all'

    const institutions = stakeholderInstitutions.filter((item) => {
      const matchesSearch =
        !search ||
        [item.name, item.shortName, ...item.datasets, ...item.programmes]
          .join(' ')
          .toLowerCase()
          .includes(search)
      return (
        matchesSearch &&
        (institutionType === 'all' || item.type === institutionType) &&
        (role === 'all' || item.roles.includes(role)) &&
        (status === 'all' || item.status === status) &&
        (dataset === 'all' || item.datasets.includes(dataset)) &&
        (programme === 'all' || item.programmes.includes(programme)) &&
        (coverage === 'all' || item.coverage === coverage)
      )
    })

    const matchingNames = new Set(
      institutions.flatMap((item) => [item.name, item.shortName]),
    )
    const matchesRelated = (value: string) =>
      matchingNames.size === stakeholderInstitutions.length ||
      matchingNames.has(value) ||
      [...matchingNames].some((name) =>
        value.toLowerCase().includes(name.toLowerCase()),
      )

    return HttpResponse.json({
      summary: {
        activeInstitutions: stakeholderInstitutions.filter((item) => item.status === 'active').length,
        dataCustodians: new Set(stakeholderCustodians.map((item) => item.custodian)).size,
        pendingOnboarding: stakeholderInstitutions.filter((item) => item.status === 'pending-onboarding').length,
      },
      institutions,
      custodians: stakeholderCustodians.filter((item) =>
        (!search || [item.dataset, item.custodian, item.focalPerson].join(' ').toLowerCase().includes(search)) &&
        (dataset === 'all' || item.dataset === dataset) &&
        matchesRelated(item.custodian),
      ),
      filters: stakeholderFilters,
      lastUpdated: '2026-07-17T17:00:00Z',
    })
  }),

  /**
   * GET /api/administration/filters
   *
   * This module has its OWN eight filters per the specification, which are not
   * the seven global dashboard filters.
   */
  http.get('/api/administration/filters', () =>
    HttpResponse.json(administrationFilterOptions),
  ),

  http.post('/api/administration/users/invite', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as {
      name: string
      email: string
      institution: string
      designation: string
      role: UserAccount['role']
    }
    const allUsers = [...administrationUsers, ...invitedUsers]
    if (allUsers.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) {
      return HttpResponse.json(
        { message: 'A user account already exists for that email.' },
        { status: 409 },
      )
    }

    const user: UserAccount = {
      id: `usr-${String(allUsers.length + 1).padStart(3, '0')}`,
      name: body.name,
      email: body.email,
      institution: body.institution,
      designation: body.designation,
      role: body.role,
      status: 'pending',
      lastLogin: null,
      createdAt: new Date().toISOString(),
    }
    invitedUsers.push(user)
    return HttpResponse.json({
      user,
      message: `An invitation was sent to ${user.email}.`,
    })
  }),

  /**
   * GET /api/administration
   *
   * Query (all optional): search, institution, role, accountStatus,
   * permission, accessScope, module, auditPeriod, usersPage, scopePage,
   * auditPage and pageSize.
   *
   * All filters and each independently paginated collection are exercised by
   * the mock so the backend contract can be implemented without guesswork.
   */
  http.get('/api/administration', async ({ request }) => {
    await delay(300)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const role = params.get('role') ?? 'all'
    const status = params.get('accountStatus') ?? 'all'
    const institution = params.get('institution') ?? 'all'
    const permission = params.get('permission') ?? 'all'
    const accessScope = params.get('accessScope') ?? 'all'
    const module = params.get('module') ?? 'all'
    const auditPeriod = params.get('auditPeriod') ?? 'last-30-days'
    const usersPage = positiveInteger(params.get('usersPage'), 1)
    const scopePage = positiveInteger(params.get('scopePage'), 1)
    const auditPage = positiveInteger(params.get('auditPage'), 1)
    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 5))

    const roleById = new Map(
      administrationOverview.roles.map((entry) => [entry.role, entry]),
    )
    const usersWithScope = new Set(
      administrationScopeAssignments
        .filter(
          (assignment) =>
            accessScope === 'all' || assignment.level === accessScope,
        )
        .map((assignment) => assignment.userId),
    )

    const users = [...administrationUsers, ...invitedUsers].filter((user) => {
      const matchesSearch =
        !search ||
        [user.name, user.email, user.institution, user.designation].some(
          (field) => field.toLowerCase().includes(search),
        )
      const matchesRole = role === 'all' || user.role === role
      const matchesStatus = status === 'all' || user.status === status
      const matchesPermission =
        permission === 'all' ||
        roleById.get(user.role)?.permissions.includes(
          permission as never,
        ) === true
      const matchesScope =
        accessScope === 'all' || usersWithScope.has(user.id)
      const matchesModule =
        module === 'all' ||
        roleReachesModule(roleById.get(user.role)!, module)

      return (
        matchesSearch &&
        matchesInstitution(user, institution) &&
        matchesRole &&
        matchesStatus &&
        matchesPermission &&
        matchesScope &&
        matchesModule
      )
    })

    const matchingUserIds = new Set(users.map((user) => user.id))

    const scopes: ScopeAssignment[] = administrationScopeAssignments.filter(
      (assignment) =>
        matchingUserIds.has(assignment.userId) &&
        (accessScope === 'all' || assignment.level === accessScope) &&
        (!search ||
          [
            assignment.userName,
            assignment.scope,
            assignment.responsibility,
          ].some((field) => field.toLowerCase().includes(search))),
    )

    const cutoff = auditCutoff(auditPeriod)
    const auditEvents: AuditEvent[] = administrationAuditLog.filter(
      (event) =>
        matchingUserIds.has(event.userId) &&
        (module === 'all' || event.module === MODULES[module]) &&
        (!cutoff || new Date(event.timestamp) >= cutoff) &&
        (!search ||
          [
            event.userName,
            event.action,
            event.module,
            event.recordId ?? '',
            event.reference ?? '',
          ].some((field) => field.toLowerCase().includes(search))),
    )

    const roles = administrationOverview.roles.filter(
      (entry) =>
        (role === 'all' || entry.role === role) &&
        (permission === 'all' ||
          entry.permissions.includes(permission as never)) &&
        roleReachesModule(entry, module),
    )

    return HttpResponse.json({
      ...administrationOverview,
      users: paginate(users, usersPage, pageSize),
      roles,
      scopeAssignments: paginate(scopes, scopePage, pageSize),
      auditLog: paginate(auditEvents, auditPage, pageSize),
    })
  }),

  /**
   * GET /api/executive-overview
   *
   * Query (all optional): period, pillar and institution.
   *
   * The artificial delay exists so loading states are exercised during
   * development rather than flashing past.
   */
  http.get('/api/executive-overview', async ({ request }) => {
    await delay(400)

    const params = new URL(request.url).searchParams
    return HttpResponse.json(
      // Rebuilt fresh rather than served from a cached snapshot, so a
      // project added/edited/deleted via the admin form (mocks/handlers/
      // programs.ts) is reflected on the next fetch — same reasoning as
      // buildPillarDashboard() and buildExecutiveOverview() being pure
      // derivations over the shared in-memory registers, not copies.
      applyExecutiveFilters(buildExecutiveOverview(), {
        period: params.get('period') ?? 'q3-2025',
        pillar: params.get('pillar') ?? 'all',
        institution: params.get('institution') ?? 'all',
        technology: params.get('technology') ?? 'all',
      }),
    )
  }),
]
