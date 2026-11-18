import type { ReportSchedule, ReportScheduleInput } from '@/api/schemas/report-schedules'
import type { FilterOption } from '@/types/filters'

export interface ScheduleFormValues {
  name: string
  cadence: 'weekly' | 'monthly'
  dayOfWeek: string
  dayOfMonth: string
  hourLagos: string
  recipients: string
  isActive: boolean
}

export const WEEKDAY_OPTIONS: FilterOption[] = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '7', label: 'Sunday' },
]

export const DAY_OF_MONTH_OPTIONS: FilterOption[] = Array.from({ length: 28 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}))

export const HOUR_OPTIONS: FilterOption[] = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, '0')}:00`,
}))

export const CADENCE_OPTIONS: FilterOption[] = [
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
]

export function emptyScheduleForm(): ScheduleFormValues {
  return { name: '', cadence: 'weekly', dayOfWeek: '1', dayOfMonth: '1', hourLagos: '8', recipients: '', isActive: true }
}

export function formFromSchedule(schedule: ReportSchedule): ScheduleFormValues {
  return {
    name: schedule.name,
    cadence: schedule.cadence,
    dayOfWeek: String(schedule.dayOfWeek ?? 1),
    dayOfMonth: String(schedule.dayOfMonth ?? 1),
    hourLagos: String(schedule.hourLagos),
    recipients: schedule.recipients.join('\n'),
    isActive: schedule.isActive,
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseRecipients(text: string): { valid: string[]; invalid: string[] } {
  const entries = [...new Set(text.split(/[\s,;]+/).map((entry) => entry.trim().toLowerCase()).filter(Boolean))]
  return { valid: entries.filter((entry) => EMAIL.test(entry)), invalid: entries.filter((entry) => !EMAIL.test(entry)) }
}

export function validateScheduleForm(values: ScheduleFormValues): string | null {
  if (!values.name.trim()) return 'Give the schedule a name.'
  const { valid, invalid } = parseRecipients(values.recipients)
  if (invalid.length > 0) return `These are not valid email addresses: ${invalid.join(', ')}.`
  if (valid.length === 0) return 'Add at least one recipient.'
  if (valid.length > 25) return 'A schedule can have at most 25 recipients.'
  return null
}

export function inputFromForm(values: ScheduleFormValues): ReportScheduleInput {
  return {
    name: values.name.trim(),
    cadence: values.cadence,
    ...(values.cadence === 'weekly' ? { dayOfWeek: Number(values.dayOfWeek) } : { dayOfMonth: Number(values.dayOfMonth) }),
    hourLagos: Number(values.hourLagos),
    recipients: parseRecipients(values.recipients).valid,
    isActive: values.isActive,
  }
}
