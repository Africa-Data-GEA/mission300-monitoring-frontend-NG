const CONFIDENCE_TERMS = [
  {
    term: 'Confirmed',
    dot: 'bg-status-on-track',
    meaning: 'Validated by the institution responsible for the figure.',
  },
  {
    term: 'Public source',
    dot: 'bg-brand-400',
    meaning: 'Published elsewhere, such as by the World Bank, and reproduced here unchanged.',
  },
  {
    term: 'Provisional',
    dot: 'bg-status-no-data',
    meaning: 'An early figure that may change as data is checked.',
  },
  {
    term: 'Requires validation',
    dot: 'bg-status-lagging',
    meaning: 'Submitted but not yet confirmed by the responsible institution.',
  },
] as const

/**
 * The data-confidence key.
 *
 * REQUIRED, NOT OPTIONAL. Every figure on this page is published regardless of
 * validation status — that decision buys maximum transparency and costs a
 * specific risk: a journalist quotes a provisional number as final, it is
 * revised next quarter, and the correction becomes the story. A badge alone does
 * not cover that, because badges are chrome and readers skip chrome. So the
 * mitigation is this: a persistent, plain-language explanation sitting directly
 * beneath the figures it describes, before any chart.
 *
 * ON THE DOTS. The spec bans "a legend of coloured dots" *in place of* prose.
 * The dots here are not that — each is attached to its term and a full sentence
 * of meaning, and their job is to make the marks already used on the cards above
 * decodable. Removing them would leave those marks undefined, which is the
 * failure the rule was written to prevent, not the rule itself.
 */
export function DataConfidenceKey() {
  return (
    <section
      id="data-confidence"
      aria-labelledby="data-confidence-heading"
      className="mt-px border-t-2 border-text-default bg-surface-sunken px-5 py-5"
    >
      <h2
        id="data-confidence-heading"
        className="text-[0.9375rem] leading-5 font-bold text-text-default"
      >
        What the status on each figure means
      </h2>
      <p className="mt-1.5 max-w-[46rem] text-[0.875rem] leading-6 text-text-muted">
        Every figure on this page carries the status of the data behind it.
        Provisional and unvalidated figures are shown so the record is complete,
        not because they are final.
      </p>

      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
        {CONFIDENCE_TERMS.map((entry) => (
          <div key={entry.term}>
            <dt className="flex items-center gap-1.5 text-[0.8125rem] leading-5 font-bold text-text-default">
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-pill ${entry.dot}`} />
              {entry.term}
            </dt>
            <dd className="mt-0.5 text-[0.8125rem] leading-5 text-text-muted">{entry.meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
