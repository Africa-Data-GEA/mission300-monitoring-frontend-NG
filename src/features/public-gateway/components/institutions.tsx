import { SectionHeading } from './section-heading'

/**
 * Section 05 — the institutions behind the record.
 *
 * NOT A LOGO WALL. A row of greyscale logos with a hover effect is a
 * fundraising-page convention: it signals endorsement without saying anything.
 * A reader who does not already know what NERC is learns nothing from its mark.
 *
 * Naming each institution and what it is accountable for does the actual job —
 * it tells a citizen who to hold responsible for which number, which is the
 * point of publishing a record at all. Each of these is a real stakeholder
 * already modelled in the platform's Stakeholders module.
 *
 * The `reports` line is the deliberate addition on this pass: an institution
 * named without the figures it owns is still only a credential. Naming the
 * figure closes the loop between the charts above and the accountability below.
 */
const INSTITUTIONS = [
  {
    name: 'Federal Ministry of Power',
    role: 'Policy direction and oversight of the National Energy Compact.',
    reports: 'Compact Progress Report headline outcomes',
  },
  {
    name: 'Nigerian Electricity Regulatory Commission (NERC)',
    role: 'Regulation of tariffs, licensing and market rules.',
    reports: 'Metering rate, market remittance, tariff shortfall',
  },
  {
    name: 'Rural Electrification Agency (REA)',
    role: 'Off-grid and mini-grid delivery to underserved communities.',
    reports: 'Mini-grid connections, solar home systems',
  },
  {
    name: 'Transmission Company of Nigeria (TCN)',
    role: 'The national transmission network.',
    reports: 'Network capacity and evacuation constraints',
  },
  {
    name: 'Nigerian Independent System Operator (NISO)',
    role: 'System operation and dispatch of the national grid.',
    reports: 'Available generation capacity',
  },
  {
    name: 'Distribution companies (DisCos)',
    role: 'Connections, metering and supply to end customers.',
    reports: 'New grid connections, ATC&C losses',
  },
] as const

export function Institutions() {
  return (
    <section aria-labelledby="institutions" className="mt-14">
      <SectionHeading
        id="institutions"
        index="05"
        title="Who reports these figures"
        description="Every figure on this page is submitted by one of these institutions and carries its name in the source line under the chart."
      />

      <dl className="mt-px grid gap-px bg-border-strong md:grid-cols-2 xl:grid-cols-3">
        {INSTITUTIONS.map((institution) => (
          <div key={institution.name} className="bg-surface p-5">
            <dt className="text-[0.9375rem] leading-5 font-bold text-text-default">
              {institution.name}
            </dt>
            <dd className="mt-1.5 text-[0.875rem] leading-6 text-text-muted">
              {institution.role}
              <span className="mt-2.5 block border-t border-border-default pt-2 text-[0.75rem] leading-4">
                <span className="font-semibold tracking-[0.06em] text-brand-600 uppercase">
                  Reports
                </span>
                <span className="mt-0.5 block text-text-muted">{institution.reports}</span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
