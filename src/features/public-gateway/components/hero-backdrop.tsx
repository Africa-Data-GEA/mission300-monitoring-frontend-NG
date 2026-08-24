/**
 * Where the hero photograph is read from.
 *
 * Drop a file at `public/hero/national-electrification.jpg` and it appears
 * behind the headline. Nothing else needs to change, and nothing breaks while
 * the file is absent — the navy field and the data texture below render on
 * their own, so the hero never shows a broken-image gap or a grey box.
 *
 * WHAT TO PUT HERE. A real photograph of Nigerian electrification work or
 * infrastructure, credited. Not a stock library image of solar panels or of
 * smiling villagers: the build spec bans those by name, and for a good reason —
 * a generic image is the single fastest way to make a page of real figures look
 * like a brochure that invented them. If no real photograph is cleared for
 * publication, leaving this absent is the better outcome, not a worse one.
 */
export const HERO_IMAGE_URL = '/hero/national-electrification.jpg'

/**
 * The layered background of the hero band.
 *
 * Three layers, in order, all behind the text:
 *
 *   1. The photograph, if one has been placed at HERO_IMAGE_URL.
 *   2. A data texture — an ascending plot drawn in near-invisible white. It is
 *      not ornament: it is the shape of the very series the page is about, and
 *      it is what stops the band reading as an empty coloured rectangle on the
 *      days no photograph is cleared.
 *   3. A navy scrim, heaviest on the left where the headline sits and lifting
 *      to the right. This is the layer that makes the text legible over an
 *      arbitrary photograph, and it is why the contrast of the headline does
 *      not depend on which image someone drops in later.
 *
 * `aria-hidden` throughout: none of this carries information the text does not.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
      />

      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-y-0 right-0 h-full w-full max-w-[70rem] text-white"
      >
        {/* Gridlines — the axis a reader of this page is used to seeing. */}
        {[80, 160, 240, 320].map((y) => (
          <line key={y} x1="0" y1={y} x2="1200" y2={y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
        ))}

        {/* The ascending series, drawn as columns then traced by a line —
            baseline at the left, target height at the right. */}
        {Array.from({ length: 26 }, (_, index) => {
          const x = 60 + index * 44
          const height = 30 + index * 11
          return (
            <rect
              key={x}
              x={x}
              y={380 - height}
              width="16"
              height={height}
              fill="currentColor"
              fillOpacity="0.05"
            />
          )
        })}

        <path
          d={Array.from({ length: 26 }, (_, index) => {
            const x = 68 + index * 44
            const y = 380 - (30 + index * 11)
            return `${index === 0 ? 'M' : 'L'}${x},${y}`
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="2"
        />
      </svg>

      {/* Scrim last, so it sits over both the photograph and the texture. */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(0,44,68,0.95)_0%,rgba(0,44,68,0.88)_42%,rgba(0,44,68,0.55)_100%)]" />
    </div>
  )
}
