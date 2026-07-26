import { delay, http, HttpResponse } from 'msw'
import {
  dataGaps,
  dataSubmissionFilters,
  manualEntryDefinitions,
  overdueItems,
  statuses,
  submissionDetails,
  submissionObligations,
  submissionRecords,
  uploadDefinitions,
  validationQueue,
} from '../data/data-submissions'
import type { WorkflowStatus } from '@/api/schemas/data-submissions'

function pageNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
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
  status: WorkflowStatus
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
      (!status || row.status.code === status)
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

export const dataSubmissionHandlers = [
  http.get('/api/data-submissions/filters', () =>
    HttpResponse.json(dataSubmissionFilters),
  ),
  http.get('/api/data-submissions/obligations', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(submissionObligations, url), url))
  }),
  http.get('/api/data-submissions/submissions', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(submissionRecords, url), url))
  }),
  http.get('/api/data-submissions/obligations/:id/entry', ({ params }) => {
    const definition = manualEntryDefinitions[String(params.id)]
    return definition
      ? HttpResponse.json(definition)
      : notFound('Manual entry is not configured for this reporting obligation.')
  }),
  http.post('/api/data-submissions/obligations/:id/entry', async ({ params }) => {
    await delay(250)
    if (!submissionObligations.some((item) => item.id === params.id)) {
      return notFound('The reporting obligation was not found.')
    }
    return HttpResponse.json({
      submissionId: 'SUB-2026-0022', version: 1, status: statuses.draft,
      message: 'Draft saved. Server validation is ready to run.',
      nextUrl: '/data-submissions/submissions',
    }, { status: 201 })
  }),
  http.get('/api/data-submissions/obligations/:id/upload', ({ params }) => {
    const definition = uploadDefinitions[String(params.id)]
    return definition
      ? HttpResponse.json(definition)
      : notFound('Template upload is not configured for this reporting obligation.')
  }),
  http.post('/api/data-submissions/obligations/:id/upload', async ({ request, params }) => {
    await delay(350)
    if (!submissionObligations.some((item) => item.id === params.id)) {
      return notFound('The reporting obligation was not found.')
    }
    const form = await request.formData()
    if (!(form.get('file') instanceof File)) {
      return HttpResponse.json({ message: 'Select a completed template to upload.' }, { status: 400 })
    }
    return HttpResponse.json({
      submissionId: 'SUB-2026-0023', version: 1, status: statuses.ready,
      message: 'Upload received and automated checks passed.',
      nextUrl: '/data-submissions/submissions',
    }, { status: 201 })
  }),
  http.get('/api/data-submissions/validation', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(validationQueue, url), url))
  }),
  http.get('/api/data-submissions/validation/:id', ({ params }) => {
    const detail = submissionDetails[String(params.id)]
    return detail ? HttpResponse.json(detail) : notFound('The submission was not found.')
  }),
  http.post('/api/data-submissions/validation/:id/decisions', async ({ request, params }) => {
    await delay(200)
    const detail = submissionDetails[String(params.id)]
    if (!detail) return notFound('The submission was not found.')
    const body = await request.json() as { decision?: keyof typeof decisionStatuses }
    const status = body.decision ? decisionStatuses[body.decision] : undefined
    if (!status) {
      return HttpResponse.json({ message: 'Select a supported validation decision.' }, { status: 400 })
    }
    detail.status = status
    return HttpResponse.json({
      submissionId: detail.id, status,
      message: `Decision recorded: ${status.label}.`,
      nextUrl: '/data-submissions/validation',
    })
  }),
  http.get('/api/data-submissions/overdue', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(overdueItems, url), url))
  }),
  http.get('/api/data-submissions/gaps', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    return HttpResponse.json(paginate(filterRows(dataGaps, url), url))
  }),
]
