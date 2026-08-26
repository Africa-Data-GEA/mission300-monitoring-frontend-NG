import { delay, http, HttpResponse } from '../local-router'
import {
  dataGaps,
  dataSubmissionFilters,
  datasets,
  manualEntryDefinitions,
  overdueItems,
  statuses,
  submissionDetails,
  submissionObligations,
  submissionRecords,
  uploadDefinitions,
  validationQueue,
} from '../data/data-submissions'
import { administrationUsers } from '../data/administration'
import { recordAuditEvent } from '../data/audit-log'
import { getKpiProfile, publishKpiValue } from '../data/kpi-explorer'
import { getLiveBackendUrl, proxyToLiveBackend } from '../live-backend'
import type {
  KpiExtraction,
  Obligation,
  SubmissionDetail,
  SubmissionListItem,
  ValidationQueueItem,
  WorkflowStatus,
} from '@/api/schemas/data-submissions'

function pageNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

/** Statuses that mean the obligation is finished and no longer in the queue. */
const SETTLED_STATUS_CODES = new Set(['accepted', 'approved', 'provisional'])

/**
 * Aggregate indicators for the obligations table (see obligationStatsSchema).
 *
 * Days overdue is read from the record's own `dueLabel` ("8 days overdue")
 * rather than computed against the wall clock: these fixtures carry fixed due
 * dates with hand-written labels, so a clock-based figure would drift away
 * from the label shown in the very same row.
 */
function buildObligationStats(rows: Obligation[]) {
  const counts = new Map<string, { code: string; label: string; tone: string; count: number }>()
  for (const row of rows) {
    const entry = counts.get(row.status.code)
    if (entry) entry.count += 1
    else counts.set(row.status.code, { ...row.status, count: 1 })
  }

  const overdueDays = rows
    .map((row) => /^(\d+)\s+days?\s+overdue/i.exec(row.dueLabel)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number)

  return {
    total: rows.length,
    byStatus: [...counts.values()].sort((a, b) => b.count - a.count),
    overdueCount: rows.filter((row) => row.status.code === 'overdue').length,
    averageDaysOverdue: overdueDays.length
      ? Math.round((overdueDays.reduce((sum, days) => sum + days, 0) / overdueDays.length) * 10) / 10
      : null,
    openCount: rows.filter((row) => !SETTLED_STATUS_CODES.has(row.status.code)).length,
  }
}

function paginate<T>(items: T[], url: URL) {
  const pageSize = Math.min(100, pageNumber(url.searchParams.get('pageSize'), 10))
  const requestedPage = pageNumber(url.searchParams.get('page'), 1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requestedPage, pageCount)
  const offset = (page - 1) * pageSize
  return { items: items.slice(offset, offset + pageSize), page, pageSize, total: items.length }
}

function filterRows<T extends {
  institution: string
  dataset?: string
  reportingPeriod: string
  status: WorkflowStatus | null
}>(rows: T[], url: URL) {
  const search = (url.searchParams.get('search') ?? '').toLowerCase()
  const institution = url.searchParams.get('institution')
  const dataset = url.searchParams.get('dataset')
  const period = url.searchParams.get('reportingPeriod')
  const status = url.searchParams.get('submissionStatus')

  return rows.filter((row) => {
    const searchable = `${row.institution} ${row.dataset ?? ''} ${row.reportingPeriod}`.toLowerCase()
    return (!search || searchable.includes(search)) &&
      (!institution || searchable.includes(institution.replaceAll('-', ' '))) &&
      (!dataset || row.dataset?.toLowerCase().includes(dataset.replaceAll('-', ' '))) &&
      (!period || row.reportingPeriod.toLowerCase().replaceAll(' ', '-') === period) &&
      (!status || row.status?.code === status)
  })
}

function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 })
}

const decisionStatuses = {
  approved: statuses.approved,
  provisional: statuses.provisional,
  returned: statuses.returned,
  rejected: statuses.rejected,
}

/**
 * Backend-response fixtures, not calculations performed by the frontend.
 * They let the UI exercise the upload -> validation -> approval contract
 * until the real ingestion service returns its own extracted values.
 */
