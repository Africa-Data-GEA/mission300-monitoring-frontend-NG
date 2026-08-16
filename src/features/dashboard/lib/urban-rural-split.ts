/**
 * Illustrative urban/rural split for an access-delivery channel figure —
 * stakeholder feedback asked, as an optional addition, for quantitative
 * access targets to show an urban vs rural breakdown where possible. No
 * disaggregated urban/rural connection data exists in this build, so this
 * applies a fixed, clearly-labelled illustrative ratio rather than
 * presenting a sourced split.
 *
 * The 65/35 urban-lean ratio reflects the well-documented pattern that
 * grid, mini-grid and SHS connections in Nigeria have historically reached
 * urban and peri-urban areas faster than remote rural communities — not a
 * specific published figure.
 */
const URBAN_SHARE = 0.65

export interface UrbanRuralBreakdownRow {
  id: 'urban' | 'rural'
  name: string
  value: number
}

export function getUrbanRuralBreakdown(current: number): UrbanRuralBreakdownRow[] {
  const urban = Math.round(current * URBAN_SHARE)
  const rural = Math.round(current - urban)

  return [
    { id: 'urban', name: 'Urban', value: urban },
    { id: 'rural', name: 'Rural', value: rural },
  ]
}
