import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { ValidationDecisionRequest } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { dashboardToast } from '@/lib/dashboard-toast'
import { useBulkValidationDecision, useUploadBatch } from '../api'
import { ListState } from '../components/list-state'
import { UploadDecisionButtons } from '../components/upload-decision-buttons'
import { UploadMatrixTable } from '../components/upload-matrix-table'
import { WorkflowShell } from '../components/workflow-shell'
import { buildUploadMatrix } from '../lib/upload-matrix'

type Decision = ValidationDecisionRequest['decision']

const DEFAULT_APPROVAL_COMMENT = 'Reviewed and approved.'

export function UploadReviewPage() {
  const batchId = useParams().batchId ?? ''
  const batch = useUploadBatch(batchId)
  const bulkDecision = useBulkValidationDecision()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [comment, setComment] = useState('')

  const data = batch.data
  const matrix = useMemo(() => (data ? buildUploadMatrix(data.datasets) : null), [data])

  function toggle(ids: string[]) {
    setSelected((current) => {
      const next = new Set(current)
      const all = ids.every((id) => next.has(id))
      ids.forEach((id) => (all ? next.delete(id) : next.add(id)))
      return next
    })
  }

  function decide(ids: string[], decision: Decision) {
    const text = comment.trim() || (decision === 'approved' ? DEFAULT_APPROVAL_COMMENT : '')
    if (text.length < 3) {
      dashboardToast.warning('Add a comment', { description: 'Say why you are returning or rejecting, so the provider knows what to fix.' })
      return
    }
    bulkDecision.mutate(
      { submissionIds: ids, decision, comments: text },
      {
        onSuccess: (result) => {
          setSelected(new Set())
          setComment('')
          void batch.refetch()
          if (result.failedCount === 0) dashboardToast.success('Decision recorded', { description: result.message })
          else dashboardToast.warning('Some decisions failed', { description: result.message })
        },
      },
    )
  }

  return (
    <WorkflowShell title="Upload review" description="One upload, everything in it. Check the values, then decide the whole upload, a dataset, or just the rows you pick.">
      <Button asChild size="sm" variant="secondary" className="mb-3 w-fit">
        <Link to="/data-submissions/validation"><ArrowLeft />All uploads</Link>
      </Button>
      <ListState pending={batch.isPending} error={batch.error} retry={() => void batch.refetch()}>
        {data && matrix && (
          <div className="flex flex-col gap-4">
            <Card className="grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-text-muted">Submitted by</p><p className="font-medium">{data.submittedBy}</p></div>
              <div><p className="text-text-muted">Submitted</p><p className="font-medium">{data.submittedAtLabel}</p></div>
              <div><p className="text-text-muted">Source reference</p><p className="font-medium">{data.sourceReference || '-'}</p></div>
              <div><p className="text-text-muted">File</p><p className="font-medium">{data.fileName ?? '-'}</p></div>
              <div><p className="text-text-muted">Contents</p><p className="font-medium">{matrix.groups.length} dataset{matrix.groups.length === 1 ? '' : 's'}, {data.total} submissions ({data.pending} waiting)</p></div>
              {data.notes && <div className="sm:col-span-3"><p className="text-text-muted">Notes</p><p className="font-medium">{data.notes}</p></div>}
            </Card>

            <UploadMatrixTable matrix={matrix} selected={selected} onToggle={toggle} />

            <Card className="sticky bottom-2 z-10 flex flex-col gap-3 p-4">
              <label className="text-sm font-medium" htmlFor="upload-review-comment">
                Comment
                <span className="ml-2 font-normal text-text-muted">Optional for approval, required to return or reject.</span>
                <input
                  id="upload-review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 font-normal"
                />
              </label>

              <div className="flex flex-col gap-3">
                <UploadDecisionButtons
                  label="whole upload"
                  pendingCount={matrix.decidableIds.length}
                  busy={bulkDecision.isPending}
                  onDecide={(decision) => decide(matrix.decidableIds, decision)}
                />
                {selected.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border-default pt-3">
                    <UploadDecisionButtons
                      label="selected"
                      pendingCount={selected.size}
                      busy={bulkDecision.isPending}
                      onDecide={(decision) => decide([...selected], decision)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} type="button">Clear selection</Button>
                  </div>
                )}
                {matrix.groups.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-3">
                    <span className="text-xs font-medium text-text-muted">By dataset</span>
                    {matrix.groups.map((group) => (
                      <div key={group.name} className="flex items-center gap-1 rounded-control border border-border-default px-2 py-1 text-xs">
                        <span className="font-medium">{group.name}</span>
                        {group.decidableIds.length > 0 ? (
                          <>
                            <Button size="sm" variant="ghost" disabled={bulkDecision.isPending} onClick={() => decide(group.decidableIds, 'approved')} type="button">
                              Approve ({group.decidableIds.length})
                            </Button>
                            <Button size="sm" variant="ghost" disabled={bulkDecision.isPending} onClick={() => decide(group.decidableIds, 'returned')} type="button">Return</Button>
                            <Button size="sm" variant="ghost" disabled={bulkDecision.isPending} onClick={() => decide(group.decidableIds, 'rejected')} type="button">Reject</Button>
                          </>
                        ) : (
                          <span className="text-text-muted">decided</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {bulkDecision.error && <p className="text-sm text-status-at-risk" role="alert">{bulkDecision.error.message}</p>}
            </Card>
          </div>
        )}
      </ListState>
    </WorkflowShell>
  )
}