const mockBackendExtractionsByObligation: Record<string, KpiExtraction[]> = {
  'obl-001': [
    {
      kpiId: 'M300-P3-004',
      kpiName: 'Metering Rate',
      reportingPeriod: 'Q3 2026',
      value: 57.4,
    },
  ],
}

let nextSubmissionNumber = 23

function createMockBackendSubmission(
  obligationId: string,
  file: File,
  sourceReference: string,
  notes: string,
) {
  const obligation = submissionObligations.find((item) => item.id === obligationId)
  if (!obligation) return undefined

  const submissionId = `SUB-2026-${String(nextSubmissionNumber).padStart(4, '0')}`
  nextSubmissionNumber += 1
  const submittedAt = new Date().toISOString()
  const submittedBy = 'Ngozi Okafor'
  const reviewer = 'Grace Etim'

  const record: SubmissionListItem = {
    id: submissionId,
    institution: obligation.institution,
    dataset: obligation.dataset,
    reportingPeriod: obligation.reportingPeriod,
    method: 'template-upload',
    methodLabel: 'Template upload',
    version: 1,
    submittedBy,
    submittedAt,
    submittedAtLabel: 'Just now',
    status: statuses.pending,
    validationSummary: 'Backend validation passed',
    availableActions: ['view'],
  }

  const queueItem: ValidationQueueItem = {
    ...record,
    reviewer,
    ageLabel: 'Awaiting review',
    automatedCheck: statuses.approved,
    issueCount: 0,
    availableActions: ['review'],
  }

  const detail: SubmissionDetail = {
    ...queueItem,
    fileName: file.name,
    sourceReference,
    notes,
    issues: [],
    history: [
      {
        id: `hist-${submissionId}-upload`,
        status: statuses.pending,
        actor: submittedBy,
        occurredAt: submittedAt,
        occurredAtLabel: 'Just now',
        comment: 'Template uploaded and backend validation completed.',
      },
    ],
    permittedDecisions: ['approved', 'provisional', 'returned', 'rejected'],
    extractedValues: (mockBackendExtractionsByObligation[obligationId] ?? []).map(
      (extraction) => ({ ...extraction }),
    ),
  }

  submissionRecords.unshift(record)
  validationQueue.unshift(queueItem)
  submissionDetails[submissionId] = detail
  obligation.status = statuses.pending
  obligation.availableActions = ['view']

  return detail
}

function synchronizeSubmissionDecision(
  detail: SubmissionDetail,
  status: WorkflowStatus,
  decision: keyof typeof decisionStatuses,
  comments: string,
) {
  const record = submissionRecords.find((item) => item.id === detail.id)
  if (record) {
    record.status = status
    record.validationSummary = `Decision recorded: ${status.label}`
    record.availableActions = decision === 'returned' ? ['correct', 'view'] : ['view']
  }

  const queueItem = validationQueue.find((item) => item.id === detail.id)
  if (queueItem) {
    queueItem.status = status
    queueItem.ageLabel = 'Decision recorded just now'
    queueItem.availableActions = decision === 'returned' ? ['review'] : ['view']
  }

  const obligation = submissionObligations.find(
    (item) =>
      item.institution === detail.institution &&
      item.dataset === detail.dataset &&
      item.reportingPeriod === detail.reportingPeriod,
  )
  if (obligation) {
    obligation.status = status
    obligation.acceptedSubmissionId =
      decision === 'approved' || decision === 'provisional' ? detail.id : null
    obligation.availableActions =
      decision === 'returned' ? ['upload-template', 'download-template'] : ['view']
  }

  const occurredAt = new Date().toISOString()
  detail.status = status
  detail.ageLabel = 'Decision recorded just now'
  detail.history = [
    ...detail.history,
    {
      id: `hist-${detail.id}-${detail.history.length + 1}`,
      status,
      actor: detail.reviewer,
      occurredAt,
      occurredAtLabel: 'Just now',
      comment: comments,
    },
  ]
}

