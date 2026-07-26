import type { ReactNode } from 'react'

export function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-page px-4 py-8 sm:px-8">
      <section className="w-full max-w-[29rem] rounded-card bg-surface px-6 py-8 sm:px-8 sm:py-10">
        <img
          alt="gEApp"
          className="mx-auto mb-10 h-auto w-28 object-contain"
          src="/Logos/geapp.png"
        />
        {children}
        <p className="mt-10 border-t border-border-default pt-5 text-xs text-text-muted">
          Authorised users only - Energy Reform Monitoring Centre
        </p>
      </section>
    </main>
  )
}
