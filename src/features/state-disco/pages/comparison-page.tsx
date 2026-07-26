import type { DiscoComparisonRow } from '@/api/schemas/state-disco'
import type { Column } from '@/components/ui/data-table'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { useDiscoComparison, useStateDiscoFilters } from '../api'
import { ComparisonBar } from '../components/comparison-bar'
import { PageState } from '../components/page-state'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

const columns: Column<DiscoComparisonRow>[] = [
  { id: 'utility', header: 'Distribution Company', cell: (row) => <><p className="font-medium">{row.name}</p><p className="text-xs text-text-muted">{row.rankLabel} · {row.validationLabel}</p></>, sortValue: (row) => row.name },
  { id: 'customers', header: 'Customers', cell: (row) => <><p>{row.activeCustomers} active</p><p className="text-xs text-text-muted">{row.meteredCustomers} metered · {row.unmeteredCustomers} gap</p></> },
  { id: 'metering', header: 'Metering rate', cell: (row) => row.meteringRate },
  { id: 'energy', header: 'Energy received / billed', cell: (row) => <ComparisonBar primaryPercent={row.energyReceivedBarPercent} secondaryPercent={row.energyBilledBarPercent} primaryLabel={row.energyReceived} secondaryLabel={`${row.energyBilled} · ${row.billingEfficiency}`} /> },
  { id: 'revenue', header: 'Revenue billed / collected', cell: (row) => <ComparisonBar primaryPercent={row.revenueBilledBarPercent} secondaryPercent={row.revenueCollectedBarPercent} primaryLabel={row.revenueBilled} secondaryLabel={`${row.revenueCollected} · ${row.collectionEfficiency}`} /> },
  { id: 'remittance', header: 'Remittance', cell: (row) => row.remittancePerformance },
]

export function DiscoComparisonPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const comparison = useDiscoComparison(state.query)
  const error = filters.error ?? comparison.error
  return (
    <StateDiscoShell title="Distribution Company comparison" description="Server-ranked customer, energy, revenue, and remittance values for a common reporting period.">
      {filters.data && <StateDiscoFilterBar options={filters.data} query={state.query} onChange={state.setQuery} onReset={state.reset} />}
      <PageState pending={filters.isPending || comparison.isPending} error={error} retry={() => void comparison.refetch()}>
        {comparison.data && <Card className="p-3"><DataTable caption="Distribution Company comparison" columns={columns} rows={comparison.data.rows} getRowId={(row) => row.id} /></Card>}
      </PageState>
    </StateDiscoShell>
  )
}
