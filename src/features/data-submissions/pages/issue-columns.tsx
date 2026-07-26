import type { SubmissionDetail } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'

type Issue = SubmissionDetail['issues'][number]

/** Column definitions for the validation-issues table. */
export const ISSUE_COLUMNS: Column<Issue>[] = [
  { id: 'type', header: 'Type', cell: (row) => row.type },
  { id: 'location', header: 'Location', cell: (row) => row.location },
  { id: 'field', header: 'Field', cell: (row) => row.field },
  { id: 'error', header: 'Error', cell: (row) => row.message },
  {
    id: 'correction',
    header: 'Required correction',
    cell: (row) => row.requiredCorrection,
  },
]
