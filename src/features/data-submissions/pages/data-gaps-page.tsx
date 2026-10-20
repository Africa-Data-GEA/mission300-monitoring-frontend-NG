import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import type { DataGap } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useDataGaps, useSubmissionFilters } from '../api'
import { ListState } from '../components/list-state'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { WorkflowStatusBadge } from '../components/workflow-status'
import { useWorkflowQuery } from '../use-workflow-query'

const columns: Column<DataGap>[] = [
  {
    id: 'kpi', header: 'KPI',
    cell: (row) => <><p className="font-medium">{row.kpiName}</p><p className="text-xs text-text-muted">{row.kpiId}</p></>,
    sortValue: (row) => row.kpiId,
  },
  { id: 'pillar', header: 'Pillar', cell: (row) => row.pillar },
  { id: 'frequency', header: 'Reporting', cell: (row) => row.reportingPeriod },
  { id: 'category', header: 'Gap category', cell: (row) => <><p>{row.category}</p><p className="text-xs text-text-muted">{row.readinessTier}</p></> },
  { id: 'owner', header: 'Owner', cell: (row) => row.owner },
  { id: 'action', header: 'Next action', cell: (row) => row.nextAction, className: 'min-w-64' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => row.status ? <WorkflowStatusBadge status={row.status} /> : <span className="text-text-muted">No obligation</span>,
  },
]

export function DataGapsPage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useDataGaps(state.query)
  const error = filters.error ?? list.error
  const canFilterByInstitution = (filters.data?.institutions.length ?? 0) > 2

  return (
    <WorkflowShell title="Data gaps" description="Trace missing or unusable KPI observations to an owner and next action.">
      {filters.data && (
        <WorkflowFilters
          options={filters.data}
          query={state.query}
          onChange={state.update}
          onReset={state.reset}
          only={canFilterByInstitution ? ['institution', 'readinessTier'] : ['readinessTier']}
          searchPlaceholder="KPI, code or owner"
        />
      )}
      <ListState pending={filters.isPending || list.isPending} error={error} retry={() => void list.refetch()}>
        {list.data && (
          <Card className="p-3">
            <DataTable
              caption="KPI data gaps"
              columns={columns}
              rows={list.data.items}
              getRowId={(row) => row.id}
              rowActions={(row) => row.availableActions.includes('view') && (
                <Button asChild size="icon" variant="ghost">
                  <Link aria-label={`Open ${row.kpiId} in KPI Explorer`} to={`/kpis?kpi=${encodeURIComponent(row.kpiId)}`}><ExternalLink /></Link>
                </Button>
              )}
            />
            <Pagination {...list.data} onPageChange={state.setPage} />
          </Card>
        )}
      </ListState>
    </WorkflowShell>
  )
}
