/**
 * §08 — the institutions behind the record.
 *
 * NOT A LOGO WALL. A row of greyscale logos with a hover effect is a
 * fundraising-page convention: it signals endorsement without saying anything.
 * A reader who does not already know what NERC is learns nothing from its mark.
 *
 * Naming each institution and what it is responsible for does the actual job —
 * it tells a citizen who to hold accountable for which number, which is the
 * point of publishing a record at all. Each of these is a real stakeholder
 * already modelled in the platform's Stakeholders module.
 */
const INSTITUTIONS = [
  {
    name: 'Federal Ministry of Power',
    role: 'Policy direction and oversight of the National Energy Compact.',
  },
  {
    name: 'Nigerian Electricity Regulatory Commission (NERC)',
    role: 'Regulation of tariffs, licensing and market rules.',
  },
  {
    name: 'Rural Electrification Agency (REA)',
    role: 'Off-grid and mini-grid delivery to underserved communities.',
  },
  {
    name: 'Transmission Company of Nigeria (TCN)',
    role: 'The national transmission network.',
  },
  {
    name: 'Nigerian Independent System Operator (NISO)',
    role: 'System operation and dispatch of the national grid.',
  },
  {
    name: 'Distribution companies (DisCos)',
    role: 'Connections, metering and supply to end customers.',
  },
] as const

export function Institutions() {
  return (
    <section aria-labelledby="institutions" className="mt-14">
      <h2
        id="institutions"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        Who reports these figures
      </h2>

      <dl className="mt-4 max-w-[42rem] border-t-2 border-text-default">
        {INSTITUTIONS.map((institution) => (
          <div
            key={institution.name}
            className="border-b border-border-strong py-4"
          >
            <dt className="text-[1.0625rem] leading-6 font-bold text-text-default">
              {institution.name}
            </dt>
            <dd className="mt-1 text-[1rem] leading-6 text-text-muted">
              {institution.role}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
