import { useParams } from 'react-router'
import type { StateDetail, StateHistoryPoint } from '@/api/schemas/state-disco'
import type { Column } from '@/components/ui/data-table'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { useStateDetail } from '../api'
import { PageState } from '../components/page-state'
import { StateDiscoShell } from '../components/state-disco-shell'

type RecordRow = StateDetail['records'][number]
const columns: Column<RecordRow>[] = [
  { id: 'type', header: 'Record type', cell: (row) => row.type },
  { id: 'name', header: 'Programme, project or bottleneck', cell: (row) => row.name, className: 'min-w-60' },
  { id: 'owner', header: 'Owner', cell: (row) => row.owner },
  { id: 'status', header: 'Status', cell: (row) => row.status },
  { id: 'delivery', header: 'Delivery position', cell: (row) => row.deliveryLabel },
  { id: 'source', header: 'Source', cell: (row) => row.sourceLabel },
]

const numberFormatter = new Intl.NumberFormat('en-NG')

/** Stakeholder feedback asked for a history view of past data, not only the
 * current aggregate snapshot the coverage table shows. */
const historyColumns: Column<StateHistoryPoint>[] = [
  { id: 'period', header: 'Reporting period', cell: (row) => row.period },
  {
    id: 'mini-grid',
    header: 'Mini-grid connections',
    align: 'right',
    cell: (row) => numberFormatter.format(row.miniGridConnections),
  },
  {
    id: 'shs',
    header: 'Solar Home Systems',
    align: 'right',
    cell: (row) => numberFormatter.format(row.solarHomeSystems),
  },
  {
    id: 'coverage',
    header: 'Validated coverage',
    align: 'right',
    cell: (row) => `${row.coverageBarPercent}%`,
  },
]

export function StateDetailPage() {
  const id = useParams().stateId ?? ''
  const data = useStateDetail(id)
  return (
    <StateDiscoShell title={data.data?.meta.title ?? 'State delivery profile'} description={data.data?.meta.description ?? 'Loading approved state records.'}>
      <PageState pending={data.isPending} error={data.error} retry={() => void data.refetch()}>
        {data.data && (
          <>
            <Card className="bg-status-info/10 p-3 text-sm">{data.data.notice}</Card>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Mini-grid connections', data.data.state.miniGridConnections],
                ['Solar Home Systems', data.data.state.solarHomeSystems],
                ['Active programmes', data.data.state.activeProgrammes],
                ['Active projects', data.data.state.activeProjects],
                ['Open bottlenecks', data.data.state.openBottlenecks],
              ].map(([label, value]) => <Card className="p-4" key={label}><p className="text-xs text-text-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Card>)}
            </div>
            <Card className="p-3"><DataTable caption={`${data.data.state.state} delivery records`} columns={columns} rows={data.data.records} getRowId={(row) => row.id} /></Card>
            {data.data.history.length > 0 && (
              <Card className="p-3">
                <DataTable
                  caption={`${data.data.state.state} coverage history, oldest to newest`}
                  columns={historyColumns}
                  rows={data.data.history}
                  getRowId={(row) => row.period}
                />
              </Card>
            )}
          </>
        )}
      </PageState>
    </StateDiscoShell>
  )
}
