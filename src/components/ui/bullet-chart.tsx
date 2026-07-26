import { cn } from '@/lib/utils'
import type { ImprovementDirection } from '@/types/domain'

/**
 * Position of a value on the chart's own scale, as a percentage.
 *
 * Rounded to two decimals because the raw division produces artefacts such as
 * 55.00000000000001, which would otherwise be written into the DOM as an
 * inline width.
 */
function toPercent(value: number, min: number, max: number): number {
  if (max === min) return 0

  const ratio = ((value - min) / (max - min)) * 100
  const clamped = Math.min(100, Math.max(0, ratio))

  return Math.round(clamped * 100) / 100
}

/**
 * Horizontal bullet chart — the visual the specification mandates for Section
 * C, National Performance and Target Progress.
 *
 * Four things are plotted on one row, each answering a different question:
 *   - the FILLED BAR is the current value        ("where are we?")
 *   - the BASELINE tick is where we started      ("how far have we come?")
 *   - the EXPECTED tick is the approved trajectory's value for this period
 *                                                ("should we be further on?")
 *   - the TARGET tick is the approved end state  ("how far is left?")
 *
 * Every metric carries its own scale because they are not comparable — a
 * percentage, a naira total and a loss rate share no axis.
 *
 * `expected` and `target` are nullable: several Compact metrics have no
 * approved target, and the specification is explicit that one must not be
 * invented. Those simply render without the tick.
 */
export function BulletChart({
  current,
  baseline,
  expected,
  target,
  scaleMin,
  scaleMax,
  direction,
  label,
  valueLabel,
  className,
}: {
  current: number
  baseline: number
  expected: number | null
  target: number | null
  scaleMin: number
  scaleMax: number
  direction: ImprovementDirection
  /** Metric name, used to build the accessible description. */
  label: string
  /** Pre-formatted current value, e.g. "₦2.2tn". */
  valueLabel: string
  className?: string
}) {
  const currentPercent = toPercent(current, scaleMin, scaleMax)
  const baselinePercent = toPercent(baseline, scaleMin, scaleMax)
  const expectedPercent =
    expected === null ? null : toPercent(expected, scaleMin, scaleMax)
  const targetPercent =
    target === null ? null : toPercent(target, scaleMin, scaleMax)

  /*
   * Behind or ahead of the approved trajectory. For a lower-is-better metric
   * (ATC&C losses, tariff shortfall) being BELOW the expected value is ahead,
   * so the comparison flips.
   */
  const isBehind =
    expected === null
      ? null
      : direction === 'higher-is-better'
        ? current < expected
        : current > expected

  // The bar alone conveys nothing to a screen reader, so state every plotted
  // value in words.
  const description = [
    `${label}: ${valueLabel}`,
    `baseline ${baseline}`,
    expected === null ? null : `expected ${expected} for this period`,
    target === null ? null : `target ${target}`,
    isBehind === null
      ? null
      : isBehind
        ? 'behind the approved trajectory'
        : 'at or ahead of the approved trajectory',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div
      role="img"
      aria-label={description}
      className={cn('relative h-6 w-full', className)}
    >
      {/* Track */}
      <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-pill bg-surface-sunken" />

      {/* Current value */}
      <div
        data-testid="bullet-current"
        className={cn(
          'absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-pill transition-[width]',
          isBehind ? 'bg-status-lagging' : 'bg-brand-600',
        )}
        style={{ width: `${currentPercent}%` }}
      />

      {/* Baseline — where the Compact started */}
      <div
        data-testid="bullet-baseline"
        title={`Baseline ${baseline}`}
        className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-subtle"
        style={{ left: `${baselinePercent}%` }}
      />

      {/* Expected for the selected period */}
      {expectedPercent !== null && (
        <div
          data-testid="bullet-expected"
          title={`Expected ${expected}`}
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-muted"
          style={{ left: `${expectedPercent}%` }}
        />
      )}

      {/* Approved target */}
      {targetPercent !== null && (
        <div
          data-testid="bullet-target"
          title={`Target ${target}`}
          className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-default"
          style={{ left: `${targetPercent}%` }}
        />
      )}
    </div>
  )
}
