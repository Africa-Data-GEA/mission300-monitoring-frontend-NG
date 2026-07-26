import { z } from 'zod'
import { paginated } from './administration'
import { bottleneckCategorySchema, lifecycleStageSchema } from './bottlenecks'
import {
  metricIconNameSchema,
  metricProvenanceSchema,
  pillarIdSchema,
  trendSchema,
} from './common'
import { filterOptionSchema } from './filters'
import { validationStatusSchema } from './kpi-explorer'

/**
 * Contract for the Implementation Register module.
 *
 * Specification: docs/specs/implementation-register.md
 *
 * The register combines four distinct record types — programmes, projects,
 * milestones and actions — while preserving their different shapes, so each
 * gets its own schema and its own tab/table rather than one unified row type.
 *
 * `lifecycleStageSchema` and `bottleneckCategorySchema` are imported from
 * bottlenecks.ts rather than redefined: both modules describe the same
 * underlying delivery pipeline and the same constraint taxonomy, and the
 * specification cross-references "Bottleneck category" as one of this
 * module's own filters. `validationStatusSchema` is imported from
 * kpi-explorer.ts for the same reason — one confirmed/provisional/pending/
 * data-gap vocabulary, used everywhere a value's trustworthiness is shown.
 */

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export const recordTypeSchema = z.enum(['programme', 'project', 'milestone', 'action'])

export const executionStatusSchema = z.enum([
  'on-track',
  'at-risk',
  'delayed',
  'blocked',
  'completed',
])

/** Whether a milestone or action is one of the Compact's priority items. */
export const registerPrioritySchema = z.enum(['priority', 'standard'])

/* ------------------------------------------------------------------ *
 * Section A — Headline performance cards
 *
 * The specification gives each of the four cards its own shape (summary,
 * progress, exception, exception), so each is modelled as a named field
 * rather than a generic array — a card cannot go missing without failing
 * validation. Mirrors executive-overview.ts's headlineCardsSchema pattern.
 * ------------------------------------------------------------------ */

/** A1. Active programmes and projects, counted separately. */
export const registerSummaryCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  activeProgrammes: z.number().int().min(0),
  activeProjects: z.number().int().min(0),
  newThisCycle: z.number().int().min(0),
  closedThisCycle: z.number().int().min(0),
  trend: trendSchema.optional(),
  provenance: metricProvenanceSchema,
})

/** A2. Priority milestones delivered on time. */
export const milestoneOnTimeCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  percentOnTime: z.number().min(0).max(100),
  dueCount: z.number().int().min(0),
  completedCount: z.number().int().min(0),
  delayedCount: z.number().int().min(0),
  blockedCount: z.number().int().min(0),
  targetLabel: z.string().min(1),
  trend: trendSchema.optional(),
  provenance: metricProvenanceSchema,
})

/** A3. Delayed or blocked priority records. Targets zero. */
export const delayedOrBlockedCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  count: z.number().int().min(0),
  targetLabel: z.string().min(1),
  supportingLabel: z.string().min(1),
  trend: trendSchema,
  provenance: metricProvenanceSchema,
})

/** A4. Priority records missing required evidence or a current update. */
export const evidenceOverdueCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  count: z.number().int().min(0),
  targetLabel: z.string().min(1),
  /** e.g. "median 61 days since last update". */
  supportingLabel: z.string().min(1),
  trend: trendSchema,
  provenance: metricProvenanceSchema,
})

export const registerHeadlineCardsSchema = z.object({
  summary: registerSummaryCardSchema,
  milestoneOnTime: milestoneOnTimeCardSchema,
  delayedOrBlocked: delayedOrBlockedCardSchema,
  evidenceOverdue: evidenceOverdueCardSchema,
})

/* ------------------------------------------------------------------ *
 * Section B — Programmes
 * ------------------------------------------------------------------ */

