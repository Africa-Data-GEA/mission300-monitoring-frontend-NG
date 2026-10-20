import { z } from 'zod'
import { paginated } from './administration'
import { metricProvenanceSchema, pillarIdSchema, trendSchema } from './common'
import { filterOptionSchema } from './filters'

/**
 * Contract for the Bottlenecks and Exceptions module.
 *
 * Specification: docs/specs/bottlenecks-exceptions.md
 *
 * This is the full delivery-constraint register — richer than the lightweight
 * `Bottleneck` summary shown in the Executive Overview's Section D exception
 * list (see executive-overview.ts). The two are deliberately separate types:
 * the Executive Overview shows a ranked top-five for context, this module is
 * the authoritative register with every field the specification lists.
 */

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

/** Register severity. Distinct from the Executive Overview's severity
 * enum, which conflates category and severity for a different purpose. */
export const registerSeveritySchema = z.enum(['critical', 'high', 'medium', 'low'])

export const bottleneckCategorySchema = z.enum([
  'financing',
  'procurement',
  'permitting',
  'regulatory-approval',
  'coordination',
  'technical-constraint',
  'implementation-delay',
  'data-or-reporting',
])

export const lifecycleStageSchema = z.enum([
  'identification',
  'design',
  'procurement',
  'implementation',
  'commissioning',
  'operations',
])

export const bottleneckStatusSchema = z.enum([
  'open',
  'in-progress',
  'blocked',
  'escalated',
  'resolved',
])

export const escalationStatusSchema = z.enum([
  'not-escalated',
  'escalated',
  'overdue',
  'resolved',
])

export const escalationLevelSchema = z.enum([
  'programme-management',
  'institution-leadership',
  'steering-committee',
  'ministerial',
])

/* ------------------------------------------------------------------ *
 * Section A — Headline alert cards
 *
 * The specification restricts operational benchmarks to these four cards —
 * every one targets zero, and every one compares against the previous
 * reporting cycle. None of the four are performance KPIs, so none carry a
 * progress bar; they are alert counts.
 * ------------------------------------------------------------------ */

export const alertCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  count: z.number().int().min(0),
  targetLabel: z.string().min(1),
  /** e.g. "median 42 days open" or "oldest: 118 days". Distinct per card. */
  supportingLabel: z.string().min(1),
  trend: trendSchema,
  provenance: metricProvenanceSchema,
})

/* ------------------------------------------------------------------ *
 * Section B — The bottleneck register
 * ------------------------------------------------------------------ */

/** One snapshot in a bottleneck's status trail — M300-INT-006 flagged that
 * only the current status/escalation state was visible, not how it got
 * there. Mirrors `statusHistoryEntrySchema` on projects (programs.ts): same
 * shape, same reasoning — a reporting-cycle snapshot, not a full audit log. */
export const bottleneckStatusHistoryEntrySchema = z.object({
  period: z.string().min(1),
  status: bottleneckStatusSchema,
})

export const bottleneckRecordSchema = z.object({
  id: z.string().min(1),
  issue: z.string().min(1),
  category: bottleneckCategorySchema,
  severity: registerSeveritySchema,
  pillar: pillarIdSchema,
  /** The indicator, programme or project this bottleneck is linked to. */
  linkedRecord: z.string(),
  /** The project or programme `linkedRecord` points to, resolved by the server. */
  link: z
    .object({ type: z.enum(['programme', 'project']), id: z.string().min(1), name: z.string().min(1) })
    .nullable()
    .optional(),
  institution: z.string().min(1),
  dateRaised: z.iso.datetime(),
  ageDays: z.number().int().min(0),
  followUp: z.string(),
  escalationStatus: escalationStatusSchema,
  status: bottleneckStatusSchema,
  lifecycleStage: lifecycleStageSchema,
  /** Oldest-to-newest. Empty for a bottleneck that has never changed status
   * since being raised — its one data point is `status` itself. */
  statusHistory: z.array(bottleneckStatusHistoryEntrySchema).default([]),
})

