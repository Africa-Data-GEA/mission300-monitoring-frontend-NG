const CONFIDENCE_TERMS = [
  {
    term: 'Confirmed',
    dot: 'bg-status-on-track',
    meaning: 'Validated by the institution responsible for it.',
  },
  {
    term: 'Public source',
    dot: 'bg-landing-blue-light',
    meaning: 'Published elsewhere, such as by the World Bank.',
  },
  {
    term: 'Provisional',
    dot: 'bg-status-no-data',
    meaning: 'Early figure, may change as data is checked.',
  },
  {
    term: 'Requires validation',
    dot: 'bg-status-lagging',
    meaning: 'Submitted, not yet confirmed.',
  },
] as const

/**
 * The data-confidence key.
 *
 * REQUIRED, NOT OPTIONAL. Every figure on this page is published regardless of
 * validation status. That buys transparency and costs a specific risk: a
 * journalist quotes a provisional number as final, it is revised next quarter,
 * and the correction becomes the story. So the page owes the reader an
 * explanation of what those statuses mean, sitting with the figures rather than
 * buried in a footer.
 *
 * ONE LINE OPEN, DEFINITIONS ON DEMAND. The previous version spent a heading,
 * a two-line paragraph and four full sentences — about seventy words — between
 * the headline figures and the first chart, which is the worst possible place
 * for the page's densest prose. The four terms are now a single legend row that
 * decodes the dots on the cards above at a glance, with the definitions behind
 * a disclosure for the reader who actually needs them.
 *
 * The spec requires this be plain language rather than a bare colour legend,
 * and it still is: the words are present and open by default, and no figure is
 * left carrying an undefined mark. What moved behind the toggle is the
 * elaboration, not the vocabulary.
 */
export function DataConfidenceKey() {
  return (
    <section
      id="data-confidence"
      aria-labelledby="data-confidence-heading"
      className="mt-px border-t-2 border-text-default bg-surface-sunken px-5 py-3.5"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <h2
          id="data-confidence-heading"
          className="text-[0.6875rem] leading-4 font-bold tracking-[0.1em] text-text-muted uppercase"
        >
          Data confidence
        </h2>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {CONFIDENCE_TERMS.map((entry) => (
            <li
              key={entry.term}
              className="flex items-center gap-1.5 text-[0.8125rem] leading-5 font-medium text-text-default"
            >
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-pill ${entry.dot}`} />
              {entry.term}
            </li>
          ))}
        </ul>

        <details className="group ml-auto">
          <summary className="cursor-pointer list-none text-[0.8125rem] leading-5 font-semibold text-link underline underline-offset-4 hover:no-underline">
            <span className="group-open:hidden">What these mean</span>
            <span className="hidden group-open:inline">Hide</span>
          </summary>

          <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {CONFIDENCE_TERMS.map((entry) => (
              <div key={entry.term} className="flex gap-2">
                <dt className="shrink-0 text-[0.8125rem] leading-5 font-bold text-text-default">
                  {entry.term}
                </dt>
                <dd className="text-[0.8125rem] leading-5 text-text-muted">{entry.meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[0.8125rem] leading-5 text-text-muted">
            Provisional and unvalidated figures are shown so the record is
            complete, not because they are final.
          </p>
        </details>
      </div>
    </section>
  )
}
