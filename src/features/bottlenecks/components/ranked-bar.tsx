/**
 * A single horizontal bar sized relative to the largest value in its group.
 *
 * Used for "Bottlenecks by category" (Section C) and the agency ranking
 * (Section D) — both are plain ranked counts with no baseline, target or
 * multi-segment breakdown, so the existing bullet-chart and stacked-bar
 * primitives are the wrong shape for this.
 */
export function RankedBar({
  label,
  count,
  maxCount,
}: {
  label: string
  count: number
  maxCount: number
}) {
  const percent = maxCount === 0 ? 0 : (count / maxCount) * 100

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-text-default">{label}</span>
        <span className="text-sm font-medium text-text-default">{count}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${count}`}
        className="mt-1 h-2 w-full overflow-hidden rounded-pill bg-surface-sunken"
      >
        <div
          className="h-full rounded-pill bg-brand-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
