import { describe, expect, it } from 'vitest'
import {
  emptyScheduleForm,
  formFromSchedule,
  inputFromForm,
  parseRecipients,
  validateScheduleForm,
} from '@/features/reports/lib/schedule-form'
import type { ReportSchedule } from '@/api/schemas/report-schedules'

describe('parseRecipients', () => {
  it('splits on lines, commas and semicolons, lower-cases and removes duplicates', () => {
    const parsed = parseRecipients('Minister@Example.org,\nadviser@example.org; minister@example.org')
    expect(parsed.valid).toEqual(['minister@example.org', 'adviser@example.org'])
    expect(parsed.invalid).toEqual([])
  })

  it('separates entries that are not email addresses', () => {
    const parsed = parseRecipients('minister@example.org, not-an-email, a@b')
    expect(parsed.valid).toEqual(['minister@example.org'])
    expect(parsed.invalid).toEqual(['not-an-email', 'a@b'])
  })
})

describe('validateScheduleForm', () => {
  const valid = { ...emptyScheduleForm(), name: 'Weekly brief', recipients: 'minister@example.org' }

  it('accepts a complete form', () => {
    expect(validateScheduleForm(valid)).toBeNull()
  })

  it('asks for a name and at least one recipient', () => {
    expect(validateScheduleForm({ ...valid, name: '  ' })).toBe('Give the schedule a name.')
    expect(validateScheduleForm({ ...valid, recipients: '' })).toBe('Add at least one recipient.')
  })

  it('names the addresses that are not valid', () => {
    expect(validateScheduleForm({ ...valid, recipients: 'minister@example.org, oops' })).toBe(
      'These are not valid email addresses: oops.',
    )
  })

  it('refuses more than 25 recipients', () => {
    const many = Array.from({ length: 26 }, (_, index) => `person${index}@example.org`).join('\n')
    expect(validateScheduleForm({ ...valid, recipients: many })).toBe('A schedule can have at most 25 recipients.')
  })
})

describe('inputFromForm', () => {
  it('sends the weekday for a weekly schedule and the day of month for a monthly one', () => {
    const weekly = inputFromForm({ ...emptyScheduleForm(), name: ' Brief ', recipients: 'a@b.org', dayOfWeek: '4', hourLagos: '17' })
    expect(weekly).toEqual({ name: 'Brief', cadence: 'weekly', dayOfWeek: 4, hourLagos: 17, recipients: ['a@b.org'], isActive: true })

    const monthly = inputFromForm({ ...emptyScheduleForm(), name: 'Monthly', cadence: 'monthly', dayOfMonth: '15', recipients: 'a@b.org' })
    expect(monthly).toMatchObject({ cadence: 'monthly', dayOfMonth: 15 })
    expect(monthly).not.toHaveProperty('dayOfWeek')
  })
})

describe('formFromSchedule', () => {
  it('puts each recipient on its own line so the schedule can be edited', () => {
    const schedule = {
      name: 'Weekly',
      cadence: 'weekly',
      dayOfWeek: 2,
      dayOfMonth: null,
      hourLagos: 9,
      recipients: ['a@b.org', 'c@d.org'],
      isActive: false,
    } as unknown as ReportSchedule
    expect(formFromSchedule(schedule)).toMatchObject({ dayOfWeek: '2', hourLagos: '9', recipients: 'a@b.org\nc@d.org', isActive: false })
  })
})
