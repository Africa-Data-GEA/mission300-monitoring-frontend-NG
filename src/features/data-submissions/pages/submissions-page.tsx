import { Eye, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { SubmissionListItem, ValidationDecisionRequest } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { useBulkValidationDecision, useSubmissions, useSubmissionFilters } from '../api'
import { BulkDecisionBar } from '../components/bulk-decision-bar'
import { ListState } from '../components/list-state'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { WorkflowStatusBadge } from '../components/workflow-status'
import { useWorkflowQuery } from '../use-workflow-query'

const REVIEW_ROLES = ['data-reviewer', 'validator', 'system-administrator']

function buildColumns(
  canBulkDecide: boolean,
  selected: ReadonlySet<string>,
  toggle: (id: string) => void,
): Column<SubmissionListItem>[] {
  const checkboxColumn: Column<SubmissionListItem>[] = canBulkDecide
    ? [
        {
          id: 'select',
          header: '',
          cell: (row) =>
            row.status.code === 'pending-review' ? (
              <input
                type="checkbox"
                aria-label={`Select ${row.dataset} for bulk decision`}
                checked={selected.has(row.id)}
                onChange={() => toggle(row.id)}
                className="size-4"
              />
            ) : null,
        },
      ]
    : []

  return [
    ...checkboxColumn,
    // The dataset leads instead of the submission code. A row is identified by
    // dataset plus the institution and period columns beside it; the code is on
    // the submission's own detail page.
    {
      id: 'submission', header: 'Submission',
      cell: (row) => <p className="font-medium">{row.dataset}</p>,
      sortValue: (row) => row.dataset,
    },
    { id: 'institution', header: 'Institution', cell: (row) => row.institution, sortValue: (row) => row.institution },
    // Stakeholder feedback asked to clearly see who submitted each row —
    // `submittedBy` already existed on the schema, just wasn't a column here.
    { id: 'lead', header: 'Submitted by', cell: (row) => row.submittedBy, sortValue: (row) => row.submittedBy },
    { id: 'period', header: 'Period', cell: (row) => row.reportingPeriod },
    { id: 'method', header: 'Method', cell: (row) => row.methodLabel },
    { id: 'version', header: 'Version', cell: (row) => `v${row.version}`, align: 'right' },
    { id: 'submitted', header: 'Submitted', cell: (row) => row.submittedAtLabel, sortValue: (row) => row.submittedAt },
    { id: 'status', header: 'Status', cell: (row) => <><WorkflowStatusBadge status={row.status} /><p className="mt-1 text-xs text-text-muted">{row.validationSummary}</p></> },
  ]
}

export function SubmissionsPage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useSubmissions(state.query)
  const error = filters.error ?? list.error
  const session = readAuthSession()
  // The detail route is reviewer/validator-only (rolePage(REVIEWERS, ...) in
  // routes.tsx) — this history table is shared with providers, so the "View"
  // action would otherwise link everyone straight to /access-denied. Bulk
  // decisions carry the exact same role gate as recording one individually.
  const canOpenDetail = !!session && grantedRoles(session.user).some((role) => REVIEW_ROLES.includes(role))
  const canCorrect = !!session && grantedRoles(session.user).includes('institutional-data-provider')
  const canBulkDecide =
    !!session && grantedRoles(session.user).some((role) => role === 'data-reviewer' || role === 'validator')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const bulkDecision = useBulkValidationDecision()

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleBulkSubmit(input: Pick<ValidationDecisionRequest, 'decision' | 'comments'>) {
    bulkDecision.mutate(
      { submissionIds: [...selected], ...input },
      { onSuccess: () => setSelected(new Set()) },
    )
  }

  const columns = buildColumns(canBulkDecide, selected, toggle)

  return (
    <WorkflowShell title="Submission history" description="Track every draft and submitted version without overwriting the audit trail.">
      {filters.data && <WorkflowFilters options={filters.data} query={state.query} onChange={state.update} onReset={state.reset} />}
      {canBulkDecide && selected.size > 0 && (
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
            <DataTable
              caption="Submission history"
              columns={columns}
              rows={list.data.items}
              getRowId={(row) => row.id}
              rowActions={canOpenDetail || canCorrect ? (row) => (
                <div className="flex justify-end gap-1">
                  {canCorrect && row.obligationId && row.availableActions.includes('correct') && (
                    <Button asChild size="sm">
                      <Link to={`/data-submissions/obligations/${row.obligationId}/upload`}>
                        <FileSpreadsheet />
                        Correct and resubmit
                      </Link>
                    </Button>
                  )}
                  {canOpenDetail && (
                    <Button asChild size="icon" variant="ghost">
                      <Link aria-label={`View ${row.id}`} to={`/data-submissions/validation/${row.id}`}><Eye /></Link>
                    </Button>
                  )}
                </div>
              ) : undefined}
            />
            <Pagination {...list.data} onPageChange={state.setPage} />
          </Card>
        )}
      </ListState>
    </WorkflowShell>
  )
}
