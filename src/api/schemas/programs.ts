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
 * Contract for Programs — the consolidated Programmes → Projects →
 * (Milestones, Bottlenecks) drill-down.
 *
 * There is no dedicated workbook specification for this page — only the
 * original Implementation Register specification
 * (docs/specs/implementation-register.md) was written, and that standalone
 * page (along with the standalone Bottlenecks & Exceptions page) has been
 * folded into this one: a portfolio overview of programmes that drills into
 * a programme's projects, and from a project into its bottlenecks and
 * milestones. There is deliberately no Actions tracker and no bulk
 * import/export here — neither survived the consolidation.
 *
 * `lifecycleStageSchema` and `bottleneckCategorySchema` are imported from
 * bottlenecks.ts rather than redefined: both describe the same underlying
 * delivery pipeline and constraint taxonomy. `validationStatusSchema` is
 * imported from kpi-explorer.ts for the same reason.
 */

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export const executionStatusSchema = z.enum([
  'on-track',
  'at-risk',
  'delayed',
  'blocked',
  'completed',
])

/** Whether a milestone is one of the Compact's priority items. */
export const registerPrioritySchema = z.enum(['priority', 'standard'])

/** How a project's funding is structured, per the Programme & Project tracking workbook. */
export const programTypeSchema = z.enum([
  'grant',
  'concessional-loan',
  'ppp',
  'government-funded',
  'blended-finance',
])

/** Whether committed funding is actually flowing, per the tracking workbook's "Funding Status". */
export const fundingStatusSchema = z.enum([
  'committed',
  'disbursing',
  'fully-disbursed',
  'at-risk',
  'unfunded',
])

/**
 * Readiness of a project not yet in active delivery — distinct from
 * `lifecycleStage` (identification→operations), which only describes stages
 * a project passes through once it IS active. Stakeholder feedback asked to
 * be able to track projects still in the pipeline with this readiness
 * detail, rather than only listing projects already underway.
 */
export const pipelineReadinessSchema = z.enum(['pipeline', 'feasibility-study', 'investment-ready'])

/* ------------------------------------------------------------------ *
 * Headline performance cards
 *
 * Each of the four cards has its own shape (summary, progress, exception,
 * exception), so each is modelled as a named field rather than a generic
 * array — a card cannot go missing without failing validation. Mirrors
 * executive-overview.ts's headlineCardsSchema pattern.
 * ------------------------------------------------------------------ */

/** Active programmes and projects, counted separately. */
export const programsSummaryCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  activeProgrammes: z.number().int().min(0),
  activeProjects: z.number().int().min(0),
  newThisCycle: z.number().int().min(0),
  closedThisCycle: z.number().int().min(0),
  trend: trendSchema.optional(),
  provenance: metricProvenanceSchema,
})

/** Priority milestones delivered on time. */
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

/** Delayed or blocked priority records. Targets zero. */
export const delayedOrBlockedCardSchema = z.object({
  title: z.string().min(1),
  icon: metricIconNameSchema,
  count: z.number().int().min(0),
  targetLabel: z.string().min(1),
  supportingLabel: z.string().min(1),
  trend: trendSchema,
  provenance: metricProvenanceSchema,
})

/** Priority records missing required evidence or a current update. */
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

export const programsHeadlineCardsSchema = z.object({
  summary: programsSummaryCardSchema,
  milestoneOnTime: milestoneOnTimeCardSchema,
  delayedOrBlocked: delayedOrBlockedCardSchema,
  evidenceOverdue: evidenceOverdueCardSchema,
})

/* ------------------------------------------------------------------ *
 * Programmes (top level)
 * ------------------------------------------------------------------ */

export const programmeRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  leadInstitution: z.string().min(1),
  /** The Institution record `leadInstitution` was resolved onto, or null where
   * the free-text name does not match a registered institution. */
  leadInstitutionRecord: z
    .object({ id: z.string().min(1), name: z.string().min(1) })
    .nullable()
    .default(null),
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
 * Projects (drill-down from a programme, with a full profile)
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

/**
 * A project row, aligned to the Programme & Project tracking workbook's
 * column set: Program, Project, M300 Pillar Alignment, Projected Completion
 * Date, Projected Status, Current Project Status, Comment – Issues/Main
 * Risk/Bottlenecks, Suggestion, Program Type, Funding Sources/Size/Structure
 * and Funding Status.
 */
/** One reporting-cycle snapshot in a project's status trail — stakeholder
 * feedback asked to see how a priority project's status evolved over the
 * reporting cycle, not just its current value. */
export const statusHistoryEntrySchema = z.object({
  period: z.string().min(1),
  status: executionStatusSchema,
})

