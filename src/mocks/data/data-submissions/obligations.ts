import type {
  ManualEntryDefinition,
  Obligation,
  UploadDefinition,
} from '@/api/schemas/data-submissions'
import { datasets } from './datasets'
import { statuses } from './statuses'

const meteringPerformance = datasets.find((entry) => entry.id === 'ds-metering-performance')!
const miniGridConnections = datasets.find((entry) => entry.id === 'ds-mini-grid-connections')!
const transmissionCapacity = datasets.find((entry) => entry.id === 'ds-transmission-transfer-capacity')!

export const submissionObligations: Obligation[] = [
  {
    id: 'obl-001', institution: 'NERC', focalPerson: 'Grace Adeyemi',
    datasetId: meteringPerformance.id, dataset: meteringPerformance.name,
    reportingPeriod: 'Q3 2026', frequency: 'Quarterly',
    dueDate: '2026-10-15T17:00:00Z', dueLabel: 'Due 15 Oct 2026',
    status: statuses.due, template: meteringPerformance.template, acceptedSubmissionId: null,
    availableActions: ['enter-data', 'upload-template', 'download-template'],
  },
  {
    id: 'obl-002', institution: 'Rural Electrification Agency',
    focalPerson: 'Fatima Suleiman',
    datasetId: miniGridConnections.id, dataset: miniGridConnections.name,
    reportingPeriod: 'September 2026',
    frequency: 'Monthly', dueDate: '2026-10-07T17:00:00Z',
    dueLabel: 'Due 7 Oct 2026', status: statuses.draft, template: miniGridConnections.template,
    acceptedSubmissionId: null,
    availableActions: ['enter-data', 'upload-template', 'view'],
  },
  {
    id: 'obl-003', institution: 'Transmission Company of Nigeria',
    focalPerson: 'Emeka Okafor',
    datasetId: transmissionCapacity.id, dataset: transmissionCapacity.name,
    reportingPeriod: 'Q3 2026',
    frequency: 'Quarterly', dueDate: '2026-10-10T17:00:00Z',
    dueLabel: '8 days overdue', status: statuses.overdue, template: transmissionCapacity.template,
    acceptedSubmissionId: null,
    availableActions: ['upload-template', 'download-template'],
  },
  // NERC's Q2 2026 metering return is already accepted (see SUB-2026-0018 in
  // submissions.ts) — a fulfilled period does not stay listed here as an
  // outstanding obligation; it lives in submission history instead. Keeping
  // both was the exact confusion this fix removes: the same dataset showing
  // twice, once owed and once already done.
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
