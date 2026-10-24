import { Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { ReformAction } from '@/api/schemas/reform-actions'
import { REFORM_STATUS_OPTIONS } from '@/api/schemas/reform-actions'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { PageLoading } from '@/components/ui/page-loading'
import { SelectField } from '@/components/ui/select-field'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
import { useDeleteReformAction, useReformActions } from './api'
import { ReformActionDialog, type ReformDialogTarget } from './components/reform-action-dialog'
import { ReformActionsTable } from './components/reform-actions-table'
import { ReformSummaryCards } from './components/reform-summary-cards'

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'priority', label: 'Priority actions' },
  { value: 'other', label: 'Other actions' },
]

const ALL = { value: 'all', label: 'All' }

/**
 * Reform actions: the policy and institutional commitments of the Compact,
 * tracked alongside programme delivery, with a priority flag, a status and a
 * status history (REQ-004). The Compact Progress Report reads its reform
 * overview and priority tables from here.
 */
export function ReformActionsPage() {
  const session = readAuthSession()
  const canEdit = !!session && canUserReachModule(session.user, 'reform-admin')
  const [page, setPage] = useState(1)
  const [pillar, setPillar] = useState('all')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [target, setTarget] = useState<ReformDialogTarget>(null)
  const [toDelete, setToDelete] = useState<ReformAction | null>(null)
  const query = { page, pillar, priority, status, search }
  const { data, isPending, isError, error, refetch } = useReformActions(query)
  const deleteMutation = useDeleteReformAction()

  if (isPending) return <PageLoading label="Loading reform actions" />

  if (isError) {
    return (
      <ErrorState title="Reform actions could not be loaded" message={error.message} onRetry={() => void refetch()} />
    )
  }

  function filter(apply: () => void) {
    apply()
    setPage(1)
  }

  async function confirmDelete() {
    if (!toDelete) return
    await deleteMutation.mutateAsync(toDelete.id)
    setToDelete(null)
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Breadcrumb items={[{ label: 'Programs' }, { label: 'Reform actions' }]} />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">Reform actions</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            Policy and institutional reforms, tracked by pillar with a priority, a status and a history of every
            change.
          </p>
        </div>
        {canEdit ? (
          <Button type="button" onClick={() => setTarget({ mode: 'create' })}>
            <Plus aria-hidden="true" />
            Record reform action
          </Button>
        ) : null}
      </div>

      <ReformSummaryCards summary={data.summary} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="Pillar"
          value={pillar}
          options={[ALL, ...data.filters.pillars]}
          onChange={(value) => filter(() => setPillar(value))}
        />
        <SelectField
          label="Priority"
          value={priority}
          options={PRIORITY_OPTIONS}
          onChange={(value) => filter(() => setPriority(value))}
        />
        <SelectField
          label="Status"
          value={status}
          options={[ALL, ...REFORM_STATUS_OPTIONS]}
          onChange={(value) => filter(() => setStatus(value))}
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted" htmlFor="reform-search">
            Search
          </label>
          <input
            id="reform-search"
            className="h-10 rounded-control border border-border-strong bg-surface px-3 text-sm text-text-default"
            placeholder="Action, commitment or institution"
            value={search}
            onChange={(event) => filter(() => setSearch(event.target.value))}
          />
        </div>
      </div>

      <ReformActionsTable
        actions={data.actions.items}
        page={data.actions.page}
        pageSize={data.actions.pageSize}
        total={data.actions.total}
        canEdit={canEdit}
        onPageChange={setPage}
        onEdit={(action) => setTarget({ mode: 'edit', id: action.id })}
        onDelete={setToDelete}
      />

      <ReformActionDialog
        key={target ? (target.mode === 'edit' ? target.id : 'new') : 'closed'}
        target={target}
        filters={data.filters}
        defaultPillar={pillar === 'all' ? (data.filters.pillars[0]?.value ?? '') : pillar}
        onClose={() => setTarget(null)}
        onSaved={(message) => {
          setTarget(null)
          toast.success(message)
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Remove this reform action?"
        description={toDelete ? `"${toDelete.action}" and its status history will be permanently removed.` : undefined}
        confirmLabel="Remove"
        isPending={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