/**
 * A submission has already had its values extracted at this point — see
 * `extractedValues` on submissionDetails. `getKpiProfile` is called BEFORE
 * `publishKpiValue` mutates anything, so the audit event carries the true
 * prior value rather than a value this same call already overwrote.
 *
 * Only approved and provisional decisions publish; returned and rejected
 * never do, since neither is an accepted value.
 *
 * The audit event is attributed to the submission's assigned reviewer — the
 * person recording the decision — resolved to a real Administration account
 * so the event shows up for that user like any other audited action, rather
 * than to an invented "system" identity no account matches.
 */
function publishExtractedValues(
  submissionId: string,
  extractedValues: KpiExtraction[],
  decision: 'approved' | 'provisional',
  reviewerName: string,
): KpiExtraction[] {
  const resultingStatus = decision === 'approved' ? 'confirmed' : 'provisional'
  const reviewer = administrationUsers.find((user) => user.name === reviewerName)
  const published: KpiExtraction[] = []

  for (const extraction of extractedValues) {
    const priorValue = getKpiProfile(extraction.kpiId)?.currentLabel ?? null
    const applied = publishKpiValue(extraction, submissionId, resultingStatus)
    if (!applied) continue

    published.push(extraction)
    recordAuditEvent({
      userId: reviewer?.id,
      userName: reviewer?.name ?? reviewerName,
      action: 'Published KPI value',
      module: 'KPI Explorer',
      recordId: extraction.kpiId,
      priorValue,
      newValue: String(extraction.value),
      reference: submissionId,
    })
  }

  return published
}

/**
 * Data Submissions is proxied to the real m300-demo-backend as one whole
 * module, not spliced obligation-by-obligation: the mock's demo dataset and
 * the backend's one real obligation (Metering Rate) are different records
 * with different ids, so mixing them would produce mismatched pagination
 * totals and duplicate-looking rows. Opt in with VITE_SUBMISSIONS_BACKEND_URL;
 * every other module is unaffected.
 */
