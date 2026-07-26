import type {
  SubmissionDetail,
  SubmissionListItem,
  ValidationQueueItem,
} from '@/api/schemas/data-submissions'
import { statuses } from './statuses'

export const submissionRecords: SubmissionListItem[] = [
  {
    id: 'SUB-2026-0021', institution: 'NERC', dataset: 'Metering performance',
    reportingPeriod: 'Q3 2026', method: 'template-upload', methodLabel: 'Template upload',
    version: 2, submittedBy: 'Ngozi Okafor', submittedAt: '2026-10-13T09:30:00Z',
    submittedAtLabel: '13 Oct 2026, 10:30', status: statuses.pending,
    validationSummary: 'Automated checks passed', availableActions: ['view'],
  },
  {
    id: 'SUB-2026-0020', institution: 'Rural Electrification Agency',
    dataset: 'Mini-grid connections', reportingPeriod: 'September 2026',
    method: 'manual-entry', methodLabel: 'Manual entry', version: 1,
    submittedBy: 'Ibrahim Suleiman', submittedAt: null,
    submittedAtLabel: 'Not submitted', status: statuses.draft,
    validationSummary: 'Checks not run', availableActions: ['correct', 'submit'],
  },
  {
    id: 'SUB-2026-0019', institution: 'Transmission Company of Nigeria',
    dataset: 'Generation availability', reportingPeriod: 'Q3 2026',
    method: 'template-upload', methodLabel: 'Template upload', version: 1,
    submittedBy: 'Funmilayo Adeyemi', submittedAt: '2026-10-12T14:10:00Z',
    submittedAtLabel: '12 Oct 2026, 15:10', status: statuses.returned,
    validationSummary: '3 corrections required', availableActions: ['correct', 'view'],
  },
  {
    id: 'SUB-2026-0018', institution: 'NERC', dataset: 'Metering performance',
    reportingPeriod: 'Q2 2026', method: 'api', methodLabel: 'System integration',
    version: 1, submittedBy: 'NERC Integration Service',
    submittedAt: '2026-07-12T11:00:00Z', submittedAtLabel: '12 Jul 2026, 12:00',
    status: statuses.approved, validationSummary: 'Approved 13 Jul 2026',
    availableActions: ['view'],
  },
]

export const validationQueue: ValidationQueueItem[] = [
  {
    ...submissionRecords[0]!, reviewer: 'Ngozi Okafor', ageLabel: 'Awaiting review for 2 days',
    automatedCheck: statuses.approved, issueCount: 0, availableActions: ['review'],
  },
  {
    ...submissionRecords[2]!, reviewer: 'Grace Etim', ageLabel: 'Returned 1 day ago',
    automatedCheck: statuses.failed, issueCount: 3, availableActions: ['review'],
  },
]

export const submissionDetails: Record<string, SubmissionDetail> = {
  'SUB-2026-0021': {
    ...validationQueue[0]!, fileName: 'nerc-metering-q3-2026-v2.xlsx',
    sourceReference: 'NERC Q3 2026 operational return',
    notes: 'Corrected Kano DisCo customer total before submission.',
    issues: [],
    history: [
      {
        id: 'hist-001', status: statuses.draft, actor: 'Ngozi Okafor',
        occurredAt: '2026-10-13T08:45:00Z', occurredAtLabel: '13 Oct 2026, 09:45',
        comment: 'Version 2 uploaded.',
      },
      {
        id: 'hist-002', status: statuses.pending, actor: 'Ngozi Okafor',
        occurredAt: '2026-10-13T09:30:00Z', occurredAtLabel: '13 Oct 2026, 10:30',
        comment: 'Submitted for validation.',
      },
    ],
    permittedDecisions: ['approved', 'provisional', 'returned', 'rejected'],
  },
  'SUB-2026-0019': {
    ...validationQueue[1]!, fileName: 'tcn-generation-q3-2026.xlsx',
    sourceReference: 'TCN system operations return, Q3 2026', notes: '',
    issues: [
      {
        id: 'issue-001', type: 'Required field', location: 'Generation!Row 8',
        field: 'source_reference', message: 'Source reference is empty.',
        requiredCorrection: 'Provide the dispatch report reference.',
      },
      {
        id: 'issue-002', type: 'Range', location: 'Generation!Row 12',
        field: 'availability_mw', message: 'Value is below zero.',
        requiredCorrection: 'Enter a value greater than or equal to zero.',
      },
      {
        id: 'issue-003', type: 'Duplicate', location: 'Generation!Rows 14–15',
        field: 'plant_id', message: 'The same plant and period appear twice.',
        requiredCorrection: 'Remove or consolidate the duplicate record.',
      },
    ],
    history: [
      {
        id: 'hist-003', status: statuses.returned, actor: 'Grace Etim',
        occurredAt: '2026-10-14T13:20:00Z', occurredAtLabel: '14 Oct 2026, 14:20',
        comment: 'Correct the three automated validation failures and resubmit.',
      },
    ],
    permittedDecisions: ['approved', 'provisional', 'returned', 'rejected'],
  },
}
