import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
  useDiscoComparison,
  usePerformanceTrends,
  useStateDiscoFilters,
  useStateDiscoOverview,
  useSupplyTariff,
} from '../api'
import { DiscoComparisonChart } from '../components/charts/disco-comparison-chart'
import { SupplyHoursChart } from '../components/charts/supply-hours-chart'
import { PageState } from '../components/page-state'
import { PerformanceCard } from '../components/performance-card'
import { PerformanceTrendsSection } from '../components/performance-trends-section'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

function numericSort(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(/\s*\(.*\)$/, '').replace(/[^0-9.-]/g, ''))
  return Number.isNaN(parsed) ? null : parsed
}

export function StateDiscoPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const overview = useStateDiscoOverview(state.query)

  const comparison = useDiscoComparison({ ...state.query, validationStatus: 'all' })

  const supplyTariff = useSupplyTariff(state.query)
  const trends = usePerformanceTrends(state.query)

  const error = filters.error ?? overview.error ?? comparison.error ?? supplyTariff.error
  const pending = filters.isPending || overview.isPending || comparison.isPending || supplyTariff.isPending

  return (
    <StateDiscoShell title="State & DisCo Performance">
      {filters.data && (
        <StateDiscoFilterBar options={filters.data} query={state.query} onChange={state.setQuery} onReset={state.reset} />
      )}

      <PageState
        pending={pending}
        error={error}
        retry={() => {
          void overview.refetch()
          void comparison.refetch()
          void supplyTariff.refetch()
        }}
      >
        {overview.data && comparison.data && supplyTariff.data && (
          <div className="flex flex-col gap-4">
            {/* Performance overview */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{overview.data.selectedUtility}</h2>
                <p className="text-xs text-text-muted">
                  {overview.data.meta.lastUpdatedLabel} · {overview.data.meta.sourceLabel}
                </p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {overview.data.metrics.map((metric) => (
                  <PerformanceCard key={metric.id} metric={metric} />
                ))}
              </div>
            </section>

            {trends.data && <PerformanceTrendsSection trends={trends.data} />}

            {/* DisCo comparison */}
            <section>
              <h2 className="text-lg font-semibold">Distribution Company comparison</h2>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <DiscoComparisonChart
                  title="Energy received vs billed"
                  rows={comparison.data.rows}
                  primaryLabel="Received"
                  secondaryLabel="Billed"
                  primaryPercentKey="energyReceivedBarPercent"
                  secondaryPercentKey="energyBilledBarPercent"
                  primaryValueKey="energyReceived"
                  secondaryValueKey="energyBilled"
                />
                <DiscoComparisonChart
                  title="Revenue billed vs collected"
                  rows={comparison.data.rows}
                  primaryLabel="Billed"
                  secondaryLabel="Collected"
                  primaryPercentKey="revenueBilledBarPercent"
                  secondaryPercentKey="revenueCollectedBarPercent"
                  primaryValueKey="revenueBilled"
                  secondaryValueKey="revenueCollected"
                />
              </div>
              <Card className="mt-3 p-3">
                <DataTable
                  caption="Distribution Company customers and metering"
                  columns={[
                    {
                      id: 'utility',
                      header: 'Distribution Company',
                      cell: (row) => (
                        <>
                          <p className="font-medium">{row.name}</p>
                          <p className="text-xs text-text-muted">{row.rankLabel} · {row.validationLabel}</p>
                        </>
                      ),
                      sortValue: (row) => row.name,
                    },
                    {
                      id: 'customers',
                      header: 'Customers',
                      sortValue: (row) => numericSort(row.activeCustomers),
                      cell: (row) => (
                        <>
                          <p>{row.activeCustomers} active</p>
                          <p className="text-xs text-text-muted">{row.meteredCustomers} metered · {row.unmeteredCustomers} gap</p>
                        </>
                      ),
                    },
                    { id: 'metering', header: 'Metering rate', cell: (row) => row.meteringRate, sortValue: (row) => numericSort(row.meteringRate) },
                    { id: 'remittance', header: 'Remittance', cell: (row) => row.remittancePerformance, sortValue: (row) => numericSort(row.remittancePerformance) },
                    // Validation status still shows as small print under the
                    // DisCo name (the "utility" column above) - removed as
                    // its own column per feedback.
                  ]}
                  rows={comparison.data.rows}
                  getRowId={(row) => row.id}
                />
              </Card>
            </section>

            {/* Supply & tariff */}
            <section>
              <h2 className="text-lg font-semibold">Supply & tariff</h2>
              <p className="text-xs text-text-muted">
                Average daily supply and approved tariff remain separate for Bands A to E.
              </p>
              <div className="mt-3">
                <SupplyHoursChart rows={supplyTariff.data.rows} />
              </div>
            </section>

          </div>
        )}
      </PageState>
    </StateDiscoShell>
  )
}
