import type { ReactNode } from 'react'

export function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-page px-4 py-8 sm:px-8">
      <section className="w-full max-w-[29rem] rounded-card bg-surface px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-10 flex items-center justify-center gap-6">
          <img
            alt="Nigeria — Mission 300"
            className="h-auto w-28 object-contain"
            src="/Logos/m300-logo-navy.svg"
          />
          <div className="h-10 w-px shrink-0 bg-border-default" aria-hidden="true" />
          <img
            alt="Federal Republic of Nigeria coat of arms"
            className="h-auto w-16 object-contain"
            src="/Logos/geapp.png"
          />
        </div>
        {children}
        <p className="mt-10 border-t border-border-default pt-5 text-xs text-text-muted">
          Authorised users only - Energy Reform Monitoring Centre
        </p>
      </section>
    </main>
  )
}
