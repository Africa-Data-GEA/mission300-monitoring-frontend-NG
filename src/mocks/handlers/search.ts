import { http, HttpResponse } from '../local-router'
import { kpiExplorerCatalogue, kpiExplorerFilterOptions } from '../data/kpi-explorer'
import { programmes, projects } from '../data/programs'

const labelForPillar = (value: string) =>
  kpiExplorerFilterOptions.pillars.find((option) => option.value === value)?.label ?? value

export const searchHandlers = [
  http.get('/api/search', ({ request }) => {
    const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''
    if (query.length < 2) return HttpResponse.json({ query, results: [] })

    const needle = query.toLowerCase()
    const results = [
      ...kpiExplorerCatalogue
        .filter((row) => row.active !== false && `${row.id} ${row.name}`.toLowerCase().includes(needle))
        .slice(0, 5)
        .map((row) => ({
          type: 'kpi' as const,
          id: row.id,
          title: row.name,
          subtitle: `KPI · ${labelForPillar(row.pillar)}`,
          url: `/kpis?kpi=${encodeURIComponent(row.id)}`,
        })),
      ...programmes
        .filter((row) => row.name.toLowerCase().includes(needle))
        .slice(0, 5)
        .map((row) => ({
          type: 'programme' as const,
          id: row.id,
          title: row.name,
          subtitle: `Programme · ${labelForPillar(row.pillar)}`,
          url: `/programs/${row.id}`,
        })),
      ...projects
        .filter((row) => `${row.name} ${row.owner} ${row.location}`.toLowerCase().includes(needle))
        .slice(0, 5)
        .map((row) => ({
          type: 'project' as const,
          id: row.id,
          title: row.name,
          subtitle: `Project · ${row.programmeName}`,
          url: `/programs/projects/${row.id}`,
        })),
    ]

    return HttpResponse.json({ query, results })
  }),
]
