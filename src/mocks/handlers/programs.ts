import { delay, http, HttpResponse } from 'msw'
import {
  milestones,
  programmes,
  programsFilterOptions,
  programsOverview,
  projects,
} from '../data/programs'

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

function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 })
}

export const programsHandlers = [
  /** GET /api/programs/filters — this page's own three filters. */
  http.get('/api/programs/filters', () => HttpResponse.json(programsFilterOptions)),

  /**
   * GET /api/programs
   *
   * Query (all optional): search, pillar, institution, status, page,
   * pageSize. The headline cards describe the full portfolio, not the
   * filtered slice — they are period benchmarks, not a filter response.
   */
  http.get('/api/programs', async ({ request }) => {
    await delay(300)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const pillar = params.get('pillar') ?? 'all'
    const institution = params.get('institution') ?? 'all'
    const status = params.get('status') ?? 'all'

    const filtered = programmes.filter((row) => {
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
      lastUpdated: programsOverview.lastUpdated,
      headlineCards: programsOverview.headlineCards,
      programmes: paginate(filtered, page, pageSize),
    })
  }),

  /** GET /api/programs/:programmeId — a single programme's detail header. */
  http.get('/api/programs/:programmeId', ({ params }) => {
    const programme = programmes.find((entry) => entry.id === String(params.programmeId))
    return programme ? HttpResponse.json(programme) : notFound('The programme was not found.')
  }),

  /**
   * GET /api/programs/:programmeId/projects
   *
   * The projects delivering one programme. Query (all optional): search,
   * status, page, pageSize.
   */
  http.get('/api/programs/:programmeId/projects', async ({ request, params }) => {
    await delay(200)

    const programmeId = String(params.programmeId)
    if (!programmes.some((entry) => entry.id === programmeId)) {
      return notFound('The programme was not found.')
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.trim().toLowerCase() ?? ''
    const status = url.searchParams.get('status') ?? 'all'

    const filtered = projects.filter((row) => {
      if (row.programmeId !== programmeId) return false
      const matchesSearch =
        !search ||
        [row.id, row.name, row.owner, row.location].some((field) =>
          field.toLowerCase().includes(search),
        )
      return matchesSearch && (status === 'all' || row.currentStatus === status)
    })

    const page = positiveInteger(url.searchParams.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(url.searchParams.get('pageSize'), 10))

    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  /** GET /api/programs/projects/:projectId — a single project's full profile. */
  http.get('/api/programs/projects/:projectId', ({ params }) => {
    const project = projects.find((entry) => entry.id === String(params.projectId))
    return project ? HttpResponse.json(project) : notFound('The project was not found.')
  }),

  /**
   * GET /api/programs/projects/:projectId/milestones
   *
   * The milestones for one project. Query (all optional): page, pageSize.
   */
  http.get('/api/programs/projects/:projectId/milestones', async ({ request, params }) => {
    await delay(200)

    const projectId = String(params.projectId)
    if (!projects.some((entry) => entry.id === projectId)) {
      return notFound('The project was not found.')
    }

    const filtered = milestones.filter((row) => row.projectId === projectId)

    const url = new URL(request.url)
    const page = positiveInteger(url.searchParams.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(url.searchParams.get('pageSize'), 10))

    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),
]
