import { useState } from 'react'
import toast from 'react-hot-toast'
import type { ReportSchedule, ReportScheduleInput, SendScheduleResult } from '@/api/schemas/report-schedules'
import {
  useDeleteReportSchedule,
  useReportSchedules,
  useSaveReportSchedule,
  useSendReportSchedule,
} from './schedules-api'

function sendOutcome(result: SendScheduleResult, test: boolean): { ok: boolean; message: string } {
  const target = test ? 'to you' : `to ${result.recipientCount} ${result.recipientCount === 1 ? 'recipient' : 'recipients'}`
  if (result.status === 'sent') return { ok: true, message: `The brief was sent ${target}.` }
  if (result.status === 'partial') {
    return { ok: false, message: `The brief reached some recipients but ${result.failedCount} failed. ${result.error ?? ''}`.trim() }
  }
  return { ok: false, message: `The brief could not be sent. ${result.error ?? ''}`.trim() }
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
      toast.success(editing ? 'Schedule updated.' : 'Schedule created.')
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The schedule could not be saved.')
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
          isActive: !schedule.isActive,
        },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The schedule could not be updated.')
    } finally {
      setBusyId(null)
    }
  }

  async function sendBrief(schedule: ReportSchedule, test: boolean) {
    setBusyId(schedule.id)
    try {
      const outcome = sendOutcome(await send.mutateAsync({ id: schedule.id, test }), test)
      if (outcome.ok) toast.success(outcome.message)
      else toast.error(outcome.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The brief could not be sent.')
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
      toast.error(error instanceof Error ? error.message : 'The schedule could not be deleted.')
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
