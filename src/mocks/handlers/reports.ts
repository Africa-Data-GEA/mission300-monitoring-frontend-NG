import { delay, http, HttpResponse } from '../local-router'
import { reportConfigSchema } from '@/api/schemas/reports'
import {
  buildMethodologyReport,
  buildReportPreview,
  compactExportCards,
  createSavedReport,
  removeSavedReport,
  reportCatalogue,
  reportsFilterOptions,
  savedReports,
} from '../data/reports'

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

export const reportsHandlers = [
  /** GET /api/reports/filters */
  http.get('/api/reports/filters', () => HttpResponse.json(reportsFilterOptions)),

  /**
   * GET /api/reports
   *
   * Query (all optional): search, category, page, pageSize — applied to the
   * Saved reports list (Section C). The catalogue (Section A) and CPR/Compact
   * export cards (Section D) are not filtered by this query — they describe
   * the fixed set of report types available, not the filtered results of one.
   */
  http.get('/api/reports', async ({ request }) => {
    await delay(250)

    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const category = params.get('category') ?? 'all'
    const page = positiveInteger(params.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 10))

    const filtered = savedReports.filter((report) => {
      const matchesSearch =
        !search ||
        [report.title, report.owner, report.fileReference].some((field) =>
          field.toLowerCase().includes(search),
        )
      const matchesCategory = category === 'all' || report.category === category
      return matchesSearch && matchesCategory
    })

    return HttpResponse.json({
      lastUpdated: new Date().toISOString(),
      catalogue: reportCatalogue,
      compactExports: compactExportCards,
      savedReports: paginate(filtered, page, pageSize),
    })
  }),

  /** POST /api/reports/preview — body: ReportConfig. Previews without saving. */
  http.post('/api/reports/preview', async ({ request }) => {
    await delay(300)

    const result = reportConfigSchema.safeParse(await request.json())
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid report configuration.' }, { status: 400 })
    }

    return HttpResponse.json(buildReportPreview(result.data))
  }),

  /**
   * POST /api/reports/generate — body: ReportConfig.
   *
   * Generates the preview and records it in Saved Reports (Section C), per
   * the spec's "Generate Report" action. The actual PDF/Excel file is
   * produced client-side from the returned preview, not by this endpoint.
   */
  http.post('/api/reports/generate', async ({ request }) => {
    await delay(400)

    const result = reportConfigSchema.safeParse(await request.json())
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid report configuration.' }, { status: 400 })
    }

    const preview = buildReportPreview(result.data)
    const savedReport = createSavedReport(result.data)

    return HttpResponse.json({ preview, savedReport })
  }),

  /** GET /api/reports/methodology — every tracked KPI's definition and
   * calculation methodology, independent of any report configuration. */
  http.get('/api/reports/methodology', async () => {
    await delay(300)
    return HttpResponse.json(buildMethodologyReport())
  }),

  /** DELETE /api/reports/saved/:id */
  http.delete('/api/reports/saved/:id', async ({ params }) => {
    await delay(200)

    const removed = removeSavedReport(String(params.id))
    if (!removed) {
      return HttpResponse.json({ message: `No saved report found with id ${String(params.id)}` }, { status: 404 })
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
