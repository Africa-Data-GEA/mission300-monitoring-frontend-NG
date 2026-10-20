import { ApiError } from '@/lib/api-client'

export interface RowProblem {
  row: number
  period: string
  field: string | null
  value: string | null
  problem: string
}

function isRowProblem(candidate: unknown): candidate is RowProblem {
  if (!candidate || typeof candidate !== 'object') return false
  const item = candidate as Record<string, unknown>
  return (
    typeof item.row === 'number' &&
    typeof item.period === 'string' &&
    typeof item.problem === 'string' &&
    (item.field === null || typeof item.field === 'string') &&
    (item.value === null || typeof item.value === 'string')
  )
}

/** The rows a refused upload named, from the server's error body. Empty when
 * the error carries none (a network failure, a duplicate, an old backend). */
export function readRowProblems(error: unknown): RowProblem[] {
  if (!(error instanceof ApiError)) return []
  const body = error.body
  if (!body || typeof body !== 'object') return []
  const problems = (body as { problems?: unknown }).problems
  return Array.isArray(problems) ? problems.filter(isRowProblem) : []
}
