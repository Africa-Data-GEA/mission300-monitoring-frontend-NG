import type { Notification } from '@/api/schemas/notifications'

/** Mutable in-memory feed, mirroring the real backend's per-user
 * notifications table closely enough for mock/dev UX and tests. */
const NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Metering submission awaiting validation',
    description: 'Ikeja Electric submitted Q3 2025 metering data for review.',
    link: '/data-submissions/validation',
    read: false,
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'Submission approved',
    description: 'Your Q3 2025 revenue collected submission was approved.',
    link: '/data-submissions',
    read: false,
    createdAt: '2026-09-14T15:30:00Z',
  },
  {
    id: 'notif-3',
    title: 'New report ready',
    description: 'The Compact Progress Report for Q3 2025 has been generated.',
    link: '/reports',
    read: false,
    createdAt: '2026-09-13T11:00:00Z',
  },
]

export function getNotificationsFeed() {
  return {
    items: NOTIFICATIONS,
    unreadCount: NOTIFICATIONS.filter((n) => !n.read).length,
  }
}

export function markNotificationRead(id: string): Notification | null {
  const notification = NOTIFICATIONS.find((n) => n.id === id)
  if (!notification) return null
  notification.read = true
  return notification
}

export function markAllNotificationsRead(): number {
  const unread = NOTIFICATIONS.filter((n) => !n.read)
  for (const n of unread) n.read = true
  return unread.length
}
