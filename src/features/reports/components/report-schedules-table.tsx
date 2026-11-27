import { Mail, Pause, Pencil, Play, Send, Trash2 } from 'lucide-react'
import type { ReportSchedule } from '@/api/schemas/report-schedules'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Column } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { formatDateTime } from '@/lib/format'
import { DeliveryStatusPill } from './delivery-status-pill'

export function ReportSchedulesTable({
  schedules,
  busyId,
  onEdit,
  onToggle,
  onSendTest,
  onSendNow,
  onDelete,
}: {
  schedules: readonly ReportSchedule[]
  busyId: string | null
  onEdit: (schedule: ReportSchedule) => void
  onToggle: (schedule: ReportSchedule) => void
  onSendTest: (schedule: ReportSchedule) => void
  onSendNow: (schedule: ReportSchedule) => void
  onDelete: (schedule: ReportSchedule) => void
}) {
  const columns: Column<ReportSchedule>[] = [
    {
      id: 'name',
      header: 'Schedule',
      cell: (row) => (
        <div>
          <p className="font-medium text-text-default">{row.name}</p>
          <p className="text-xs text-text-muted">{row.description}</p>
        </div>
      ),
      sortValue: (row) => row.name,
    },
    {
      id: 'audience',
      header: 'Report for',
      cell: (row) => row.institutionName ?? 'Everyone',
      sortValue: (row) => row.institutionName ?? '',
    },
    {
      id: 'recipients',
      header: 'Recipients',
      cell: (row) => (
        <span title={row.recipients.join(', ')}>
          {row.recipients.length} {row.recipients.length === 1 ? 'recipient' : 'recipients'}
        </span>
      ),
      sortValue: (row) => row.recipients.length,
    },
    {
      id: 'last',
      header: 'Last delivery',
      cell: (row) =>
        row.lastDelivery ? (
          <div className="flex flex-col gap-1">
            <DeliveryStatusPill status={row.lastDelivery.status} />
            <span className="text-xs text-text-muted">{formatDateTime(row.lastDelivery.sentAt)}</span>
            {row.lastDelivery.error && <span className="max-w-56 text-xs text-status-delayed">{row.lastDelivery.error}</span>}
          </div>
        ) : (
          <span className="text-text-muted">Not sent yet</span>
        ),
      sortValue: (row) => row.lastDelivery?.sentAt ?? '',
    },
    {
      id: 'next',
      header: 'Next send',
      cell: (row) => (row.isActive ? formatDateTime(row.nextRunAt) : <span className="text-text-muted">Paused</span>),
      sortValue: (row) => (row.isActive ? row.nextRunAt : ''),
    },
  ]

  return (
    <Card className="p-3">
      <DataTable
        caption="Scheduled executive briefs"
        columns={columns}
        rows={schedules}
        getRowId={(row) => row.id}
        rowActions={(row) => (
          <div className="flex flex-wrap justify-end gap-1">
            <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => onSendTest(row)} type="button">
              <Mail aria-hidden="true" />
              Send me a test
            </Button>
            <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => onSendNow(row)} type="button">
              <Send aria-hidden="true" />
              Send now
            </Button>
            <Button size="icon" variant="ghost" aria-label={`Edit ${row.name}`} onClick={() => onEdit(row)} type="button">
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`${row.isActive ? 'Pause' : 'Resume'} ${row.name}`}
              disabled={busyId === row.id}
              onClick={() => onToggle(row)}
              type="button"
            >
              {row.isActive ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </Button>
            <Button size="icon" variant="ghost" aria-label={`Delete ${row.name}`} disabled={busyId === row.id} onClick={() => onDelete(row)} type="button">
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        )}
      />
    </Card>
  )
}
