import { Mail } from 'lucide-react'
import type { OverdueItem } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useOverdueSubmissions, useSubmissionFilters } from '../api'
import { ListState } from '../components/list-state'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { WorkflowStatusBadge } from '../components/workflow-status'
import { useWorkflowQuery } from '../use-workflow-query'

const columns: Column<OverdueItem>[] = [
  {
    id: 'dataset', header: 'Obligation',
    cell: (row) => <><p className="font-medium">{row.dataset}</p><p className="text-xs text-text-muted">{row.institution}</p></>,
    sortValue: (row) => row.dataset,
  },
  { id: 'period', header: 'Period', cell: (row) => row.reportingPeriod },
  { id: 'due', header: 'Due date', cell: (row) => row.dueDateLabel, sortValue: (row) => row.dueDate },
  { id: 'delay', header: 'Compliance position', cell: (row) => <><WorkflowStatusBadge status={row.status} /><p className="mt-1 text-xs text-text-muted">{row.overdueLabel}</p></> },
  { id: 'owner', header: 'Submission owner', cell: (row) => row.owner },
]

export function OverduePage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useOverdueSubmissions(state.query)
  const error = filters.error ?? list.error

  return (
    <WorkflowShell title="Overdue & missing" description="Server-ranked reporting obligations that require follow-up.">
      {filters.data && <WorkflowFilters options={filters.data} query={state.query} onChange={state.update} onReset={state.reset} />}
      <ListState pending={filters.isPending || list.isPending} error={error} retry={() => void list.refetch()}>
        {list.data && (
          <Card className="p-3">
            <DataTable
              caption="Overdue and missing submissions"
              columns={columns}
              rows={list.data.items}
              getRowId={(row) => row.id}
              rowActions={(row) => row.availableActions.includes('contact-owner') && (
                <Button aria-label={`Contact ${row.owner}`} size="icon" variant="ghost"><Mail /></Button>
              )}
            />
            <Pagination {...list.data} onPageChange={state.setPage} />
          </Card>
        )}
      </ListState>
    </WorkflowShell>
  )
}
