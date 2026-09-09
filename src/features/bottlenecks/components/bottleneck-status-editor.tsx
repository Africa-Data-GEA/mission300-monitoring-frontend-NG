import { useState } from 'react'
import {
  BOTTLENECK_STATUS_LABELS,
  bottleneckStatusSchema,
  type BottleneckRecord,
  type BottleneckStatus,
} from '@/api/schemas/bottlenecks'
import { SelectField } from '@/components/ui/select-field'
import { useUpdateBottleneckStatus } from '../api'
import { BottleneckStatusBadge } from './bottleneck-status-badge'
import { BottleneckStatusHistory } from './bottleneck-status-history'

const STATUS_OPTIONS = bottleneckStatusSchema.options.map((status) => ({
  value: status,
  label: BOTTLENECK_STATUS_LABELS[status],
}))

/**
 * The Status cell — previously just a read-only badge, with no way to
 * actually change a bottleneck's status once raised (only `createBottleneck`
 * existed; nothing updated one). A change here is what should grow
 * `statusHistory` going forward, the same way an approved data submission is
 * what grows a KPI's `history`.
 */
export function BottleneckStatusEditor({ record }: { record: BottleneckRecord }) {
  const [editing, setEditing] = useState(false)
  const updateStatus = useUpdateBottleneckStatus(record.id)

  if (editing) {
    return (
      <SelectField
        label="Status"
        value={record.status}
        options={STATUS_OPTIONS}
        onChange={(value) => {
          updateStatus.mutate(
            { status: value as BottleneckStatus },
            { onSettled: () => setEditing(false) },
          )
        }}
        className="w-36"
      />
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={updateStatus.isPending}
        aria-label={`Change status for ${record.issue}`}
        className="rounded-pill outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
      >
        <BottleneckStatusBadge status={record.status} />
      </button>
      <BottleneckStatusHistory history={record.statusHistory} issue={record.issue} />
    </div>
  )
}
