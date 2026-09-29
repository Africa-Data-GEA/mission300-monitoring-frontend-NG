import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLearningLogEntryResponseSchema,
  deleteLearningLogEntryResponseSchema,
  learningLogOverviewSchema,
  updateLearningLogEntryResponseSchema,
  type CreateLearningLogEntryRequest,
  type UpdateLearningLogEntryRequest,
} from '@/api/schemas/learning-log'
import { api } from '@/lib/api-client'

export const learningLogKeys = {
  all: ['learning-log'] as const,
  overview: (page: number) => [...learningLogKeys.all, 'overview', page] as const,
}

export function useLearningLog(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: learningLogKeys.overview(page),
    queryFn: () =>
      api.get(`/learning-log?page=${page}&pageSize=${pageSize}`, learningLogOverviewSchema),
    placeholderData: keepPreviousData,
  })
}

export function useCreateLearningLogEntry() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLearningLogEntryRequest) =>
      api.post('/learning-log', input, createLearningLogEntryResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: learningLogKeys.all }),
  })
}

export function useUpdateLearningLogEntry() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLearningLogEntryRequest }) =>
      api.patch(`/learning-log/${id}`, input, updateLearningLogEntryResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: learningLogKeys.all }),
  })
}

export function useDeleteLearningLogEntry() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/learning-log/${id}`, deleteLearningLogEntryResponseSchema),
    onSuccess: () => client.invalidateQueries({ queryKey: learningLogKeys.all }),
  })
}
