import { ExternalLink } from 'lucide-react'
import type { ProjectRecord } from '@/api/schemas/implementation-register'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { PROJECT_COLUMNS } from './project-columns'

/** Section C — the searchable project table, with profile drill-down. */
export function ProjectsTable({
  records,
  page,
  pageSize,
  total,
  onPageChange,
  onOpenProfile,
}: {
  records: readonly ProjectRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onOpenProfile: (project: ProjectRecord) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Projects</h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Projects delivering the register's approved programmes"
          columns={PROJECT_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1400px]"
          rowActions={(row) => (
            <Button type="button" size="sm" variant="ghost" onClick={() => onOpenProfile(row)}>
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">Open profile for {row.id}</span>
              Profile
            </Button>
          )}
          emptyMessage="No projects match the current filters."
        />
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
