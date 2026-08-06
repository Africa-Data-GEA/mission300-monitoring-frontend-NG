/**
 * Placeholder while the national figures load.
 *
 * Reserves the heights the real content occupies so nothing shifts under a
 * reader's thumb when the figures arrive — this is a public service on
 * connections that are often slow, where first paint matters more than it does
 * behind a login.
 */
export function NationalStatementSkeleton() {
  return (
    <div
      aria-busy="true"
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <span className="sr-only">Loading national figures</span>
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-12 w-full max-w-[34rem] rounded bg-border-default" />
        <div className="mt-6 space-y-2 max-w-[42rem]">
          <div className="h-5 w-full rounded bg-border-default" />
          <div className="h-5 w-full rounded bg-border-default" />
          <div className="h-5 w-3/4 rounded bg-border-default" />
        </div>

        <div className="mt-10 h-4 w-48 rounded bg-border-default" />
        <div className="mt-3 border-t border-border-default">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between border-b border-border-default py-4"
            >
              <div className="h-4 w-56 max-w-[45%] rounded bg-border-default" />
              <div className="h-5 w-24 rounded bg-border-default" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
