import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { useInstitutionOverview } from './api'
import { KpiPerformanceCard } from './components/kpi-performance-card'
import { ObligationSummaryCard } from './components/obligation-summary-card'
import { ProgrammeListCard } from './components/programme-list-card'
import { ProjectListCard } from './components/project-list-card'

export function InstitutionOverviewPage() {
  const overview = useInstitutionOverview()

  if (overview.isPending) {
    return <p className="p-6 text-sm text-text-muted">Loading your institution's overview…</p>
  }

  if (overview.isError) {
    return (
      <ErrorState
        title="Couldn't load your institution's overview"
        message="Something went wrong while loading your institution's performance summary."
        onRetry={() => overview.refetch()}
      />
    )
  }

  const { institution, obligations, kpis, programmes, projects } = overview.data

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Overview' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">{institution.name}</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          A summary of your institution's reporting compliance, KPI performance and delivery activity across the Compact.
        </p>
      </div>

      <ObligationSummaryCard obligations={obligations} />

      <div>
        <h2 className="text-sm font-semibold text-text-default">
          KPIs sourced from your institution
          {kpis.length > 0 && (
            <span className="ml-2 rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
              {kpis.length}
            </span>
          )}
        </h2>
        {kpis.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No approved KPI values are attributed to your institution yet.</p>
        ) : (
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <KpiPerformanceCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        )}
      </div>

      <ProgrammeListCard programmes={programmes} />
      <ProjectListCard projects={projects} />
    </div>
  )
}
