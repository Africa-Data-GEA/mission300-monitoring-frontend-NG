import { z } from 'zod'

export const reminderSectionSchema = z.enum([
  'review-escalation',
  'review-waiting',
  'overdue',
  'deadline',
  'returned-escalation',
  'returned',
])

export const reminderOverviewSchema = z.object({
  enabled: z.boolean(),
  updatedByName: z.string().nullable(),
  updatedAt: z.string().nullable(),
  lastRunAt: z.string().nullable(),
  lastSent: z.number().int().min(0),
  lastFailed: z.number().int().min(0),
  emailConfigured: z.boolean(),
  recipients: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
      items: z.array(z.object({ section: reminderSectionSchema, text: z.string() })),
    }),
  ),
})

export type ReminderOverview = z.infer<typeof reminderOverviewSchema>
export type ReminderSection = z.infer<typeof reminderSectionSchema>
