import { Card } from '@/components/ui/card'
import { useKpiBreakdown } from '../api'
import { RegionalPerformanceChart } from './regional-performance-chart'

/**
 * Real per-DisCo/state breakdown for the two KPIs this build's backend
 * actually calculates (Metering Rate, ATC&C Loss Rate) — from the latest
 * approved submission's own rows, not an estimate. Only renders when a live
 * backend is configured (VITE_SUBMISSIONS_BACKEND_URL) and has an approved
 * submission to show; otherwise this section is simply absent, rather than
 * showing an empty or fabricated regional split.
 */
export function RegionalPerformanceSection() {
  const meteringRate = useKpiBreakdown('M300-P3-004')
  const atccLossRate = useKpiBreakdown('M300-P3-006')

  const meteringItems = meteringRate.data ?? []
  const atccItems = atccLossRate.data ?? []

  if (meteringItems.length === 0 && atccItems.length === 0) return null

  return (
    <Card variant="well" className="p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Regional performance by DisCo
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        The most recently approved submission's own figures, by DisCo and
        state — not a national estimate broken down.
      </p>

      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {meteringItems.length > 0 && (
          <Card className="p-4">
            <RegionalPerformanceChart title="Metering Rate" items={meteringItems} />
          </Card>
        )}
        {atccItems.length > 0 && (
          <Card className="p-4">
            <RegionalPerformanceChart title="ATC&C Loss Rate" items={atccItems} />
          </Card>
        )}
      </div>
    </Card>
  )
}
