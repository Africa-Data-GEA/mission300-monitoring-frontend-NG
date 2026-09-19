import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  markAllReadResponseSchema,
  notificationSchema,
  notificationsFeedSchema,
} from '@/api/schemas/notifications'
import { api } from '@/lib/api-client'

const notificationsKey = ['notifications'] as const

export function useNotifications() {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: () => api.get('/notifications', notificationsFeedSchema),
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${encodeURIComponent(id)}/read`, {}, notificationSchema),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}, markAllReadResponseSchema),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  })
}
