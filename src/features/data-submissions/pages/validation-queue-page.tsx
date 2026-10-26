import { ClipboardCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import type { ValidationQueueItem } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { usePrefetchSubmissionReview, useSubmissionFilters, useValidationQueue } from '../api'
import { ListState } from '../components/list-state'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { WorkflowStatusBadge } from '../components/workflow-status'
import { useWorkflowQuery } from '../use-workflow-query'
import { PublishConfirmationBanner } from './publish-confirmation-banner'

const columns: Column<ValidationQueueItem>[] = [
  // The dataset leads instead of the submission code. A row is identified by
  // dataset plus the institution and period columns beside it; the code is on
  // the submission's own review page.
  {
    id: 'submission', header: 'Submission',
    cell: (row) => <p className="font-medium">{row.dataset}</p>,
    sortValue: (row) => row.dataset,
  },
  { id: 'institution', header: 'Institution', cell: (row) => row.institution, sortValue: (row) => row.institution },
  { id: 'period', header: 'Period', cell: (row) => row.reportingPeriod },
  { id: 'check', header: 'Automated check', cell: (row) => <><WorkflowStatusBadge status={row.automatedCheck} /><p className="mt-1 text-xs text-text-muted">{row.issueCount} issues</p></> },
  { id: 'reviewer', header: 'Reviewer', cell: (row) => row.reviewer },
  { id: 'age', header: 'Queue age', cell: (row) => row.ageLabel },
  { id: 'status', header: 'Status', cell: (row) => <WorkflowStatusBadge status={row.status} /> },
]

export function ValidationQueuePage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useValidationQueue(state.query)
  const prefetchReview = usePrefetchSubmissionReview()
  const error = filters.error ?? list.error
  const location = useLocation()
  const publishedMessage =
    typeof location.state === 'object' &&
    location.state !== null &&
    'publishedMessage' in location.state &&
    typeof location.state.publishedMessage === 'string'
      ? location.state.publishedMessage
      : null

  return (
    <WorkflowShell title="Validation queue" description="Review server validation results and record a controlled publication decision.">
      {publishedMessage && <PublishConfirmationBanner message={publishedMessage} />}
      {filters.data && <WorkflowFilters options={filters.data} query={state.query} onChange={state.update} onReset={state.reset} />}
      <ListState pending={filters.isPending || list.isPending} error={error} retry={() => void list.refetch()}>
        {list.data && (
          <Card className="p-3">
            <DataTable
              caption="Validation queue"
              columns={columns}
              rows={list.data.items}
              getRowId={(row) => row.id}
              rowActions={(row) => (
                <Button asChild size="sm">
                  <Link
                    to={`/data-submissions/validation/${row.id}`}
                    onPointerEnter={() => prefetchReview(row.id)}
                    onFocus={() => prefetchReview(row.id)}
                  >
                    <ClipboardCheck />Review
                  </Link>
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
