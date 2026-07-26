import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { StateCoverageRow } from '@/api/schemas/state-disco'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { useStateCoverage, useStateDiscoFilters } from '../api'
import { PageState } from '../components/page-state'
import { StateDiscoFilterBar } from '../components/state-disco-filters'
import { StateDiscoShell } from '../components/state-disco-shell'
import { useStateDiscoQuery } from '../use-state-disco-query'

const columns: Column<StateCoverageRow>[] = [
  { id: 'state', header: 'State', cell: (row) => <><p className="font-medium">{row.state}</p><p className="text-xs text-text-muted">{row.zone}</p></>, sortValue: (row) => row.state },
  { id: 'mini-grid', header: 'Mini-grid connections', cell: (row) => row.miniGridConnections, align: 'right' },
  { id: 'shs', header: 'Solar Home Systems', cell: (row) => row.solarHomeSystems, align: 'right' },
  { id: 'programmes', header: 'Programmes', cell: (row) => row.activeProgrammes, align: 'right' },
  { id: 'projects', header: 'Projects', cell: (row) => row.activeProjects, align: 'right' },
  { id: 'bottlenecks', header: 'Open bottlenecks', cell: (row) => row.openBottlenecks, align: 'right' },
  {
    id: 'coverage', header: 'Validated coverage',
    cell: (row) => <div className="min-w-28"><p className="text-xs">{row.validationLabel}</p><div className="mt-2 h-1.5 rounded-pill bg-border-default"><div className="h-full rounded-pill bg-brand-600" style={{ width: `${row.coverageBarPercent}%` }} /></div></div>,
  },
]

export function StatesPage() {
  const state = useStateDiscoQuery()
  const filters = useStateDiscoFilters()
  const data = useStateCoverage(state.query)
  const error = filters.error ?? data.error
  return (
    <StateDiscoShell title="State delivery view" description="Only approved centrally maintained state breakdowns are presented.">
      {filters.data && <StateDiscoFilterBar options={filters.data} query={state.query} onChange={state.setQuery} onReset={state.reset} />}
      <PageState pending={filters.isPending || data.isPending} error={error} retry={() => void data.refetch()}>
        {data.data && (
          <>
            <Card className="bg-status-info/10 p-3 text-sm text-text-default">{data.data.notice}</Card>
            <Card className="p-3">
              <DataTable
                caption="State delivery coverage"
                columns={columns}
                rows={data.data.rows}
                getRowId={(row) => row.id}
                rowActions={(row) => (
                  <Button asChild size="icon" variant="ghost">
                    <Link aria-label={`View ${row.state}`} to={`/state-disco/states/${row.id}`}><ArrowRight /></Link>
                  </Button>
                )}
              />
            </Card>
          </>
        )}
      </PageState>
    </StateDiscoShell>
  )
}
