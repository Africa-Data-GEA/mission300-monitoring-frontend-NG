/**
 * Relative size of each Distribution Company, used to turn a national Core
 * Indicator figure into an illustrative per-DisCo split for the "By DisCo"
 * expansion on the pillar dashboard.
 *
 * Ikeja/Eko/Kano are anchored to their real active-customer counts from
 * src/mocks/data/state-disco/comparison.ts (1.31m / 0.74m / 0.71m). The
 * other eight DisCos don't have a published customer count in this build,
 * so their weights are a plausible relative ordering, not a sourced figure —
 * this is why the breakdown UI must label itself illustrative rather than
 * presenting it as confirmed DisCo-level data.
 */
const DISCO_SIZE: ReadonlyArray<{ id: string; name: string; weight: number }> = [
  { id: 'ikeja', name: 'Ikeja', weight: 131 },
  { id: 'ibadan', name: 'Ibadan', weight: 118 },
  { id: 'abuja', name: 'Abuja', weight: 112 },
  { id: 'ph', name: 'Port Harcourt', weight: 95 },
  { id: 'benin', name: 'Benin', weight: 88 },
  { id: 'enugu', name: 'Enugu', weight: 82 },
  { id: 'kaduna', name: 'Kaduna', weight: 78 },
  { id: 'eko', name: 'Eko', weight: 74 },
  { id: 'kano', name: 'Kano', weight: 71 },
  { id: 'jos', name: 'Jos', weight: 58 },
  { id: 'yola', name: 'Yola', weight: 45 },
]

const TOTAL_WEIGHT = DISCO_SIZE.reduce((sum, entry) => sum + entry.weight, 0)
const MAX_WEIGHT = Math.max(...DISCO_SIZE.map((entry) => entry.weight))

export interface DiscoBreakdownRow {
  id: string
  name: string
  value: number
}

/**
 * Units that add up across DisCos to the national figure (customer counts,
 * money) vs. units that are already a rate/average, where DisCos instead
 * spread *around* the national figure rather than summing to it.
 */
function isExtensiveUnit(unit: string): boolean {
  return unit === 'customers' || unit === 'NGN Billion'
}

export function getDiscoBreakdown(current: number, unit: string): DiscoBreakdownRow[] {
  if (isExtensiveUnit(unit)) {
    return DISCO_SIZE.map((disco) => ({
      id: disco.id,
      name: disco.name,
      value: Math.round(current * (disco.weight / TOTAL_WEIGHT) * 100) / 100,
    }))
  }

  // Intensive metric (%, NGN/kWh, hours/day): larger DisCos skew a little
  // above the national figure and smaller ones a little below it, echoing
  // the real spread already on record (Ikeja's 90.58% collection efficiency
  // vs Kano's 64.56%, in state-disco/comparison.ts) rather than flattening
  // every DisCo to an identical number.
  return DISCO_SIZE.map((disco) => {
    const factor = 0.75 + 0.5 * (disco.weight / MAX_WEIGHT)
    return {
      id: disco.id,
      name: disco.name,
      value: Math.round(current * factor * 100) / 100,
    }
  }).sort((a, b) => b.value - a.value)
}
