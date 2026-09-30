import { z } from 'zod'

/** One hit from the global search endpoint - a KPI, programme or project,
 * each with a real page it can deep-link to. Institutions/DisCos aren't a
 * search target: unlike these three, there's no single-record page for one
 * to land on yet. */
export const searchResultItemSchema = z.object({
  type: z.enum(['kpi', 'programme', 'project']),
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  url: z.string(),
})

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.array(searchResultItemSchema),
})

export type SearchResultItem = z.infer<typeof searchResultItemSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>