export const dataSubmissionHandlers = [
  http.get('/api/data-submissions/filters', ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    return HttpResponse.json(dataSubmissionFilters)
  }),
  /** GET /api/data-submissions/datasets — the real Dataset records behind
   * every obligation's `datasetId` (purpose, required data points, owner
   * institution, its own submission template). */
  http.get('/api/data-submissions/datasets', () => HttpResponse.json(datasets)),
  http.get('/api/data-submissions/obligations', async ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(100)
    const url = new URL(request.url)
    const matched = filterRows(submissionObligations, url)
    // Stats describe the filtered set, not the page — see obligationStatsSchema.
    return HttpResponse.json({ ...paginate(matched, url), stats: buildObligationStats(matched) })
  }),
  http.get('/api/data-submissions/submissions', async ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(submissionRecords, url), url))
  }),
  http.get('/api/data-submissions/obligations/:id/entry', ({ request, params }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    const definition = manualEntryDefinitions[String(params.id)]
    return definition
      ? HttpResponse.json(definition)
      : notFound('Manual entry is not configured for this reporting obligation.')
  }),
  http.post('/api/data-submissions/obligations/:id/entry', async ({ request, params }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(250)
    const obligation = submissionObligations.find((item) => item.id === params.id)
    if (!obligation) {
      return notFound('The reporting obligation was not found.')
    }
    recordAuditEvent({
      action: 'Saved manual-entry draft',
      module: 'Data Submissions & Validation',
      recordId: 'SUB-2026-0022',
      newValue: `${obligation.dataset} (${obligation.reportingPeriod})`,
      reference: obligation.id,
    })
    return HttpResponse.json({
      submissionId: 'SUB-2026-0022', version: 1, status: statuses.draft,
      message: 'Draft saved. Server validation is ready to run.',
      nextUrl: '/data-submissions/submissions',
    }, { status: 201 })
  }),
  http.get('/api/data-submissions/obligations/:id/upload', ({ request, params }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    const definition = uploadDefinitions[String(params.id)]
    return definition
      ? HttpResponse.json(definition)
      : notFound('Template upload is not configured for this reporting obligation.')
  }),
  http.post('/api/data-submissions/obligations/:id/upload', async ({ request, params }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(350)
    const obligationId = String(params.id)
    if (!submissionObligations.some((item) => item.id === obligationId)) {
      return notFound('The reporting obligation was not found.')
    }
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'Select a completed template to upload.' }, { status: 400 })
    }
    const sourceReference = String(form.get('sourceReference') ?? '').trim()
    if (!sourceReference) {
      return HttpResponse.json({ message: 'Provide the source reference for this submission.' }, { status: 400 })
    }
    const detail = createMockBackendSubmission(
      obligationId,
      file,
      sourceReference,
      String(form.get('notes') ?? ''),
    )
    if (!detail) return notFound('The reporting obligation was not found.')

    recordAuditEvent({
      action: 'Uploaded submission',
      module: 'Data Submissions & Validation',
      recordId: detail.id,
      newValue: file.name,
      reference: sourceReference,
    })

    return HttpResponse.json({
      submissionId: detail.id, version: detail.version, status: detail.status,
      message: 'Upload received. Backend validation passed and the submission is ready for review.',
      nextUrl: `/data-submissions/validation/${detail.id}`,
    }, { status: 201 })
  }),
  http.get('/api/data-submissions/validation', async ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(validationQueue, url), url))
  }),
  http.get('/api/data-submissions/validation/:id', ({ request, params }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    const detail = submissionDetails[String(params.id)]
    return detail ? HttpResponse.json(detail) : notFound('The submission was not found.')
  }),
  http.post('/api/data-submissions/validation/:id/decisions', async ({ request, params }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(200)
    const detail = submissionDetails[String(params.id)]
    if (!detail) return notFound('The submission was not found.')
    const body = await request.json() as {
      decision?: keyof typeof decisionStatuses
      comments?: string
    }
    const status = body.decision ? decisionStatuses[body.decision] : undefined
    if (!status) {
      return HttpResponse.json({ message: 'Select a supported validation decision.' }, { status: 400 })
    }
    const comments = body.comments?.trim() ?? ''
    if (comments.length < 3) {
      return HttpResponse.json({ message: 'Provide review comments with the decision.' }, { status: 400 })
    }
    synchronizeSubmissionDecision(detail, status, body.decision!, comments)

    const published =
      body.decision === 'approved' || body.decision === 'provisional'
        ? publishExtractedValues(
            detail.id,
            detail.extractedValues,
            body.decision,
            detail.reviewer,
          )
        : []

    // publishExtractedValues already logs one event per published KPI value;
    // a returned/rejected decision publishes nothing, so it would otherwise
    // leave no audit trail at all — this covers every decision outcome.
    if (published.length === 0) {
      const reviewer = administrationUsers.find((user) => user.name === detail.reviewer)
      recordAuditEvent({
        userId: reviewer?.id,
        userName: reviewer?.name ?? detail.reviewer,
        action: `Recorded validation decision: ${status.label}`,
        module: 'Data Submissions & Validation',
        recordId: detail.id,
        result: body.decision === 'rejected' ? 'rejected' : 'success',
        reference: comments,
      })
    }

    const message =
      published.length > 0
        ? `Decision recorded: ${status.label}. Published to ${published.map((entry) => entry.kpiName).join(', ')}.`
        : `Decision recorded: ${status.label}.`

    return HttpResponse.json({
      submissionId: detail.id, status, message, published,
      nextUrl: '/data-submissions/validation',
    })
  }),
  http.get('/api/data-submissions/overdue', async ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(overdueItems, url), url))
  }),
  http.get('/api/data-submissions/gaps', async ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(dataGaps, url), url))
  }),
  /**
   * The real backend generates its templates fresh on every download (see
   * BACKEND-CONTRACT.md) and only serves them at this path — the mock never
   * had an equivalent route, since its own templates are static files under
   * /templates/*.csv, not an API endpoint. Only reachable in live mode.
   */
  http.get('/api/data-submissions/templates/:fileName', async ({ request }) => {
    const liveBackend = getLiveBackendUrl()
    if (liveBackend) return proxyToLiveBackend(request, liveBackend)
    return notFound('Templates are not served through this endpoint in mock mode.')
  }),
]
