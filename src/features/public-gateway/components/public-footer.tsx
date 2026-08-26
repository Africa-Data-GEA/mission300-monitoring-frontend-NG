import { ArrowUpRight, Download } from 'lucide-react'
import { Link } from 'react-router'

const FOOTER_LINKS = [
  { label: 'Latest figures', href: '#latest-figures' },
  { label: 'Delivery', href: '#access-delivery' },
  { label: 'Indicator tracker', href: '#performance-evolution' },
  { label: 'States', href: '#delivery-in-motion' },
] as const

export function PublicFooter({ lastUpdated }: { lastUpdated: string }) {
  return (
    <footer className="mt-16 bg-landing-blue text-white">
      <div className="mx-auto max-w-[96rem] px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_auto] lg:items-start">
          <div>
            <p className="text-[1.125rem] leading-6 font-semibold tracking-tight">
              Mission 300 Nigeria
            </p>
            <p className="mt-2 max-w-[28rem] text-[0.8125rem] leading-5 text-white/70">
              Federal Republic of Nigeria · Federal Ministry of Power
            </p>
            <p className="mt-1 text-[0.75rem] leading-5 text-white/55">
              National Energy Compact · updated {lastUpdated}
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.8125rem] leading-5 font-medium text-white/72 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap gap-2.5 lg:max-w-[19rem] lg:justify-end">
            <a
              href="/nigeria_mission-300_compact-progress-report_q12026.pdf"
              className="inline-flex items-center gap-2 rounded-[0.375rem] border border-white/30 px-3.5 py-2 text-[0.75rem] leading-5 font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <Download aria-hidden="true" className="size-3.5" />
              Progress report
            </a>
            <Link
              to="/progress"
              className="inline-flex items-center gap-2 rounded-[0.375rem] bg-white px-3.5 py-2 text-[0.75rem] leading-5 font-semibold text-landing-blue transition-colors hover:bg-[#edf2f5]"
            >
              Explore progress
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/18 pt-5 text-[0.6875rem] leading-4 text-white/50">
          <p>© 2026 Federal Ministry of Power</p>
          <Link to="/account/login" className="font-medium text-white/70 hover:text-white">
            Reporting institution sign in
          </Link>
        </div>
      </div>
    </footer>
  )
}
