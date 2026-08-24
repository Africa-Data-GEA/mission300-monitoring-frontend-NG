import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { DeliveryRow, StateCoverageRow } from '@/api/schemas/state-disco'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { formatDate } from '@/lib/format'
import {
  useDiscoComparison,
  useStateCoverage,
  useStateDiscoFilters,
  useStateDiscoOverview,
  useSupplyTariff,
  useUtilityDelivery,
} from '../api'
import { DeliveryStatusChart } from '../components/charts/delivery-status-chart'
import { DiscoComparisonChart } from '../components/charts/disco-comparison-chart'
import { StateCoverageChart } from '../components/charts/state-coverage-chart'
import { SupplyHoursChart } from '../components/charts/supply-hours-chart'
import { PageState } from '../components/page-state'
import { PerformanceCard } from '../components/performance-card'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

// Typed from the schema rather than a hand-copied shape, so a field added to
// DeliveryRow (serviceBand, dueDate) is available here without a second edit.
const deliveryColumns: Column<DeliveryRow>[] = [
  { id: 'utility', header: 'Utility', cell: (row) => row.utility, sortValue: (row) => row.utility },
  { id: 'milestone', header: 'PIP milestone', cell: (row) => row.milestone, className: 'min-w-56', sortValue: (row) => row.milestone },
  // Shown because it is filterable — a filter with no matching column left a
  // filtered result unreadable (feedback slide 11).
  { id: 'band', header: 'Service band', cell: (row) => `Band ${row.serviceBand}`, sortValue: (row) => row.serviceBand },
  // Sorted on the ISO date, not the display label, so Apr does not precede Jan.
  { id: 'due', header: 'Due date', cell: (row) => row.dueDateLabel, sortValue: (row) => row.dueDate },
  {
    id: 'status',
    header: 'Execution',
    sortValue: (row) => row.executionStatus,
    cell: (row) => (
      <>
        <p className="font-medium">{row.executionStatus}</p>
        <p className="text-xs text-text-muted">{row.achievedLabel}</p>
      </>
    ),
  },
  { id: 'evidence', header: 'Evidence', cell: (row) => row.evidenceLabel, sortValue: (row) => row.evidenceLabel },
  { id: 'compliance', header: 'Reporting', cell: (row) => row.reportingCompliance, sortValue: (row) => row.reportingCompliance },
  {
    id: 'bottleneck',
    header: 'Open bottleneck',
    className: 'min-w-52',
    sortValue: (row) => row.bottleneck,
    cell: (row) => row.bottleneck || <span className="text-text-muted">None</span>,
  },
]

const stateColumns: Column<StateCoverageRow>[] = [
  {
    id: 'state',
    header: 'State',
    cell: (row) => (
      <>
        <p className="font-medium">{row.state}</p>
        <p className="text-xs text-text-muted">{row.zone}</p>
      </>
    ),
    sortValue: (row) => row.state,
  },
  { id: 'mini-grid', header: 'Mini-grid connections', cell: (row) => row.miniGridConnections, align: 'right' },
  { id: 'shs', header: 'Solar Home Systems', cell: (row) => row.solarHomeSystems, align: 'right' },
  { id: 'programmes', header: 'Programmes', cell: (row) => row.activeProgrammes, align: 'right' },
  { id: 'projects', header: 'Projects', cell: (row) => row.activeProjects, align: 'right' },
  { id: 'bottlenecks', header: 'Open bottlenecks', cell: (row) => row.openBottlenecks, align: 'right' },
  {
    id: 'validation',
    header: 'Validated coverage',
    cell: (row) => (
      <div className="min-w-36">
        <p className="text-xs">{row.validationLabel}</p>
        <p className="mt-1 text-2xs text-text-subtle">
          {row.validatedBy && row.validatedAt ? `${row.validatedBy} · ${formatDate(row.validatedAt)}` : 'Not yet validated'}
        </p>
      </div>
    ),
  },
]

/**
 * State & DisCo Performance — one page, every metric. Previously five tabs
 * (Overview / Comparison / Supply & tariff / Delivery / States) each on its
 * own route; stakeholder feedback was that a tabbed view made it harder to
 * see everything together, so this merges all five into one scroll, and
 * replaces every flat CSS progress-bar with a real Apex chart.
 */
export function StateDiscoPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const overview = useStateDiscoOverview(state.query)
  const comparison = useDiscoComparison(state.query)
  const supplyTariff = useSupplyTariff(state.query)
  const delivery = useUtilityDelivery(state.query)
  const coverage = useStateCoverage(state.query)

  const error =
    filters.error ?? overview.error ?? comparison.error ?? supplyTariff.error ?? delivery.error ?? coverage.error
  const pending =
    filters.isPending ||
    overview.isPending ||
    comparison.isPending ||
    supplyTariff.isPending ||
    delivery.isPending ||
    coverage.isPending

  return (
    <StateDiscoShell
      title="State & DisCo Performance"
      description="Utility performance defaults to approved national and Distribution Company records."
    >
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
          void delivery.refetch()
          void coverage.refetch()
        }}
      >
        {overview.data && comparison.data && supplyTariff.data && delivery.data && coverage.data && (
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
                      cell: (row) => (
                        <>
                          <p>{row.activeCustomers} active</p>
                          <p className="text-xs text-text-muted">{row.meteredCustomers} metered · {row.unmeteredCustomers} gap</p>
                        </>
                      ),
                    },
                    { id: 'metering', header: 'Metering rate', cell: (row) => row.meteringRate },
                    { id: 'remittance', header: 'Remittance', cell: (row) => row.remittancePerformance },
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

            {/* Delivery & compliance */}
            <section>
              <h2 className="text-lg font-semibold">Delivery & compliance</h2>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                <DeliveryStatusChart rows={delivery.data.rows} />
                <Card className="p-3">
                  <DataTable
                    caption="Utility delivery and compliance"
                    columns={deliveryColumns}
                    rows={delivery.data.rows}
                    getRowId={(row) => row.id}
                  />
                </Card>
              </div>
            </section>

            {/* State view */}
            <section>
              <h2 className="text-lg font-semibold">State delivery coverage</h2>
              <Card className="mt-3 bg-status-info/10 p-3 text-sm text-text-default">{coverage.data.notice}</Card>
              <div className="mt-3">
                <StateCoverageChart rows={coverage.data.rows} />
              </div>
              <Card className="mt-3 p-3">
                <DataTable
                  caption="State delivery coverage"
                  columns={stateColumns}
                  rows={coverage.data.rows}
                  getRowId={(row) => row.id}
                  rowActions={(row) => (
                    <Button asChild size="icon" variant="ghost">
                      <Link aria-label={`View ${row.state}`} to={`/state-disco/states/${row.id}`}>
                        <ArrowRight />
                      </Link>
                    </Button>
                  )}
                />
              </Card>
            </section>
          </div>
        )}
      </PageState>
    </StateDiscoShell>
  )
}
