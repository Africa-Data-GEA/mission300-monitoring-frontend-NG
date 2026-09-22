import { UserRoundSearch } from 'lucide-react'
import type { AuditEvent, AuditResult } from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Outcome styling.
 *
 * `rejected` is deliberately not red: rejecting a submission is a legitimate
 * validation decision, not a system failure. Only `failure` reads as a problem.
 */
const RESULT_STYLES: Record<AuditResult, string> = {
  success: 'bg-status-on-track-bg text-status-on-track',
  rejected: 'bg-status-lagging-bg text-status-lagging',
  failure: 'bg-status-at-risk-bg text-status-at-risk',
}

const RESULT_LABELS: Record<AuditResult, string> = {
  success: 'Success',
  rejected: 'Rejected',
  failure: 'Failure',
}

function humanizeAction(action: string): string {
  if (/\s/.test(action)) return action
  const words = action.replace(/[._-]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function prettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function summarise(value: string): string {
  try {
    const parsed: unknown = JSON.parse(value)
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>
      const nested = record.row ?? record.user ?? record.savedReport ?? record
      const source = nested && typeof nested === 'object' ? (nested as Record<string, unknown>) : record
      const label = source.name ?? source.title ?? source.id
      if (typeof label === 'string') return label
    }
  } catch {
    return value
  }
  return value
}

const COLUMNS: readonly Column<AuditEvent>[] = [
  {
    id: 'timestamp',
    header: 'Timestamp',
    className: 'min-w-40',
    sortValue: (event) => event.timestamp,
    cell: (event) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDateTime(event.timestamp)}
      </span>
    ),
  },
  {
    id: 'user',
    header: 'User',
    className: 'min-w-44',
    sortValue: (event) => event.userName,
    cell: (event) => (
      <span className="font-medium whitespace-nowrap text-text-default">
        {event.userName}
      </span>
    ),
  },
  {
    id: 'action',
    header: 'Action',
    className: 'min-w-56',
    sortValue: (event) => event.action,
    cell: (event) => (
      <div className="min-w-0">
        <p className="text-text-default">{humanizeAction(event.action)}</p>
        <p className="truncate text-xs text-text-muted">{event.module}</p>
      </div>
    ),
  },
  {
    id: 'record',
    header: 'Record',
    className: 'min-w-40',
    cell: (event) => (
      <span className="font-mono text-xs whitespace-nowrap text-text-muted">
        {event.recordId ?? '—'}
      </span>
    ),
  },
  {
    id: 'change',
    header: 'Change',
    className: 'min-w-64',
    cell: (event) => {
      // Creations have no prior value and deletions have no new value, so a
      // bare arrow would be misleading in both directions.
      if (!event.priorValue && !event.newValue) {
        return <span className="text-xs text-text-subtle">—</span>
      }

      const full = event.newValue ?? event.priorValue ?? ''

      return (
        <details className="max-w-xs text-xs text-text-muted">
          <summary className="cursor-pointer truncate" title={summarise(full)}>
            {event.priorValue ? `${summarise(event.priorValue)} → ` : ''}
            {event.newValue ? summarise(event.newValue) : 'removed'}
          </summary>
          <div className="mt-2 space-y-2">
            {event.priorValue && (
              <div>
                <p className="font-medium text-text-default">Before</p>
                <pre className="max-h-48 overflow-auto rounded-control bg-surface-sunken p-2 font-mono text-[11px] whitespace-pre-wrap break-all">
                  {prettyJson(event.priorValue)}
                </pre>
              </div>
            )}
            {event.newValue && (
              <div>
                <p className="font-medium text-text-default">After</p>
                <pre className="max-h-48 overflow-auto rounded-control bg-surface-sunken p-2 font-mono text-[11px] whitespace-pre-wrap break-all">
                  {prettyJson(event.newValue)}
                </pre>
              </div>
            )}
          </div>
        </details>
      )
    },
  },
  {
    id: 'result',
    header: 'Result',
    className: 'min-w-24',
    sortValue: (event) => event.result,
    cell: (event) => (
      <span
        className={cn(
          'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium',
          RESULT_STYLES[event.result],
        )}
      >
        {RESULT_LABELS[event.result]}
      </span>
    ),
  },
  {
    id: 'reference',
    header: 'Reference',
    className: 'min-w-36',
    cell: (event) => (
      <span className="font-mono text-xs whitespace-nowrap text-text-muted">
        {event.reference ?? '—'}
      </span>
    ),
  },
]

/** Section E — user and administrative activity log. */
export function AuditLog({
  events,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onViewUser,
}: {
  events: readonly AuditEvent[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onViewUser: (event: AuditEvent) => void
}) {
  return (
    <Card variant="well" className="min-w-0 overflow-hidden p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Audit log</h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="User and administrative activity log"
          columns={COLUMNS}
          rows={events}
          getRowId={(event) => event.id}
          className={'[&_table]:min-w-[1180px]'}
          rowActions={(event) => (
            <RowActionMenu
              label={`Actions for audit event ${event.id}`}
              actions={[
                {
                  label: 'View user',
                  icon: UserRoundSearch,
                  onSelect: () => onViewUser(event),
                },
                ...(event.reference
                  ? [{ label: 'Copy reference', copyText: event.reference }]
                  : []),
                { label: 'Copy event ID', copyText: event.id },
              ]}
            />
          )}
          emptyMessage="No audit events match the current filters."
        />
      </Card>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Card>
  )
}
