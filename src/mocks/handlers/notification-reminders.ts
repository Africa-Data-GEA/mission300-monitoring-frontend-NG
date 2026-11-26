import { delay, http, HttpResponse } from '../local-router'

let enabled = false
let updatedAt: string | null = null

const overview = () => ({
  enabled,
  updatedByName: updatedAt ? 'System Administrator' : null,
  updatedAt,
  lastRunAt: null,
  lastSent: 0,
  lastFailed: 0,
  emailConfigured: true,
  recipients: [
    {
      name: 'Sample Reviewer',
      email: 'reviewer@example.org',
      items: [{ section: 'review-waiting', text: 'NERC: DisCo Energy Billed, waiting 4 days' }],
    },
  ],
})

export const notificationReminderHandlers = [
  http.get('/api/notification-reminders', async () => {
    await delay(80)
    return HttpResponse.json(overview())
  }),

  http.put('/api/notification-reminders', async ({ request }) => {
    await delay(80)
    const body = (await request.json()) as { enabled?: unknown }
    enabled = body.enabled === true
    updatedAt = new Date().toISOString()
    return HttpResponse.json(overview())
  }),
]
