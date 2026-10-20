import type { ReactNode } from 'react'
import { useBrandIdentity } from '@/features/branding/use-brand-identity'

export function AuthLayout({ children }: { readonly children: ReactNode }) {
  const identity = useBrandIdentity()
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-page px-4 py-8 sm:px-8">
      <section className="w-full max-w-[29rem] rounded-card bg-surface px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-10 flex items-center justify-center gap-6">
          <img
            alt={`${identity.country} — Mission 300`}
            className="h-auto w-28 object-contain"
            src="/Logos/m300-logo-navy.svg"
          />
          <div className="h-10 w-px shrink-0 bg-border-default" aria-hidden="true" />
          <img
            alt={`${identity.officialName} coat of arms`}
            className="h-auto w-16 object-contain"
            src={identity.crestUrl}
          />
        </div>
        {children}
        <p className="mt-10 border-t border-border-default pt-5 text-xs text-text-muted">
          Mission 300 Progress Tracker
        </p>
      </section>
    </main>
  )
}
