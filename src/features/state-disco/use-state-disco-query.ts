import { useState } from 'react'
import type { StateDiscoQuery } from '@/api/schemas/state-disco'

export const DEFAULT_STATE_DISCO_QUERY: Required<StateDiscoQuery> = {
  reportingPeriod: 'q3-2025',
  view: 'disco',
  distributionCompany: 'national',
  state: 'all',
  utilityMetric: 'all',
  serviceBand: 'all',
  // Defaults to showing everything — see the note in shared.ts. Filtering to
  // `confirmed` by default would hide provisional rows before the reader has
  // seen them.
  validationStatus: 'all',
  source: 'nerc',
}

export function useStateDiscoQuery() {
  const [query, setQuery] = useState(DEFAULT_STATE_DISCO_QUERY)
  return { query, setQuery, reset: () => setQuery(DEFAULT_STATE_DISCO_QUERY) }
}
