import type { UtilityOperationsRow } from '@/api/schemas/state-disco'
import type { Column } from '@/components/ui/data-table'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { useStateDiscoFilters, useSupplyTariff } from '../api'
import { PageState } from '../components/page-state'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

function bandColumn(index: number, label: string): Column<UtilityOperationsRow> {
  return {
    id: `band-${label}`,
    header: `Band ${label}`,
    cell: (row) => {
      const band = row.bands[index]
      return band ? (
        <div className="min-w-28">
          <p className="font-medium">{band.supplyHours}</p>
          <p className="text-xs text-text-muted">{band.tariff}</p>
          <div className="mt-2 h-1.5 rounded-pill bg-border-default">
            <div className="h-full rounded-pill bg-brand-600" style={{ width: `${band.intensityPercent}%` }} />
          </div>
        </div>
      ) : null
    },
  }
}

const columns: Column<UtilityOperationsRow>[] = [
  { id: 'utility', header: 'Distribution Company', cell: (row) => <><p className="font-medium">{row.utility}</p><p className="text-xs text-text-muted">{row.effectiveOrder}</p></> },
  bandColumn(0, 'A'), bandColumn(1, 'B'), bandColumn(2, 'C'), bandColumn(3, 'D'), bandColumn(4, 'E'),
]

export function SupplyTariffPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const data = useSupplyTariff(state.query)
  const error = filters.error ?? data.error
  return (
    <StateDiscoShell title="Supply & tariff" description="Average daily supply and approved tariff remain separate for Bands A to E.">
      {filters.data && <StateDiscoFilterBar options={filters.data} query={state.query} onChange={state.setQuery} onReset={state.reset} />}
      <PageState pending={filters.isPending || data.isPending} error={error} retry={() => void data.refetch()}>
        {data.data && <Card className="p-3"><DataTable caption="Supply hours and tariff matrix" columns={columns} rows={data.data.rows} getRowId={(row) => row.id} /></Card>}
      </PageState>
    </StateDiscoShell>
  )
}
