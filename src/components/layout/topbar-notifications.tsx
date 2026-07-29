import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const NOTIFICATIONS = [
  {
    id: 'notification-validation',
    title: 'Metering submission awaiting validation',
    description: 'A new quarterly submission is ready for review.',
    time: '12 minutes ago',
    to: '/data-submissions',
  },
  {
    id: 'notification-project',
    title: 'Tariff Order Implementation is delayed',
    description: 'The project requires a ministerial funding decision.',
    time: '2 hours ago',
    to: '/programs/projects/PRJ-2025-033',
  },
  {
    id: 'notification-kpi',
    title: 'Private capital KPI requires validation',
    description: 'Evidence has not yet been confirmed for publication.',
    time: 'Yesterday',
    to: '/kpis?kpi=M300-P3-006',
  },
] as const
type NotificationId = (typeof NOTIFICATIONS)[number]['id']

export function TopbarNotifications() {
  const [unread, setUnread] = useState(() => new Set(NOTIFICATIONS.map((item) => item.id)))
  const unreadCount = unread.size

  function markRead(id: NotificationId) {
    setUnread((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-text-muted transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Bell aria-hidden="true" className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-1 min-w-4 rounded-pill bg-status-at-risk px-1 py-0.5 text-center text-2xs leading-none font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-text-default">Notifications</h2>
            <p className="text-xs text-text-muted">{unreadCount} unread</p>
          </div>
          <button
            type="button"
            disabled={unreadCount === 0}
            onClick={() => setUnread(new Set())}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-link disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" aria-hidden="true" />
            Mark all as read
          </button>
        </div>

        <ul className="divide-y divide-border-default">
          {NOTIFICATIONS.map((notification) => {
            const isUnread = unread.has(notification.id)
            return (
              <li key={notification.id}>
                <Link
                  to={notification.to}
                  onClick={() => markRead(notification.id)}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${isUnread ? 'bg-brand-600' : 'bg-border-strong'}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-default">{notification.title}</span>
                    <span className="mt-0.5 block text-xs text-text-muted">{notification.description}</span>
                    <span className="mt-1 block text-2xs text-text-subtle">{notification.time}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
