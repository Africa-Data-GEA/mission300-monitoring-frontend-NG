import { delay, http, HttpResponse } from '../local-router'
import type { LearningLogEntry } from '@/api/schemas/learning-log'
import { recordAuditEvent } from '../data/audit-log'
import { learningLogEntries } from '../data/learning-log'

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requestedPage, pageCount)
  const offset = (page - 1) * pageSize

  return {
    items: items.slice(offset, offset + pageSize),
    page,
    pageSize,
    total: items.length,
  }
}

let nextEntryNumber = learningLogEntries.length + 1

export const learningLogHandlers = [
  /**
   * GET /api/learning-log
   *
   * Newest first — a decision log reads as a timeline, not a stable-sorted
   * table.
   */
  http.get('/api/learning-log', async ({ request }) => {
    await delay(250)

    const params = new URL(request.url).searchParams
    const page = positiveInteger(params.get('page'), 1)
    const pageSize = Math.min(50, positiveInteger(params.get('pageSize'), 25))

    const sorted = [...learningLogEntries].sort(
      (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
    )

    return HttpResponse.json({
      lastUpdated: sorted[0]?.decidedAt ?? new Date().toISOString(),
      entries: paginate(sorted, page, pageSize),
    })
  }),

  /**
   * POST /api/learning-log
   *
   * Logs a new decision or course-correction — the server owns the
   * generated identifier and timestamp, mirroring createBottleneckRequestSchema.
   */
  http.post('/api/learning-log', async ({ request }) => {
    await delay(300)

    const body = (await request.json()) as {
      title?: string
      area?: string
      decision?: string
      rationale?: string
      relatedRecord?: string
      reviewCycle?: string
      status?: string
    }

    if (!body.title || body.title.trim().length < 3) {
      return HttpResponse.json({ message: 'Give the entry a title.' }, { status: 422 })
    }
    if (!body.decision || body.decision.trim().length < 10) {
      return HttpResponse.json(
        { message: 'Describe what was decided or proposed.' },
        { status: 422 },
      )
    }

    const entry: LearningLogEntry = {
      id: `LOG-2026-${String(nextEntryNumber).padStart(3, '0')}`,
      title: body.title.trim(),
      area: (body.area ?? 'other') as LearningLogEntry['area'],
      decision: body.decision.trim(),
      rationale: body.rationale?.trim() ?? '',
      relatedRecord: body.relatedRecord?.trim() || null,
      reviewCycle: body.reviewCycle?.trim() || 'Unscheduled',
      status: (body.status ?? 'proposed') as LearningLogEntry['status'],
      decidedBy: 'Current user',
      decidedAt: new Date().toISOString(),
    }

    nextEntryNumber += 1
    learningLogEntries.unshift(entry)

    recordAuditEvent({
      action: 'Logged a decision',
      module: 'Learning & Decision Log',
      recordId: entry.id,
      newValue: entry.title,
      reference: entry.relatedRecord,
    })

    return HttpResponse.json({
      entry,
      message: `${entry.id} has been added to the learning log.`,
    })
  }),

  /**
   * PATCH /api/learning-log/:id
   *
   * Partial update - only the fields the client sent are changed.
   */
  http.patch('/api/learning-log/:id', async ({ request, params }) => {
    await delay(300)

    const entry = learningLogEntries.find((candidate) => candidate.id === params.id)
    if (!entry) {
      return HttpResponse.json({ message: 'The learning log entry was not found.' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<{
      title: string
      area: string
      decision: string
      rationale: string
      relatedRecord: string
      reviewCycle: string
      status: string
    }>

    if (body.title !== undefined) entry.title = body.title.trim()
    if (body.area !== undefined) entry.area = body.area as LearningLogEntry['area']
    if (body.decision !== undefined) entry.decision = body.decision.trim()
    if (body.rationale !== undefined) entry.rationale = body.rationale.trim()
    if (body.relatedRecord !== undefined) entry.relatedRecord = body.relatedRecord.trim() || null
    if (body.reviewCycle !== undefined) entry.reviewCycle = body.reviewCycle.trim()
    if (body.status !== undefined) entry.status = body.status as LearningLogEntry['status']

    recordAuditEvent({
      action: 'Updated a learning log entry',
      module: 'Learning & Decision Log',
      recordId: entry.id,
      newValue: entry.title,
      reference: entry.relatedRecord,
    })

    return HttpResponse.json({ entry, message: `${entry.id} has been updated.` })
  }),

  /**
   * DELETE /api/learning-log/:id
   */
  http.delete('/api/learning-log/:id', async ({ params }) => {
    await delay(300)

    const index = learningLogEntries.findIndex((candidate) => candidate.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: 'The learning log entry was not found.' }, { status: 404 })
    }

    const removed = learningLogEntries[index]
    learningLogEntries.splice(index, 1)
    if (!removed) {
      return HttpResponse.json({ message: 'The learning log entry was not found.' }, { status: 404 })
    }

    recordAuditEvent({
      action: 'Deleted a learning log entry',
      module: 'Learning & Decision Log',
      recordId: removed.id,
      newValue: removed.title,
      reference: removed.relatedRecord,
    })

    return HttpResponse.json({ message: `${removed.id} has been removed from the learning log.` })
  }),
]
