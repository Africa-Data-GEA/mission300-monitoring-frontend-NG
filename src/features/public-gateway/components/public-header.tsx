import { Link } from 'react-router'
import { useBrandConfig } from '@/features/branding/api'

const NAV_ITEMS = [
  { label: 'Figures', to: '#latest-figures' },
  { label: 'Delivery', to: '#access-delivery' },
  { label: 'Progress', to: '#performance-evolution' },
  { label: 'States', to: '#delivery-in-motion' },
  { label: 'About', to: '#institutions' },
] as const

/** A restrained public masthead with direct navigation and one primary action. */
export function PublicHeader() {
  const { data: brand } = useBrandConfig()

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-landing-navy text-white">
        <div className="mx-auto flex min-h-8 max-w-[96rem] items-center justify-between gap-6 px-4 py-1.5 sm:px-6">
          <p className="text-[0.625rem] leading-4 font-medium tracking-[0.12em] text-white/70 uppercase sm:text-[0.6875rem]">
            Federal Republic of Nigeria · Federal Ministry of Power
          </p>
          <p className="hidden text-[0.625rem] leading-4 font-medium tracking-[0.08em] text-white/55 uppercase sm:block">
            Official public record
          </p>
        </div>
      </div>

      <div className="border-b border-[#dce3e8] bg-white/95 text-text-default backdrop-blur-md">
        <div className="mx-auto flex min-h-[4.5rem] max-w-[96rem] items-center gap-7 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3.5">
            <img
              src={brand?.logoUrl ?? '/Logos/geapp.png'}
              alt=""
              width={34}
              height={34}
              className="size-[2.125rem] shrink-0 object-contain"
            />
            <span className="min-w-0 border-l border-[#dce3e8] pl-3.5">
              <span className="block text-[1rem] leading-5 font-semibold tracking-[-0.01em] text-landing-navy">
                Mission 300 {brand?.countryName ?? 'Nigeria'}
              </span>
              <span className="mt-0.5 block text-[0.6875rem] leading-4 tracking-[0.02em] text-text-muted">
                National Energy Compact
              </span>
            </span>
          </Link>

          <nav aria-label="Page sections" className="ml-auto hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.to}
                href={item.to}
                className="border-b-2 border-transparent py-2 text-[0.8125rem] leading-5 font-medium text-[#465866] transition-colors hover:border-landing-gold hover:text-landing-navy"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            to="/account/login"
            className="ml-auto shrink-0 rounded-[0.375rem] border border-landing-blue bg-landing-blue px-4 py-2 text-[0.8125rem] leading-5 font-semibold text-white transition-colors hover:bg-landing-navy lg:ml-0"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
