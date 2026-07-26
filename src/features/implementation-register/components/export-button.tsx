import { Download } from 'lucide-react'
import type { ImplementationRegisterOverview } from '@/api/schemas/implementation-register'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import type { ImplementationRegisterTab } from '../use-implementation-register-page'
import { exportToCsv } from '../export-csv'

/**
 * Section E — filtered export and technical handoff.
 *
 * Exports the currently active tab's current page, which has already been
 * narrowed by the active filters — so the export preserves them by
 * construction, per the specification's requirement.
 */
export function ExportButton({
  activeTab,
  data,
}: {
  activeTab: ImplementationRegisterTab
  data: ImplementationRegisterOverview
}) {
  function handleExport() {
    const exportedAt = formatDate(new Date().toISOString())

    if (activeTab === 'programmes') {
      exportToCsv(
        'implementation-register-programmes.csv',
        ['ID', 'Name', 'Lead institution', 'Status', 'Priority', 'Validation', 'Exported'],
        data.programmes.items.map((row) => [
          row.id,
          row.name,
          row.leadInstitution,
          row.status,
          row.priority,
          row.validationStatus,
          exportedAt,
        ]),
      )
      return
    }

    if (activeTab === 'projects') {
      exportToCsv(
        'implementation-register-projects.csv',
        ['ID', 'Programme', 'Owner', 'Lifecycle stage', 'Status', 'Validation', 'Exported'],
        data.projects.items.map((row) => [
          row.id,
          row.programmeName,
          row.owner,
          row.lifecycleStage,
          row.status,
          row.validationStatus,
          exportedAt,
        ]),
      )
      return
    }

    if (activeTab === 'milestones') {
      exportToCsv(
        'implementation-register-milestones.csv',
        ['ID', 'Milestone', 'Project', 'Expected date', 'Status', 'Exported'],
        data.milestones.items.map((row) => [
          row.id,
          row.name,
          row.projectName,
          row.expectedDate,
          row.status,
          exportedAt,
        ]),
      )
      return
    }

    exportToCsv(
      'implementation-register-actions.csv',
      ['ID', 'Action', 'Owner', 'Due date', 'Status', 'Exported'],
      data.actions.items.map((row) => [
        row.id,
        row.description,
        row.responsibleInstitution,
        row.dueDate,
        row.status,
        exportedAt,
      ]),
    )
  }

  return (
    <Button onClick={handleExport} size="sm" type="button" variant="secondary">
      <Download aria-hidden="true" />
      Export
    </Button>
  )
}
