import { useStateDiscoFilters, useStateDiscoOverview } from '../api'
import { PageState } from '../components/page-state'
import { PerformanceCard } from '../components/performance-card'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

export function StateDiscoOverviewPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const overview = useStateDiscoOverview(state.query)
  const error = filters.error ?? overview.error

  return (
    <StateDiscoShell title="State & DisCo Performance" description="Utility performance defaults to approved national and Distribution Company records.">
      {filters.data && <StateDiscoFilterBar options={filters.data} query={state.query} onChange={state.setQuery} onReset={state.reset} />}
      <PageState pending={filters.isPending || overview.isPending} error={error} retry={() => void overview.refetch()}>
        {overview.data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{overview.data.selectedUtility}</h2>
              <p className="text-xs text-text-muted">{overview.data.meta.lastUpdatedLabel} · {overview.data.meta.sourceLabel}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {overview.data.metrics.map((metric) => <PerformanceCard key={metric.id} metric={metric} />)}
            </div>
          </>
        )}
      </PageState>
    </StateDiscoShell>
  )
}
