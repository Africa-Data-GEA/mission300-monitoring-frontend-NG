import { delay, http, HttpResponse } from 'msw'
import { pillarIdSchema } from '@/api/schemas/common'
import { buildPillarDashboard } from '../data/pillar-dashboard'

export const pillarDashboardHandlers = [
  /** GET /api/pillars/:pillar */
  http.get('/api/pillars/:pillar', async ({ params }) => {
    await delay(300)

    const result = pillarIdSchema.safeParse(String(params.pillar))
    if (!result.success) {
      return HttpResponse.json({ message: 'Unknown Compact pillar.' }, { status: 404 })
    }

    return HttpResponse.json(buildPillarDashboard(result.data))
  }),
]
