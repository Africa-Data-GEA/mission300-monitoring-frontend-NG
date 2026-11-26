import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { useReminderOverview, useSetRemindersEnabled } from '../reminders-api'
import { ReminderPreviewList } from './reminder-preview-list'
import { ReminderScheduleTable } from './reminder-schedule-table'

const formatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export function RemindersPanel() {
  const overview = useReminderOverview()
  const save = useSetRemindersEnabled()
  const [confirming, setConfirming] = useState(false)

  if (overview.isPending) {
    return <p className="py-8 text-center text-sm text-text-muted">Loading reminders…</p>
  }
  if (overview.isError) {
    return (
      <ErrorState
        title="Reminders could not be loaded"
        message={overview.error.message}
        onRetry={() => void overview.refetch()}
      />
    )
  }

  const data = overview.data
  const count = data.recipients.length

  function apply(enabled: boolean) {
    save.mutate(enabled, {
      onSuccess: () => {
        setConfirming(false)
        toast.success(enabled ? 'Reminders switched on' : 'Reminders switched off')
      },
      onError: (error) => {
        setConfirming(false)
        toast.error(error instanceof Error ? error.message : 'The setting could not be saved.')
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-default">
            Data reminders are {data.enabled ? 'on' : 'off'}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Each person gets at most one summary a day, by email and in the app, from 8:00 am Nigeria
            time.
          </p>
          {data.updatedAt && (
            <p className="mt-1 text-xs text-text-subtle">
              Last changed {formatter.format(new Date(data.updatedAt))}
              {data.updatedByName ? ` by ${data.updatedByName}` : ''}
            </p>
          )}
          <p className="mt-1 text-xs text-text-subtle">
            {data.lastRunAt
              ? `Last sent ${formatter.format(new Date(data.lastRunAt))}: ${data.lastSent} delivered, ${data.lastFailed} failed`
              : 'No reminders have been sent yet.'}
          </p>
        </div>
        <Button
          type="button"
          variant={data.enabled ? 'secondary' : 'primary'}
          disabled={save.isPending}
          onClick={() => (data.enabled ? apply(false) : setConfirming(true))}
        >
          {data.enabled ? 'Switch off' : 'Switch on'}
        </Button>
      </div>

      {!data.emailConfigured && (
        <p role="alert" className="text-sm text-status-at-risk">
          Email delivery is not set up on the server, so reminders would only appear in the app.
        </p>
      )}

      <ReminderScheduleTable />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-text-default">
          Next reminders ({count} {count === 1 ? 'person' : 'people'})
        </h3>
        <ReminderPreviewList recipients={data.recipients} />
      </div>

      <ConfirmDialog
        open={confirming}
        title="Switch on data reminders?"
        description={`${count} ${count === 1 ? 'person is' : 'people are'} due a reminder now. The first summaries go out within an hour, after 8:00 am Nigeria time.`}
        confirmLabel="Switch on"
        isDestructive={false}
        isPending={save.isPending}
        onConfirm={() => apply(true)}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
