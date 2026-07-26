import { SEVERITY_LABELS, type RegisterSeverity } from '@/api/schemas/bottlenecks'
import { cn } from '@/lib/utils'

const FILL: Record<RegisterSeverity, string> = {
  critical: 'bg-status-at-risk',
  high: 'bg-status-lagging',
  medium: 'bg-brand-400',
  low: 'bg-border-strong',
}

/** Horizontal stacked bar of bottleneck counts by severity, for one lifecycle
 * stage (Section C, part two). */
export function SeverityStackedBar({
  label,
  total,
  bySeverity,
}: {
  label: string
  total: number
  bySeverity: readonly { severity: RegisterSeverity; count: number }[]
}) {
  const populated = bySeverity.filter((entry) => entry.count > 0)

  if (total === 0 || populated.length === 0) {
    return <p className="text-xs text-text-subtle">No open bottlenecks</p>
  }

  const description = `${label}: ${populated
    .map((entry) => `${entry.count} ${SEVERITY_LABELS[entry.severity].toLowerCase()}`)
    .join(', ')}, ${total} total`

  return (
    <div
      role="img"
      aria-label={description}
      className="flex h-2.5 w-full overflow-hidden rounded-pill"
    >
      {populated.map((entry) => (
        <div
          key={entry.severity}
          title={`${SEVERITY_LABELS[entry.severity]}: ${entry.count}`}
          className={cn(FILL[entry.severity])}
          style={{ width: `${(entry.count / total) * 100}%` }}
        />
      ))}
    </div>
  )
}
