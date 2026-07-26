import type {
  ManualEntryDefinition,
  Obligation,
  UploadDefinition,
} from '@/api/schemas/data-submissions'
import { statuses } from './statuses'

const template = {
  id: 'tpl-metering-v3',
  version: '3.0',
  fileName: 'metering-performance-v3.csv',
  downloadUrl: '/templates/metering-performance-v3.csv',
}

export const submissionObligations: Obligation[] = [
  {
    id: 'obl-001', institution: 'NERC', dataset: 'Metering performance',
    reportingPeriod: 'Q3 2026', frequency: 'Quarterly',
    dueDate: '2026-10-15T17:00:00Z', dueLabel: 'Due 15 Oct 2026',
    status: statuses.due, template, acceptedSubmissionId: null,
    availableActions: ['enter-data', 'upload-template', 'download-template'],
  },
  {
    id: 'obl-002', institution: 'Rural Electrification Agency',
    dataset: 'Mini-grid connections', reportingPeriod: 'September 2026',
    frequency: 'Monthly', dueDate: '2026-10-07T17:00:00Z',
    dueLabel: 'Due 7 Oct 2026', status: statuses.draft, template,
    acceptedSubmissionId: null,
    availableActions: ['enter-data', 'upload-template', 'view'],
  },
  {
    id: 'obl-003', institution: 'Transmission Company of Nigeria',
    dataset: 'Generation availability', reportingPeriod: 'Q3 2026',
    frequency: 'Quarterly', dueDate: '2026-10-10T17:00:00Z',
    dueLabel: '8 days overdue', status: statuses.overdue, template,
    acceptedSubmissionId: null,
    availableActions: ['upload-template', 'download-template'],
  },
  {
    id: 'obl-004', institution: 'NERC', dataset: 'Metering performance',
    reportingPeriod: 'Q2 2026', frequency: 'Quarterly',
    dueDate: '2026-07-15T17:00:00Z', dueLabel: 'Accepted 13 Jul 2026',
    status: statuses.approved, template, acceptedSubmissionId: 'SUB-2026-0018',
    availableActions: ['view'],
  },
]

export const manualEntryDefinitions: Record<string, ManualEntryDefinition> = {
  'obl-001': {
    obligationId: 'obl-001', title: 'Enter metering performance data',
    institution: 'NERC', dataset: 'Metering performance', reportingPeriod: 'Q3 2026',
    sections: [
      {
        id: 'performance', title: 'Performance values',
        description: 'Provide the approved period totals. Derived rates are calculated by the backend.',
        fields: [
          {
            id: 'distributionCompany', label: 'Distribution company',
            helpText: 'Select the company represented by this record.', type: 'select',
            required: true, unit: null, placeholder: 'Select a DisCo',
            options: [
              { value: 'ikeja', label: 'Ikeja DisCo' },
              { value: 'kano', label: 'Kano DisCo' },
              { value: 'enugu', label: 'Enugu DisCo' },
            ],
          },
          {
            id: 'registeredCustomers', label: 'Registered customers',
            helpText: 'Total active registered customers at period end.', type: 'number',
            required: true, unit: 'customers', placeholder: 'e.g. 1200000', options: [],
          },
          {
            id: 'meteredCustomers', label: 'Metered customers',
            helpText: 'Total active customers with an installed meter.', type: 'number',
            required: true, unit: 'customers', placeholder: 'e.g. 840000', options: [],
          },
        ],
      },
    ],
  },
}

export const uploadDefinitions: Record<string, UploadDefinition> = Object.fromEntries(
  submissionObligations.map((obligation) => [obligation.id, {
    obligationId: obligation.id,
    institution: obligation.institution,
    dataset: obligation.dataset,
    reportingPeriod: obligation.reportingPeriod,
    template: obligation.template,
    acceptedFileTypes: ['.xlsx', '.csv'],
    acceptedFileTypesLabel: 'Excel workbook or CSV',
    maxFileSizeMb: 20,
  }]),
)
