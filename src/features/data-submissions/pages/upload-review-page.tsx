import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import type { ValidationDecisionRequest } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { dashboardToast } from '@/lib/dashboard-toast'
import { useBulkValidationDecision, useUploadBatch } from '../api'
import { BulkDecisionBar } from '../components/bulk-decision-bar'
import { ListState } from '../components/list-state'
import { UploadValuesTable } from '../components/upload-values-table'
import { WorkflowShell } from '../components/workflow-shell'

export function UploadReviewPage() {
  const batchId = useParams().batchId ?? ''
  const batch = useUploadBatch(batchId)
  const bulkDecision = useBulkValidationDecision()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll(ids: string[]) {
    setSelected((current) => new Set([...current, ...ids]))
  }

  function decide(input: Pick<ValidationDecisionRequest, 'decision' | 'comments'>) {
    bulkDecision.mutate(
      { submissionIds: [...selected], ...input },
      {
        onSuccess: (result) => {
          setSelected(new Set())
          void batch.refetch()
          if (result.failedCount === 0) dashboardToast.success('Decision recorded', { description: result.message })
          else dashboardToast.warning('Some decisions failed', { description: result.message })
        },
      },
    )
  }

  const data = batch.data
  const allPending = data
    ? data.datasets.flatMap((dataset) => dataset.rows.filter((row) => row.canDecide).map((row) => row.id))
    : []

  return (
    <WorkflowShell title="Upload review" description="Everything that came in with this upload, with the values to check before you decide.">
      <Button asChild size="sm" variant="secondary" className="mb-3 w-fit">
        <Link to="/data-submissions/validation"><ArrowLeft />All uploads</Link>
      </Button>
      <ListState pending={batch.isPending} error={batch.error} retry={() => void batch.refetch()}>
        {data && (
          <div className="flex flex-col gap-4">
            <Card className="grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-text-muted">Submitted by</p><p className="font-medium">{data.submittedBy}</p></div>
              <div><p className="text-text-muted">Submitted</p><p className="font-medium">{data.submittedAtLabel}</p></div>
              <div><p className="text-text-muted">Source reference</p><p className="font-medium">{data.sourceReference || '-'}</p></div>
              <div><p className="text-text-muted">File</p><p className="font-medium">{data.fileName ?? '-'}</p></div>
              <div><p className="text-text-muted">Submissions</p><p className="font-medium">{data.total} ({data.pending} waiting for a decision)</p></div>
              {data.notes && <div className="sm:col-span-2"><p className="text-text-muted">Notes</p><p className="font-medium">{data.notes}</p></div>}
              {allPending.length > 0 && (
                <div className="flex items-end">
                  <Button size="sm" type="button" onClick={() => selectAll(allPending)}>
                    Select everything waiting ({allPending.length})
                  </Button>
                </div>
              )}
            </Card>
            {selected.size > 0 && (
              <BulkDecisionBar
                selectedCount={selected.size}
                pending={bulkDecision.isPending}
                error={bulkDecision.error}
                onSubmit={decide}
                onClear={() => setSelected(new Set())}
              />
            )}
            {data.datasets.map((dataset) => (
              <UploadValuesTable key={dataset.name} dataset={dataset} selected={selected} onToggle={toggle} onSelectAll={selectAll} />
            ))}
          </div>
        )}
      </ListState>
    </WorkflowShell>
  )
}
