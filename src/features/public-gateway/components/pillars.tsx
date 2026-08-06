import { PILLAR_LABELS } from '@/api/schemas/common'
import type { PillarId } from '@/types/domain'

/**
 * §05 — the Compact's six pillars.
 *
 * These are the real pillars already modelled throughout the platform, read
 * from PILLAR_LABELS so this list cannot drift from the one the dashboard uses.
 * They are the Compact's actual structure, not six invented "features".
 *
 * NO ICONS. A pillar rendered as an icon in a tinted circle above a heading and
 * two lines of filler is the single most recognisable generated-page pattern
 * there is, and the icons never mean anything — there is no glyph for "viable
 * utilities". A numbered list carries the same information and reads as a
 * document rather than a brochure.
 *
 * Not links yet: the public per-pillar views do not exist, and the
 * authenticated /pillars routes are behind sign-in. Rendering these as links
 * would drop a citizen onto a login wall.
 */
const PILLAR_SUMMARIES: Record<PillarId, string> = {
  'generation-network':
    'Building generation capacity and the transmission network to carry it.',
  'last-mile-access':
    'Reaching households beyond the grid through mini-grids and solar home systems.',
  'financially-viable-utilities':
    'Putting distribution companies on a financially sustainable footing.',
  'private-sector-participation':
    'Bringing private capital into generation, distribution and off-grid delivery.',
  'regional-integration':
    'Connecting Nigeria to regional power markets and cross-border trade.',
  'clean-cooking':
    'Moving households away from firewood and charcoal to cleaner fuels.',
}

export function Pillars() {
  const pillars = Object.entries(PILLAR_LABELS) as [PillarId, string][]

  return (
    <section aria-labelledby="pillars" className="mt-14">
      <h2
        id="pillars"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        The six pillars of the Compact
      </h2>

      <ol className="mt-4 max-w-[42rem] border-t-2 border-text-default">
        {pillars.map(([id, label], index) => (
          <li
            key={id}
            className="flex gap-4 border-b border-border-strong py-4"
          >
            <span
              aria-hidden="true"
              className="w-6 shrink-0 text-[1.0625rem] leading-6 font-bold text-text-muted tabular-nums"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-[1.0625rem] leading-6 font-bold text-text-default">
                {label}
              </h3>
              <p className="mt-1 text-[1rem] leading-6 text-text-muted">
                {PILLAR_SUMMARIES[id]}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
