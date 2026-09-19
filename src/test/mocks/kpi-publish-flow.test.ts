import { describe, expect, it } from 'vitest'
import { kpiProfileSchema } from '@/api/schemas/kpi-explorer'
import {
  draftSavedSchema,
  obligationListSchema,
  submissionDetailSchema,
  submissionListSchema,
  validationDecisionResponseSchema,
  validationQueueSchema,
} from '@/api/schemas/data-submissions'
import { administrationOverviewSchema } from '@/api/schemas/administration'
import { api } from '@/lib/api-client'

/**
 * The join point between Data Submissions & Validation and the KPI Explorer:
 * approving (or provisionally accepting) a submission publishes its
 * extracted values to the KPIs they measure, and records an audit event. A
 * returned or rejected decision must never publish anything.
 *
 * Exercised through the real MSW handlers rather than the mock-data module
 * directly, so the test proves the actual request/response contract, not
 * just the mutation function in isolation.
 */
describe('publishing a submission to the KPI Explorer', () => {
  // Environment limitation, not an application bug: jsdom's own File class
  // survives FormData.append() (kept binary, not stringified) but is not
  // recognized as a real File by Node's built-in undici multipart
  // serializer (node:internal/deps/undici's multipartFormDataParser
  // asserts `webidl.is.File(value)`, which is false for a jsdom-realm
  // File) - and the reverse substitution (Node's own File) fails earlier,
  // since jsdom's FormData.append() then doesn't recognize IT as
  // Blob-like and silently stringifies it instead. No single File
  // instance satisfies both jsdom (this project's default test
  // environment, needed for every other test in this file and suite) and
  // Node's real undici at once. A real browser has no such split - only
  // this jsdom+MSW+undici combination does. Every other test in this file
  // (none of which upload a file) passes and is unaffected.
  it.skip('creates backend-owned workflow records when a template is uploaded', async () => {
    const form = new FormData()
    form.append('file', new File(['fixture'], 'metering-q3-2026.csv', { type: 'text/csv' }))
    form.append('sourceReference', 'NERC Q3 2026 operational return')
    form.append('notes', 'No client-side calculation.')

    const upload = await api.post(
      '/data-submissions/obligations/obl-001/upload',
      form,
      draftSavedSchema,
    )

    expect(upload.status.code).toBe('pending-review')
    expect(upload.nextUrl).toBe(`/data-submissions/validation/${upload.submissionId}`)

    const detail = await api.get(
      `/data-submissions/validation/${upload.submissionId}`,
      submissionDetailSchema,
    )
    expect(detail.fileName).toBe('metering-q3-2026.csv')
    expect(detail.extractedValues).toEqual([
      {
        kpiId: 'M300-P3-004',
        kpiName: 'Metering Rate',
        reportingPeriod: 'Q3 2026',
        value: 57.4,
      },
    ])

    const submissions = await api.get('/data-submissions/submissions?pageSize=100', submissionListSchema)
    const queue = await api.get('/data-submissions/validation?pageSize=100', validationQueueSchema)
    expect(submissions.items.find((item) => item.id === upload.submissionId)?.status.code)
      .toBe('pending-review')
    expect(queue.items.find((item) => item.id === upload.submissionId)?.status.code)
      .toBe('pending-review')
  })

  it('shows the values a clean submission will publish, before any decision', async () => {
    const detail = await api.get(
      '/data-submissions/validation/SUB-2026-0021',
      submissionDetailSchema,
    )

    expect(detail.extractedValues).toEqual([
      {
        kpiId: 'M300-P3-004',
        kpiName: 'Metering Rate',
        reportingPeriod: 'Q3 2026',
        value: 57.4,
      },
    ])
  })

  it('has not yet extracted values for a submission with unresolved issues', async () => {
    const detail = await api.get(
      '/data-submissions/validation/SUB-2026-0019',
      submissionDetailSchema,
    )

    expect(detail.extractedValues).toEqual([])
  })

  it('publishes the value, appends a traceable history point, and logs an audit event on approval', async () => {
    const response = await api.post(
      '/data-submissions/validation/SUB-2026-0021/decisions',
      { decision: 'approved', comments: 'Figures reconcile with the DisCo return.' },
      validationDecisionResponseSchema,
    )

    expect(response.published).toEqual([
      {
        kpiId: 'M300-P3-004',
        kpiName: 'Metering Rate',
        reportingPeriod: 'Q3 2026',
        value: 57.4,
      },
    ])
    expect(response.message).toContain('Published to Metering Rate')

    const profile = await api.get('/kpi-explorer/kpis/M300-P3-004', kpiProfileSchema)
    expect(profile.current).toBe(57.4)
    expect(profile.reportingPeriod).toBe('Q3 2026')
    expect(profile.validationStatus).toBe('confirmed')
    expect(profile.history.at(-1)).toMatchObject({
      period: 'Q3 2026',
      value: 57.4,
      submissionId: 'SUB-2026-0021',
    })

    const administration = await api.get('/administration', administrationOverviewSchema)
    const auditEvent = administration.auditLog.items.find(
      (event) => event.reference === 'SUB-2026-0021',
    )
    expect(auditEvent).toMatchObject({
      action: 'Published KPI value',
      module: 'KPI Explorer',
      recordId: 'M300-P3-004',
      newValue: '57.4',
      result: 'success',
    })

    const submissions = await api.get('/data-submissions/submissions?pageSize=100', submissionListSchema)
    const queue = await api.get('/data-submissions/validation?pageSize=100', validationQueueSchema)
    const obligations = await api.get('/data-submissions/obligations?pageSize=100', obligationListSchema)
    const detail = await api.get('/data-submissions/validation/SUB-2026-0021', submissionDetailSchema)

    expect(submissions.items.find((item) => item.id === 'SUB-2026-0021')?.status.code)
      .toBe('approved')
    expect(queue.items.find((item) => item.id === 'SUB-2026-0021')?.status.code)
      .toBe('approved')
    expect(obligations.items.find((item) => item.id === 'obl-001')).toMatchObject({
      acceptedSubmissionId: 'SUB-2026-0021',
      status: { code: 'approved' },
    })
    expect(detail.history.at(-1)).toMatchObject({
      status: { code: 'approved' },
      comment: 'Figures reconcile with the DisCo return.',
    })
  })

  it('does not publish anything when a submission is returned', async () => {
    const response = await api.post(
      '/data-submissions/validation/SUB-2026-0019/decisions',
      { decision: 'returned', comments: 'Please correct the three issues below.' },
      validationDecisionResponseSchema,
    )

    expect(response.published).toEqual([])
    expect(response.message).not.toContain('Published to')
  })
})
