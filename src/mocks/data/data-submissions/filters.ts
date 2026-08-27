import type { DataSubmissionFilters } from '@/api/schemas/data-submissions'

const all = { value: 'all', label: 'All' }

export const dataSubmissionFilters: DataSubmissionFilters = {
  institutions: [
    all,
    { value: 'nerc', label: 'NERC' },
    { value: 'rea', label: 'Rural Electrification Agency' },
    { value: 'tcn', label: 'Transmission Company of Nigeria' },
  ],
  datasets: [
    all,
    { value: 'metering', label: 'Metering performance' },
    { value: 'mini-grid', label: 'Mini-grid connections' },
    { value: 'transmission-capacity', label: 'Transmission transfer capacity' },
  ],
  reportingPeriods: [
    all,
    { value: 'q3-2026', label: 'Q3 2026' },
    { value: 'sep-2026', label: 'September 2026' },
    { value: 'q2-2026', label: 'Q2 2026' },
  ],
  submissionStatuses: [
    all,
    { value: 'draft', label: 'Draft' },
    { value: 'pending-review', label: 'Pending review' },
    { value: 'returned', label: 'Returned' },
    { value: 'approved', label: 'Approved' },
  ],
  validationStatuses: [
    all,
    { value: 'passed', label: 'Checks passed' },
    { value: 'failed', label: 'Checks failed' },
    { value: 'not-run', label: 'Not run' },
  ],
  reviewers: [
    all,
    { value: 'ngozi-okafor', label: 'Ngozi Okafor' },
    { value: 'grace-etim', label: 'Grace Etim' },
  ],
  readinessTiers: [
    all,
    { value: 'core', label: 'Core' },
    { value: 'supporting', label: 'Supporting' },
    { value: 'future', label: 'Future' },
  ],
  overdueStatuses: [
    all,
    { value: 'overdue', label: 'Overdue' },
    { value: 'missing', label: 'Missing' },
    { value: 'due-soon', label: 'Due soon' },
  ],
}
