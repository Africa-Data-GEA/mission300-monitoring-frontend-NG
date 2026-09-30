import { NotebookPen } from 'lucide-react'
import { useState } from 'react'
import type { LearningLogEntry } from '@/api/schemas/learning-log'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { PageLoading } from '@/components/ui/page-loading'
import { useDeleteLearningLogEntry, useLearningLog } from './api'
import { CreateLearningLogEntryDialog } from './components/create-learning-log-entry-dialog'
import { EditLearningLogEntryDialog } from './components/edit-learning-log-entry-dialog'
import { LearningLogTable } from './components/learning-log-table'

/**
 * The Learning & Decision Log — added per the SE4ALL MRL alignment review
 * (docs/se4all-mrl-alignment-renewable-private-capital.md). Bottlenecks &
 * Exceptions tracks what's currently blocked; this tracks course-correction
 * decisions themselves, which had no dedicated record anywhere before.
 */
export function LearningLogPage() {
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<LearningLogEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<LearningLogEntry | null>(null)
  const { data, isPending, isError, error, refetch } = useLearningLog(page)
  const deleteMutation = useDeleteLearningLogEntry()

  if (isPending) return <PageLoading label="Loading learning log" />

  if (isError) {
    return (
      <ErrorState
        title="Learning log could not be loaded"
        message={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  async function confirmDelete() {
    if (!deleteEntry) return
    await deleteMutation.mutateAsync(deleteEntry.id)
    setDeleteEntry(null)
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Breadcrumb items={[{ label: 'Data operations' }, { label: 'Learning & decision log' }]} />
          <div className="mt-2 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700">
              <NotebookPen aria-hidden="true" className="size-5" />
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-text-default">
              Learning &amp; decision log
            </h1>
          </div>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Log a decision
        </Button>
      </div>

      <LearningLogTable
        entries={data.entries.items}
        page={data.entries.page}
        pageSize={data.entries.pageSize}
        total={data.entries.total}
        onPageChange={setPage}
        onEdit={setEditEntry}
        onDelete={setDeleteEntry}
      />

      <CreateLearningLogEntryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          void refetch()
        }}
      />

      <EditLearningLogEntryDialog
        entry={editEntry}
        onClose={() => setEditEntry(null)}
        onUpdated={() => {
          setEditEntry(null)
          void refetch()
        }}
      />

      <ConfirmDialog
        open={deleteEntry !== null}
        title="Delete this entry?"
        description={
          deleteEntry
            ? `"${deleteEntry.title}" will be permanently removed from the learning log. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteEntry(null)}
      />
    </div>
  )
}
