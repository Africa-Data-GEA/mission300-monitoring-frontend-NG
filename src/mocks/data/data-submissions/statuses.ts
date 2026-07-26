import type { WorkflowStatus } from '@/api/schemas/data-submissions'

export const statuses = {
  due: { code: 'due', label: 'Due', tone: 'info' },
  draft: { code: 'draft', label: 'Draft', tone: 'neutral' },
  failed: { code: 'validation-failed', label: 'Validation failed', tone: 'danger' },
  ready: { code: 'ready', label: 'Ready to submit', tone: 'success' },
  pending: { code: 'pending-review', label: 'Pending review', tone: 'warning' },
  returned: { code: 'returned', label: 'Returned', tone: 'warning' },
  rejected: { code: 'rejected', label: 'Rejected', tone: 'danger' },
  provisional: { code: 'provisional', label: 'Provisionally approved', tone: 'info' },
  approved: { code: 'approved', label: 'Approved', tone: 'success' },
  overdue: { code: 'overdue', label: 'Overdue', tone: 'danger' },
  missing: { code: 'missing', label: 'Missing', tone: 'danger' },
  open: { code: 'open', label: 'Open', tone: 'danger' },
  inProgress: { code: 'in-progress', label: 'In progress', tone: 'warning' },
  resolved: { code: 'resolved', label: 'Resolved', tone: 'success' },
} satisfies Record<string, WorkflowStatus>
