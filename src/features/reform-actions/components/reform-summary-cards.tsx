import type { ReformActionsOverview } from '@/api/schemas/reform-actions'
import { Card } from '@/components/ui/card'

function sum(counts: Record<string, number>, keys: readonly string[]) {
  return keys.reduce((total, key) => total + (counts[key] ?? 0), 0)
}

const IN_PROGRESS = ['in-progress-on-track', 'in-progress-minor-delays', 'in-progress-at-risk'] as const

function SummaryCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-text-default">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{detail}</p>
    </Card>
  )
}

export function ReformSummaryCards({ summary }: { summary: ReformActionsOverview['summary'] }) {
  const { priority, other } = summary.byStatus
  const completed = (priority.completed ?? 0) + (other.completed ?? 0)
  const delayed = (priority.delayed ?? 0) + (other.delayed ?? 0)
  const inProgress = sum(priority, IN_PROGRESS) + sum(other, IN_PROGRESS)

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Reform actions" value={summary.total} detail={`${summary.priorityTotal} priority`} />
      <SummaryCard label="Completed" value={completed} detail="All implementation concluded" />
      <SummaryCard label="In progress" value={inProgress} detail="On track, minor delays or at risk" />
      <SummaryCard label="Delayed" value={delayed} detail="Deadline passed, not complete" />
    </div>
  )
}
