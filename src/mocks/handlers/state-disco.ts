import { delay, http, HttpResponse } from '../local-router'
import {
  discoComparisonRows,
  stateCoverageRows,
  stateDetails,
  stateDiscoFilters,
  stateDiscoOverview,
  utilityDeliveryRows,
  utilityOperationsRows,
} from '../data/state-disco'

function filterUtility<T extends { id: string }>(rows: T[], request: Request) {
  const value = new URL(request.url).searchParams.get('distributionCompany')
  return !value || value === 'national' ? rows : rows.filter((row) => row.id === value)
}

export const stateDiscoHandlers = [
  http.get('/api/state-disco/filters', () => HttpResponse.json(stateDiscoFilters)),
  http.get('/api/state-disco/overview', async () => {
    await delay(100)
    return HttpResponse.json(stateDiscoOverview)
  }),
  http.get('/api/state-disco/comparison', async ({ request }) => {
    await delay(100)
    return HttpResponse.json({
      meta: stateDiscoOverview.meta,
      rows: filterUtility(discoComparisonRows, request),
    })
  }),
  http.get('/api/state-disco/supply-tariff', async ({ request }) => {
    await delay(100)
    return HttpResponse.json({
      meta: {
        ...stateDiscoOverview.meta,
        title: 'Supply hours and approved tariffs',
        description: 'Service bands remain separate; no unweighted tariff average is presented.',
      },
      rows: filterUtility(utilityOperationsRows, request),
    })
  }),
  http.get('/api/state-disco/delivery', async ({ request }) => {
    await delay(100)
    return HttpResponse.json({
      meta: {
        ...stateDiscoOverview.meta,
        title: 'Utility delivery and reporting compliance',
        description: 'Performance Improvement Plan milestones linked to evidence and open bottlenecks.',
      },
      rows: filterUtility(utilityDeliveryRows, request),
    })
  }),
  http.get('/api/state-disco/states', async ({ request }) => {
    await delay(100)
    const state = new URL(request.url).searchParams.get('state')
    const rows = !state || state === 'all'
      ? stateCoverageRows
      : stateCoverageRows.filter((row) => row.id === state)
    return HttpResponse.json({
      meta: {
        ...stateDiscoOverview.meta,
        title: 'State delivery coverage',
        description: 'Validated distributed-energy delivery records where approved state breakdowns exist.',
        sourceLabel: 'REA and Implementation Register',
      },
      notice: 'Connection counts are not converted into inferred state electricity-access rates.',
      rows,
    })
  }),
  http.get('/api/state-disco/states/:id', ({ params }) => {
    const detail = stateDetails[String(params.id)]
    return detail
      ? HttpResponse.json(detail)
      : HttpResponse.json({ message: 'The state profile was not found.' }, { status: 404 })
  }),
]
