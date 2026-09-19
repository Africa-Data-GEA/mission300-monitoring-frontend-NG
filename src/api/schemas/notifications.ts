import { z } from 'zod'

export const notificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  link: z.string().min(1),
  read: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const notificationsFeedSchema = z.object({
  items: z.array(notificationSchema),
  unreadCount: z.number().int().min(0),
})

export const markAllReadResponseSchema = z.object({
  count: z.number().int().min(0),
})

export type Notification = z.infer<typeof notificationSchema>
export type NotificationsFeed = z.infer<typeof notificationsFeedSchema>
