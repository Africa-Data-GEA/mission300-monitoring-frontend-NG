import { CheckCircle2, TriangleAlert } from 'lucide-react'
import type { ImportRegisterResponse } from '@/api/schemas/implementation-register'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'

const ERROR_COLUMNS: readonly Column<ImportRegisterResponse['errors'][number]>[] = [
  { id: 'row', header: 'Row', cell: (row) => row.row },
  { id: 'field', header: 'Field', cell: (row) => row.field },
  { id: 'issue', header: 'Issue', className: 'min-w-56', cell: (row) => row.issue },
]

/** Validation report shown after a template upload (Section E). */
export function ImportRegisterResult({
  result,
  onDone,
}: {
  result: ImportRegisterResponse
  onDone: () => void
}) {
  const isClean = result.errorRows === 0

  return (
    <div aria-live="polite" className="flex flex-col gap-5">
      <div className="flex flex-col items-center py-6 text-center">
        {isClean ? (
          <CheckCircle2 aria-hidden="true" className="size-12 text-brand-600" />
        ) : (
          <TriangleAlert aria-hidden="true" className="size-12 text-status-at-risk" />
        )}
        <h3 className="mt-4 text-xl font-semibold">
          {isClean ? 'Template validated' : 'Validation errors found'}
        </h3>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          {result.validRows} of {result.totalRows} rows in {result.fileName} passed validation
          {isClean ? '.' : `; ${result.errorRows} need correction before this version is accepted.`}
        </p>
      </div>

      {!isClean && (
        <DataTable
          caption="Rows that failed validation"
          columns={ERROR_COLUMNS}
          rows={result.errors}
          getRowId={(row) => `${row.row}-${row.field}`}
          emptyMessage="No errors."
        />
      )}

      <div className="flex justify-end border-t border-border-default pt-5">
        <Button onClick={onDone} type="button">
          Done
        </Button>
      </div>
    </div>
  )
}
