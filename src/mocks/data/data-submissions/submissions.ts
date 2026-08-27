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
    id: 'SUB-2026-0022', institution: 'Rural Electrification Agency',
    dataset: 'Mini-grid connections', reportingPeriod: 'Q4 2026',
    method: 'template-upload', methodLabel: 'Template upload', version: 1,
    submittedBy: 'Chiamaka Nwosu', submittedAt: '2026-10-14T08:15:00Z',
    submittedAtLabel: '14 Oct 2026, 09:15', status: statuses.pending,
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
    dataset: 'Transmission transfer capacity', reportingPeriod: 'Q3 2026',
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
    ...submissionRecords[1]!, reviewer: 'Chiamaka Nwosu', ageLabel: 'Awaiting review for 1 day',
    automatedCheck: statuses.approved, issueCount: 0, availableActions: ['review'],
  },
  {
    ...submissionRecords[3]!, reviewer: 'Grace Etim', ageLabel: 'Returned 1 day ago',
    automatedCheck: statuses.failed, issueCount: 3, availableActions: ['review'],
  },
]

export const submissionDetails: Record<string, SubmissionDetail> = {
  'SUB-2026-0021': {
    ...validationQueue[0]!, fileName: 'nerc-metering-q3-2026-v2.xlsx',
    sourceReference: 'NERC Q3 2026 operational return',
    notes: 'Corrected Kano DisCo customer total before submission.',
    issues: [],
    // Automated checks passed and the values are clean, so the pipeline has
    // already identified what this submission would publish — shown to the
    // reviewer before they decide, and actually written to the KPI when they
    // approve or accept it provisionally (see publishExtractedValues in
    // mocks/handlers/data-submissions.ts).
    extractedValues: [
      {
        kpiId: 'M300-P3-004',
        kpiName: 'Metering Rate',
        reportingPeriod: 'Q3 2026',
        value: 57.4,
      },
    ],
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
  'SUB-2026-0022': {
    ...validationQueue[1]!, fileName: 'rea-minigrid-connections-q4-2026.xlsx',
    sourceReference: 'REA DARES PMU Q4 2026 connections return',
    notes: 'Includes newly commissioned mini-grids in Kebbi and Sokoto.',
    issues: [],
    // Same publish pipeline as SUB-2026-0021 — approving or provisionally
    // accepting this writes M300-P2-003's current value, which is what
    // Executive Overview's Access Delivery section and the Last-Mile Access
    // pillar dashboard both read on their next fetch.
    extractedValues: [
      {
        kpiId: 'M300-P2-003',
        kpiName: 'Mini-Grid Customer Connections',
        reportingPeriod: 'Q4 2026',
        value: 141_780,
      },
    ],
    history: [
      {
        id: 'hist-004', status: statuses.draft, actor: 'Chiamaka Nwosu',
        occurredAt: '2026-10-13T16:00:00Z', occurredAtLabel: '13 Oct 2026, 17:00',
        comment: 'Draft prepared from DARES PMU connections export.',
      },
      {
        id: 'hist-005', status: statuses.pending, actor: 'Chiamaka Nwosu',
        occurredAt: '2026-10-14T08:15:00Z', occurredAtLabel: '14 Oct 2026, 09:15',
        comment: 'Submitted for validation.',
      },
    ],
    permittedDecisions: ['approved', 'provisional', 'returned', 'rejected'],
  },
  'SUB-2026-0019': {
    ...validationQueue[1]!, fileName: 'tcn-generation-q3-2026.xlsx',
    sourceReference: 'TCN system operations return, Q3 2026', notes: '',
    // Unresolved validation issues mean the pipeline has not extracted
    // publishable values yet — resolving the issues below is what would
    // populate this on resubmission.
    extractedValues: [],
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
