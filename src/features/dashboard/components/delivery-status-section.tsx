import { BarChart3, Map, Table2 } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SeverityBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { DeliveryStatusPanel } from '../types'
import { OngoingProjectsTable } from './ongoing-projects-table'
import { ProjectStatusChart } from './project-status-chart'
import { ProjectsMap } from './projects-map'

/**
 * Section D — Delivery Status, Bottlenecks and Decisions.
 *
 * One linked split panel: priority delivery status by pillar as horizontal
 * stacked bars, beside a ranked exception table. The specification caps the
 * table at five records and requires a View All action into the Bottlenecks
 * and Exceptions module.
 */
const MAX_VISIBLE_EXCEPTIONS = 5

export function DeliveryStatusSection({ panel }: { panel: DeliveryStatusPanel }) {
  // Enforced here rather than trusted to the API, so an over-long response
  // cannot break the layout.
  const visible = panel.exceptions.slice(0, MAX_VISIBLE_EXCEPTIONS)

  return (
    <Card variant="well" className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-default">
            Delivery status, bottlenecks and decisions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {panel.trend && <TrendIndicator trend={panel.trend} />}
          <InfoPopover
            provenance={panel.provenance}
            label="Delivery status and exceptions"
          />
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {/* Ongoing project delivery */}
        <Card className="p-4">
          <div>
            <div>
              <h3 className="text-sm font-semibold text-text-default">
                Priority project delivery status
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                {panel.ongoingProjects.length} ongoing project{panel.ongoingProjects.length === 1 ? '' : 's'}.
                Open a project or its parent programme for the full delivery record.
              </p>
            </div>
          </div>

          <Tabs defaultValue="table" className="mt-3">
            <TabsList aria-label="Project delivery views">
              <TabsTrigger value="table" className="inline-flex items-center gap-2">
                <Table2 className="size-4" aria-hidden="true" />
                Table
              </TabsTrigger>
              <TabsTrigger value="chart" className="inline-flex items-center gap-2">
                <BarChart3 className="size-4" aria-hidden="true" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="map" className="inline-flex items-center gap-2">
                <Map className="size-4" aria-hidden="true" />
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="pt-0">
              <OngoingProjectsTable projects={panel.ongoingProjects} />
            </TabsContent>
            <TabsContent value="chart">
              <ProjectStatusChart summary={panel.statusSummary} />
            </TabsContent>
            <TabsContent value="map">
              <ProjectsMap projects={panel.ongoingProjects} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Ranked exceptions */}
        <Card className="flex flex-col p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-default">
              Priority exceptions
            </h3>
            <Link
              to="/bottlenecks"
              className="text-xs font-medium text-link underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <ul
            aria-label="Priority exceptions"
            className="mt-3 divide-y divide-border-default"
          >
            {visible.map((exception) => (
              <li key={exception.id} className="flex items-start gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-default">
                    {exception.title}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {exception.category} • {exception.institution}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <SeverityBadge severity={exception.severity} />
                  <InfoPopover
                    provenance={exception.provenance}
                    label={exception.title}
                    details={[
                      { label: 'Reference', value: exception.reference },
                      {
                        label: 'Time unresolved',
                        value: `${exception.daysUnresolved} days`,
                      },
                    ]}
                  />
                </div>
              </li>
            ))}
          </ul>

          {visible.length === 0 && (
            <p className="mt-3 text-sm text-status-on-track">
              No unresolved priority exceptions.
            </p>
          )}
        </Card>
      </div>
    </Card>
  )
}
