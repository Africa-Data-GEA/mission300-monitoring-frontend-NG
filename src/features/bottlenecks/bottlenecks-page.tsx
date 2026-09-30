import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { BottlenecksQuery } from '@/api/schemas/bottlenecks'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { SelectField } from '@/components/ui/select-field'
import { PageLoading } from '@/components/ui/page-loading'
import { useBottlenecks, useBottlenecksFilters } from './api'
import { BottleneckRegister } from './components/bottleneck-register'
import { CreateBottleneckDialog } from './components/create-bottleneck-dialog'

/**
 * The bottleneck and exception register.
 *
 * Review asked that a bottleneck shown on a Programs table link through to
 * "the issue/bottleneck register" (docs/M300 Monitoring Platform
 * Feedback.pptx, slide 12). No such route existed — the Executive Overview's
 * "Open the full register" link already pointed at /bottlenecks and 404'd —
 * so this page is that destination, reusing the same BottleneckRegister the
 * project detail page renders rather than a second table implementation.
 *
 * A `?id=` search param highlights and filters to one record, which is how
 * the cross-links from Programs arrive here.
 */
export function BottlenecksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusedId = searchParams.get('id') ?? ''

  const [severity, setSeverity] = useState('all')
  const [category, setCategory] = useState('all')
  const [institution, setInstitution] = useState('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: options } = useBottlenecksFilters()

  const query: BottlenecksQuery = useMemo(
    () => ({
      ...(severity !== 'all' && { severity }),
      ...(category !== 'all' && { category }),
      ...(institution !== 'all' && { institution }),
    }),
    [severity, category, institution],
  )

  const { data, isPending, isError, error, refetch } = useBottlenecks(query, {
    page,
    pageSize: 10,
    escalationPage: 1,
  })

  if (isPending) return <PageLoading label="Loading bottleneck register" />

  if (isError) {
    return (
      <ErrorState
        title="Bottleneck register could not be loaded"
        message={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  // A record arrived via ?id= — show just that one, with a way back to all.
  const records = focusedId
    ? data.register.items.filter((row) => row.id === focusedId)
    : data.register.items

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb
          items={[{ label: 'Delivery tracking' }, { label: 'Bottlenecks and exceptions' }]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Bottlenecks and exceptions
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          Every delivery constraint raised against a programme, project or indicator, with its
          severity, age and current follow-up.
        </p>
      </div>

      {focusedId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-brand-50 px-3 py-2 text-sm">
          <span className="text-brand-700">
            Showing one record: <span className="font-semibold">{focusedId}</span>
            {records.length === 0 && ' — no matching record in the register.'}
          </span>
          <button
            type="button"
            onClick={() => setSearchParams({}, { replace: true })}
            className="font-medium text-link underline underline-offset-4"
          >
            Show the full register
          </button>
        </div>
      )}

      {options && !focusedId && (
        <div className="flex flex-wrap items-end gap-3 rounded-control bg-surface-sunken p-3">
          <SelectField
            label="Severity"
            value={severity}
            options={options.severities}
            onChange={(value) => {
              setSeverity(value)
              setPage(1)
            }}
            className="min-w-44"
          />
          <SelectField
            label="Category"
            value={category}
            options={options.categories}
            onChange={(value) => {
              setCategory(value)
              setPage(1)
            }}
            className="min-w-48"
          />
          <SelectField
            label="Institution"
            value={institution}
            options={options.institutions}
            onChange={(value) => {
              setInstitution(value)
              setPage(1)
            }}
            className="min-w-52"
          />
        </div>
      )}

      <BottleneckRegister
        records={records}
        page={page}
        pageSize={data.register.pageSize}
        total={focusedId ? records.length : data.register.total}
        onPageChange={setPage}
        onRaiseBottleneck={() => setCreateOpen(true)}
      />

      <CreateBottleneckDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          void refetch()
        }}
        institutions={(options?.institutions ?? []).filter((option) => option.value !== 'all')}
      />
    </div>
  )
}
