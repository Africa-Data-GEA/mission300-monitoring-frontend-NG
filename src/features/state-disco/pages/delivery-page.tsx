import type { DeliveryRow } from '@/api/schemas/state-disco'
import type { Column } from '@/components/ui/data-table'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { useStateDiscoFilters, useUtilityDelivery } from '../api'
import { PageState } from '../components/page-state'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

const columns: Column<DeliveryRow>[] = [
  { id: 'utility', header: 'Utility', cell: (row) => row.utility, sortValue: (row) => row.utility },
  { id: 'milestone', header: 'PIP milestone', cell: (row) => row.milestone, className: 'min-w-56' },
  { id: 'due', header: 'Due date', cell: (row) => row.dueDateLabel },
  { id: 'status', header: 'Execution', cell: (row) => <><p className="font-medium">{row.executionStatus}</p><p className="text-xs text-text-muted">{row.achievedLabel}</p></> },
  { id: 'evidence', header: 'Evidence', cell: (row) => row.evidenceLabel },
  { id: 'compliance', header: 'Reporting', cell: (row) => row.reportingCompliance },
  { id: 'bottleneck', header: 'Open bottleneck', cell: (row) => row.bottleneck, className: 'min-w-52' },
]

export function DeliveryPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const data = useUtilityDelivery(state.query)
  const error = filters.error ?? data.error
  return (
    <StateDiscoShell title="Delivery & compliance" description="Utility milestones, evidence, reporting compliance, and linked bottlenecks.">
      {filters.data && <StateDiscoFilterBar options={filters.data} query={state.query} onChange={state.setQuery} onReset={state.reset} />}
      <PageState pending={filters.isPending || data.isPending} error={error} retry={() => void data.refetch()}>
        {data.data && <Card className="p-3"><DataTable caption="Utility delivery and compliance" columns={columns} rows={data.data.rows} getRowId={(row) => row.id} /></Card>}
      </PageState>
    </StateDiscoShell>
  )
}