export const projectRecordSchema = z.object({
  id: z.string().min(1),
  /** The workbook's "Project" column — a title, distinct from the id. */
  name: z.string().min(1),
  programmeId: z.string().min(1),
  programmeName: z.string().min(1),
  owner: z.string().min(1),
  /** The named person leading delivery — distinct from `owner`, which is the
   * accountable institution. Stakeholder feedback asked for both. */
  leadName: z.string().min(1),
  location: z.string().min(1),
  coverage: z.string().min(1),
  /** The workbook's "M300 Pillar Alignment" — a project can align to a
   * different pillar than its parent programme's primary pillar. */
  pillar: pillarIdSchema,
  lifecycleStage: lifecycleStageSchema,
  programType: programTypeSchema,
  /** The workbook's "Funding Sources", e.g. "World Bank DARES facility".
   * Null where funding has not yet been secured. */
  fundingSource: z.string().nullable(),
  /** The workbook's "Funding Structure", e.g. "Concessional loan with
   * government counterpart funding". */
  fundingStructure: z.string().min(1),
  fundingStatus: fundingStatusSchema,
  /** Null once a project is active (design stage or beyond) — only tracked
   * while a project is still in the pipeline, not yet formally underway. */
  pipelineReadiness: pipelineReadinessSchema.nullable(),
  /** The workbook's "Projected Status" — the status expected at this point
   * in the plan, shown alongside the actual current status so a gap between
   * them is visible at a glance. */
  projectedStatus: executionStatusSchema,
  /** The workbook's "Current Project Status". */
  currentStatus: executionStatusSchema,
  startDate: z.iso.datetime(),
  /**
   * The workbook's "Projected Completion Date". Null where the source
   * register records no projected completion date for the project — the
   * NISO register leaves this blank for most of its entries, and a
   * placeholder date here would read as a real commitment.
   */
  endDate: z.iso.datetime().nullable(),
  /** Null when no evidence document has been attached. */
  evidenceUrl: z.string().nullable(),
  bottlenecks: z.array(z.string()),
  /** Null when nothing currently blocks this project. */
  bottleneckCategory: bottleneckCategorySchema.nullable(),
  /** The workbook's "Comment – Issues/Main Risk/Bottlenecks" narrative. */
  comment: z.string(),
  /** The workbook's "Suggestion". */
  suggestion: z.string(),
  validationStatus: validationStatusSchema,
  profile: projectProfileSchema,
  /** Ordered oldest-to-newest status per reporting period, so leadership can
   * see the trajectory (e.g. on-track → at-risk → delayed) rather than only
   * the current snapshot. */
  statusHistory: z.array(statusHistoryEntrySchema),
})

/* ------------------------------------------------------------------ *
 * Admin: create / update / delete a priority project
 *
 * Mock-only mutation, mirroring createBottleneckRequestSchema in
 * bottlenecks.ts. Scoped to the fields shown on the Overview delivery-status
 * table plus the essentials a new project needs to exist (budget, contractor
 * etc. default to placeholders and are only editable from the full Programs
 * project profile, not this quick-add form). There is no auth/role
 * enforcement anywhere in this app yet (see administration.ts), so — like
 * every other mutation here — this is reachable by anyone, not gated to an
 * "admin" role.
 * ------------------------------------------------------------------ */

export const upsertProjectRequestSchema = z.object({
  name: z.string().trim().min(3, 'Name the project'),
  programmeId: z.string().trim().min(1, 'Select a programme'),
  owner: z.string().trim().min(1, 'Name the accountable institution'),
  leadName: z.string().trim().min(1, 'Name the project lead'),
  location: z.string().trim().min(1, 'Add a location'),
  pillar: pillarIdSchema,
  currentStatus: executionStatusSchema,
  endDate: z.iso.datetime(),
  comment: z.string().trim().max(1000).optional(),
  /** Null once a project is active — stakeholder feedback asked to be able
   * to add a project still in the pipeline with this readiness detail from
   * this same quick-add form, not only view it on pre-existing records. */
  pipelineReadiness: pipelineReadinessSchema.nullable(),
})

export const upsertProjectResponseSchema = z.object({
  record: projectRecordSchema,
  message: z.string().min(1),
})

/* ------------------------------------------------------------------ *
 * Admin: create a new programme
 *
 * Mock-only mutation, create-only (no edit/delete yet) — mirrors
 * upsertProjectRequestSchema's scoping: the quick-add essentials a new
 * programme needs to exist, not the full record. `supportingInstitutions`,
 * `priority` and `bottlenecks` default on the server rather than being
 * asked here.
 * ------------------------------------------------------------------ */

export const createProgrammeRequestSchema = z.object({
  name: z.string().trim().min(3, 'Name the programme'),
  leadInstitution: z.string().trim().min(1, 'Name the lead institution'),
  pillar: pillarIdSchema,
  objectives: z.string().trim().min(10, 'Describe the programme objectives'),
  status: executionStatusSchema,
  endDate: z.iso.datetime(),
  financing: z.string().trim().max(200).optional(),
})

export const createProgrammeResponseSchema = z.object({
  record: programmeRecordSchema,
  message: z.string().min(1),
})

/* ------------------------------------------------------------------ *
 * Bulk upload (one Excel template, programmes + projects together)
 * ------------------------------------------------------------------ */

export const bulkUploadRowErrorSchema = z.object({
  row: z.number(),
  message: z.string(),
})