/** Request body for creating a new bottleneck / exception record. */
export const createBottleneckRequestSchema = z.object({
  issue: z.string().trim().min(5, 'Describe the issue in a few words'),
  category: bottleneckCategorySchema,
  severity: registerSeveritySchema,
  pillar: pillarIdSchema,
  linkedRecord: z.string().trim().optional(),
  institution: z.string().trim().min(1, 'Select the responsible institution'),
  lifecycleStage: lifecycleStageSchema,
  followUp: z.string().trim().max(1000).optional(),
})

export const createBottleneckResponseSchema = z.object({
  record: bottleneckRecordSchema,
  message: z.string().min(1),
})

/**
 * Updates a bottleneck's current status (and optionally its follow-up note).
 * There was previously no way to change a bottleneck's status at all once
 * raised — only `createBottleneck` existed. Deliberately narrow: this
 * changes the current snapshot only. The append to `statusHistory` is a
 * side effect the backend performs when the status actually changes value,
 * not something the caller constructs directly — the same reasoning as
 * `current`/`history` on a KPI only changing through a publish action, not a
 * direct edit.
 */
export const updateBottleneckStatusRequestSchema = z.object({
  status: bottleneckStatusSchema,
  followUp: z.string().trim().max(1000).optional(),
})

export const updateBottleneckStatusResponseSchema = z.object({
  record: bottleneckRecordSchema,
})

/* ------------------------------------------------------------------ *
 * Section C — By category and lifecycle stage
 * ------------------------------------------------------------------ */

export const categoryDistributionSchema = z.object({
  category: bottleneckCategorySchema,
  label: z.string().min(1),
  count: z.number().int().min(0),
})

export const lifecycleDistributionSchema = z.object({
  stage: lifecycleStageSchema,
  label: z.string().min(1),
  bySeverity: z.array(
    z.object({
      severity: registerSeveritySchema,
      count: z.number().int().min(0),
    }),
  ),
  total: z.number().int().min(0),
})

/* ------------------------------------------------------------------ *
 * Section D — By agency
 * ------------------------------------------------------------------ */

export const institutionExceptionsSchema = z.object({
  institution: z.string().min(1),
  openCount: z.number().int().min(0),
  criticalOrHighCount: z.number().int().min(0),
})

/* ------------------------------------------------------------------ *
 * Section E — Escalation tracker
 * ------------------------------------------------------------------ */

export const escalationRecordSchema = z.object({
  id: z.string().min(1),
  bottleneckId: z.string().min(1),
  decisionRequired: z.string().min(1),
  level: escalationLevelSchema,
  owner: z.string().min(1),
  dueDate: z.iso.datetime(),
  daysOverdue: z.number().int(),
  status: escalationStatusSchema,
  /** Null until the escalation is resolved. */
  resolution: z.string().nullable(),
  /** Null when no supporting document has been attached. */
  evidenceUrl: z.string().nullable(),
})

/* ------------------------------------------------------------------ *
 * Section F — this module's own filters
 * ------------------------------------------------------------------ */

export const bottlenecksFilterOptionsSchema = z.object({
  severities: z.array(filterOptionSchema),
  categories: z.array(filterOptionSchema),
  institutions: z.array(filterOptionSchema),
  pillars: z.array(filterOptionSchema),
  linkedRecords: z.array(filterOptionSchema),
  responsibleInstitutions: z.array(filterOptionSchema).optional(),
  programmes: z.array(filterOptionSchema).optional(),
  projects: z.array(filterOptionSchema).optional(),
  lifecycleStages: z.array(filterOptionSchema),
  escalationStatuses: z.array(filterOptionSchema),
  validationStatuses: z.array(filterOptionSchema),
  reportingPeriods: z.array(filterOptionSchema),
})

export const bottlenecksQuerySchema = z.object({
  search: z.string().optional(),
  severity: z.string().optional(),
  category: z.string().optional(),
  institution: z.string().optional(),
  pillar: z.string().optional(),
  linkedRecord: z.string().optional(),
  lifecycleStage: z.string().optional(),
  escalationStatus: z.string().optional(),
  validationStatus: z.string().optional(),
  reportingPeriod: z.string().optional(),
})