export const programmeRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  leadInstitution: z.string().min(1),
  supportingInstitutions: z.array(z.string().min(1)),
  pillar: pillarIdSchema,
  objectives: z.string().min(1),
  /** Null where financing is held at project level rather than programme level. */
  financing: z.string().nullable(),
  status: executionStatusSchema,
  priority: registerPrioritySchema,
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  bottlenecks: z.array(z.string()),
  /** Null when nothing currently blocks this programme. */
  bottleneckCategory: bottleneckCategorySchema.nullable(),
  validationStatus: validationStatusSchema,
  lastUpdate: z.iso.datetime(),
})

/* ------------------------------------------------------------------ *
 * Section C — Projects (with profile drill-down)
 * ------------------------------------------------------------------ */

export const projectProfileSchema = z.object({
  description: z.string().min(1),
  budgetUsd: z.number().min(0),
  disbursedUsd: z.number().min(0),
  contractor: z.string().nullable(),
  contactName: z.string().min(1),
  contactEmail: z.email(),
  documents: z.array(
    z.object({
      label: z.string().min(1),
      url: z.string().min(1),
    }),
  ),
  updates: z.array(
    z.object({
      date: z.iso.datetime(),
      note: z.string().min(1),
    }),
  ),
})

export const projectRecordSchema = z.object({
  id: z.string().min(1),
  programmeId: z.string().min(1),
  programmeName: z.string().min(1),
  owner: z.string().min(1),
  location: z.string().min(1),
  coverage: z.string().min(1),
  lifecycleStage: lifecycleStageSchema,
  /** Null where financing is held at programme level rather than project level. */
  financing: z.string().nullable(),
  status: executionStatusSchema,
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  /** Null when no evidence document has been attached. */
  evidenceUrl: z.string().nullable(),
  bottlenecks: z.array(z.string()),
  /** Null when nothing currently blocks this project. */
  bottleneckCategory: bottleneckCategorySchema.nullable(),
  validationStatus: validationStatusSchema,
  profile: projectProfileSchema,
})

/* ------------------------------------------------------------------ *
 * Section D — Milestones and Actions
 * ------------------------------------------------------------------ */

export const milestoneRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  priority: registerPrioritySchema,
  expectedDate: z.iso.datetime(),
  /** Null until the milestone is actually completed. */
  actualDate: z.iso.datetime().nullable(),
  status: executionStatusSchema,
  leadInstitution: z.string().min(1),
  /** Null when no supporting evidence has been attached. */
  evidenceUrl: z.string().nullable(),
  risk: z.string(),
  nextAction: z.string(),
  /** Null when nothing currently blocks this milestone. */
  bottleneckCategory: bottleneckCategorySchema.nullable(),
  validationStatus: validationStatusSchema,
})

export const actionRecordSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  linkedRecord: z.string(),
  responsibleInstitution: z.string().min(1),
  dueDate: z.iso.datetime(),
  status: executionStatusSchema,
  priority: registerPrioritySchema,
  /** Empty when the action has no dependency. */
  dependency: z.string(),
  nextAction: z.string(),
  /** Null when no supporting evidence has been attached. */
  evidenceUrl: z.string().nullable(),
  /** Null when nothing currently blocks this action. */
  bottleneckCategory: bottleneckCategorySchema.nullable(),
  validationStatus: validationStatusSchema,
})

/* ------------------------------------------------------------------ *
 * Section E — Import, export and record linkages
 * ------------------------------------------------------------------ */

export const importValidationIssueSchema = z.object({
  row: z.number().int().min(1),
  field: z.string().min(1),
  issue: z.string().min(1),
})

export const importRegisterRequestSchema = z.object({
  fileName: z.string().trim().min(1, 'Choose a file to upload'),
})

export const importRegisterResponseSchema = z.object({
  fileName: z.string().min(1),
  validatedAt: z.iso.datetime(),
  totalRows: z.number().int().min(0),
  validRows: z.number().int().min(0),
  errorRows: z.number().int().min(0),
  errors: z.array(importValidationIssueSchema),
})

/* ------------------------------------------------------------------ *
 * Section F — this module's own filters
 * ------------------------------------------------------------------ */

