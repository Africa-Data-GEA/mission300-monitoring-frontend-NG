import type { CategoryDistribution } from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { RankedBar } from './ranked-bar'

/** Section C, part one — bottlenecks by category, as horizontal bars. */
export function CategoryDistributionCard({
  rows,
}: {
  rows: readonly CategoryDistribution[]
}) {
  const maxCount = Math.max(1, ...rows.map((row) => row.count))
  // Highest count first, so the biggest constraint categories lead.
  const sorted = [...rows].sort((a, b) => b.count - a.count)

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">
        Bottlenecks by category
      </h3>

      <div className="mt-4 space-y-3">
        {sorted.map((row) => (
          <RankedBar
            key={row.category}
            label={row.label}
            count={row.count}
            maxCount={maxCount}
          />
        ))}
      </div>
    </Card>
  )
}
