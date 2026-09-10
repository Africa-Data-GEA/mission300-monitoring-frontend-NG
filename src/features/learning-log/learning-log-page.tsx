import { useState } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useLearningLog } from './api'
import { CreateLearningLogEntryDialog } from './components/create-learning-log-entry-dialog'
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
  const { data, isPending, isError, error, refetch } = useLearningLog(page)

  if (isPending) return <Skeleton className="h-96 w-full rounded-card" />

  if (isError) {
    return (
      <ErrorState
        title="Learning log could not be loaded"
        message={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Breadcrumb items={[{ label: 'Data operations' }, { label: 'Learning & decision log' }]} />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
            Learning &amp; decision log
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            Course-correction decisions and their rationale — distinct from Bottlenecks &amp;
            Exceptions, which tracks what&apos;s currently blocked, not why a methodology or
            record changed.
          </p>
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
      />

      <CreateLearningLogEntryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          void refetch()
        }}
      />
    </div>
  )
}
