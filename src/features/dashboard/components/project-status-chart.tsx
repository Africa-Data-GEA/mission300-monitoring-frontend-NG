import Chart from 'react-apexcharts'
import { EXECUTION_STATUS_LABELS, type ExecutionStatus } from '@/api/schemas/programs'
import { CHART_BLUE, getChartAccent } from '@/config/chart-colors'
import { groupProjectsByProgramme, STATUS_SEVERITY } from '../lib/group-projects-by-programme'
import type { OngoingProject } from '../types'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/** One stacked bar per programme, split by the status of its projects. */
export function ProjectStatusChart({
  projects,
  onStatusClick,
}: {
  projects: readonly OngoingProject[]
  /** Fired when a bar segment is clicked, to jump to that status's projects
   * in the table. */
  onStatusClick?: (status: ExecutionStatus) => void
}) {
  // Read inside the render body, not as a module-level constant, so a
  // brand-colour change (see BrandProvider) is picked up on the next render.
  const STATUS_COLORS: Record<ExecutionStatus, string> = {
    'on-track': CHART_BLUE.darkest,
    'at-risk': CHART_BLUE.base,
    delayed: CHART_BLUE.light,
    blocked: getChartAccent(),
    // Finished work sits apart from the live-delivery ramp rather than
    // reading as another degree of risk on the same scale.
    completed: CHART_BLUE.lightest,
  }

  if (projects.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">No ongoing projects to chart.</p>
  }

  // Largest programme first, so the bars read as a ranking.
  const groups = groupProjectsByProgramme(projects).sort(
    (a, b) => b.projects.length - a.projects.length,
  )
  const statuses = (Object.keys(STATUS_SEVERITY) as ExecutionStatus[]).filter((status) =>
    projects.some((project) => project.currentStatus === status),
  )

  return (
    <div
      role="img"
      aria-label={`Delivery status by programme for ${projects.length} ongoing projects`}
      className="rounded-xl border border-border-default bg-surface-card p-3"
    >
      <div className="px-2 pt-1">
        <h4 className="text-sm font-semibold text-text-default">Project status by programme</h4>
        <p className="mt-1 text-xs text-text-muted">
          Number of ongoing projects in each programme, by current delivery status.
        </p>
      </div>

      <Chart
        type="bar"
        height={Math.max(260, groups.length * 48 + 110)}
        series={statuses.map((status) => ({
          name: EXECUTION_STATUS_LABELS[status],
          data: groups.map(
            (group) => group.statusCounts.find((entry) => entry.status === status)?.count ?? 0,
          ),
        }))}
        options={{
          chart: {
            type: 'bar',
            stacked: true,
            toolbar: { show: false },
            fontFamily: FONT_FAMILY,
            events: onStatusClick
              ? {
                  dataPointSelection: (_event, _chartContext, opts) => {
                    const status = opts && statuses[opts.seriesIndex]
                    if (status) onStatusClick(status)
                  },
                }
              : undefined,
          },
          colors: statuses.map((status) => STATUS_COLORS[status]),
          plotOptions: { bar: { horizontal: true, barHeight: '62%' } },
          dataLabels: {
            enabled: true,
            formatter: (value: number) => (value > 0 ? String(value) : ''),
            style: { fontFamily: FONT_FAMILY, fontSize: '12px', fontWeight: 600 },
          },
          xaxis: {
            categories: groups.map((group) => group.programmeName),
            title: { text: 'Projects' },
            labels: { formatter: (value: string) => String(Math.round(Number(value))) },
            tickAmount: Math.min(groups[0]!.projects.length, 10),
          },
          yaxis: { labels: { maxWidth: 260 } },
          legend: { position: 'top', fontFamily: FONT_FAMILY, fontSize: '13px' },
          stroke: { colors: ['var(--surface-card)'], width: 2 },
          tooltip: {
            y: { formatter: (value: number) => `${value} project${value === 1 ? '' : 's'}` },
          },
        }}
      />
    </div>
  )
}
