import type { Dataset } from '@/api/schemas/data-submissions'

/**
 * The real Dataset records `Obligation.dataset` used to only reference by a
 * matching free-text label. Each one now carries its own purpose, required
 * data points, and its own submission template — previously every
 * obligation pointed at the same shared metering-performance template
 * regardless of which dataset it actually was.
 */
export const datasets: Dataset[] = [
  {
    id: 'ds-metering-performance',
    name: 'Metering performance',
    purpose:
      'Tracks customer metering coverage and billing/collection efficiency across DisCos, feeding the ' +
      'financially-viable-utilities pillar’s metering-rate KPI.',
    pillar: 'financially-viable-utilities',
    requiredDataPoints: ['Distribution company', 'Registered customers', 'Metered customers'],
    frequency: 'Quarterly',
    ownerInstitution: 'NERC',
    template: {
      id: 'tpl-metering-v3',
      version: '3.0',
      fileName: 'metering-performance-v3.csv',
      downloadUrl: '/templates/metering-performance-v3.csv',
    },
  },
  {
    id: 'ds-mini-grid-connections',
    name: 'Mini-grid connections',
    purpose:
      'Tracks new mini-grid household connections toward the last-mile-access pillar’s connection targets.',
    pillar: 'last-mile-access',
    requiredDataPoints: ['Reporting DisCo or developer', 'New connections this period', 'Households served'],
    frequency: 'Monthly',
    ownerInstitution: 'Rural Electrification Agency',
    template: {
      id: 'tpl-minigrid-v1',
      version: '1.0',
      fileName: 'mini-grid-connections-v1.csv',
      downloadUrl: '/templates/mini-grid-connections-v1.csv',
    },
  },
  {
    id: 'ds-generation-availability',
    name: 'Generation availability',
    purpose:
      'Tracks available generation capacity actually dispatched onto the grid, feeding the ' +
      'generation-network pillar’s available-capacity KPI.',
    pillar: 'generation-network',
    requiredDataPoints: ['Reporting plant or operator', 'Available capacity (MW)', 'Dispatched capacity (MW)'],
    frequency: 'Quarterly',
    ownerInstitution: 'Transmission Company of Nigeria',
    template: {
      id: 'tpl-generation-v2',
      version: '2.0',
      fileName: 'generation-availability-v2.csv',
      downloadUrl: '/templates/generation-availability-v2.csv',
    },
  },
]

export function getDataset(id: string): Dataset | undefined {
  return datasets.find((entry) => entry.id === id)
}
