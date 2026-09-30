import { delay, http, HttpResponse } from '../local-router'
import { pillarIdSchema } from '@/api/schemas/common'
import { buildPillarDashboard } from '../data/pillar-dashboard'

export const pillarDashboardHandlers = [
  /** GET /api/pillars/:pillar
   *
   * Ignores `?reportingPeriod=` - the mock KPI profiles (kpi-explorer.ts)
   * only model a single "current" snapshot per KPI, not a per-period value
   * history, so there's nothing here to filter against yet. The real
   * backend (pillar-dashboard.service.ts) does apply it.
   */
  http.get('/api/pillars/:pillar', async ({ params }) => {
    await delay(300)

    const result = pillarIdSchema.safeParse(String(params.pillar))
    if (!result.success) {
      return HttpResponse.json({ message: 'Unknown Compact pillar.' }, { status: 404 })
    }

    return HttpResponse.json(buildPillarDashboard(result.data))
  }),
]
