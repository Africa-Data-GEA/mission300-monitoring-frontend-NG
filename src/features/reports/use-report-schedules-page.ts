import { useState } from 'react'
import type { ReportSchedule, ReportScheduleInput, SendScheduleResult } from '@/api/schemas/report-schedules'
import { dashboardToast } from '@/lib/dashboard-toast'
import {
  useDeleteReportSchedule,
  useReportSchedules,
  useSaveReportSchedule,
  useSendReportSchedule,
} from './schedules-api'

function sendOutcome(
  result: SendScheduleResult,
  test: boolean,
): { tone: 'success' | 'warning' | 'error'; title: string; message: string } {
  const target = test ? 'to you' : `to ${result.recipientCount} ${result.recipientCount === 1 ? 'recipient' : 'recipients'}`
  if (result.status === 'sent') return { tone: 'success', title: 'Brief sent', message: `The brief was sent ${target}.` }
  if (result.status === 'partial') {
    return {
      tone: 'warning',
      title: 'Brief partly sent',
      message: `${result.failedCount} of ${result.recipientCount} could not be reached. ${result.error ?? ''}`.trim(),
    }
  }
  return { tone: 'error', title: 'Brief not sent', message: result.error ?? 'The brief could not be sent.' }
}

function reason(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useReportSchedulesPage() {
  const schedules = useReportSchedules()
  const save = useSaveReportSchedule()
  const remove = useDeleteReportSchedule()
  const send = useSendReportSchedule()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ReportSchedule | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ReportSchedule | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(schedule: ReportSchedule) {
    setEditing(schedule)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
  }

  async function saveSchedule(input: ReportScheduleInput) {
    try {
      await save.mutateAsync({ id: editing?.id ?? null, input })
      dashboardToast.success(editing ? 'Schedule updated' : 'Schedule created')
      setDialogOpen(false)
    } catch (error) {
      dashboardToast.error('Schedule not saved', { description: reason(error, 'The schedule could not be saved.') })
    }
  }

  async function toggle(schedule: ReportSchedule) {
    setBusyId(schedule.id)
    try {
      await save.mutateAsync({
        id: schedule.id,
        input: {
          name: schedule.name,
          cadence: schedule.cadence,
          ...(schedule.cadence === 'weekly' ? { dayOfWeek: schedule.dayOfWeek ?? 1 } : { dayOfMonth: schedule.dayOfMonth ?? 1 }),
          hourLagos: schedule.hourLagos,
          recipients: schedule.recipients,
          pillars: schedule.pillars,
          ...(schedule.institutionId ? { institutionId: schedule.institutionId } : {}),
          isActive: !schedule.isActive,
        },
      })
    } catch (error) {
      dashboardToast.error('Schedule not updated', { description: reason(error, 'The schedule could not be updated.') })
    } finally {
      setBusyId(null)
    }
  }

  async function sendBrief(schedule: ReportSchedule, test: boolean) {
    setBusyId(schedule.id)
    try {
      const outcome = sendOutcome(await send.mutateAsync({ id: schedule.id, test }), test)
      dashboardToast[outcome.tone](outcome.title, { description: outcome.message })
    } catch (error) {
      dashboardToast.error('Brief not sent', { description: reason(error, 'The brief could not be sent.') })
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setBusyId(target.id)
    try {
      await remove.mutateAsync(target.id)
      setPendingDelete(null)
    } catch (error) {
      dashboardToast.error('Schedule not deleted', { description: reason(error, 'The schedule could not be deleted.') })
    } finally {
      setBusyId(null)
    }
  }

  return {
    schedules,
    dialogOpen,
    editing,
    isSaving: save.isPending,
    busyId,
    pendingDelete,
    isDeleting: remove.isPending,
    openNew,
    openEdit,
    closeDialog,
    saveSchedule: (input: ReportScheduleInput) => void saveSchedule(input),
    toggle: (schedule: ReportSchedule) => void toggle(schedule),
    sendTest: (schedule: ReportSchedule) => void sendBrief(schedule, true),
    sendNow: (schedule: ReportSchedule) => void sendBrief(schedule, false),
    askDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete: () => void confirmDelete(),
  }
}
