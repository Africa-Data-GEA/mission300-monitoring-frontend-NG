import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatRelativeTime } from '@/lib/format'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/features/notifications/api'

export function TopbarNotifications() {
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const notifications = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0

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
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-link disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" aria-hidden="true" />
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-muted">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-border-default">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  to={notification.link}
                  onClick={() => {
                    if (!notification.read) markRead.mutate(notification.id)
                  }}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${!notification.read ? 'bg-brand-600' : 'bg-border-strong'}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-default">{notification.title}</span>
                    <span className="mt-0.5 block text-xs text-text-muted">{notification.description}</span>
                    <span className="mt-1 block text-2xs text-text-subtle">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
