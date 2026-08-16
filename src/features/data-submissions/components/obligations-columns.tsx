import type { Obligation } from '@/api/schemas/data-submissions'
import type { Column } from '@/components/ui/data-table'
import { WorkflowStatusBadge } from './workflow-status'

/** Column definitions for the reporting-obligations table. */
export const OBLIGATIONS_COLUMNS: Column<Obligation>[] = [
  {
    id: 'dataset',
    header: 'Dataset',
    cell: (row) => (
      <>
        <p className="font-medium">{row.dataset}</p>
        <p className="text-xs text-text-muted">{row.institution}</p>
      </>
    ),
    sortValue: (row) => row.dataset,
  },
  {
    id: 'lead',
    header: 'Lead',
    cell: (row) => row.focalPerson,
    sortValue: (row) => row.focalPerson,
  },
  {
    id: 'period',
    header: 'Reporting period',
    cell: (row) => row.reportingPeriod,
    sortValue: (row) => row.reportingPeriod,
  },
  {
    id: 'frequency',
    header: 'Frequency',
    cell: (row) => row.frequency,
  },
  {
    id: 'due',
    header: 'Due',
    cell: (row) => row.dueLabel,
    sortValue: (row) => row.dueDate,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <WorkflowStatusBadge status={row.status} />,
  },
]
