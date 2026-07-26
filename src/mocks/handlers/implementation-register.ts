import { delay, http, HttpResponse } from 'msw'
import {
  implementationRegisterActions,
  implementationRegisterFilterOptions,
  implementationRegisterMilestones,
  implementationRegisterOverview,
  implementationRegisterProgrammes,
  implementationRegisterProjects,
} from '../data/implementation-register'

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

function matchesCommon(
  row: { bottleneckCategory: string | null; validationStatus: string },
  bottleneckCategory: string,
  validationStatus: string,
) {
  return (
    (bottleneckCategory === 'all' || row.bottleneckCategory === bottleneckCategory) &&
    (validationStatus === 'all' || row.validationStatus === validationStatus)
  )
}

export const implementationRegisterHandlers = [
  /** GET /api/implementation-register/filters — this module's own nine filters. */
  http.get('/api/implementation-register/filters', () =>
    HttpResponse.json(implementationRegisterFilterOptions),
  ),

  /**
   * GET /api/implementation-register
   *
   * Query (all optional): search, recordType, pillar, institution,
   * lifecycleStage, executionStatus, priority, bottleneckCategory,
   * validationStatus, reportingPeriod, pageSize, programmePage, projectPage,
   * milestonePage, actionPage.
   *
   * The mock applies search, institution, priority, bottleneckCategory and
   * validationStatus across all four tables, pillar and lifecycleStage where
   * the record type carries that field, and executionStatus against each
   * table's status. `recordType` narrows which of the four lists returns any
   * rows at all. The headline cards describe the full register, not the
   * filtered slice, matching the specification's framing as period
   * benchmarks.
   */
  http.get('/api/implementation-register', async ({ request }) => {
    await delay(300)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const recordType = params.get('recordType') ?? 'all'
    const pillar = params.get('pillar') ?? 'all'
    const institution = params.get('institution') ?? 'all'
    const lifecycleStage = params.get('lifecycleStage') ?? 'all'
    const executionStatus = params.get('executionStatus') ?? 'all'
    const priority = params.get('priority') ?? 'all'
    const bottleneckCategory = params.get('bottleneckCategory') ?? 'all'
    const validationStatus = params.get('validationStatus') ?? 'all'

    const matchesStatusPriority = (row: { status: string; priority?: string }) =>
      (executionStatus === 'all' || row.status === executionStatus) &&
      (priority === 'all' || row.priority === undefined || row.priority === priority)

    const programmes = implementationRegisterProgrammes.filter((row) => {
      if (recordType !== 'all' && recordType !== 'programme') return false
      const matchesSearch =
        !search ||
        [row.id, row.name, row.leadInstitution].some((field) =>
          field.toLowerCase().includes(search),
        )
      return (
        matchesSearch &&
        (pillar === 'all' || row.pillar === pillar) &&
        (institution === 'all' || row.leadInstitution === institution) &&
        matchesStatusPriority(row) &&
        matchesCommon(row, bottleneckCategory, validationStatus)
      )
    })

    const projects = implementationRegisterProjects.filter((row) => {
      if (recordType !== 'all' && recordType !== 'project') return false
      const matchesSearch =
        !search ||
        [row.id, row.programmeName, row.owner, row.location].some((field) =>
          field.toLowerCase().includes(search),
        )
      return (
        matchesSearch &&
        (institution === 'all' || row.owner === institution) &&
        (lifecycleStage === 'all' || row.lifecycleStage === lifecycleStage) &&
        matchesStatusPriority(row) &&
        matchesCommon(row, bottleneckCategory, validationStatus)
      )
    })

    const milestones = implementationRegisterMilestones.filter((row) => {
      if (recordType !== 'all' && recordType !== 'milestone') return false
      const matchesSearch =
        !search ||
        [row.id, row.name, row.projectName].some((field) =>
          field.toLowerCase().includes(search),
        )
      return (
        matchesSearch &&
        (institution === 'all' || row.leadInstitution === institution) &&
        matchesStatusPriority(row) &&
        matchesCommon(row, bottleneckCategory, validationStatus)
      )
    })

    const actions = implementationRegisterActions.filter((row) => {
      if (recordType !== 'all' && recordType !== 'action') return false
      const matchesSearch =
        !search ||
        [row.id, row.description, row.linkedRecord].some((field) =>
          field.toLowerCase().includes(search),
        )
      return (
        matchesSearch &&
        (institution === 'all' || row.responsibleInstitution === institution) &&
        matchesStatusPriority(row) &&
        matchesCommon(row, bottleneckCategory, validationStatus)
      )
    })

    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 10))
    const programmePage = positiveInteger(params.get('programmePage'), 1)
    const projectPage = positiveInteger(params.get('projectPage'), 1)
    const milestonePage = positiveInteger(params.get('milestonePage'), 1)
    const actionPage = positiveInteger(params.get('actionPage'), 1)

    return HttpResponse.json({
      ...implementationRegisterOverview,
      programmes: paginate(programmes, programmePage, pageSize),
      projects: paginate(projects, projectPage, pageSize),
      milestones: paginate(milestones, milestonePage, pageSize),
      actions: paginate(actions, actionPage, pageSize),
    })
  }),

  /**
   * POST /api/implementation-register/import
   *
   * Validates an uploaded template. The mock cannot parse a real workbook, so
   * it returns a fixed, representative validation report keyed off the
   * submitted file name — enough to exercise the "structured import and
   * validation" UI without a real parser.
   */
  http.post('/api/implementation-register/import', async ({ request }) => {
    await delay(500)

    const body = (await request.json()) as { fileName?: string }

    if (!body.fileName || body.fileName.trim().length === 0) {
      return HttpResponse.json(
        { message: 'Choose a file to upload.' },
        { status: 422 },
      )
    }

    return HttpResponse.json({
      fileName: body.fileName.trim(),
      validatedAt: new Date().toISOString(),
      totalRows: 48,
      validRows: 44,
      errorRows: 4,
      errors: [
        { row: 7, field: 'institution', issue: 'Institution "FMOP" is not a recognised controlled value.' },
        { row: 12, field: 'expectedDate', issue: 'Expected date is missing.' },
        { row: 23, field: 'id', issue: 'Record identifier duplicates row 9.' },
        { row: 31, field: 'status', issue: 'Status "in progress" does not match a controlled value.' },
      ],
    })
  }),
]
