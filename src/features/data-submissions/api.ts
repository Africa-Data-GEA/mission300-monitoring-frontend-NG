import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkValidationDecisionResponseSchema,
  dataGapListSchema,
  datasetListSchema,
  dataSubmissionFiltersSchema,
  draftSavedSchema,
  entryDraftSavedSchema,
  entryDraftSchema,
  manualEntryDefinitionSchema,
  obligationListSchema,
  overdueListSchema,
  submissionDetailSchema,
  submissionListSchema,
  uploadDefinitionSchema,
  validationDecisionResponseSchema,
  validationQueueSchema,
  type BulkValidationDecisionRequest,
  type DataSubmissionQuery,
  type ManualEntryRequest,
  type ValidationDecisionRequest,
} from '@/api/schemas/data-submissions'
import { api } from '@/lib/api-client'

function withObligationContext(value: unknown, obligationId: string, kind: 'entry' | 'upload') {
  if (!value || typeof value !== 'object') return value

  const definition = value as Record<string, unknown>
  if (kind === 'upload') return { obligationId, ...definition }

  const sections = Array.isArray(definition.sections)
    ? definition.sections.map((section, sectionIndex) => {
        if (!section || typeof section !== 'object') return section
        const current = section as Record<string, unknown>
        const fields = Array.isArray(current.fields)
          ? current.fields.map((field) => {
              if (!field || typeof field !== 'object') return field
              const currentField = field as Record<string, unknown>
              return {
                ...currentField,
                helpText: currentField.helpText ?? '',
                options: currentField.options ?? [],
              }
            })
          : current.fields

        return {
          id: current.id ?? `section-${sectionIndex + 1}`,
          description: current.description ?? '',
          ...current,
          fields,
        }
      })
    : definition.sections

  return { obligationId, ...definition, sections }
}

export const submissionKeys = {
  all: ['data-submissions'] as const,
  filters: () => ['data-submissions', 'filters'] as const,
  list: (name: string, query: DataSubmissionQuery) =>
    ['data-submissions', name, query] as const,
  entry: (id: string) => ['data-submissions', 'entry', id] as const,
  draft: (id: string) => ['data-submissions', 'draft', id] as const,
  upload: (id: string) => ['data-submissions', 'upload', id] as const,
  review: (id: string) => ['data-submissions', 'review', id] as const,
}

function queryString(query: DataSubmissionQuery) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params.set(key, String(value))
    }
  })
  const value = params.toString()
  return value ? `?${value}` : ''
}

function useWorkflowList<T>(
  name: string,
  path: string,
  query: DataSubmissionQuery,
  schema: Parameters<typeof api.get<T>>[1],
) {
  return useQuery({
    queryKey: submissionKeys.list(name, query),
    queryFn: () => api.get(`${path}${queryString(query)}`, schema),
    placeholderData: keepPreviousData,
  })
}

export function useSubmissionFilters() {
  return useQuery({
    queryKey: submissionKeys.filters(),
    queryFn: () => api.get('/data-submissions/filters', dataSubmissionFiltersSchema),
    staleTime: Infinity,
  })
}

/** The real Dataset records behind every obligation's `datasetId` — purpose,
 * required data points, owner institution and each dataset's own template. */
export function useDatasets() {
  return useQuery({
    queryKey: [...submissionKeys.all, 'datasets'],
    queryFn: () => api.get('/data-submissions/datasets', datasetListSchema),
    staleTime: Infinity,
  })
}

export const useObligations = (query: DataSubmissionQuery) =>
  useWorkflowList('obligations', '/data-submissions/obligations', query, obligationListSchema)

export const useSubmissions = (query: DataSubmissionQuery) =>
  useWorkflowList('submissions', '/data-submissions/submissions', query, submissionListSchema)

export const useValidationQueue = (query: DataSubmissionQuery) =>
  useWorkflowList('validation', '/data-submissions/validation', query, validationQueueSchema)

export const useOverdueSubmissions = (query: DataSubmissionQuery) =>
  useWorkflowList('overdue', '/data-submissions/overdue', query, overdueListSchema)

export const useDataGaps = (query: DataSubmissionQuery) =>
  useWorkflowList('gaps', '/data-submissions/gaps', query, dataGapListSchema)

export function useManualEntryDefinition(id: string) {
  return useQuery({
    queryKey: submissionKeys.entry(id),
    queryFn: async () => {
      const response = await api.get<unknown>(`/data-submissions/obligations/${id}/entry`)
      return manualEntryDefinitionSchema.parse(withObligationContext(response, id, 'entry'))
    },
    enabled: Boolean(id),
  })
}

export function useEntryDraft(id: string) {
  return useQuery({
    queryKey: submissionKeys.draft(id),
    queryFn: () => api.get(`/data-submissions/obligations/${id}/entry/draft`, entryDraftSchema),
    enabled: Boolean(id),
    staleTime: Infinity,
    gcTime: 0,
  })
}

export function useSaveEntryDraft(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ManualEntryRequest) =>
      api.put(`/data-submissions/obligations/${id}/entry/draft`, input, entryDraftSavedSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: submissionKeys.draft(id) }),
  })
}

export function useDiscardEntryDraft(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/data-submissions/obligations/${id}/entry/draft`),
    onSuccess: () => client.invalidateQueries({ queryKey: submissionKeys.draft(id) }),
  })
}

export function useUploadDefinition(id: string) {
  return useQuery({
    queryKey: submissionKeys.upload(id),
    queryFn: async () => {
      const response = await api.get<unknown>(`/data-submissions/obligations/${id}/upload`)
      return uploadDefinitionSchema.parse(withObligationContext(response, id, 'upload'))
    },
    enabled: Boolean(id),
  })
}

export function useSaveManualEntry(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ManualEntryRequest) =>
      api.post(`/data-submissions/obligations/${id}/entry`, input, draftSavedSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: submissionKeys.all }),
  })
}

export function useUploadSubmission(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post(`/data-submissions/obligations/${id}/upload`, formData, draftSavedSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: submissionKeys.all }),
  })
}

export function useSubmissionReview(id: string) {
  return useQuery({
    queryKey: submissionKeys.review(id),
    queryFn: () => api.get(`/data-submissions/validation/${id}`, submissionDetailSchema),
    enabled: Boolean(id),
  })
}

export function useValidationDecision(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ValidationDecisionRequest) =>
      api.post(`/data-submissions/validation/${id}/decisions`, input, validationDecisionResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: submissionKeys.all }),
  })
}

export function useBulkValidationDecision() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: BulkValidationDecisionRequest) =>
      api.post('/data-submissions/validation/bulk-decisions', input, bulkValidationDecisionResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: submissionKeys.all }),
  })
}
