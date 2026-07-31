/**
 * The reporting period a headline figure is drawn from, shown identically on
 * all four Section A cards.
 *
 * Trend comparison basis differs card to card ("vs prior published year" for
 * annual outcomes, "vs Q3 2025" for a quarterly reading) because the metrics
 * genuinely update on different cadences — that's correct, not a bug. What
 * was missing was any visible signal of *which* cadence a given card is on,
 * so the difference read as inconsistency rather than as a stated fact.
 *
 * NEUTRAL, not amber. This previously used bg-status-lagging-bg and
 * text-status-lagging — the delivery-status tokens that mean "Lagging"
 * everywhere else in the product. Every headline card carries a period, so
 * all four pills lit amber at once and the first thing on the Executive
 * Overview read as four warnings against the Compact's four headline
 * outcomes. A period is metadata, not a status, and it must not borrow the
 * status vocabulary. If a genuine staleness warning is wanted it should fire
 * conditionally, on a card whose period actually trails the selection.
 */
export function ReportingPeriodPill({ period }: { period: string }) {
  return (
    <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-muted">
      {period}
    </span>
  )
}
