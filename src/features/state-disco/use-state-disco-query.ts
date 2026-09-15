import { useState } from 'react'
import type { StateDiscoQuery } from '@/api/schemas/state-disco'

export const DEFAULT_STATE_DISCO_QUERY: Required<StateDiscoQuery> = {
  // 'all' resolves server-side to each DisCo's latest reported quarter, so
  // this page opens on the same figures the Executive Overview headlines
  // show. A hardcoded quarter here silently pinned the page to an older
  // period and made the two pages disagree on the national ATC&C rate.
  reportingPeriod: 'all',
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
