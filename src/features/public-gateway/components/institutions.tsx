const REPORTING_INSTITUTIONS = [
  {
    name: 'Nigerian Electricity Regulatory Commission',
    shortName: 'NERC',
    logo: '/Logos/processed/nerc-transparent.png',
    logoClassName: 'max-h-[4.25rem] max-w-[4.25rem]',
  },
  {
    name: 'Rural Electrification Agency',
    shortName: 'REA',
    logo: '/Logos/processed/rea.png',
    logoClassName: 'max-h-[4.5rem] max-w-[9.5rem]',
  },
  {
    name: 'Transmission Company of Nigeria',
    shortName: 'TCN',
    logo: '/Logos/tcn.jpg',
    logoClassName: 'max-h-[4.5rem] max-w-[5.5rem] mix-blend-multiply',
  },
  {
    name: 'Nigerian Independent System Operator',
    shortName: 'NISO',
    logo: '/Logos/processed/niso-transparent.png',
    logoClassName: 'max-h-[3.25rem] max-w-[9.5rem]',
  },
  {
    name: 'Distribution companies',
    shortName: 'DisCos',
    logo: null,
    logoClassName: '',
  },
] as const

/** Publisher-led accountability map using the institutions' actual marks. */
export function Institutions() {
  return (
    <section id="institutions" aria-labelledby="institutions-heading" className="bg-[#f7f9fb] py-16 sm:py-20">
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
        <h2
          id="institutions-heading"
          className="text-[1.875rem] leading-9 font-semibold tracking-tight text-landing-blue sm:text-[2.25rem] sm:leading-10"
        >
          Who reports these figures
        </h2>

        <div className="mt-8 grid overflow-hidden bg-white lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="flex min-h-[13rem] items-center justify-center bg-white p-7">
            <img
              src="/Logos/geapp.png"
              alt="Federal Republic of Nigeria coat of arms"
              className="max-h-32 max-w-40 object-contain mix-blend-multiply"
            />
          </div>
          <div className="flex flex-col justify-center bg-landing-blue px-7 py-9 text-white sm:px-10">
            <p className="text-[0.625rem] leading-4 font-bold tracking-[0.14em] text-white/55 uppercase">
              Lead publisher
            </p>
            <h3 className="mt-2 text-[1.5rem] leading-8 font-semibold tracking-tight">
              Federal Ministry of Power
            </h3>
          </div>
        </div>

        <ol className="mt-px grid gap-px bg-[#dce4e9] sm:grid-cols-2 lg:grid-cols-5">
          {REPORTING_INSTITUTIONS.map((institution, index) => (
            <li key={institution.shortName} className="flex min-h-[15rem] flex-col bg-white p-5 sm:p-6">
              <div className="flex h-20 items-center justify-between gap-4">
                {institution.logo ? (
                  <img
                    src={institution.logo}
                    alt={`${institution.shortName} logo`}
                    className={`object-contain ${institution.logoClassName}`}
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#edf2f5] text-center text-[0.6875rem] leading-4 font-bold text-landing-blue">
                    11<br />DisCos
                  </div>
                )}
                <span className="text-[0.625rem] leading-4 font-medium text-[#a0adb6] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-auto pt-5">
                <p className="text-[0.6875rem] leading-4 font-bold tracking-[0.08em] text-landing-blue uppercase">
                  {institution.shortName}
                </p>
                <h3 className="mt-1.5 text-[0.875rem] leading-5 font-semibold text-[#263b49]">
                  {institution.name}
                </h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
