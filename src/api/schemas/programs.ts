import { z } from 'zod'
import { paginated } from './administration'
import { programmeRecordSchema, registerSummaryCardSchema } from './implementation-register'
import { filterOptionSchema } from './filters'

/**
 * Contract for the Programs overview page.
 *
 * There is no dedicated workbook specification for "Programs" — only the
 * Implementation Register spec (docs/specs/implementation-register.md) is
 * written. The wireframe lists "Programs" and "Implementation register" as
 * two separate sidebar items, so this page is built as a lighter, read-only
 * monitoring surface over the SAME programme data the register manages: the
 * portfolio summary card plus the programme table, with no create, import or
 * export capability. It links through to the full Implementation Register
 * for drill-down and record management — the same "curated subset of a
 * fuller register" relationship this codebase already has between Executive
 * Overview and Bottlenecks & Exceptions.
 */

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

/** Response shape for GET /api/programs. */
export const programsOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  summary: registerSummaryCardSchema,
  programmes: paginated(programmeRecordSchema),
})

export type ProgramsFilterOptions = z.infer<typeof programsFilterOptionsSchema>
export type ProgramsQuery = z.infer<typeof programsQuerySchema>
export type ProgramsPagination = z.infer<typeof programsPaginationSchema>
export type ProgramsOverview = z.infer<typeof programsOverviewSchema>
