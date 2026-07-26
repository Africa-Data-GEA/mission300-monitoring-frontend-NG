import type {
  StateDiscoFilters,
  StateDiscoOverview,
} from '@/api/schemas/state-disco'

export const stateDiscoFilters: StateDiscoFilters = {
  reportingPeriods: [{ value: 'q3-2025', label: 'Q3 2025' }, { value: 'q2-2025', label: 'Q2 2025' }],
  views: [{ value: 'disco', label: 'Distribution Company' }, { value: 'state', label: 'State' }],
  distributionCompanies: [{ value: 'national', label: 'National weighted value' }, { value: 'ikeja', label: 'Ikeja DisCo' }, { value: 'kano', label: 'Kano DisCo' }],
  states: [{ value: 'all', label: 'All states' }, { value: 'kaduna', label: 'Kaduna' }, { value: 'lagos', label: 'Lagos' }],
  utilityMetrics: [{ value: 'all', label: 'All utility metrics' }, { value: 'metering', label: 'Metering' }, { value: 'collection', label: 'Collection efficiency' }],
  serviceBands: [{ value: 'all', label: 'All bands' }, { value: 'a', label: 'Band A' }, { value: 'b', label: 'Band B' }],
  validationStatuses: [{ value: 'confirmed', label: 'Confirmed' }, { value: 'provisional', label: 'Provisional' }],
  sources: [{ value: 'nerc', label: 'NERC' }, { value: 'rea', label: 'REA' }, { value: 'implementation-register', label: 'Implementation Register' }],
}

const provenance = {
  definition: 'Official utility performance value for the selected reporting period.',
  methodology: 'Calculated and validated by the source system before this API response is produced.',
  source: 'NERC Q3 2025 Quarterly Report and approved supporting tables.',
  lastUpdated: '2025-10-14T09:12:00Z',
}

export const stateDiscoOverview: StateDiscoOverview = {
  meta: {
    title: 'Distribution Company performance',
    description: 'National weighted utility performance from approved centrally maintained records.',
    lastUpdatedLabel: 'Updated 14 October 2025',
    sourceLabel: 'NERC Q3 2025',
  },
  selectedUtility: 'National weighted value',
  metrics: [
    {
      id: 'metering-rate', title: 'Metering rate', value: '55.37%',
      supportingLabel: '6.66m of 12.03m active customers metered',
      benchmarkLabel: 'Target: 100% by 2027', varianceLabel: '44.63 pp below target',
      progressPercent: 55.37,
      trend: { change: 1.8, label: '+1.8 pp from Q2 2025', direction: 'higher-is-better' },
      provenance,
    },
    {
      id: 'atcc-loss', title: 'ATC&C loss rate', value: '33.27%',
      supportingLabel: 'Official weighted sector loss',
      benchmarkLabel: 'Allowed loss: 21.4%', varianceLabel: '11.87 pp above allowed loss',
      progressPercent: 66.73,
      trend: { change: -4.65, label: '-4.65 pp from Q2 2025', direction: 'lower-is-better' },
      provenance,
    },
    {
      id: 'collection-efficiency', title: 'Collection efficiency', value: '80.70%',
      supportingLabel: '₦570.25bn collected of ₦706.61bn billed',
      benchmarkLabel: 'Benchmark: 100%', varianceLabel: '19.30 pp below benchmark',
      progressPercent: 80.7,
      trend: { change: 2.1, label: '+2.1 pp from Q2 2025', direction: 'higher-is-better' },
      provenance,
    },
    {
      id: 'market-remittance', title: 'Market-remittance performance', value: '95.21%',
      supportingLabel: 'Combined applicable market obligation',
      benchmarkLabel: 'Benchmark: 100%', varianceLabel: '4.79 pp below benchmark',
      progressPercent: 95.21,
      trend: { change: 0.9, label: '+0.9 pp from Q2 2025', direction: 'higher-is-better' },
      provenance,
    },
  ],
}
