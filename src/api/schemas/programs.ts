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
export const projectRecordSchema = z.object({
  id: z.string().min(1),
  /** The workbook's "Project" column — a title, distinct from the id. */
  name: z.string().min(1),
  programmeId: z.string().min(1),
  programmeName: z.string().min(1),
  owner: z.string().min(1),
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
  /** The workbook's "Projected Status" — the status expected at this point
   * in the plan, shown alongside the actual current status so a gap between
   * them is visible at a glance. */
  projectedStatus: executionStatusSchema,
  /** The workbook's "Current Project Status". */
  currentStatus: executionStatusSchema,
  startDate: z.iso.datetime(),
  /** The workbook's "Projected Completion Date". */
  endDate: z.iso.datetime(),
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
export type ProgramsSummaryCard = z.infer<typeof programsSummaryCardSchema>
export type MilestoneOnTimeCard = z.infer<typeof milestoneOnTimeCardSchema>
export type DelayedOrBlockedCard = z.infer<typeof delayedOrBlockedCardSchema>
export type EvidenceOverdueCard = z.infer<typeof evidenceOverdueCardSchema>
export type ProgramsHeadlineCards = z.infer<typeof programsHeadlineCardsSchema>
export type ProgrammeRecord = z.infer<typeof programmeRecordSchema>
export type ProjectProfile = z.infer<typeof projectProfileSchema>
export type ProjectRecord = z.infer<typeof projectRecordSchema>
export type MilestoneRecord = z.infer<typeof milestoneRecordSchema>
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

export const EXECUTION_STATUSES = executionStatusSchema.options
export const PROGRAM_TYPES = programTypeSchema.options
export const FUNDING_STATUSES = fundingStatusSchema.options
