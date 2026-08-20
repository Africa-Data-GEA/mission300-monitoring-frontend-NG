/**
 * The data-confidence key, per docs/public-gateway-home.md §00/§03: because
 * every figure on this page is published regardless of validation status,
 * the page owes the reader a plain explanation of what those statuses mean
 * — in body text, not a tooltip or a legend of coloured dots, immediately
 * beneath the headline strip. It used to sit only in the footer, separated
 * from the figures it explains by the rest of the page; every occurrence of
 * "Confirmed"/"Provisional" above this point had nothing to point back to.
 */
export function DataConfidenceKey() {
  return (
    <p id="data-confidence" className="mt-4 max-w-[42rem] text-[0.9375rem] leading-6 text-text-muted">
      Every figure above carries the status of the data behind it.
      <strong className="font-bold text-text-default"> Confirmed</strong> means
      validated by the institution responsible for it.
      <strong className="font-bold text-text-default"> Public source</strong> means
      published elsewhere, such as by the World Bank.
      <strong className="font-bold text-text-default"> Provisional</strong> and{' '}
      <strong className="font-bold text-text-default">requires validation</strong> are
      early figures that may change as data is checked. They are shown so the
      record is complete, not because they are final.
    </p>
  )
}
