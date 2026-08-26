import type { FigureTrack } from '../lib/headline-figures'

/**
 * Baseline → current → target on a single axis.
 *
 * A bullet chart rather than a percentage bar, and the distinction matters on
 * this page: a percentage bar answers "how full is it", which for an
 * electrification target is the wrong question. What a reader needs is where
 * the country started, where it is now, and how far the approved target still
 * is — three positions on one scale, which is exactly what a bullet chart
 * encodes and a progress bar destroys.
 *
 * Milestone ticks are the approved trajectory's interim checkpoints. They are
 * what turns "we are at 137M of 236M" into "we are ahead of, or behind, where
 * the plan said we would be" — the only version of that sentence a reader can
 * act on.
 */
export function FigureTrack({ track, label }: { track: FigureTrack; label: string }) {
  const span = track.max - track.min
  if (span <= 0) return null

  const position = (value: number) => `${Math.min(100, Math.max(0, ((value - track.min) / span) * 100))}%`

  return (
    <div className="mt-4">
      <div
        role="img"
        aria-label={ariaLabel(track, label)}
        className="relative h-2.5 w-full bg-surface-sunken"
      >
        {/* Baseline-to-current fill: the distance actually covered. */}
        <div
          className="absolute inset-y-0 bg-landing-blue"
          style={{
            left: track.baseline === null ? '0%' : position(Math.min(track.baseline, track.current)),
            right: `calc(100% - ${position(track.current)})`,
          }}
        />

        {/* Everything before the baseline was already true in the base year —
            shown, but visibly not part of the Compact's own progress. */}
        {track.baseline !== null && (
          <div
            className="absolute inset-y-0 left-0 bg-landing-blue-lighter"
            style={{ right: `calc(100% - ${position(track.baseline)})` }}
          />
        )}

        {track.milestones.map((milestone) => (
          <span
            key={milestone.label}
            title={`${milestone.label}: ${milestone.value.toLocaleString('en-US')}`}
            className="absolute -top-0.5 h-3.5 w-px bg-text-subtle"
            style={{ left: position(milestone.value) }}
          />
        ))}

        {track.target !== null && (
          <span
            className="absolute -top-1 h-4.5 w-0.5 bg-text-default"
            style={{ left: position(track.target) }}
          />
        )}
      </div>

      <div className="mt-1.5 flex justify-between gap-4 text-[0.6875rem] leading-4 text-text-subtle">
        <span className="truncate">{track.baselineLabel || 'Available'}</span>
        <span className="truncate text-right font-semibold text-text-muted">{track.targetLabel}</span>
      </div>
    </div>
  )
}

function ariaLabel(track: FigureTrack, label: string): string {
  const parts = [`${label}: currently ${track.current.toLocaleString('en-US')}`]
  if (track.baseline !== null) parts.push(`from a baseline of ${track.baselineLabel}`)
  if (track.target !== null) parts.push(`against a target of ${track.targetLabel}`)
  return parts.join(', ')
}
