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
      'One category within NERC’s real compiled quarterly return (the same "Compiled NERC Data" workbook NERC ' +
      'already submits, covering 2020–2026) — specifically its "Disco Metering" sheet: one row per DisCo per ' +
      'month, registered and metered customer counts. Feeds the financially-viable-utilities pillar’s Metering ' +
      'Rate KPI (M300-P3-004). The same one-file upload also carries the energy-received/billed and revenue ' +
      'billed/collected sheets that feed ATC&C Loss Rate — a single NERC submission satisfies both, which is ' +
      'why the workbook is accepted here even though this obligation only reads its metering sheet.',
    pillar: 'financially-viable-utilities',
    requiredDataPoints: [
      'DisCo (one of the eleven, as named in the workbook — Ikeja, Eko, Abuja, Kaduna, Kano, Benin, Enugu, Ibadan, Jos, Yola, PH)',
      'Reporting month and year',
      'Registered customers (from "Disco Metering")',
      'Metered customers (from "Disco Metering")',
    ],
    frequency: 'Quarterly',
    ownerInstitution: 'NERC',
    template: {
      id: 'tpl-nerc-compiled-data',
      version: '2026',
      fileName: 'compiled-nerc-data-2020-2026.xlsx',
      downloadUrl: '/templates/compiled-nerc-data-2020-2026.xlsx',
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
    id: 'ds-transmission-transfer-capacity',
    name: 'Transmission transfer capacity',
    purpose:
      'Tracks available cross-regional transmission transfer capacity on TCN’s own network, feeding the ' +
      'generation-network pillar’s Available Transmission Transfer Capacity KPI (M300-P1-012). Distinct from ' +
      'generation capacity itself, which NISO/GenCos report separately — TCN owns the wires, not the plants.',
    pillar: 'generation-network',
    requiredDataPoints: ['Reporting corridor or interconnector', 'Available transfer capacity (MW)', 'Constraint notes'],
    frequency: 'Quarterly',
    ownerInstitution: 'Transmission Company of Nigeria',
    template: {
      id: 'tpl-transmission-capacity-v1',
      version: '1.0',
      fileName: 'transmission-transfer-capacity-v1.csv',
      downloadUrl: '/templates/transmission-transfer-capacity-v1.csv',
    },
  },
]

export function getDataset(id: string): Dataset | undefined {
  return datasets.find((entry) => entry.id === id)
}
