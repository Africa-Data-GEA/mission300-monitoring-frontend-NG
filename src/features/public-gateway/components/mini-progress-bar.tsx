/**
 * A plain horizontal progress-to-target bar — square corners, one colour
 * fill, no track shadow or animation. The graphical element on cards that
 * have a numeric target to show progress against; cards that only have a
 * trend (no target) use `FigureTrend` instead.
 */
export function MiniProgressBar({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div
      role="img"
      aria-label={`${label}: ${clamped.toFixed(0)}% of target`}
      className="mt-3 h-2 w-full bg-surface-sunken"
    >
      <div className="h-full bg-brand-600" style={{ width: `${clamped}%` }} />
    </div>
  )
}
