import { Link } from 'react-router'
import type { Obligation } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { useObligations, useSubmissionFilters } from '../api'
import { ListState } from '../components/list-state'
import { ObligationStats } from '../components/obligation-stats'
import { ObligationGroup } from '../components/obligation-group'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { useWorkflowQuery } from '../use-workflow-query'

function groupByInstitution(items: Obligation[]) {
  const groups = new Map<string, Obligation[]>()
  for (const item of items) groups.set(item.institution, [...(groups.get(item.institution) ?? []), item])
  return [...groups]
}

export function ObligationsPage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useObligations({ ...state.query, pageSize: 100 })
  const error = filters.error ?? list.error
  const session = readAuthSession()
  const isProvider =
    !!session &&
    grantedRoles(session.user).some((role) => role === 'institutional-data-provider' || role === 'system-administrator')

  return (
    <WorkflowShell
      title="Reporting obligations"
      description="Start an assigned return using guided entry or the controlled upload template."
    >
      {isProvider && (
        <Card className="mb-3 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold text-text-default">Submit everything in one workbook</p>
            <p className="text-sm text-text-muted">
              One Excel file with a sheet per dataset, already listing your open periods. Fill in the numbers and upload it once.
            </p>
          </div>
          <Button asChild>
            <Link
              to="/data-submissions/workbook"
              onPointerEnter={() => void import('./workbook-upload-page')}
              onFocus={() => void import('./workbook-upload-page')}
            >
              Download and upload workbook
            </Link>
          </Button>
        </Card>
      )}
      {filters.data && (
        <WorkflowFilters
          options={filters.data}
          query={state.query}
          onChange={state.update}
          onReset={state.reset}
        />
      )}
      <ListState
        pending={filters.isPending || list.isPending}
        error={error}
        retry={() => void list.refetch()}
      >
        {list.data && <ObligationStats stats={list.data.stats} />}
        {list.data && (
          <div className="flex flex-col gap-3">
            {groupByInstitution(list.data.items).map(([institution, items]) => (
              <ObligationGroup key={institution} institution={institution} items={items} />
            ))}
            <Pagination {...list.data} onPageChange={state.setPage} />
          </div>
        )}
      </ListState>
    </WorkflowShell>
  )
}
