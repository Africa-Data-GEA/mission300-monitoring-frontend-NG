import { Building2, Database, UserRoundPlus } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StakeholderFilters } from './components/stakeholder-filters'
import { CustodiansTable, InstitutionsTable } from './components/stakeholder-tables'
import { useStakeholdersPage } from './use-stakeholders-page'

const summaries = [
  ['activeInstitutions', 'Active institutions', Building2],
  ['dataCustodians', 'Institutions with datasets', Database],
  ['pendingOnboarding', 'Pending onboarding', UserRoundPlus],
] as const

export function StakeholdersPage() {
  const page = useStakeholdersPage()

  if (page.isPending) return <div className="space-y-4" aria-busy="true"><Skeleton className="h-9 w-72" /><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /></div>
  if (page.isError) return <Card className="p-8 text-center" role="alert"><h1 className="text-lg font-semibold">Stakeholders could not be loaded</h1><p className="mt-2 text-sm text-text-muted">{page.error.message}</p><Button className="mt-5" onClick={() => void page.refetch()}>Try again</Button></Card>
  if (!page.data) return null

  const data = page.data
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Administration' }, { label: 'Stakeholders & Institutions' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Stakeholders &amp; Institutions</h1>
        <p className="mt-1 text-sm text-text-muted">Institution registry, reporting ownership and Mission 300 accountability.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {summaries.map(([key, label, Icon]) => <Card className="flex items-center gap-3 p-3 sm:p-4" key={key}><span className="flex size-9 items-center justify-center rounded-control bg-brand-50 text-brand-700"><Icon aria-hidden="true" className="size-4" /></span><div><p className="text-2xl font-semibold">{data.summary[key]}</p><p className="text-xs text-text-muted">{label}</p></div></Card>)}
      </div>
      <Card className="min-w-0 overflow-hidden p-0">
        <Tabs defaultValue="institutions" value={page.activeTab} onValueChange={page.changeTab}>
          <TabsList>
            <TabsTrigger value="institutions">Institutions <span className="ml-1 text-xs text-text-muted">{data.institutions.length}</span></TabsTrigger>
            <TabsTrigger value="custodians">Data custodians <span className="ml-1 text-xs text-text-muted">{data.custodians.length}</span></TabsTrigger>
          </TabsList>
          <div className="px-2 pt-3 sm:px-4">
            <StakeholderFilters activeFilterCount={page.activeFilterCount} options={data.filters} query={page.query} onChange={page.changeQuery} onReset={page.resetQuery} />
          </div>
          <div className="min-w-0 p-2 pt-0 sm:p-4 sm:pt-0">
            <TabsContent value="institutions"><InstitutionsTable items={data.institutions} onViewAssignments={page.viewInstitutionAssignments} /></TabsContent>
            <TabsContent value="custodians"><CustodiansTable items={data.custodians} /></TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
