import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteReformActionResponseSchema,
  reformActionDetailSchema,
  reformActionsOverviewSchema,
  saveReformActionResponseSchema,
  type ReformActionRequest,
} from '@/api/schemas/reform-actions'
import { api } from '@/lib/api-client'

export interface ReformActionsQuery {
  page: number
  pageSize?: number
  pillar: string
  priority: string
  status: string
  search: string
}

export const reformActionKeys = {
  all: ['reform-actions'] as const,
  overview: (query: ReformActionsQuery) => [...reformActionKeys.all, 'overview', query] as const,
  detail: (id: string) => [...reformActionKeys.all, 'detail', id] as const,
}

function toSearchParams(query: ReformActionsQuery) {
  const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize ?? 25) })
  if (query.pillar !== 'all') params.set('pillar', query.pillar)
  if (query.priority !== 'all') params.set('priority', query.priority)
  if (query.status !== 'all') params.set('status', query.status)
  if (query.search.trim()) params.set('search', query.search.trim())
  return params.toString()
}

export function useReformActions(query: ReformActionsQuery) {
  return useQuery({
    queryKey: reformActionKeys.overview(query),
    queryFn: () => api.get(`/reform-actions?${toSearchParams(query)}`, reformActionsOverviewSchema),
    placeholderData: keepPreviousData,
  })
}

export function useReformActionDetail(id: string | null) {
  return useQuery({
    queryKey: reformActionKeys.detail(id ?? ''),
    queryFn: () => api.get(`/reform-actions/${id}`, reformActionDetailSchema),
    enabled: Boolean(id),
    gcTime: 0,
  })
}

export function useCreateReformAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ReformActionRequest) => api.post('/reform-actions', input, saveReformActionResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: reformActionKeys.all }),
  })
}

export function useUpdateReformAction(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<ReformActionRequest>) =>
      api.patch(`/reform-actions/${id}`, input, saveReformActionResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: reformActionKeys.all }),
  })
}

export function useDeleteReformAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reform-actions/${id}`, deleteReformActionResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: reformActionKeys.all }),
  })
}
