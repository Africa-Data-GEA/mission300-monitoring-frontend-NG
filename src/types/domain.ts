/**
 * Core domain vocabulary for the Mission 300 Monitoring Dashboard.
 *
 * These types are the shared language between this frontend and the gApp
 * backend. Every string union here is closed on purpose: adding a value is a
 * contract change that must be reflected in docs/API.md and the page
 * specifications under docs/specs/.
 */

/** The six Compact pillars. IDs are stable and used in URLs and API filters. */
export const PILLARS = [
  'generation-network',
  'last-mile-access',
  'financially-viable-utilities',
  'private-sector-participation',
  'regional-integration',
  'clean-cooking',
] as const

export type PillarId = (typeof PILLARS)[number]

export const PILLAR_LABELS: Record<PillarId, string> = {
  'generation-network': 'Generation & network',
  'last-mile-access': 'Last-mile access',
  'financially-viable-utilities': 'Viable utilities',
  'private-sector-participation': 'Private sector',
  'regional-integration': 'Regional integration',
  'clean-cooking': 'Clean cooking',
}

/**
 * Delivery status vocabulary. `limited-data` and `provisional` are distinct
 * from a performance judgement: they mean the dashboard cannot yet assert
 * whether the pillar is performing, which the spec requires us to show plainly
 * rather than defaulting to "at risk".
 */
export type DeliveryStatus =
  | 'completed'
  | 'on-track'
  | 'at-risk'
  | 'lagging'
  | 'delayed'
  | 'blocked'
  | 'limited-data'
  | 'provisional'

/**
 * How much the underlying figure can be trusted. The spec is emphatic that a
 * number is never shown without disclosing its provenance.
 */
export type DataConfidence = 'confirmed' | 'requires-validation' | 'future-gap'

/** Provenance badge shown on a metric card. */
export type SourceTag =
  | 'live'
  | 'live-cpr'
  | 'public-source'
  | 'indicative'
  | 'requires-validation'

/**
 * Direction in which a metric improves. Critical for arrow colouring: ATC&C
 * losses and tariff shortfall improve as they FALL, so a downward arrow must
 * render green for those metrics.
 */
export type ImprovementDirection = 'higher-is-better' | 'lower-is-better'

/** Period-on-period movement attached to a metric. */
export interface Trend {
  /** Signed change against the previous comparable period. */
  readonly change: number
  /** Rendering hint, e.g. "target 100% by 2027" or "from 42—47%". */
  readonly label: string
  readonly direction: ImprovementDirection
}

/**
 * Semantic icon name carried by a metric.
 *
 * The API sends a name, not an icon, so the backend stays independent of the
 * icon library. Names are resolved to components in src/config/metric-icons.tsx.
 */
export type MetricIconName =
  | 'access'
  | 'metering'
  | 'losses'
  | 'capital'
  | 'generation'
  | 'milestones'
  | 'pillars'
  | 'kpis'
  | 'escalations'
  | 'institutions'
  | 'generic'

/**
 * The definition/methodology payload behind every information icon. The spec
 * requires all four parts, so none of them are optional.
 */
export interface MetricProvenance {
  readonly definition: string
  readonly methodology: string
  readonly source: string
  readonly lastUpdated: string
}