/**
 * Pagination for GET /api/bottlenecks, kept separate from the filter query
 * above (matching administration's convention): `page` and `escalationPage`
 * paginate the register and the escalation tracker independently, since both
 * lists come back in the same payload.
 */
export const bottlenecksPaginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(200),
  escalationPage: z.number().int().min(1),
})

/* ------------------------------------------------------------------ */

/** Response shape for GET /api/bottlenecks. */
export const bottlenecksOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  alerts: z.array(alertCardSchema).length(4),
  register: paginated(bottleneckRecordSchema),
  byCategory: z.array(categoryDistributionSchema),
  byLifecycleStage: z.array(lifecycleDistributionSchema),
  byInstitution: z.array(institutionExceptionsSchema),
  escalations: paginated(escalationRecordSchema),
})

export type RegisterSeverity = z.infer<typeof registerSeveritySchema>
export type BottleneckCategory = z.infer<typeof bottleneckCategorySchema>
export type LifecycleStage = z.infer<typeof lifecycleStageSchema>
export type BottleneckStatus = z.infer<typeof bottleneckStatusSchema>
export type EscalationStatus = z.infer<typeof escalationStatusSchema>
export type EscalationLevel = z.infer<typeof escalationLevelSchema>
export type AlertCard = z.infer<typeof alertCardSchema>
export type BottleneckRecord = z.infer<typeof bottleneckRecordSchema>
export type BottleneckStatusHistoryEntry = z.infer<typeof bottleneckStatusHistoryEntrySchema>
export type CreateBottleneckRequest = z.infer<typeof createBottleneckRequestSchema>
export type CreateBottleneckResponse = z.infer<typeof createBottleneckResponseSchema>
export type UpdateBottleneckStatusRequest = z.infer<typeof updateBottleneckStatusRequestSchema>
export type CategoryDistribution = z.infer<typeof categoryDistributionSchema>
export type LifecycleDistribution = z.infer<typeof lifecycleDistributionSchema>
export type InstitutionExceptions = z.infer<typeof institutionExceptionsSchema>
export type EscalationRecord = z.infer<typeof escalationRecordSchema>
export type BottlenecksOverview = z.infer<typeof bottlenecksOverviewSchema>
export type BottlenecksQuery = z.infer<typeof bottlenecksQuerySchema>
export type BottlenecksPagination = z.infer<typeof bottlenecksPaginationSchema>
export type BottlenecksFilterOptions = z.infer<typeof bottlenecksFilterOptionsSchema>

/* ------------------------------------------------------------------ *
 * Display labels for the closed vocabularies
 * ------------------------------------------------------------------ */

export const SEVERITY_LABELS: Record<RegisterSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const CATEGORY_LABELS: Record<BottleneckCategory, string> = {
  financing: 'Financing',
  procurement: 'Procurement',
  permitting: 'Permitting',
  'regulatory-approval': 'Regulatory approval',
  coordination: 'Coordination',
  'technical-constraint': 'Technical constraint',
  'implementation-delay': 'Implementation delay',
  'data-or-reporting': 'Data or reporting',
}

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  identification: 'Identification',
  design: 'Design',
  procurement: 'Procurement',
  implementation: 'Implementation',
  commissioning: 'Commissioning',
  operations: 'Operations',
}

export const BOTTLENECK_STATUS_LABELS: Record<BottleneckStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  escalated: 'Escalated',
  resolved: 'Resolved',
}

export const ESCALATION_STATUS_LABELS: Record<EscalationStatus, string> = {
  'not-escalated': 'Not escalated',
  escalated: 'Escalated',
  overdue: 'Overdue',
  resolved: 'Resolved',
}

export const ESCALATION_LEVEL_LABELS: Record<EscalationLevel, string> = {
  'programme-management': 'Programme management',
  'institution-leadership': 'Institution leadership',
  'steering-committee': 'Steering committee',
  ministerial: 'Ministerial',
}

export const REGISTER_SEVERITIES = registerSeveritySchema.options
export const BOTTLENECK_CATEGORIES = bottleneckCategorySchema.options
export const LIFECYCLE_STAGES = lifecycleStageSchema.options
