import { BarChart3, History, Table2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SeverityBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { BottleneckSeverity, DeliveryStatusPanel, OngoingProject } from '../types'
import { ExceptionSeverityChart } from './exception-severity-chart'
import { OngoingProjectsTable } from './ongoing-projects-table'
import { ProjectStatusChart } from './project-status-chart'
import { ProjectStatusEvolutionTable } from './project-status-evolution-table'

/**
 * Section D — Delivery Status, Bottlenecks and Decisions.
 *
 * One linked split panel: priority delivery status by pillar as horizontal
 * stacked bars, beside a ranked exception table. The specification caps the
 * table at five records and requires a View All action into the Bottlenecks
 * and Exceptions module.
 */
const MAX_VISIBLE_EXCEPTIONS = 5

export function DeliveryStatusSection({
  panel,
  onProjectsChanged,
}: {
  panel: DeliveryStatusPanel
  onProjectsChanged: () => void
}) {
  const [severityFilter, setSeverityFilter] = useState<BottleneckSeverity | null>(null)
  const [deliveryTab, setDeliveryTab] = useState('table')
  const [statusFilter, setStatusFilter] = useState<OngoingProject['currentStatus'] | null>(null)

  // Enforced here rather than trusted to the API, so an over-long response
  // cannot break the layout. Clicking a bar on the severity chart filters to
  // that severity instead — once filtered, the cap lifts, since a single
  // severity is rarely more than a handful of records and the whole point
  // of clicking through is to see all of them, not another five-row sample.
  const visible = severityFilter
    ? panel.exceptions.filter((exception) => exception.severity === severityFilter)
    : panel.exceptions.slice(0, MAX_VISIBLE_EXCEPTIONS)

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
              {/*
                No subtitle. The count is already in the table's pagination
                summary, and the ordering and drill-down are both evident from
                the table itself.
              */}
            </div>
          </div>

          <Tabs
            value={deliveryTab}
            onValueChange={setDeliveryTab}
            defaultValue="table"
            className="mt-3"
          >
            <TabsList aria-label="Project delivery views">
              <TabsTrigger value="table" className="inline-flex items-center gap-2">
                <Table2 className="size-4" aria-hidden="true" />
                Table
              </TabsTrigger>
              <TabsTrigger value="chart" className="inline-flex items-center gap-2">
                <BarChart3 className="size-4" aria-hidden="true" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="evolution" className="inline-flex items-center gap-2">
                <History className="size-4" aria-hidden="true" />
                Evolution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="pt-0">
              <OngoingProjectsTable
                projects={panel.ongoingProjects}
                onChanged={onProjectsChanged}
                statusFilter={statusFilter}
                onClearStatusFilter={() => setStatusFilter(null)}
              />
            </TabsContent>
            <TabsContent value="chart">
              <ProjectStatusChart
                summary={panel.statusSummary}
                onStatusClick={(status) => {
                  setStatusFilter(status)
                  setDeliveryTab('table')
                }}
              />
            </TabsContent>
            <TabsContent value="evolution">
              <ProjectStatusEvolutionTable projects={panel.ongoingProjects} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Ranked exceptions */}
        <Card className="flex flex-col p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-default">
              Priority exceptions
              {severityFilter && (
                <span className="ml-2 text-xs font-normal text-text-muted">
                  — filtered to {visible.length} {severityFilter}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {severityFilter && (
                <button
                  type="button"
                  onClick={() => setSeverityFilter(null)}
                  className="text-xs font-medium text-link underline underline-offset-4"
                >
                  Clear filter
                </button>
              )}
              <Link
                to="/bottlenecks"
                className="text-xs font-medium text-link underline underline-offset-4"
              >
                View all
              </Link>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-3 text-sm text-status-on-track">
              No unresolved priority exceptions.
            </p>
          ) : (
            /*
              Chart beside the list rather than above it, same split as Section
              B's channel chart: the shape of the whole exception load reads at
              a glance on the left, while the right still names the specific
              records leadership would click into. The chart counts every
              exception, not just the five-row slice beside it.
            */
            <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_1.2fr]">
              <Card className="flex flex-col justify-center p-4">
                <h4 className="text-xs font-medium tracking-wide text-text-subtle uppercase">
                  By severity
                </h4>
                <div className="mt-2">
                  <ExceptionSeverityChart
                    exceptions={panel.exceptions}
                    selectedSeverity={severityFilter}
                    onSeverityClick={setSeverityFilter}
                  />
                </div>
              </Card>

              <ul aria-label="Priority exceptions" className="divide-y divide-border-default">
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
                          { label: 'Follow-up', value: exception.followUp || null },
                        ]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </Card>
  )
}
