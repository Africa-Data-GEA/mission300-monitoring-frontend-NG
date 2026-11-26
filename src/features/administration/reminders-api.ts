import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reminderOverviewSchema } from '@/api/schemas/notification-reminders'
import { api } from '@/lib/api-client'

const REMINDERS_KEY = ['administration', 'reminders'] as const

export function useReminderOverview() {
  return useQuery({
    queryKey: REMINDERS_KEY,
    queryFn: () => api.get('/notification-reminders', reminderOverviewSchema),
  })
}

export function useSetRemindersEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) =>
      api.put('/notification-reminders', { enabled }, reminderOverviewSchema),
    onSuccess: (overview) => queryClient.setQueryData(REMINDERS_KEY, overview),
  })
}
