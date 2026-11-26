import type { ReminderOverview, ReminderSection } from '@/api/schemas/notification-reminders'

const SECTION_LABELS: Record<ReminderSection, string> = {
  'review-escalation': 'Escalation: still waiting for review',
  'review-waiting': 'Waiting for review',
  overdue: 'Overdue',
  deadline: 'Due soon',
  'returned-escalation': 'Escalation: returned, not resubmitted',
  returned: 'Returned for correction',
}

export function ReminderPreviewList({
  recipients,
}: {
  recipients: ReminderOverview['recipients']
}) {
  if (recipients.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No reminders are waiting to be sent.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border-default rounded-lg border border-border-default bg-surface-card">
      {recipients.map((recipient) => (
        <li key={recipient.email}>
          <details>
            <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2 px-3 py-2.5">
              <span className="text-sm font-medium text-text-default">
                {recipient.name} <span className="font-normal text-text-muted">{recipient.email}</span>
              </span>
              <span className="text-xs text-text-muted">
                {recipient.items.length} item{recipient.items.length === 1 ? '' : 's'}
              </span>
            </summary>
            <ul className="space-y-1.5 px-3 pb-3 text-sm text-text-muted">
              {recipient.items.map((item, index) => (
                <li key={`${item.section}-${index}`}>
                  <span className="font-medium text-text-default">{SECTION_LABELS[item.section]}:</span>{' '}
                  {item.text}
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  )
}
