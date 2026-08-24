import { BarChart3, History, Table2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { DeliveryStatusPanel, OngoingProject } from '../types'
import { BottlenecksTable } from './bottlenecks-table'
import { OngoingProjectsTable } from './ongoing-projects-table'
import { ProjectStatusChart } from './project-status-chart'
import { ProjectStatusEvolutionTable } from './project-status-evolution-table'

/**
 * Section D — Delivery Status, Bottlenecks and Decisions.
 *
 * Two stacked panels: priority project delivery (table / chart / evolution
 * views), then the delivery-bottleneck table. Both are filterable and
 * sortable in place, with a link out to the full Bottlenecks register for
 * the resolved history this page deliberately omits.
 */
export function DeliveryStatusSection({
  panel,
  onProjectsChanged,
}: {
  panel: DeliveryStatusPanel
  onProjectsChanged: () => void
}) {
  const [deliveryTab, setDeliveryTab] = useState('table')
  const [statusFilter, setStatusFilter] = useState<OngoingProject['currentStatus'] | null>(null)

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

        {/*
          Delivery bottlenecks. Renamed from "Priority exceptions", which
          review feedback found unclear, and rebuilt as a table — the
          severity bar chart that used to sit beside a five-row list was
          reported as not communicating effectively, and the table's own
          severity column and filter now carry that job (docs/M300 Monitoring
          Platform Feedback.pptx, slide 4).
        */}
        <Card className="flex flex-col p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-default">
              Delivery bottlenecks and blockers
            </h3>
            <Link
              to="/bottlenecks"
              className="text-xs font-medium text-link underline underline-offset-4"
            >
              Open the full register
            </Link>
          </div>

          <div className="mt-3">
            <BottlenecksTable exceptions={panel.exceptions} />
          </div>
        </Card>
      </div>
    </Card>
  )
}
