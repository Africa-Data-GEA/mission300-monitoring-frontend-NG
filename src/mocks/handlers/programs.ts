import { delay, http, HttpResponse } from '../local-router'
import type {
  CreateProgrammeRequest,
  ProgrammeRecord,
  ProjectRecord,
  UpsertProjectRequest,
} from '@/api/schemas/programs'
import {
  milestones,
  programmes,
  programsFilterOptions,
  programsOverview,
  projects,
} from '../data/programs'
import { recordAuditEvent } from '../data/audit-log'

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

let nextProjectNumber = projects.length + 1
let nextProgrammeNumber = programmes.length + 1

/** Reporting-period label a newly created/edited status entry belongs to —
 * "now" is always the current cycle in this mock's fixed 2025-10-14 clock. */
const CURRENT_PERIOD_LABEL = 'Q3 2025'

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

  /**
   * POST /api/programs
   *
   * Creates a new programme from the Programs page's own quick-add form.
   * Only the essentials are supplied by the client; everything else
   * (supporting institutions, priority, bottlenecks) gets a placeholder the
   * record owner can flesh out later. No auth/role check gates this — same
   * as every other mutation here.
   */
  http.post('/api/programs', async ({ request }) => {
    await delay(300)

    const body = (await request.json()) as Partial<CreateProgrammeRequest>

    if (!body.name || body.name.trim().length < 3) {
      return HttpResponse.json({ message: 'Name the programme.' }, { status: 422 })
    }
    if (!body.leadInstitution || body.leadInstitution.trim().length < 1) {
      return HttpResponse.json({ message: 'Name the lead institution.' }, { status: 422 })
    }
    if (!body.objectives || body.objectives.trim().length < 10) {
      return HttpResponse.json({ message: 'Describe the programme objectives.' }, { status: 422 })
    }

    const record: ProgrammeRecord = {
      id: `PRG-2025-${String(nextProgrammeNumber).padStart(3, '0')}`,
      name: body.name.trim(),
      leadInstitution: body.leadInstitution.trim(),
      supportingInstitutions: [],
      pillar: (body.pillar ?? 'generation-network') as ProgrammeRecord['pillar'],
      objectives: body.objectives.trim(),
      financing: body.financing?.trim() || null,
      status: (body.status ?? 'on-track') as ProgrammeRecord['status'],
      priority: 'standard',
      startDate: new Date().toISOString(),
      endDate: body.endDate ?? new Date().toISOString(),
      bottlenecks: [],
      bottleneckCategory: null,
      validationStatus: 'provisional',
      lastUpdate: new Date().toISOString(),
    }

    nextProgrammeNumber += 1
    programmes.unshift(record)

    recordAuditEvent({
      action: 'Added programme',
      module: 'Programs',
      recordId: record.id,
      newValue: record.name,
    })

    return HttpResponse.json({
      record,
      message: `${record.id} has been added to the programme register.`,
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

  /**
   * POST /api/programs/projects
   *
   * Creates a new priority project from the Overview delivery-status admin
   * form. Only the quick-add fields are supplied by the client; everything
   * else (funding detail, contacts, documents) gets a placeholder the record
   * owner can flesh out later from the full project profile. No auth/role
   * check gates this — see the schema comment on upsertProjectRequestSchema.
   */
  http.post('/api/programs/projects', async ({ request }) => {
    await delay(300)

    const body = (await request.json()) as Partial<UpsertProjectRequest>

    if (!body.name || body.name.trim().length < 3) {
      return HttpResponse.json({ message: 'Name the project.' }, { status: 422 })
    }
    const programme = programmes.find((entry) => entry.id === body.programmeId)
    if (!programme) {
      return HttpResponse.json({ message: 'Select a valid programme.' }, { status: 422 })
    }

    const record: ProjectRecord = {
      id: `PRJ-2025-${String(nextProjectNumber).padStart(3, '0')}`,
      name: body.name.trim(),
      programmeId: programme.id,
      programmeName: programme.name,
      owner: body.owner?.trim() ?? programme.leadInstitution,
      leadName: body.leadName?.trim() ?? '',
      location: body.location?.trim() ?? '',
      coverage: 'To be confirmed',
      pillar: (body.pillar ?? programme.pillar) as ProjectRecord['pillar'],
      lifecycleStage: 'identification',
      programType: 'government-funded',
      fundingSource: null,
      fundingStructure: 'To be confirmed',
      fundingStatus: 'unfunded',
      pipelineReadiness: body.pipelineReadiness ?? null,
      projectedStatus: (body.currentStatus ?? 'on-track') as ProjectRecord['currentStatus'],
      currentStatus: (body.currentStatus ?? 'on-track') as ProjectRecord['currentStatus'],
      startDate: new Date().toISOString(),
      endDate: body.endDate ?? new Date().toISOString(),
      evidenceUrl: null,
      bottlenecks: [],
      bottleneckCategory: null,
      comment: body.comment?.trim() ?? '',
      suggestion: '',
      validationStatus: 'provisional',
      profile: {
        description: 'Added from the Overview delivery-status admin form; full profile to be completed.',
        budgetUsd: 0,
        disbursedUsd: 0,
        contractor: null,
        contactName: body.leadName?.trim() ?? programme.leadInstitution,
        contactEmail: 'unassigned@example.gov.ng',
        documents: [],
        updates: [],
      },
      statusHistory: [{ period: CURRENT_PERIOD_LABEL, status: (body.currentStatus ?? 'on-track') as ProjectRecord['currentStatus'] }],
    }

    nextProjectNumber += 1
    projects.unshift(record)

    recordAuditEvent({
      action: 'Added project',
      module: 'Programs',
      recordId: record.id,
      newValue: record.name,
    })

    return HttpResponse.json({
      record,
      message: `${record.id} has been added to the project register.`,
    })
  }),

  /**
   * PATCH /api/programs/projects/:projectId
   *
   * Updates the same quick-add fields a create submits. A status change is
   * appended to statusHistory rather than overwriting it, so the evolution
   * table this feeds stays a real trail rather than losing prior periods.
   */
  http.patch('/api/programs/projects/:projectId', async ({ request, params }) => {
    await delay(300)

    const project = projects.find((entry) => entry.id === String(params.projectId))
    if (!project) return notFound('The project was not found.')

    const body = (await request.json()) as Partial<UpsertProjectRequest>
    const priorStatus = project.currentStatus

    if (body.name) project.name = body.name.trim()
    if (body.owner) project.owner = body.owner.trim()
    if (body.leadName) project.leadName = body.leadName.trim()
    if (body.location) project.location = body.location.trim()
    if (body.pillar) project.pillar = body.pillar
    if (body.endDate) project.endDate = body.endDate
    if (body.comment !== undefined) project.comment = body.comment.trim()
    if (body.pipelineReadiness !== undefined) project.pipelineReadiness = body.pipelineReadiness
    if (body.programmeId) {
      const programme = programmes.find((entry) => entry.id === body.programmeId)
      if (programme) {
        project.programmeId = programme.id
        project.programmeName = programme.name
      }
    }
    if (body.currentStatus && body.currentStatus !== project.currentStatus) {
      project.currentStatus = body.currentStatus
      project.statusHistory = [
        ...project.statusHistory,
        { period: CURRENT_PERIOD_LABEL, status: body.currentStatus },
      ]
    }

    recordAuditEvent({
      action: 'Updated project',
      module: 'Programs',
      recordId: project.id,
      priorValue: priorStatus,
      newValue: project.currentStatus,
    })

    return HttpResponse.json({
      record: project,
      message: `${project.id} has been updated.`,
    })
  }),

  /** DELETE /api/programs/projects/:projectId */
  http.delete('/api/programs/projects/:projectId', async ({ params }) => {
    await delay(300)

    const index = projects.findIndex((entry) => entry.id === String(params.projectId))
    if (index === -1) return notFound('The project was not found.')

    const [removed] = projects.splice(index, 1)

    recordAuditEvent({
      action: 'Removed project',
      module: 'Programs',
      recordId: removed!.id,
      priorValue: removed!.name,
    })

    return HttpResponse.json({ message: `${removed!.id} has been removed from the project register.` })
  }),
]
