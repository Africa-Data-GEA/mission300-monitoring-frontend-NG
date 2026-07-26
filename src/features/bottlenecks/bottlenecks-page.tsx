import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { AgencyAccountability } from './components/agency-accountability'
import { AlertCardsSection } from './components/alert-cards-section'
import { BottleneckRegister } from './components/bottleneck-register'
import { BottlenecksFilters } from './components/bottlenecks-filters'
import { BottlenecksSkeleton } from './components/bottlenecks-skeleton'
import { CategoryLifecycleSection } from './components/category-lifecycle-section'
import { CreateBottleneckDialog } from './components/create-bottleneck-dialog'
import { EscalationTracker } from './components/escalation-tracker'
import { useBottlenecksPage } from './use-bottlenecks-page'

/**
 * Bottlenecks & Exceptions.
 * Specification: docs/specs/bottlenecks-exceptions.md
 *
 * Uses its own nine filters rather than the global dashboard filters, so the
 * route opts out of the global filter bar (see src/app/router.tsx). All state
 * and data-fetching lives in use-bottlenecks-page.ts — this component only
 * reads that hook and renders.
 */
export function BottlenecksPage() {
  const page = useBottlenecksPage()

  if (page.isPending) return <BottlenecksSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Bottlenecks and exceptions could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.data) return null

  const { data } = page
  const institutionOptions = (page.filters?.institutions ?? []).filter(
    (option) => option.value !== 'all',
  )

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Delivery tracking' },
            { label: 'Bottlenecks & Exceptions' },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Bottlenecks &amp; Exceptions
        </h1>
      </div>

      {page.filters && (
        <BottlenecksFilters
          options={page.filters}
          value={page.query}
          activeFilterCount={page.activeFilterCount}
          onChange={page.changeFilters}
          onReset={page.resetFilters}
        />
      )}

      <AlertCardsSection cards={data.alerts} />

      <BottleneckRegister
        records={data.register.items}
        page={data.register.page}
        pageSize={data.register.pageSize}
        total={data.register.total}
        onPageChange={page.setRegisterPage}
        onRaiseBottleneck={page.openCreate}
      />

      <CategoryLifecycleSection
        byCategory={data.byCategory}
        byLifecycleStage={data.byLifecycleStage}
      />

      <AgencyAccountability rows={data.byInstitution} />

      <EscalationTracker
        records={data.escalations.items}
        page={data.escalations.page}
        pageSize={data.escalations.pageSize}
        total={data.escalations.total}
        onPageChange={page.setEscalationPage}
      />

      <CreateBottleneckDialog
        open={page.createOpen}
        onClose={page.closeCreate}
        onCreated={page.refreshAfterCreate}
        institutions={institutionOptions}
      />
    </div>
  )
}
