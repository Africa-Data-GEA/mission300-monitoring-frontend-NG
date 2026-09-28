/**
 * Placeholder while the national figures load.
 *
 * Reserves the shape the real content occupies — the dark hero band with its
 * metadata card, then the four-cell headline strip — so nothing shifts under a
 * reader's thumb when the figures arrive. This is a public service on
 * connections that are often slow, where first paint matters more than it does
 * behind a login, and a page that reflows twice on arrival reads as broken.
 */
export function NationalStatementSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading national figures</span>

      <div aria-hidden="true" className="bg-landing-deep-navy">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:gap-14">
          <div className="min-w-0 flex-1 animate-pulse">
            <div className="h-4 w-72 max-w-full bg-white/20" />
            <div className="mt-5 h-12 w-full max-w-[34rem] bg-white/20" />
            <div className="mt-3 h-12 w-full max-w-[24rem] bg-white/20" />
            <div className="mt-8 h-11 w-48 bg-white/20" />
          </div>
          <div className="w-full animate-pulse bg-surface p-6 lg:w-[22rem] lg:shrink-0">
            <div className="space-y-4">
              {[0, 1, 2, 3].map((row) => (
                <div key={row}>
                  <div className="h-3 w-24 bg-border-default" />
                  <div className="mt-2 h-4 w-40 bg-border-default" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="mx-auto max-w-[96rem] px-4 sm:px-6">
        <div className="mt-10 animate-pulse">
          <div className="h-6 w-64 border-b-2 border-border-default pb-3" />
          <div className="mt-px grid gap-px bg-border-strong sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className="bg-surface p-5">
                <div className="h-3 w-20 bg-border-default" />
                <div className="mt-4 h-4 w-36 bg-border-default" />
                <div className="mt-4 h-9 w-28 bg-border-default" />
                <div className="mt-5 h-2.5 w-full bg-border-default" />
                <div className="mt-4 h-3 w-full bg-border-default" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
