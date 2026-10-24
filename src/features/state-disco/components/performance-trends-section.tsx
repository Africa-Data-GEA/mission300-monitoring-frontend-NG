import type { PerformanceTrends } from '@/api/schemas/state-disco'
import { PerformanceTrendChart } from './charts/performance-trend-chart'

export function PerformanceTrendsSection({ trends }: { trends: PerformanceTrends }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Performance trends</h2>
      <p className="text-xs text-text-muted">
        Quarter by quarter for {trends.selectedUtility}. Gaps mean that quarter has no data for the metric.
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <PerformanceTrendChart title="Metering rate" metric="meteringRate" points={trends.points} target={100} />
        <PerformanceTrendChart
          title="ATC&C loss rate"
          metric="atccLossRate"
          points={trends.points}
          lowerIsBetter
        />
        <PerformanceTrendChart
          title="Collection efficiency"
          metric="collectionEfficiency"
          points={trends.points}
          target={100}
        />
        <PerformanceTrendChart
          title="Market-remittance performance"
          metric="remittancePerformance"
          points={trends.points}
          target={100}
        />
      </div>
    </section>
  )
}
