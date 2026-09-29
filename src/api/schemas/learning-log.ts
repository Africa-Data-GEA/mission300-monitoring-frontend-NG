import { z } from 'zod'
import { paginated } from './administration'

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

export const learningLogStatusSchema = z.enum(['proposed', 'decided', 'superseded'])

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
  /** What was decided or proposed. */
  decision: z.string().min(1),
  /** Why — what prompted the review and what it changed or will change. */
  rationale: z.string().min(1),
  /** The KPI id, module, or record this decision affects, where there is
   * one. Null for a decision with no single affected record. */
  relatedRecord: z.string().nullable(),
  /** e.g. "Q3 2026 review". Free text — review cycles aren't a closed
   * vocabulary anywhere else in the app either. */
  reviewCycle: z.string().min(1),
  status: learningLogStatusSchema,
  decidedBy: z.string().min(1),
  decidedAt: z.iso.datetime(),
})

export const createLearningLogEntryRequestSchema = z.object({
  title: z.string().trim().min(3, 'Give the entry a title'),
  area: learningLogAreaSchema,
  decision: z.string().trim().min(10, 'Describe what was decided or proposed'),
  rationale: z.string().trim().min(10, 'Describe why'),
  relatedRecord: z.string().trim().optional(),
  reviewCycle: z.string().trim().min(1, 'Name the review cycle'),
  status: learningLogStatusSchema,
})

export const createLearningLogEntryResponseSchema = z.object({
  entry: learningLogEntrySchema,
  message: z.string().min(1),
})

/** Same shape as create - every field optional, since an update is a
 * partial patch (e.g. just moving status from "proposed" to "decided"). */
export const updateLearningLogEntryRequestSchema = createLearningLogEntryRequestSchema.partial()

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
}

export const LEARNING_LOG_AREAS = learningLogAreaSchema.options
export const LEARNING_LOG_STATUSES = learningLogStatusSchema.options
