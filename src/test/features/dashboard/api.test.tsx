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

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 3_000,
    })

    expect(result.current.data?.headlineCards.accessRate.value).toBe('70.0%')
    expect(result.current.data?.accessDelivery).toHaveLength(4)
    expect(result.current.data?.nationalPerformance).toHaveLength(6)
    expect(result.current.data?.deliveryStatus.ongoingProjects).toHaveLength(8)
  })

  describe('query parameters', () => {
    /*
     * These tests only assert on the request URL the hook constructs, not on
     * the response body, so the mock returns `{}` rather than a full payload.
     * That fails schema validation, so the query settles as an error — which
     * is fine here; we wait for "settled" rather than "success" because the
     * URL is already captured by the time the request lands, regardless of
     * how the mock response validates.
     */
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
      await waitFor(() => expect(result.current.isPending).toBe(false))

      expect(url).not.toContain('?')
    })

    it('serialises only the executive filters the endpoint can apply', async () => {
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
      await waitFor(() => expect(result.current.isPending).toBe(false))

      for (const fragment of [
        'period=q2-2025',
        'pillar=last-mile-access',
        'institution=nerc',
        'technology=mini-grid',
      ]) {
        expect(url, fragment).toContain(fragment)
      }
      // Still not sent: nothing in the payload can answer these three yet —
      // see the note in GlobalFilterBar on why they have no control either.
      for (const excluded of ['priority', 'geographicScope', 'distributionCompany']) {
        expect(url).not.toContain(excluded)
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
      await waitFor(() => expect(result.current.isPending).toBe(false))

      expect(url).toContain('period=q2-2025')
      expect(url).not.toContain('institution')
    })
  })

  /*
   * The endpoint narrows project rows and national metrics for a selected
   * pillar while headline outcomes remain national.
   */
  describe('dynamic pillar behaviour', () => {
    it('returns every ongoing project for All Pillars', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'all' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.appliedPillar).toBe('all')
      expect(result.current.data?.deliveryStatus.ongoingProjects).toHaveLength(8)
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
      expect(result.current.data?.deliveryStatus.ongoingProjects).toHaveLength(2)
      // Four of the six Section C metrics belong to this pillar.
      expect(result.current.data?.nationalPerformance).toHaveLength(4)
    })

    it('narrows project rows to the selected pillar', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'last-mile-access' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const projects = result.current.data?.deliveryStatus.ongoingProjects ?? []
      expect(projects).toHaveLength(1)
      expect(projects.every((project) => project.pillar === 'last-mile-access')).toBe(true)
    })

    it('falls back to the full payload for an unknown pillar', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ pillar: 'not-a-pillar' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.deliveryStatus.ongoingProjects).toHaveLength(8)
    })
  })

  describe('period and institution behaviour', () => {
    it('returns a different reporting snapshot when the period changes', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ period: 'q1-2025' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.headlineCards.peopleWithElectricityAccess.value).toBe('123.6M')
      expect(result.current.data?.headlineCards.peopleWithElectricityAccess.reportingPeriod).toBe('Q1 2025')
      expect(result.current.data?.nationalPerformance.find((metric) => metric.id === 'metering-rate')?.current).not.toBe(57)
    })

    it('narrows metrics, projects and exceptions by institution', async () => {
      const { result } = renderHook(
        () => useExecutiveOverview({ institution: 'nerc' }),
        { wrapper: QueryWrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.nationalPerformance.map((metric) => metric.id)).toEqual([
        'metering-rate',
        'atcc-losses',
        'market-remittance',
        'tariff-shortfall',
      ])
      expect(result.current.data?.deliveryStatus.ongoingProjects).toHaveLength(1)
      expect(result.current.data?.deliveryStatus.ongoingProjects[0]?.owner).toBe('NERC')
      expect(result.current.data?.deliveryStatus.exceptions.every((item) => item.institution.includes('NERC'))).toBe(true)
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
