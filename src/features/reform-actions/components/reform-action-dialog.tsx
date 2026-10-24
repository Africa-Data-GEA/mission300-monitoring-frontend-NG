import type { ReformActionsOverview } from '@/api/schemas/reform-actions'
import { SideDialog } from '@/components/ui/side-dialog'
import { useReformActionDetail } from '../api'
import { ReformActionForm } from './reform-action-form'

export type ReformDialogTarget = { mode: 'create' } | { mode: 'edit'; id: string } | null

/** Records a new reform action, or edits an existing one together with its
 * status history. */
export function ReformActionDialog({
  target,
  filters,
  defaultPillar,
  onClose,
  onSaved,
}: {
  target: ReformDialogTarget
  filters: ReformActionsOverview['filters']
  defaultPillar: string
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const editingId = target?.mode === 'edit' ? target.id : null
  const detail = useReformActionDetail(editingId)
  const ready = target?.mode === 'create' || (target?.mode === 'edit' && detail.data)

  return (
    <SideDialog
      open={target !== null}
      onClose={onClose}
      title={target?.mode === 'edit' ? 'Edit reform action' : 'Record a reform action'}
      description="Reform actions track the policy and institutional commitments alongside programme delivery."
    >
      {target?.mode === 'edit' && detail.isError ? (
        <p className="p-7 text-sm text-status-at-risk">{detail.error.message}</p>
      ) : null}
      {ready ? (
        <ReformActionForm
          key={target?.mode === 'edit' ? target.id : 'new'}
          action={target?.mode === 'edit' ? (detail.data ?? null) : null}
          filters={filters}
          defaultPillar={defaultPillar}
          onSaved={onSaved}
          onCancel={onClose}
        />
      ) : null}
    </SideDialog>
  )
}
