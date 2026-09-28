import { delay, http, HttpResponse } from '../local-router'
import type { BottleneckRecord } from '@/api/schemas/bottlenecks'
import { recordAuditEvent } from '../data/audit-log'
import {
  bottlenecksEscalations,
  bottlenecksFilterOptions,
  bottlenecksOverview,
  bottlenecksRegister,
} from '../data/bottlenecks'
import { projects } from '../data/programs'

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

let nextRecordNumber = bottlenecksRegister.length + 1

export const bottlenecksHandlers = [
  http.delete('/api/bottlenecks/:id', ({ params }) => {
    const id = String(params.id)
    const index = bottlenecksRegister.findIndex((record) => record.id === id)
    if (index < 0) return HttpResponse.json({ message: 'The bottleneck was not found.' }, { status: 404 })
    const record = bottlenecksRegister[index]!
    bottlenecksRegister.splice(index, 1)
    for (let i = bottlenecksEscalations.length - 1; i >= 0; i--) {
      if (bottlenecksEscalations[i]?.bottleneckId === id) bottlenecksEscalations.splice(i, 1)
    }
    for (const project of projects) project.bottlenecks = project.bottlenecks.filter((entry) => entry !== id)
    recordAuditEvent({ action: 'Deleted bottleneck', module: 'Bottlenecks & Exceptions', recordId: id, priorValue: record.issue })
    return new HttpResponse(null, { status: 204 })
  }),
  /** GET /api/bottlenecks/filters — this module's own nine filters. */
  http.get('/api/bottlenecks/filters', () =>
    HttpResponse.json(bottlenecksFilterOptions),
  ),

  /**
   * GET /api/bottlenecks
   *
   * Query (all optional): search, severity, category, institution, pillar,
   * linkedRecord, lifecycleStage, escalationStatus, validationStatus,
   * reportingPeriod, page, pageSize (applies to the register only).
   *
   * The mock applies search, severity, category and institution to the
   * register table; the four headline cards, distributions and agency
   * breakdown describe the full open register, not the filtered slice — the
   * specification frames them as period benchmarks, not a filter response.
   */
  http.get('/api/bottlenecks', async ({ request }) => {
    await delay(300)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const severity = params.get('severity') ?? 'all'
    const category = params.get('category') ?? 'all'
    const institution = params.get('institution') ?? 'all'

    const filtered = bottlenecksRegister.filter((row) => {
      const matchesSearch =
        !search ||
        [row.id, row.issue, row.institution].some((field) =>
          field.toLowerCase().includes(search),
        )
      const matchesSeverity = severity === 'all' || row.severity === severity
      const matchesCategory = category === 'all' || row.category === category
      const matchesInstitution =
        institution === 'all' || row.institution === institution

      return matchesSearch && matchesSeverity && matchesCategory && matchesInstitution
    })

    const page = positiveInteger(params.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 10))
    const escalationPage = positiveInteger(params.get('escalationPage'), 1)

    return HttpResponse.json({
      ...bottlenecksOverview,
      register: paginate(filtered, page, pageSize),
      escalations: paginate(bottlenecksEscalations, escalationPage, 10),
    })
  }),

  /**
   * POST /api/bottlenecks
   *
   * Creates a new bottleneck / exception record. The server is the source of
   * truth for the generated identifier, date raised and initial status — the
   * client only supplies what a person raising the issue would know.
   */
  http.post('/api/bottlenecks', async ({ request }) => {
    await delay(300)

    const body = (await request.json()) as {
      issue?: string
      category?: string
      severity?: string
      pillar?: string
      linkedRecord?: string
      institution?: string
      lifecycleStage?: string
      followUp?: string
    }

    if (!body.issue || body.issue.trim().length < 5) {
      return HttpResponse.json(
        { message: 'Describe the issue in at least a few words.' },
        { status: 422 },
      )
    }

    const record: BottleneckRecord = {
      id: `BTN-2025-${String(nextRecordNumber).padStart(3, '0')}`,
      issue: body.issue.trim(),
      category: (body.category ?? 'coordination') as BottleneckRecord['category'],
      severity: (body.severity ?? 'medium') as BottleneckRecord['severity'],
      pillar: (body.pillar ?? 'generation-network') as BottleneckRecord['pillar'],
      linkedRecord: body.linkedRecord?.trim() ?? '',
      institution: body.institution?.trim() ?? '',
      dateRaised: new Date().toISOString(),
      ageDays: 0,
      followUp: body.followUp?.trim() ?? '',
      escalationStatus: 'not-escalated',
      status: 'open',
      lifecycleStage:
        (body.lifecycleStage ?? 'identification') as BottleneckRecord['lifecycleStage'],
      // Empty per statusHistorySchema's own rule: a bottleneck just raised has
      // never changed status, so its one data point is `status` itself.
      statusHistory: [],
    }

    nextRecordNumber += 1
    bottlenecksRegister.unshift(record)

    // linkedRecord carries a project id when raised from a project's page
    // (see Programs' project detail page) — keep the project's own
    // `bottlenecks` list in sync so the new record shows up there immediately.
    const project = projects.find((entry) => entry.id === record.linkedRecord)
    project?.bottlenecks.unshift(record.id)

    recordAuditEvent({
      action: 'Raised bottleneck',
      module: 'Bottlenecks & Exceptions',
      recordId: record.id,
      newValue: record.issue,
      reference: record.linkedRecord || null,
    })

    return HttpResponse.json({
      record,
      message: `${record.id} has been added to the bottleneck register.`,
    })
  }),

  /**
   * PATCH /api/bottlenecks/:id
   *
   * Updates a bottleneck's current status (and optionally its follow-up
   * note) — the only way to change a bottleneck's status once raised; there
   * was previously no update path at all. When the status actually changes,
   * appends a new `statusHistory` entry rather than silently overwriting —
   * that history is what the register's "History" popover reads.
   */
  http.patch('/api/bottlenecks/:id', async ({ request, params }) => {
    await delay(300)

    const record = bottlenecksRegister.find((entry) => entry.id === String(params.id))
    if (!record) {
      return HttpResponse.json({ message: 'The bottleneck was not found.' }, { status: 404 })
    }

    const body = (await request.json()) as { status?: string; followUp?: string }
    if (!body.status) {
      return HttpResponse.json({ message: 'A status is required.' }, { status: 422 })
    }

    const previousStatus = record.status
    record.status = body.status as BottleneckRecord['status']
    if (body.followUp !== undefined) record.followUp = body.followUp.trim()

    if (record.status !== previousStatus) {
      const period = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      record.statusHistory = [...record.statusHistory, { period, status: record.status }]

      recordAuditEvent({
        action: 'Updated bottleneck status',
        module: 'Bottlenecks & Exceptions',
        recordId: record.id,
        priorValue: previousStatus,
        newValue: record.status,
        reference: record.linkedRecord || null,
      })
    }

    return HttpResponse.json({ record })
  }),

  /**
   * GET /api/bottlenecks/by-project/:projectId
   *
   * The bottlenecks linked to one project, for Programs' project detail
   * page. Filtered by the project's own `bottlenecks` id list rather than by
   * matching free-text, since that list is the real foreign key.
   */
  http.get('/api/bottlenecks/by-project/:projectId', async ({ request, params }) => {
    await delay(200)

    const project = projects.find((entry) => entry.id === String(params.projectId))
    if (!project) {
      return HttpResponse.json({ message: 'The project was not found.' }, { status: 404 })
    }

    const linked = bottlenecksRegister.filter((row) => project.bottlenecks.includes(row.id))

    const url = new URL(request.url)
    const page = positiveInteger(url.searchParams.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(url.searchParams.get('pageSize'), 10))

    return HttpResponse.json(paginate(linked, page, pageSize))
  }),
]
