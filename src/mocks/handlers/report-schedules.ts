import { delay, http, HttpResponse } from '../local-router'
import type { ReportSchedule, ReportScheduleInput } from '@/api/schemas/report-schedules'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function describe(input: ReportScheduleInput): string {
  const time = `${String(input.hourLagos).padStart(2, '0')}:00 (Lagos time)`
  return input.cadence === 'weekly'
    ? `Every ${WEEKDAYS[(input.dayOfWeek ?? 1) - 1]} at ${time}`
    : `On day ${input.dayOfMonth ?? 1} of every month at ${time}`
}

function nextRun(): string {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
}

const DEMO_AGENCIES = [
  { id: 'inst-nerc', name: 'NERC' },
  { id: 'inst-rea', name: 'Rural Electrification Agency' },
]

const audienceOf = (input: ReportScheduleInput) => ({
  institutionId: input.institutionId ?? null,
  institutionName: DEMO_AGENCIES.find((agency) => agency.id === input.institutionId)?.name ?? null,
})

let schedules: ReportSchedule[] = [
  {
    id: 'sched-demo-1',
    name: 'Weekly brief for the Minister',
    cadence: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: null,
    hourLagos: 8,
    description: 'Every Monday at 08:00 (Lagos time)',
    recipients: ['minister.office@example.gov.ng', 'special.adviser@example.gov.ng'],
    pillars: ['all'],
    institutionId: null,
    institutionName: null,
    isActive: true,
    nextRunAt: nextRun(),
    lastRunAt: null,
    createdBy: 'Demo administrator',
    lastDelivery: null,
  },
]

const DEMO_PDF = `%PDF-1.1
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 74>>stream
BT /F1 18 Tf 60 780 Td (Executive brief - demo preview) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
%%EOF`

export const reportScheduleHandlers = [
  http.get('/api/reports/schedules/audiences', () => HttpResponse.json(DEMO_AGENCIES)),

  http.get('/api/reports/schedules', async () => {
    await delay(200)
    return HttpResponse.json({ items: schedules })
  }),

  http.post('/api/reports/schedules', async ({ request }) => {
    await delay(250)
    const input = (await request.json()) as ReportScheduleInput
    const created: ReportSchedule = {
      id: `sched-${Date.now()}`,
      name: input.name,
      cadence: input.cadence,
      dayOfWeek: input.dayOfWeek ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      hourLagos: input.hourLagos,
      description: describe(input),
      recipients: input.recipients,
      pillars: input.pillars ?? ['all'],
      ...audienceOf(input),
      isActive: input.isActive ?? true,
      nextRunAt: nextRun(),
      lastRunAt: null,
      createdBy: 'Demo administrator',
      lastDelivery: null,
    }
    schedules = [created, ...schedules]
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/reports/schedules/:id', async ({ params, request }) => {
    await delay(250)
    const input = (await request.json()) as ReportScheduleInput
    const existing = schedules.find((schedule) => schedule.id === String(params.id))
    if (!existing) return HttpResponse.json({ message: 'Schedule not found.' }, { status: 404 })
    const updated: ReportSchedule = {
      ...existing,
      ...audienceOf(input),
      name: input.name,
      cadence: input.cadence,
      dayOfWeek: input.dayOfWeek ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      hourLagos: input.hourLagos,
      description: describe(input),
      recipients: input.recipients,
      isActive: input.isActive ?? true,
    }
    schedules = schedules.map((schedule) => (schedule.id === updated.id ? updated : schedule))
    return HttpResponse.json(updated)
  }),

  http.delete('/api/reports/schedules/:id', async ({ params }) => {
    await delay(200)
    schedules = schedules.filter((schedule) => schedule.id !== String(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/reports/schedules/:id/send', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json().catch(() => ({}))) as { test?: boolean }
    const existing = schedules.find((schedule) => schedule.id === String(params.id))
    if (!existing) return HttpResponse.json({ message: 'Schedule not found.' }, { status: 404 })
    const recipientCount = body.test ? 1 : existing.recipients.length
    const sentAt = new Date().toISOString()
    schedules = schedules.map((schedule) =>
      schedule.id === existing.id
        ? { ...schedule, lastRunAt: sentAt, lastDelivery: { status: 'sent', sentAt, recipientCount, failedCount: 0, error: null } }
        : schedule,
    )
    return HttpResponse.json({ status: 'sent', recipientCount, failedCount: 0, error: null })
  }),

  http.get('/api/reports/saved/:id/pdf', () =>
    new HttpResponse(DEMO_PDF, { headers: { 'content-type': 'application/pdf' } }),
  ),
]
