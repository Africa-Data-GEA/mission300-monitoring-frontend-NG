import { Plus } from 'lucide-react'
import type { ProjectRecord } from '@/api/schemas/programs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { buildProjectColumns } from './project-columns'

/**
 * The projects delivering one programme. Click a project to see its
 * bottlenecks and milestones. `onAddProject` is optional so this table can
 * still render read-only wherever a caller doesn't wire it up.
 */
export function ProjectsTable({
  records,
  page,
  pageSize,
  total,
  onPageChange,
  onOpenProject,
  onAddProject,
}: {
  records: readonly ProjectRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onOpenProject: (project: ProjectRecord) => void
  onAddProject?: () => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-default">Projects</h2>
        {onAddProject && (
          <Button type="button" size="sm" onClick={onAddProject}>
            <Plus aria-hidden="true" />
            Add project
          </Button>
        )}
      </div>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Projects delivering this programme"
          columns={buildProjectColumns(onOpenProject)}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[2200px]"
          emptyMessage="No projects match the current filters."
        />
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
