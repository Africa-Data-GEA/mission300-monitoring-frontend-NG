import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from 'lucide-react'
import type { Trend } from '@/types/domain'

/**
 * Decides how a period-on-period movement is rendered.
 *
 * Two independent things are being expressed and they must not be conflated:
 *   - the ARROW points in the direction the value actually moved;
 *   - the COLOUR says whether that movement is good.
 *
 * For a lower-is-better metric (ATC&C losses, tariff shortfall) a falling
 * value is an improvement, so the arrow points down and is green. The page
 * specification calls this out explicitly:
 *   "Use a green downward arrow when losses decline and a red upward arrow
 *    when losses rise."
 */
export function resolveTrend(trend: Trend): {
  isFlat: boolean
  isRising: boolean
  isImproving: boolean
  Icon: LucideIcon
} {
  const isFlat = trend.change === 0
  const isRising = trend.change > 0
  const isImproving =
    trend.direction === 'higher-is-better' ? isRising : !isRising

  return {
    isFlat,
    isRising,
    isImproving,
    Icon: isFlat ? ArrowRight : isRising ? ArrowUp : ArrowDown,
  }
}
