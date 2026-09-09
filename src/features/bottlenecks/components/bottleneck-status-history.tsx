import { History } from 'lucide-react'
import type { BottleneckStatusHistoryEntry } from '@/api/schemas/bottlenecks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BottleneckStatusBadge } from './bottleneck-status-badge'

/**
 * How a bottleneck's status changed over time — M300-INT-006 flagged that
 * only the current status/escalation state was visible on the register, not
 * how it got there. Small popover rather than a widened register column: a
 * register row's history length varies per record, so a fixed set of period
 * columns (the pattern ProjectStatusEvolutionTable uses for the fixed
 * priority-project list) doesn't fit a filterable, arbitrary-length register.
 */
export function BottleneckStatusHistory({
  history,
  issue,
}: {
  history: readonly BottleneckStatusHistoryEntry[]
  issue: string
}) {
  if (history.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Status history for ${issue}`}
        className="mt-1 inline-flex items-center gap-1 text-2xs text-text-subtle underline-offset-2 hover:text-brand-700 hover:underline"
      >
        <History aria-hidden="true" className="size-3" />
        History
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-xs font-semibold text-text-default">Status over time</p>
        <ul className="flex flex-col gap-1.5">
          {history.map((entry) => (
            <li key={entry.period} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-text-muted">{entry.period}</span>
              <BottleneckStatusBadge status={entry.status} />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
