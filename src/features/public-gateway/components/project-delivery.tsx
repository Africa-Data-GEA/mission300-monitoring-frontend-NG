import { usePublicProjectDelivery } from '../api'

/**
 * Priority projects under delivery, as counts.
 *
 * Every other figure on this page is a national percentage or an aggregate
 * headline — true, but abstract. This section answers the question a
 * visitor actually arrives with: how much is actually being built, and
 * where. It stays at the level of counts on purpose: individual project
 * records carry delivery status, owner institutions and free-text risk
 * commentary that belong behind authentication (see
 * publicProjectDeliverySchema), so no project is named here and no status
 * is shown.
 */
export function ProjectDelivery() {
  const { data } = usePublicProjectDelivery()

  // No skeleton: this sits below the fold on a page whose other sections
  // render independently, and an empty slot reads better than a flash of
  // placeholder blocks that resolve to nothing if the endpoint is down.
  if (!data || data.totalProjects === 0) return null

  return (
    <section
      id="project-delivery"
      aria-labelledby="project-delivery-heading"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
        <h2
          id="project-delivery-heading"
          className="text-[1.875rem] leading-9 font-semibold tracking-tight text-landing-blue sm:text-[2.25rem] sm:leading-10"
        >
          Projects under delivery
        </h2>
        <p className="mt-3 max-w-[48rem] text-[0.9375rem] leading-6 text-[#465866]">
          Projects and programmes tracked under the Compact, across the delivery pillars.
        </p>

        <div className="mt-8 grid gap-px bg-[#dce3e8] sm:grid-cols-2">
          <div className="bg-landing-blue px-7 py-9 text-white">
            {/* "Projects", not "Priority projects": priority is a field on
                the parent Programme (RegisterPriority), not on Project, and
                this count is every tracked project regardless of it. */}
            <p className="text-[0.625rem] leading-4 font-bold tracking-[0.14em] text-white/55 uppercase">
              Projects tracked
            </p>
            <p className="mt-2 text-[3rem] leading-none font-semibold tracking-tight tabular-nums">
              {data.totalProjects.toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-[#f7f9fb] px-7 py-9">
            <p className="text-[0.625rem] leading-4 font-bold tracking-[0.14em] text-[#667684] uppercase">
              Programmes
            </p>
            <p className="mt-2 text-[3rem] leading-none font-semibold tracking-tight text-landing-navy tabular-nums">
              {data.totalProgrammes.toLocaleString('en-US')}
            </p>
          </div>
        </div>

        {data.byPillar.length > 0 && (
          <div className="mt-8">
            <p className="text-[0.625rem] leading-4 font-bold tracking-[0.14em] text-[#667684] uppercase">
              By pillar
            </p>
            <ul className="mt-4 grid gap-px bg-[#dce3e8] sm:grid-cols-2 lg:grid-cols-3">
              {data.byPillar.map((entry) => (
                <li
                  key={entry.pillar}
                  className="flex items-baseline justify-between gap-4 bg-white px-5 py-4"
                >
                  <span className="text-[0.9375rem] leading-6 text-[#465866]">{entry.label}</span>
                  <span className="shrink-0 text-[1.25rem] leading-7 font-semibold text-landing-navy tabular-nums">
                    {entry.projects.toLocaleString('en-US')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
