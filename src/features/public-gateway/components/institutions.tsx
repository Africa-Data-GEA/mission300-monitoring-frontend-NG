import { SectionHeading } from './section-heading'

/**
 * Section 05 — the institutions behind the record.
 *
 * NOT A LOGO WALL. A row of greyscale logos with a hover effect is a
 * fundraising-page convention: it signals endorsement without saying anything.
 * A reader who does not already know what NERC is learns nothing from its mark.
 *
 * ONE LINE EACH, AND IT IS THE USEFUL ONE. An earlier version gave every
 * institution both a mandate sentence and the figures it reports — twelve lines
 * of prose closing a page that had already spent too many. The mandate is
 * general knowledge or a search away; which numbers above belong to whom is
 * not, and it is the only line that connects this section to the charts. So the
 * mandate goes and the reporting line stays.
 *
 * Each of these is a real stakeholder already modelled in the platform's
 * Stakeholders module.
 */
const INSTITUTIONS = [
  {
    name: 'Federal Ministry of Power',
    reports: 'Compact Progress Report headline outcomes',
  },
  {
    name: 'Nigerian Electricity Regulatory Commission',
    reports: 'Metering rate · market remittance · tariff shortfall',
  },
  {
    name: 'Rural Electrification Agency',
    reports: 'Mini-grid connections · solar home systems',
  },
  {
    name: 'Transmission Company of Nigeria',
    reports: 'Network capacity · evacuation constraints',
  },
  {
    name: 'Nigerian Independent System Operator',
    reports: 'Available generation capacity',
  },
  {
    name: 'Distribution companies (DisCos)',
    reports: 'New grid connections · ATC&C losses',
  },
] as const

export function Institutions() {
  return (
    <section aria-labelledby="institutions" className="mt-14">
      <SectionHeading id="institutions" index="05" title="Who reports these figures" />

      <dl className="mt-px grid gap-px bg-border-strong md:grid-cols-2 xl:grid-cols-3">
        {INSTITUTIONS.map((institution) => (
          <div key={institution.name} className="bg-surface p-4">
            <dt className="text-[0.875rem] leading-5 font-bold text-text-default">
              {institution.name}
            </dt>
            <dd className="mt-1 text-[0.8125rem] leading-5 text-text-muted">
              {institution.reports}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
