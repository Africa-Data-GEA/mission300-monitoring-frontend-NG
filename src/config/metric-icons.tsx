import {
  Activity,
  Banknote,
  CalendarCheck,
  Gauge,
  Layers,
  ListChecks,
  PlugZap,
  TrendingDown,
  TriangleAlert,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { MetricIconName } from '@/types/domain'

/**
 * Maps the semantic icon name carried in the API payload to a concrete icon.
 *
 * The contract sends a NAME rather than an icon so the backend never has to
 * know about the icon library, and swapping icon sets is a change to this one
 * file.
 */
const METRIC_ICONS: Record<MetricIconName, LucideIcon> = {
  access: PlugZap,
  metering: Gauge,
  losses: TrendingDown,
  capital: Banknote,
  generation: Zap,
  milestones: CalendarCheck,
  pillars: Layers,
  kpis: ListChecks,
  escalations: TriangleAlert,
  institutions: Users,
  generic: Activity,
}

/**
 * Renders the icon for a metric.
 *
 * Exposed as a component rather than a `resolveIcon()` helper because
 * selecting a component type during render defeats fast refresh and React
 * Compiler memoisation. An unknown name falls back to a neutral icon so a new
 * backend value can never render a blank space.
 */
export function MetricIcon({
  name,
  className,
}: {
  name: MetricIconName | undefined
  className?: string
}) {
  const Icon = (name && METRIC_ICONS[name]) || METRIC_ICONS.generic

  return <Icon aria-hidden="true" className={className} />
}

export { METRIC_ICONS }
