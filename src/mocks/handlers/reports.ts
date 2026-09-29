import { delay, http, HttpResponse } from '../local-router'
import { reportConfigSchema } from '@/api/schemas/reports'
import type { ReportPreview } from '@/api/schemas/reports'
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

const savedSnapshots = new Map<string, { preview: ReportPreview; orientation: 'portrait' | 'landscape'; compactLayout: boolean }>()

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

    const body = await request.json() as Record<string, unknown>
    const result = reportConfigSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid report configuration.' }, { status: 400 })
    }

    const excluded = Array.isArray(body.excludedSections)
      ? body.excludedSections.filter((title): title is string => typeof title === 'string')
      : []
    const fullPreview = buildReportPreview(result.data)
    const preview = {
      ...fullPreview,
      sections: fullPreview.sections.filter((section) => !excluded.includes(section.title)),
    }
    const savedReport = createSavedReport(result.data)
    savedSnapshots.set(savedReport.id, {
      preview,
      orientation: body.orientation === 'landscape' ? 'landscape' : 'portrait',
      compactLayout: body.compactLayout === true,
    })

    return HttpResponse.json({ preview, savedReport })
  }),

  http.get('/api/reports/saved/:id/preview', ({ params }) => {
    const id = String(params.id)
    const saved = savedReports.find((report) => report.id === id)
    if (!saved) return HttpResponse.json({ message: 'Saved report not found.' }, { status: 404 })
    return HttpResponse.json(savedSnapshots.get(id) ?? {
      preview: buildReportPreview(saved.config), orientation: 'portrait',
    })
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
    savedSnapshots.delete(String(params.id))
    if (!removed) {
      return HttpResponse.json({ message: `No saved report found with id ${String(params.id)}` }, { status: 404 })
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
