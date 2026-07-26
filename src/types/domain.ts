/**
 * Core domain vocabulary for the Mission 300 Monitoring Dashboard.
 *
 * Inferred from the zod schemas in src/api/schemas/common.ts, which are the
 * single source of truth for the contract between this frontend and the gApp
 * backend. Every string union is closed on purpose: adding a value is a
 * contract change that must be reflected in docs/API.md and the page
 * specifications under docs/specs/.
 */
export {
  PILLARS,
  PILLAR_LABELS,
  dataConfidenceSchema,
  deliveryStatusSchema,
  improvementDirectionSchema,
  metricIconNameSchema,
  metricProvenanceSchema,
  pillarIdSchema,
  sourceTagSchema,
  trendSchema,
} from '@/api/schemas/common'

export type {
  DataConfidence,
  DeliveryStatus,
  ImprovementDirection,
  MetricIconName,
  MetricProvenance,
  PillarId,
  SourceTag,
  Trend,
} from '@/api/schemas/common'
