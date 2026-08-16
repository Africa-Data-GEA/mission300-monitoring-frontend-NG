import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  generateReportResponseSchema,
  reportPreviewSchema,
  reportsFilterOptionsSchema,
  reportsOverviewSchema,
  type GenerateReportResponse,
  type ReportConfig,
  type ReportPreview,
  type ReportsQuery,
} from '@/api/schemas/reports'
import { api } from '@/lib/api-client'

export const reportsKeys = {
  all: ['reports'] as const,
  filters: () => [...reportsKeys.all, 'filters'] as const,
  overview: (query: ReportsQuery) => [...reportsKeys.all, 'overview', query] as const,
  preview: (config: ReportConfig) => [...reportsKeys.all, 'preview', config] as const,
}

function toSearchParams(query: ReportsQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

export function useReportsFilters() {
  return useQuery({
    queryKey: reportsKeys.filters(),
    queryFn: () => api.get('/reports/filters', reportsFilterOptionsSchema),
    staleTime: Infinity,
  })
}

export function useReportsOverview(query: ReportsQuery = {}) {
  return useQuery({
    queryKey: reportsKeys.overview(query),
    queryFn: () => api.get(`/reports${toSearchParams(query)}`, reportsOverviewSchema),
    placeholderData: keepPreviousData,
  })
}

/**
 * Live preview for the current Generate Report configuration.
 *
 * A query rather than a mutation even though the endpoint is a POST — the
 * request body is just the current filter selection and the call is a pure
 * read, so keying it by config gets automatic refetch-on-change and
 * `keepPreviousData` for free instead of hand-rolling that with a mutation.
 */
export function useReportPreview(config: ReportConfig, enabled: boolean) {
  return useQuery({
    queryKey: reportsKeys.preview(config),
    queryFn: () => api.post('/reports/preview', config, reportPreviewSchema),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ReportConfig) =>
      api.post<GenerateReportResponse>('/reports/generate', config, generateReportResponseSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportsKeys.all })
    },
  })
}

/**
 * One-off preview fetch for imperative flows (re-downloading an existing
 * saved report, exporting a compact-export card) — these should not create a
 * new preview cache entry or a new saved-report history row the way
 * `useGenerateReport` does.
 */
export function previewReport(config: ReportConfig): Promise<ReportPreview> {
  return api.post('/reports/preview', config, reportPreviewSchema)
}

/** Every tracked KPI's methodology, independent of the report builder's
 * current configuration — see buildMethodologyReport in mocks/data/reports.ts. */
export function fetchMethodologyReport(): Promise<ReportPreview> {
  return api.get('/reports/methodology', reportPreviewSchema)
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/reports/saved/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportsKeys.all })
    },
  })
}
