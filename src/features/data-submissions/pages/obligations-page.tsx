import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useObligations, useSubmissionFilters } from '../api'
import { ListState } from '../components/list-state'
import { ObligationActions } from '../components/obligation-actions'
import { ObligationStats } from '../components/obligation-stats'
import { OBLIGATIONS_COLUMNS } from '../components/obligations-columns'
import { WorkflowFilters } from '../components/workflow-filters'
import { WorkflowShell } from '../components/workflow-shell'
import { useWorkflowQuery } from '../use-workflow-query'

export function ObligationsPage() {
  const state = useWorkflowQuery()
  const filters = useSubmissionFilters()
  const list = useObligations(state.query)
  const error = filters.error ?? list.error
  const session = readAuthSession()
  const isProvider = !!session && grantedRoles(session.user).includes('institutional-data-provider')

  return (
    <WorkflowShell
      title="Reporting obligations"
      description="Start an assigned return using guided entry or the controlled upload template."
    >
      {isProvider && (
        <Button asChild size="sm" variant="secondary" className="mb-3 w-fit">
          <Link to="/data-submissions/workbook">Upload one workbook for all datasets</Link>
        </Button>
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
          <Card className="p-3">
            <DataTable
              caption="Assigned reporting obligations"
              columns={OBLIGATIONS_COLUMNS}
              rows={list.data.items}
              getRowId={(row) => row.id}
              rowActions={(row) => <ObligationActions obligation={row} />}
            />
            <Pagination {...list.data} onPageChange={state.setPage} />
          </Card>
        )}
      </ListState>
    </WorkflowShell>
  )
}