export const implementationRegisterFilterOptionsSchema = z.object({
  recordTypes: z.array(filterOptionSchema),
  pillars: z.array(filterOptionSchema),
  institutions: z.array(filterOptionSchema),
  lifecycleStages: z.array(filterOptionSchema),
  executionStatuses: z.array(filterOptionSchema),
  priorities: z.array(filterOptionSchema),
  bottleneckCategories: z.array(filterOptionSchema),
  validationStatuses: z.array(filterOptionSchema),
  reportingPeriods: z.array(filterOptionSchema),
})

export const implementationRegisterQuerySchema = z.object({
  search: z.string().optional(),
  recordType: z.string().optional(),
  pillar: z.string().optional(),
  institution: z.string().optional(),
  lifecycleStage: z.string().optional(),
  executionStatus: z.string().optional(),
  priority: z.string().optional(),
  bottleneckCategory: z.string().optional(),
  validationStatus: z.string().optional(),
  reportingPeriod: z.string().optional(),
})

/**
 * Pagination for GET /api/implementation-register, kept separate from the
 * filter query above (matching the bottlenecks and administration
 * convention): each tab's table paginates independently since all four lists
 * come back in the same payload.
 */
export const implementationRegisterPaginationSchema = z.object({
  pageSize: z.number().int().min(1).max(200),
  programmePage: z.number().int().min(1),
  projectPage: z.number().int().min(1),
  milestonePage: z.number().int().min(1),
  actionPage: z.number().int().min(1),
})

/* ------------------------------------------------------------------ */

/** Response shape for GET /api/implementation-register. */
export const implementationRegisterOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  headlineCards: registerHeadlineCardsSchema,
  programmes: paginated(programmeRecordSchema),
  projects: paginated(projectRecordSchema),
  milestones: paginated(milestoneRecordSchema),
  actions: paginated(actionRecordSchema),
})

export type RecordType = z.infer<typeof recordTypeSchema>
export type ExecutionStatus = z.infer<typeof executionStatusSchema>
export type RegisterPriority = z.infer<typeof registerPrioritySchema>
export type RegisterSummaryCard = z.infer<typeof registerSummaryCardSchema>
export type MilestoneOnTimeCard = z.infer<typeof milestoneOnTimeCardSchema>
export type DelayedOrBlockedCard = z.infer<typeof delayedOrBlockedCardSchema>
export type EvidenceOverdueCard = z.infer<typeof evidenceOverdueCardSchema>
export type RegisterHeadlineCards = z.infer<typeof registerHeadlineCardsSchema>
export type ProgrammeRecord = z.infer<typeof programmeRecordSchema>
export type ProjectProfile = z.infer<typeof projectProfileSchema>
export type ProjectRecord = z.infer<typeof projectRecordSchema>
export type MilestoneRecord = z.infer<typeof milestoneRecordSchema>
export type ActionRecord = z.infer<typeof actionRecordSchema>
export type ImportValidationIssue = z.infer<typeof importValidationIssueSchema>
export type ImportRegisterRequest = z.infer<typeof importRegisterRequestSchema>
export type ImportRegisterResponse = z.infer<typeof importRegisterResponseSchema>
export type ImplementationRegisterOverview = z.infer<
  typeof implementationRegisterOverviewSchema
>
export type ImplementationRegisterQuery = z.infer<
  typeof implementationRegisterQuerySchema
>
export type ImplementationRegisterPagination = z.infer<
  typeof implementationRegisterPaginationSchema
>
export type ImplementationRegisterFilterOptions = z.infer<
  typeof implementationRegisterFilterOptionsSchema
>

/* ------------------------------------------------------------------ *
 * Display labels for the closed vocabularies
 * ------------------------------------------------------------------ */

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  programme: 'Programme',
  project: 'Project',
  milestone: 'Milestone',
  action: 'Action',
}

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  'on-track': 'On track',
  'at-risk': 'At risk',
  delayed: 'Delayed',
  blocked: 'Blocked',
  completed: 'Completed',
}

export const REGISTER_PRIORITY_LABELS: Record<RegisterPriority, string> = {
  priority: 'Priority',
  standard: 'Standard',
}

export const RECORD_TYPES = recordTypeSchema.options
export const EXECUTION_STATUSES = executionStatusSchema.options
