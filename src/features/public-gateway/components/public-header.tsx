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
      <div className="border-b border-[#dce3e8] bg-white/95 text-text-default backdrop-blur-md">
        <div className="mx-auto flex min-h-[4.5rem] max-w-[96rem] items-center gap-7 px-4 sm:px-6">
          <Link
            to="/"
            aria-label={`Mission 300 ${brand?.countryName ?? 'Nigeria'} — National Energy Compact`}
            className="flex shrink-0 items-center"
          >
            <img
              src="/Logos/m300-logo-navy.svg"
              alt={`Mission 300 ${brand?.countryName ?? 'Nigeria'} — National Energy Compact`}
              width={151}
              height={91}
              className="h-12 w-auto shrink-0 object-contain"
            />
          </Link>

          {/* Funding partners — AfDB and the World Bank back the Compact
              itself, shown quietly beside the masthead in their real brand
              colours (official marks, via Wikimedia Commons). */}
          <div className="hidden shrink-0 items-center gap-4 border-l border-[#dce3e8] pl-4 sm:flex">
            <img
              alt="World Bank Group"
              src="/reports/compact-progress/worldbank-color.png"
              className="h-8 w-auto shrink-0 object-contain"
            />
            <img
              alt="African Development Bank"
              src="/reports/compact-progress/afdb-color.png"
              className="h-9 w-auto shrink-0 object-contain"
            />
          </div>

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
