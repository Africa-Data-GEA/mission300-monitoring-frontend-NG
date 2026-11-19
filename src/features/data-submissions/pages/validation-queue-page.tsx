import { ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import type { ValidationDecisionRequest, ValidationQueueItem } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { dashboardToast } from '@/lib/dashboard-toast'
import { useBulkValidationDecision, usePrefetchSubmissionReview, useSubmissionFilters, useValidationQueue } from '../api'
import { BulkDecisionBar } from '../components/bulk-decision-bar'
import { ListState } from '../components/list-state'
import { QueueSelectionBar } from '../components/queue-selection-bar'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { WorkflowStatusBadge } from '../components/workflow-status'
import { useWorkflowQuery } from '../use-workflow-query'
import { PublishConfirmationBanner } from './publish-confirmation-banner'

function buildColumns(selected: ReadonlySet<string>, toggle: (id: string) => void): Column<ValidationQueueItem>[] {
  return [
  {
    id: 'select',
    header: '',
    cell: (row) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.dataset} for ${row.institution} for bulk decision`}
        checked={selected.has(row.id)}
        onChange={() => toggle(row.id)}
        className="size-4"
      />
    ),
  },
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
}

export function ValidationQueuePage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useValidationQueue(state.query)
  const prefetchReview = usePrefetchSubmissionReview()
  const error = filters.error ?? list.error
  const location = useLocation()
  const bulkDecision = useBulkValidationDecision()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const items = list.data?.items ?? []
  const passedIds = items.filter((row) => row.automatedCheck.code === 'pass' && row.issueCount === 0).map((row) => row.id)

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addToSelection(ids: string[]) {
    setSelected((current) => new Set([...current, ...ids]))
  }

  function handleBulkSubmit(input: Pick<ValidationDecisionRequest, 'decision' | 'comments'>) {
    bulkDecision.mutate(
      { submissionIds: [...selected], ...input },
      {
        onSuccess: (result) => {
          setSelected(new Set())
          if (result.failedCount === 0) dashboardToast.success('Decision recorded', { description: result.message })
          else dashboardToast.warning('Some decisions failed', { description: result.message })
        },
      },
    )
  }

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
      {selected.size > 0 && (
        <BulkDecisionBar
          selectedCount={selected.size}
          pending={bulkDecision.isPending}
          error={bulkDecision.error}
          onSubmit={handleBulkSubmit}
          onClear={() => setSelected(new Set())}
        />
      )}
      <ListState pending={filters.isPending || list.isPending} error={error} retry={() => void list.refetch()}>
        {list.data && (
          <Card className="p-3">
            <QueueSelectionBar
              pageCount={items.length}
              passedCount={passedIds.length}
              selectedCount={selected.size}
              pageSize={state.query.pageSize}
              onSelectPage={() => addToSelection(items.map((row) => row.id))}
              onSelectPassed={() => addToSelection(passedIds)}
              onPageSizeChange={(pageSize) => state.update({ ...state.query, pageSize })}
            />
            <DataTable
              caption="Validation queue"
              columns={buildColumns(selected, toggle)}
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
