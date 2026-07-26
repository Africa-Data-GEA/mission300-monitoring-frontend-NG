import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustodiansTable } from './components/custodians-table'
import { InstitutionsTable } from './components/institutions-table'
import { StakeholderFilters } from './components/stakeholder-filters'
import { StakeholdersSkeleton } from './components/stakeholders-skeleton'
import { StakeholdersSummary } from './components/stakeholders-summary'
import { useStakeholdersPage } from './use-stakeholders-page'

/**
 * Stakeholders & Institutions.
 *
 * All state and data-fetching lives in use-stakeholders-page.ts — this
 * component only reads that hook and renders.
 */
export function StakeholdersPage() {
  const page = useStakeholdersPage()

  if (page.isPending) return <StakeholdersSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Stakeholders could not be loaded"
        message={page.error.message}
        onRetry={() => void page.refetch()}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Administration' },
            { label: 'Stakeholders & Institutions' },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Stakeholders &amp; Institutions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Institution registry, reporting ownership and Mission 300
          accountability.
        </p>
      </div>

      <StakeholdersSummary summary={data.summary} />

      <Card className="min-w-0 overflow-hidden p-0">
        <Tabs
          defaultValue="institutions"
          value={page.activeTab}
          onValueChange={page.changeTab}
        >
          <TabsList>
            <TabsTrigger value="institutions">
              Institutions{' '}
              <span className="ml-1 text-xs text-text-muted">
                {data.institutions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="custodians">
              Data custodians{' '}
              <span className="ml-1 text-xs text-text-muted">
                {data.custodians.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="px-2 pt-3 sm:px-4">
            <StakeholderFilters
              activeFilterCount={page.activeFilterCount}
              options={data.filters}
              query={page.query}
              onChange={page.changeQuery}
              onReset={page.resetQuery}
            />
          </div>

          <div className="min-w-0 p-2 pt-0 sm:p-4 sm:pt-0">
            <TabsContent value="institutions">
              <InstitutionsTable
                items={data.institutions}
                onViewAssignments={page.viewInstitutionAssignments}
              />
            </TabsContent>
            <TabsContent value="custodians">
              <CustodiansTable items={data.custodians} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
