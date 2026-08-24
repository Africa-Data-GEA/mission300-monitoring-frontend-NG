/**
 * The shape of a figure's own history, for the cards that have no numeric
 * target to plot a bullet chart against.
 *
 * Hand-drawn SVG rather than a charting library: this is four to eight points
 * with no axes, no tooltip and no interaction, and mounting an ApexCharts
 * instance per card to draw a polyline costs a measurable amount of main-thread
 * time on the page that will take the most traffic in the platform.
 *
 * It carries a real accessible label with the first and last reading, so the
 * trend is available to a screen reader rather than being purely decorative.
 */
export function KpiSparkline({
  points,
  label,
}: {
  points: readonly { period: string; value: number }[]
  label: string
}) {
  const first = points[0]
  const last = points[points.length - 1]

  // Two readings are the minimum that can be a trend. The card only reaches
  // for a sparkline when it has them; this makes that explicit.
  if (!first || !last) return null

  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // A flat series would divide by zero; drawing it mid-height is the honest
  // rendering of "this did not move".
  const span = max - min || 1

  const width = 100
  const height = 28
  const step = points.length > 1 ? width / (points.length - 1) : 0

  const path = points
    .map((point, index) => {
      const x = index * step
      const y = height - ((point.value - min) / span) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}: ${first.value.toLocaleString('en-US')} in ${first.period}, ${last.value.toLocaleString('en-US')} in ${last.period}`}
        className="h-7 w-full"
      >
        <path d={path} fill="none" stroke="var(--color-brand-600)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1.5 flex justify-between gap-4 text-[0.6875rem] leading-4 text-text-subtle">
        <span className="truncate">{first.period}</span>
        <span className="truncate text-right">{last.period}</span>
      </div>
    </div>
  )
}