export const bulkUploadResultSchema = z.object({
  dryRun: z.boolean(),
  totalRows: z.number(),
  programmesCreated: z.number(),
  programmesUpdated: z.number(),
  projectsCreated: z.number(),
  projectsUpdated: z.number(),
  errorCount: z.number(),
  errors: z.array(bulkUploadRowErrorSchema),
  message: z.string(),
})

/* ------------------------------------------------------------------ *
 * Milestones (drill-down from a project)
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

export const createMilestoneRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name the milestone'),
  leadInstitution: z.string().trim().min(1, 'Name the lead institution'),
  expectedDate: z.iso.datetime(),
  priority: registerPrioritySchema.optional(),
  status: executionStatusSchema.optional(),
  risk: z.string().trim().max(1000).optional(),
  nextAction: z.string().trim().max(1000).optional(),
  bottleneckCategory: bottleneckCategorySchema.nullable().optional(),
})

export const createMilestoneResponseSchema = z.object({
  record: milestoneRecordSchema,
  message: z.string().min(1),
})

/* ------------------------------------------------------------------ *
 * Filters, query and pagination
 * ------------------------------------------------------------------ */

export const programsFilterOptionsSchema = z.object({
  pillars: z.array(filterOptionSchema),
  institutions: z.array(filterOptionSchema),
  statuses: z.array(filterOptionSchema),
})

export const programsQuerySchema = z.object({
  search: z.string().optional(),
  pillar: z.string().optional(),
  institution: z.string().optional(),
  status: z.string().optional(),
})

export const programsPaginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(200),
})

export const projectsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
})

/** Response shape for GET /api/programs. */
export const programsOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  headlineCards: programsHeadlineCardsSchema,
  programmes: paginated(programmeRecordSchema),
})

export type ExecutionStatus = z.infer<typeof executionStatusSchema>
export type RegisterPriority = z.infer<typeof registerPrioritySchema>
export type ProgramType = z.infer<typeof programTypeSchema>
export type FundingStatus = z.infer<typeof fundingStatusSchema>
export type PipelineReadiness = z.infer<typeof pipelineReadinessSchema>
export type ProgramsSummaryCard = z.infer<typeof programsSummaryCardSchema>
export type MilestoneOnTimeCard = z.infer<typeof milestoneOnTimeCardSchema>
export type DelayedOrBlockedCard = z.infer<typeof delayedOrBlockedCardSchema>
export type EvidenceOverdueCard = z.infer<typeof evidenceOverdueCardSchema>
export type ProgramsHeadlineCards = z.infer<typeof programsHeadlineCardsSchema>
export type ProgrammeRecord = z.infer<typeof programmeRecordSchema>
export type ProjectProfile = z.infer<typeof projectProfileSchema>
export type ProjectRecord = z.infer<typeof projectRecordSchema>
export type StatusHistoryEntry = z.infer<typeof statusHistoryEntrySchema>
export type UpsertProjectRequest = z.infer<typeof upsertProjectRequestSchema>
export type UpsertProjectResponse = z.infer<typeof upsertProjectResponseSchema>
export type CreateProgrammeRequest = z.infer<typeof createProgrammeRequestSchema>
export type CreateProgrammeResponse = z.infer<typeof createProgrammeResponseSchema>
export type BulkUploadResult = z.infer<typeof bulkUploadResultSchema>
export type MilestoneRecord = z.infer<typeof milestoneRecordSchema>
export type CreateMilestoneRequest = z.infer<typeof createMilestoneRequestSchema>
export type CreateMilestoneResponse = z.infer<typeof createMilestoneResponseSchema>
export type ProgramsFilterOptions = z.infer<typeof programsFilterOptionsSchema>
export type ProgramsQuery = z.infer<typeof programsQuerySchema>
export type ProgramsPagination = z.infer<typeof programsPaginationSchema>
export type ProjectsQuery = z.infer<typeof projectsQuerySchema>
export type ProgramsOverview = z.infer<typeof programsOverviewSchema>

/* ------------------------------------------------------------------ *
 * Display labels for the closed vocabularies
 * ------------------------------------------------------------------ */

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

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  grant: 'Grant',
  'concessional-loan': 'Concessional loan',
  ppp: 'Public-private partnership',
  'government-funded': 'Government-funded',
  'blended-finance': 'Blended finance',
}

export const FUNDING_STATUS_LABELS: Record<FundingStatus, string> = {
  committed: 'Committed',
  disbursing: 'Disbursing',
  'fully-disbursed': 'Fully disbursed',
  'at-risk': 'At risk',
  unfunded: 'Unfunded',
}

export const PIPELINE_READINESS_LABELS: Record<PipelineReadiness, string> = {
  pipeline: 'Pipeline',
  'feasibility-study': 'Feasibility study',
  'investment-ready': 'Investment-ready',
}

export const EXECUTION_STATUSES = executionStatusSchema.options
export const PROGRAM_TYPES = programTypeSchema.options
export const FUNDING_STATUSES = fundingStatusSchema.options
export const PIPELINE_READINESS_TIERS = pipelineReadinessSchema.options
