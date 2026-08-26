/**
 * The shape of a figure's own history, for the cards that have no numeric
 * target to plot a bullet chart against.
 *
 * Hand-drawn SVG rather than a charting library: this is four to eight points
 * with no axes, no tooltip and no interaction, and mounting an ApexCharts
 * instance per card to draw a polyline costs a measurable amount of main-thread
 * time on the page that will take the most traffic in the platform.
 *
 * THE ACTUAL VALUES ARE ON THE FACE, NOT JUST THE SHAPE. The line alone shows
 * direction, not magnitude — a reader could see the trend but never learn what
 * the first or last reading actually was without opening the info popover.
 * FigureTrack, the sibling component used on every other card, already states
 * its baseline/target numbers as text; this now does the same for its two
 * endpoints, so no card on this strip is line-only.
 *
 * It carries a real accessible label with the first and last reading, so the
 * trend is available to a screen reader rather than being purely decorative.
 */
export function KpiSparkline({
  points,
  label,
  formatValue = (value) => value.toLocaleString('en-US'),
}: {
  points: readonly { period: string; value: number }[]
  label: string
  /** Matches the card's own display format (e.g. one-decimal percent) rather
   * than falling back to a raw, differently-rounded number. */
  formatValue?: (value: number) => string
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

  const firstY = height - ((first.value - min) / span) * height
  const lastY = height - ((last.value - min) / span) * height

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}: ${first.value.toLocaleString('en-US')} in ${first.period}, ${last.value.toLocaleString('en-US')} in ${last.period}`}
        className="h-7 w-full overflow-visible"
      >
        <path d={path} fill="none" stroke="var(--color-landing-blue)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={0} cy={firstY} r="2" fill="var(--color-landing-blue)" vectorEffect="non-scaling-stroke" />
        <circle cx={width} cy={lastY} r="2" fill="var(--color-landing-blue)" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1.5 flex justify-between gap-4">
        <span className="truncate text-[0.75rem] leading-4 font-semibold text-text-default">
          {formatValue(first.value)}
        </span>
        <span className="truncate text-right text-[0.75rem] leading-4 font-semibold text-text-default">
          {formatValue(last.value)}
        </span>
      </div>
      <div className="flex justify-between gap-4 text-[0.6875rem] leading-4 text-text-subtle">
        <span className="truncate">{first.period}</span>
        <span className="truncate text-right">{last.period}</span>
      </div>
    </div>
  )
}
