import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLearningLogEntryResponseSchema,
  learningLogOverviewSchema,
  type CreateLearningLogEntryRequest,
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
