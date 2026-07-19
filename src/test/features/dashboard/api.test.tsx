import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { dashboardKeys, useExecutiveOverview } from '@/features/dashboard/api'
import { server } from '@/mocks/server'
import { QueryWrapper } from '@/test/render'

describe('dashboardKeys', () => {
  it('namespaces all dashboard queries under a common root', () => {
    expect(dashboardKeys.executiveOverview({})[0]).toBe('dashboard')
  })

  /*
   * Filters are part of the key, so changing one is a distinct cache entry
   * rather than a silent reuse of the previous period's data.
   */
  it('produces distinct keys for distinct filters', () => {
    const a = JSON.stringify(dashboardKeys.executiveOverview({ pillar: 'all' }))
    const b = JSON.stringify(
      dashboardKeys.executiveOverview({ pillar: 'clean-cooking' }),
    )

    expect(a).not.toBe(b)
  })

  it('produces a stable key for the same filters', () => {
    const a = JSON.stringify(dashboardKeys.executiveOverview({ period: 'q3-2025' }))
    const b = JSON.stringify(dashboardKeys.executiveOverview({ period: 'q3-2025' }))

    expect(a).toBe(b)
  })
})

describe('useExecutiveOverview', () => {
  it('starts in a pending state', () => {
    const { result } = renderHook(() => useExecutiveOverview(), {
      wrapper: QueryWrapper,
    })

    expect(result.current.isPending).toBe(true)
  })

  it('fetches the full section A–D payload', async () => {
    const { result } = renderHook(() => useExecutiveOverview(), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.headlineCards.accessRate.value).toBe('70%')
    expect(result.current.data?.accessDelivery).toHaveLength(3)
    expect(result.current.data?.nationalPerformance).toHaveLength(6)
    expect(result.current.data?.deliveryStatus.pillars).toHaveLength(6)
  })

  describe('query parameters', () => {
    it('sends no query string when no filters are given', async () => {
      let url = ''
      server.use(
        http.get('/api/executive-overview', ({ request }) => {
          url = request.url
          return HttpResponse.json({})
        }),
      )

      const { result } = renderHook(() => useExecutiveOverview(), {
        wrapper: QueryWrapper,
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(url).not.toContain('?')
    })

    it('serialises all seven filters', async () => {
      let url = ''
      server.use(
        http.get('/api/executive-overview', ({ request }) => {
          url = request.url
          return HttpResponse.json({})
        }),
      )

      const { result } = renderHook(
        () =>
          useExecutiveOverview({
            period: 'q2-2025',
            pillar: 'last-mile-access',
            institution: 'nerc',
            priority: 'all',
            geographicScope: 'state',
            distributionCompany: 'ikeja',
            technology: 'mini-grid',
          }),
        { wrapper: QueryWrapper },
      )
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      for (const fragment of [
        'period=q2-2025',
        'pillar=last-mile-access',
        'institution=nerc',
        'priority=all',
        'geographicScope=state',
        'distributionCompany=ikeja',
        'technology=mini-grid',
      ]) {
        expect(url, fragment).toContain(fragment)
      }
    })

    it('omits filters that are not set', async () => {
      let url = ''
      server.use(
        http.get('/api/executive-overview', ({ request }) => {
          url = request.url
          return HttpResponse.json({})
        }),
      )

      const { result } = renderHook(
        () => useExecutiveOverview({ period: 'q2-2025' }),
        { wrapper: QueryWrapper },
      )
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(url).toContain('period=q2-2025')
      expect(url).not.toContain('institution')
    })
  })

  /*
   * The specification requires the page to recalculate for a selected pillar,
   * not merely to hide rows. The mock implements the narrowing so the required
   * behaviour is demonstrable and the contract is unambiguous for the backend.
   */
  describe('dynamic pillar behaviour', () => {
    it('returns every pillar for All Pillars', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'all' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.appliedPillar).toBe('all')
      expect(result.current.data?.deliveryStatus.pillars).toHaveLength(6)
    })

    it('narrows the payload to the selected pillar', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'financially-viable-utilities' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.appliedPillar).toBe(
        'financially-viable-utilities',
      )
      expect(result.current.data?.deliveryStatus.pillars).toHaveLength(1)
      // Four of the six Section C metrics belong to this pillar.
      expect(result.current.data?.nationalPerformance).toHaveLength(4)
    })

    it('recalculates the milestone delivery card for the selected pillar', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'last-mile-access' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // 4 completed of 21 records ≈ 19%, not the national 15%.
      expect(
        result.current.data?.headlineCards.milestoneDelivery.percentComplete,
      ).toBe(19)
    })

    it('falls back to the full payload for an unknown pillar', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'not-a-pillar' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.deliveryStatus.pillars).toHaveLength(6)
    })
  })

  it('surfaces a server error to the caller', async () => {
    server.use(
      http.get('/api/executive-overview', () =>
        HttpResponse.json({ message: 'Upstream unavailable' }, { status: 503 }),
      ),
    )

    const { result } = renderHook(() => useExecutiveOverview(), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Upstream unavailable')
  })
})
