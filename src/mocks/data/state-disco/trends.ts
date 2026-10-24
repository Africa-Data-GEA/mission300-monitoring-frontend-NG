import type { PerformanceTrendPoint } from '@/api/schemas/state-disco'

/** Six quarters of illustrative national performance. The latest quarter has
 * no remittance figure, matching how the NERC MO/NBET tables lag the energy
 * and revenue tables by a quarter. */
const ROWS: [period: string, label: string, metering: number, atcc: number, collection: number, remittance: number | null][] = [
  ['q1-2025', 'Q1 2025', 44.2, 41.8, 72.4, 88.3],
  ['q2-2025', 'Q2 2025', 45.1, 40.2, 74.0, 91.0],
  ['q3-2025', 'Q3 2025', 46.3, 39.5, 73.1, 95.6],
  ['q4-2025', 'Q4 2025', 47.0, 38.1, 75.8, 98.2],
  ['q1-2026', 'Q1 2026', 48.4, 37.4, 77.2, 100.4],
  ['q2-2026', 'Q2 2026', 49.1, 36.9, 78.0, null],
]

export const performanceTrendPoints: PerformanceTrendPoint[] = ROWS.map(
  ([period, label, meteringRate, atccLossRate, collectionEfficiency, remittancePerformance]) => ({
    period,
    label,
    meteringRate,
    atccLossRate,
    collectionEfficiency,
    remittancePerformance,
    reportingDiscos: 12,
  }),
)
