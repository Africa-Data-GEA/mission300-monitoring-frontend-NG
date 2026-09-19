import type { HeadlineCards } from '@/api/schemas/executive-overview'
import type { MetricProvenance, SourceTag, Trend } from '@/api/schemas/common'

/** Baseline → current → target on one axis, where all three are real numbers. */
export interface FigureTrack {
  readonly min: number
  readonly max: number
  readonly current: number
  readonly baseline: number | null
  readonly target: number | null
  readonly baselineLabel: string
  readonly targetLabel: string
  /** Interim checkpoints on the approved trajectory, plotted as ticks. */
  readonly milestones: readonly { label: string; value: number }[]
}

export interface KpiFigure {
  readonly id: string
  readonly label: string
  readonly value: string
  /** Reporting period or source year — never omitted, per §03 of the spec:
   * an annual official publication must never read as current-period data. */
  readonly period: string
  readonly trend?: Trend
  readonly provenance: MetricProvenance
  readonly source: SourceTag
  /** Null where the card has no numeric baseline/target to plot. Deliberately
   * null rather than a guessed scale — the spec forbids inventing a target. */
  readonly track: FigureTrack | null
  readonly sparkline: readonly { period: string; value: number }[]
  /** One short line under the figure — for whatever the track above it does
   * NOT already say. Null where there is nothing left to add: a card with a
   * baseline→current→target bullet track already prints its baseline and
   * target as that track's own axis labels, so restating "Baseline X ·
   * target Y" as a sentence underneath it is the same two facts twice on one
   * card, not a second one. */
  readonly context: string | null
}

/**
 * The four Compact outcomes, normalised into one shape the KPI strip can render
 * uniformly.
 *
 * The four cards arrive from the API as four *different* schemas — two Compact
 * outcomes with a baseline/target scale, an access rate published annually with
 * a source year, and a generation figure expressed as available-of-installed.
 * That asymmetry is correct in the contract and wrong in a headline strip,
 * where four cells of visibly different construction read as four unrelated
 * facts rather than one record.
 *
 * WHERE A FIELD DOES NOT EXIST IT STAYS NULL. The access rate has no numeric
 * approved target on this payload, only a target *label*, so it gets no
 * progress track rather than a track drawn against an assumed 100%. Publishing
 * the absence of a target is itself a credibility signal — the same rule §04 of
 * the spec applies to the delivery channels.
 */
export function buildKpiFigures(cards: HeadlineCards): KpiFigure[] {
  const { peopleWithElectricityAccess: people, accessRate, generationCapacity, cleanCookingAccess: cooking } = cards

  return [
    compactOutcomeFigure('people', people),
    {
      id: 'access-rate',
      label: accessRate.title,
      value: accessRate.value,
      period: accessRate.sourceYear,
      trend: accessRate.trend,
      provenance: accessRate.provenance,
      source: accessRate.source,
      track: null,
      sparkline: accessRate.sparkline,
      // `previousPublication` already reads as a complete phrase ("previous
      // publication 61% (2022)", or "No previous publication on record") —
      // prepending a second "previously published" here just repeated the
      // same word twice in one sentence.
      context: null,
    },
    {
      id: 'generation-capacity',
      label: generationCapacity.title,
      value: generationCapacity.value,
      period: generationCapacity.reportingPeriod,
      trend: generationCapacity.trend,
      provenance: generationCapacity.provenance,
      source: generationCapacity.source,
      // Available-of-installed is a real, published ratio — not an invented
      // target — so it is honest to plot it as one.
      track: {
        min: 0,
        max: generationCapacity.installedMw,
        current: generationCapacity.availableMw,
        baseline: null,
        target: generationCapacity.installedMw,
        baselineLabel: '',
        targetLabel: `${generationCapacity.installedMw.toLocaleString('en-US')} MW installed`,
        milestones: [],
      },
      sparkline: generationCapacity.sparkline,
      context: null,
    },
    compactOutcomeFigure('clean-cooking', cooking),
  ]
}

function compactOutcomeFigure(
  id: string,
  card: HeadlineCards['peopleWithElectricityAccess'],
): KpiFigure {
  return {
    id,
    label: card.title,
    value: card.value,
    period: card.reportingPeriod,
    trend: card.trend,
    provenance: card.provenance,
    source: card.source,
    // No approved value has ever been reported for this outcome yet
    // (`reportingPeriod` is only ever "Not yet reported" when the backing
    // KPI profile's `current` is null) - `card.current` is a contractual 0 in
    // that case, not a real reading, so drawing a bullet track against it
    // would show a filled bar implying real progress that was never made.
    track:
      card.reportingPeriod === 'Not yet reported'
        ? null
        : {
            min: card.scaleMin,
            max: card.scaleMax,
            current: card.current,
            baseline: card.baseline,
            target: card.target,
            baselineLabel: card.baselineLabel,
            targetLabel: card.targetLabel,
            milestones: card.milestones,
          },
    sparkline: [],
    // No context sentence: the bullet track above already prints
    // `baselineLabel` and `targetLabel` as its own left/right axis labels —
    // see the note on KpiFigure.context.
    context: null,
  }
}

/**
 * The page's own four-word confidence vocabulary, mapped from the API's source
 * tag. These four strings are exactly the ones the data-confidence key explains
 * in prose — if a fifth appears here without being added there, a reader meets
 * a label the page never defined.
 */
export const CONFIDENCE_LABELS: Record<SourceTag, string> = {
  live: 'Confirmed',
  'live-cpr': 'Confirmed',
  'public-source': 'Public source',
  indicative: 'Provisional',
  'requires-validation': 'Requires validation',
}

export const CONFIDENCE_DOT_CLASSES: Record<SourceTag, string> = {
  live: 'bg-status-on-track',
  'live-cpr': 'bg-status-on-track',
  'public-source': 'bg-landing-blue-light',
  indicative: 'bg-status-no-data',
  'requires-validation': 'bg-status-lagging',
}
