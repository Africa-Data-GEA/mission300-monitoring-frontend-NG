import { Eye } from 'lucide-react'
import { Link } from 'react-router'
import type { SubmissionListItem } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useSubmissions, useSubmissionFilters } from '../api'
import { ListState } from '../components/list-state'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { WorkflowStatusBadge } from '../components/workflow-status'
import { useWorkflowQuery } from '../use-workflow-query'

const columns: Column<SubmissionListItem>[] = [
  // The dataset leads instead of the submission code. A row is identified by
  // dataset plus the institution and period columns beside it; the code is on
  // the submission's own detail page.
  {
    id: 'submission', header: 'Submission',
    cell: (row) => <p className="font-medium">{row.dataset}</p>,
    sortValue: (row) => row.dataset,
  },
  { id: 'institution', header: 'Institution', cell: (row) => row.institution, sortValue: (row) => row.institution },
  { id: 'period', header: 'Period', cell: (row) => row.reportingPeriod },
  { id: 'method', header: 'Method', cell: (row) => row.methodLabel },
  { id: 'version', header: 'Version', cell: (row) => `v${row.version}`, align: 'right' },
  { id: 'submitted', header: 'Submitted', cell: (row) => row.submittedAtLabel, sortValue: (row) => row.submittedAt },
  { id: 'status', header: 'Status', cell: (row) => <><WorkflowStatusBadge status={row.status} /><p className="mt-1 text-xs text-text-muted">{row.validationSummary}</p></> },
]

export function SubmissionsPage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useSubmissions(state.query)
  const error = filters.error ?? list.error

  return (
    <WorkflowShell title="Submission history" description="Track every draft and submitted version without overwriting the audit trail.">
      {filters.data && <WorkflowFilters options={filters.data} query={state.query} onChange={state.update} onReset={state.reset} />}
      <ListState pending={filters.isPending || list.isPending} error={error} retry={() => void list.refetch()}>
        {list.data && (
          <Card className="p-3">
            <DataTable
              caption="Submission history"
              columns={columns}
              rows={list.data.items}
              getRowId={(row) => row.id}
              rowActions={(row) => (
                <Button asChild size="icon" variant="ghost">
                  <Link aria-label={`View ${row.id}`} to={`/data-submissions/validation/${row.id}`}><Eye /></Link>
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
