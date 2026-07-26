import { delay, http, HttpResponse } from 'msw'
import { implementationRegisterOverview, implementationRegisterProgrammes } from '../data/implementation-register'

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

const PROGRAMS_FILTER_OPTIONS = {
  pillars: [
    { value: 'all', label: 'All pillars' },
    { value: 'generation-network', label: 'Generation & network' },
    { value: 'last-mile-access', label: 'Last-mile access' },
    { value: 'financially-viable-utilities', label: 'Viable utilities' },
    { value: 'private-sector-participation', label: 'Private sector' },
    { value: 'regional-integration', label: 'Regional integration' },
    { value: 'clean-cooking', label: 'Clean cooking' },
  ],
  institutions: [
    { value: 'all', label: 'All institutions' },
    { value: 'Federal Ministry of Power', label: 'Federal Ministry of Power' },
    { value: 'NERC', label: 'NERC' },
    { value: 'Rural Electrification Agency', label: 'Rural Electrification Agency' },
    { value: 'Transmission Company of Nigeria', label: 'Transmission Company of Nigeria' },
  ],
  statuses: [
    { value: 'all', label: 'All statuses' },
    { value: 'on-track', label: 'On track' },
    { value: 'at-risk', label: 'At risk' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' },
  ],
}

export const programsHandlers = [
  /** GET /api/programs/filters — this page's own three filters. */
  http.get('/api/programs/filters', () => HttpResponse.json(PROGRAMS_FILTER_OPTIONS)),

  /**
   * GET /api/programs
   *
   * A lighter, read-only monitoring surface over the same programme data the
   * Implementation Register manages: the portfolio summary card plus the
   * programme table. Query (all optional): search, pillar, institution,
   * status, page, pageSize.
   */
  http.get('/api/programs', async ({ request }) => {
    await delay(300)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const pillar = params.get('pillar') ?? 'all'
    const institution = params.get('institution') ?? 'all'
    const status = params.get('status') ?? 'all'

    const filtered = implementationRegisterProgrammes.filter((row) => {
      const matchesSearch =
        !search ||
        [row.id, row.name, row.leadInstitution].some((field) =>
          field.toLowerCase().includes(search),
        )
      return (
        matchesSearch &&
        (pillar === 'all' || row.pillar === pillar) &&
        (institution === 'all' || row.leadInstitution === institution) &&
        (status === 'all' || row.status === status)
      )
    })

    const page = positiveInteger(params.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 10))

    return HttpResponse.json({
      lastUpdated: implementationRegisterOverview.lastUpdated,
      summary: implementationRegisterOverview.headlineCards.summary,
      programmes: paginate(filtered, page, pageSize),
    })
  }),
]
