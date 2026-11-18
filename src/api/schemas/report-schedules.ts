import { z } from 'zod'

export const scheduleCadenceSchema = z.enum(['weekly', 'monthly'])

export const deliveryStatusSchema = z.enum(['sent', 'partial', 'failed'])

export const lastDeliverySchema = z.object({
  status: deliveryStatusSchema,
  sentAt: z.string().min(1),
  recipientCount: z.number(),
  failedCount: z.number(),
  error: z.string().nullable(),
})

export const reportScheduleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cadence: scheduleCadenceSchema,
  dayOfWeek: z.number().nullable(),
  dayOfMonth: z.number().nullable(),
  hourLagos: z.number(),
  description: z.string().min(1),
  recipients: z.array(z.string()),
  pillars: z.array(z.string()),
  isActive: z.boolean(),
  nextRunAt: z.string().min(1),
  lastRunAt: z.string().nullable(),
  createdBy: z.string(),
  lastDelivery: lastDeliverySchema.nullable(),
})

export const reportSchedulesSchema = z.object({
  items: z.array(reportScheduleSchema),
})

export const sendScheduleResultSchema = z.object({
  status: deliveryStatusSchema,
  recipientCount: z.number(),
  failedCount: z.number(),
  error: z.string().nullable(),
})

export const reportScheduleInputSchema = z.object({
  name: z.string().min(1),
  cadence: scheduleCadenceSchema,
  dayOfWeek: z.number().optional(),
  dayOfMonth: z.number().optional(),
  hourLagos: z.number().min(0).max(23),
  recipients: z.array(z.string()).min(1),
  pillars: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export type ReportSchedule = z.infer<typeof reportScheduleSchema>
export type ReportScheduleInput = z.infer<typeof reportScheduleInputSchema>
export type SendScheduleResult = z.infer<typeof sendScheduleResultSchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>
