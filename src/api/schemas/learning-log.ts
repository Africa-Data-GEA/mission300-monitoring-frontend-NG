import { z } from 'zod'
import { paginated } from './administration'
import { filterOptionSchema } from './filters'

/**
 * Contract for the Learning & Decision Log.
 *
 * Added per the SE4ALL MRL alignment review (docs/se4all-mrl-alignment-
 * renewable-private-capital.md), which flagged that Bottlenecks &
 * Exceptions tracks constraints and next actions but has no dedicated place
 * to record a course-correction decision itself — the "why we changed X"
 * record, distinct from "what's currently blocked." SE4ALL's guidance calls
 * for "a dedicated learnings tracker, review cycles and corrective action
 * feedback"; this is that tracker, scoped small on purpose.
 */

export const learningLogStatusSchema = z.enum(['proposed', 'decided', 'superseded', 'captured', 'applied'])

/** A decision records what was decided and why; a learning records what
 * happened, what was learned and what to do differently. */
export const learningLogTypeSchema = z.enum(['decision', 'learning'])

export const DECISION_STATUSES = ['proposed', 'decided', 'superseded'] as const
export const LEARNING_STATUSES = ['captured', 'applied', 'superseded'] as const

/** What kind of thing this entry is about, so the log can be scanned by
 * subject without needing free-text search. */
export const learningLogAreaSchema = z.enum([
  'kpi-methodology',
  'data-governance',
  'results-framework',
  'submission-workflow',
  'other',
])

export const learningLogEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  area: learningLogAreaSchema,
  entryType: learningLogTypeSchema.optional(),
  /** What was decided or proposed. Empty for a learning. */
  decision: z.string(),
  /** Why — what prompted the review and what it changed or will change. Empty for a learning. */
  rationale: z.string(),
  /** Learning: what happened or was observed. */
  context: z.string().optional(),
  /** Learning: what was learned. */
  lesson: z.string().optional(),
  /** Learning: what to do differently next time. */
  recommendation: z.string().optional(),
  /** Learning: the data or source that supports it. */
  evidence: z.string().optional(),
  /** The KPI id, module, or record this decision affects, where there is
   * one. Null for a decision with no single affected record. */
  relatedRecord: z.string().nullable(),
  /** The KPI, programme or project `relatedRecord` points to, resolved by the server. */
  related: z
    .object({ type: z.enum(['kpi', 'programme', 'project']), id: z.string().min(1), name: z.string().min(1) })
    .nullable()
    .optional(),
  /** e.g. "Q3 2026 review". Free text — review cycles aren't a closed
   * vocabulary anywhere else in the app either. */
  reviewCycle: z.string().min(1),
  status: learningLogStatusSchema,
  decidedBy: z.string().min(1),
  decidedAt: z.iso.datetime(),
})

const learningLogEntryFieldsSchema = z.object({
  entryType: learningLogTypeSchema,
  title: z.string().trim().min(3, 'Give the entry a title'),
  area: learningLogAreaSchema,
  decision: z.string().trim().optional(),
  rationale: z.string().trim().optional(),
  context: z.string().trim().optional(),
  lesson: z.string().trim().optional(),
  recommendation: z.string().trim().optional(),
  evidence: z.string().trim().optional(),
  relatedRecord: z.string().trim().optional(),
  reviewCycle: z.string().trim().min(1, 'Name the review cycle'),
  status: learningLogStatusSchema,
})

export const createLearningLogEntryRequestSchema = learningLogEntryFieldsSchema.superRefine((value, ctx) => {
  const need = (field: 'decision' | 'rationale' | 'context' | 'lesson', message: string) => {
    if ((value[field] ?? '').length < 10) ctx.addIssue({ code: 'custom', path: [field], message })
  }
  if (value.entryType === 'decision') {
    need('decision', 'Describe what was decided or proposed')
    need('rationale', 'Describe why')
  } else {
    need('context', 'Describe what happened')
    need('lesson', 'Describe what was learned')
  }
})

export const learningLogOptionsSchema = z.object({
  kpis: z.array(filterOptionSchema),
  programmes: z.array(filterOptionSchema),
  projects: z.array(filterOptionSchema),
})

export const createLearningLogEntryResponseSchema = z.object({
  entry: learningLogEntrySchema,
  message: z.string().min(1),
})

/** Same shape as create - every field optional, since an update is a
 * partial patch (e.g. just moving status from "proposed" to "decided"). */
export const updateLearningLogEntryRequestSchema = learningLogEntryFieldsSchema.partial()

export const updateLearningLogEntryResponseSchema = createLearningLogEntryResponseSchema

export const deleteLearningLogEntryResponseSchema = z.object({
  message: z.string().min(1),
})

/** Response shape for GET /api/learning-log. */
export const learningLogOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  entries: paginated(learningLogEntrySchema),
})

export type LearningLogStatus = z.infer<typeof learningLogStatusSchema>
export type LearningLogArea = z.infer<typeof learningLogAreaSchema>
export type LearningLogType = z.infer<typeof learningLogTypeSchema>
export type LearningLogOptions = z.infer<typeof learningLogOptionsSchema>
export type LearningLogEntry = z.infer<typeof learningLogEntrySchema>
export type CreateLearningLogEntryRequest = z.infer<typeof createLearningLogEntryRequestSchema>
export type CreateLearningLogEntryResponse = z.infer<typeof createLearningLogEntryResponseSchema>
export type UpdateLearningLogEntryRequest = z.infer<typeof updateLearningLogEntryRequestSchema>
export type UpdateLearningLogEntryResponse = z.infer<typeof updateLearningLogEntryResponseSchema>
export type DeleteLearningLogEntryResponse = z.infer<typeof deleteLearningLogEntryResponseSchema>
export type LearningLogOverview = z.infer<typeof learningLogOverviewSchema>

export const LEARNING_LOG_AREA_LABELS: Record<LearningLogArea, string> = {
  'kpi-methodology': 'KPI methodology',
  'data-governance': 'Data governance',
  'results-framework': 'Results framework',
  'submission-workflow': 'Submission workflow',
  other: 'Other',
}

export const LEARNING_LOG_STATUS_LABELS: Record<LearningLogStatus, string> = {
  proposed: 'Proposed',
  decided: 'Decided',
  superseded: 'Superseded',
  captured: 'Captured',
  applied: 'Applied',
}

export const LEARNING_LOG_TYPE_LABELS: Record<LearningLogType, string> = {
  decision: 'Decision',
  learning: 'Learning',
}

export const LEARNING_LOG_AREAS = learningLogAreaSchema.options
export const LEARNING_LOG_STATUSES = learningLogStatusSchema.options
