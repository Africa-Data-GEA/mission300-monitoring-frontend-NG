import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  reportScheduleSchema,
  reportSchedulesSchema,
  scheduleAudiencesSchema,
  sendScheduleResultSchema,
  type ReportScheduleInput,
} from '@/api/schemas/report-schedules'
import { api } from '@/lib/api-client'

export const scheduleKeys = {
  all: ['report-schedules'] as const,
}

export function useReportSchedules() {
  return useQuery({
    queryKey: scheduleKeys.all,
    queryFn: () => api.get('/reports/schedules', reportSchedulesSchema),
  })
}

export function useScheduleAudiences() {
  return useQuery({
    queryKey: [...scheduleKeys.all, 'audiences'],
    queryFn: () => api.get('/reports/schedules/audiences', scheduleAudiencesSchema),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSaveReportSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string | null; input: ReportScheduleInput }) =>
      id
        ? api.put(`/reports/schedules/${id}`, input, reportScheduleSchema)
        : api.post('/reports/schedules', input, reportScheduleSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useDeleteReportSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/reports/schedules/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useSendReportSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, test }: { id: string; test: boolean }) =>
      api.post(`/reports/schedules/${id}/send`, { test }, sendScheduleResultSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}
