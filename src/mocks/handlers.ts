import { http, HttpResponse, delay } from 'msw'
import { executiveOverview } from './data/executive-overview'
import type { ExecutiveOverview } from '@/features/dashboard/types'

/**
 * MSW request handlers — the executable API contract.
 *
 * These handlers ARE the specification handed to the gApp backend team: each
 * documents a path, method, accepted query parameters and exact response
 * shape. Keep them in sync with docs/API.md and the feature type definitions.
 */

/**
 * Applies the Compact pillar filter, demonstrating the dynamic pillar
 * behaviour the specification requires:
 *
 *   "All Pillars shows the four default headline cards. When a pillar is
 *    selected, the delivery card recalculates for that pillar, the middle two
 *    cards change to the most important metrics for the selected pillar, and
 *    the escalation card filters to that pillar."
 *
 * This mock implements the narrowing that can be derived from the base
 * payload — Section C and D filter to the pillar, and the delivery card
 * recalculates from that pillar's record counts. Swapping the middle two
 * headline cards for pillar-specific metrics needs data the mock does not
 * carry, so those stay as the national figures; the real implementation must
 * substitute them. Called out in docs/API.md as an open contract item.
 */
function applyPillarFilter(
  payload: ExecutiveOverview,
  pillar: string,
): ExecutiveOverview {
  if (!pillar || pillar === 'all') return payload

  const pillarStatus = payload.deliveryStatus.pillars.find(
    (entry) => entry.pillar === pillar,
  )

  // Unknown pillar: return the payload untouched rather than an empty page.
  if (!pillarStatus) return payload

  const completed =
    pillarStatus.counts.find((entry) => entry.status === 'completed')?.count ?? 0
  const onTrack =
    pillarStatus.counts.find((entry) => entry.status === 'on-track')?.count ?? 0
  const percentComplete =
    pillarStatus.total === 0
      ? 0
      : Math.round((completed / pillarStatus.total) * 100)

  const exceptions = payload.deliveryStatus.exceptions.filter((exception) =>
    exception.institution.length > 0,
  )

  return {
    ...payload,
    appliedPillar: pillar,
    headlineCards: {
      ...payload.headlineCards,
      milestoneDelivery: {
        ...payload.headlineCards.milestoneDelivery,
        percentComplete,
        breakdown: pillarStatus.counts.map((entry) => ({
          status: entry.status,
          label: entry.status.replace('-', ' '),
          count: entry.count,
        })),
        baselineLabel: `${pillarStatus.total} priority records in ${pillarStatus.label}`,
      },
      escalations: {
        ...payload.headlineCards.escalations,
        unresolvedCritical: Math.min(
          payload.headlineCards.escalations.unresolvedCritical,
          completed + onTrack,
        ),
      },
    },
    nationalPerformance: payload.nationalPerformance.filter(
      (metric) => metric.pillar === pillar,
    ),
    deliveryStatus: {
      ...payload.deliveryStatus,
      pillars: [pillarStatus],
      exceptions,
    },
  }
}

export const handlers = [
  http.get('/api/health', () =>
    HttpResponse.json({ status: 'ok', version: 'mock' }),
  ),

  /**
   * GET /api/executive-overview
   *
   * Query (all optional): period, pillar, institution, priority,
   * geographicScope, distributionCompany, technology.
   *
   * The mock applies the `pillar` filter to demonstrate the required dynamic
   * behaviour. The remaining filters are accepted and echoed but do not narrow
   * the mock data; the real implementation must apply all seven.
   *
   * The artificial delay exists so loading states are exercised during
   * development rather than flashing past.
   */
  http.get('/api/executive-overview', async ({ request }) => {
    await delay(400)

    const pillar = new URL(request.url).searchParams.get('pillar') ?? 'all'

    return HttpResponse.json(applyPillarFilter(executiveOverview, pillar))
  }),
]
