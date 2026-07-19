import { cn } from '@/lib/utils'

/**
 * Compact trend line for a KPI card — required on the available generation
 * capacity card.
 *
 * Drawn as a plain SVG polyline rather than pulling in a charting library: it
 * has no axes, legend, tooltip or interaction, so a chart library would add
 * weight for nothing. The series is decorative detail on top of a figure that
 * is already stated in text, so the graphic is hidden from assistive
 * technology and the trend is conveyed by the accompanying trend indicator.
 */
export function Sparkline({
  points,
  className,
  width = 96,
  height = 24,
}: {
  /** Ordered oldest-to-newest readings. */
  points: readonly number[]
  className?: string
  width?: number
  height?: number
}) {
  // Fewer than two points cannot describe a trend.
  if (points.length < 2) return null

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min

  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width
    // A flat series would divide by zero; centre it instead.
    const y = range === 0 ? height / 2 : height - ((point - min) / range) * height
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-6 w-24 overflow-visible', className)}
    >
      <polyline
        points={coordinates.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
