import { useState } from 'react'
import type { DataSubmissionQuery } from '@/api/schemas/data-submissions'

export const DEFAULT_WORKFLOW_QUERY: Required<DataSubmissionQuery> = {
  search: '', institution: 'all', dataset: 'all', reportingPeriod: 'all',
  submissionStatus: 'all', validationStatus: 'all', reviewer: 'all',
  readinessTier: 'all', overdueStatus: 'all', page: 1, pageSize: 10,
}

export function useWorkflowQuery() {
  const [query, setQuery] = useState(DEFAULT_WORKFLOW_QUERY)
  function update(next: Required<DataSubmissionQuery>) {
    setQuery({ ...next, page: 1 })
  }
  return {
    query, update,
    reset: () => setQuery({ ...DEFAULT_WORKFLOW_QUERY, search: query.search }),
    setPage: (page: number) => setQuery((current) => ({ ...current, page })),
  }
}
