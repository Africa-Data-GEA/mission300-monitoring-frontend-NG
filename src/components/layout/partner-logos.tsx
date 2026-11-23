import { cn } from '@/lib/utils'

const GROUPS = [
  {
    label: 'Funded by',
    logos: [
      { alt: 'World Bank Group', src: '/Logos/partners/worldbank-white.png', height: 'h-5', wideHeight: 'h-8' },
      { alt: 'African Development Bank', src: '/Logos/partners/afdb-white.png', height: 'h-9', wideHeight: 'h-14' },
      { alt: 'The Rockefeller Foundation', src: '/Logos/rockefeller-foundation-white.png', height: 'h-8', wideHeight: 'h-12' },
    ],
  },
  {
    label: 'Delivery partners',
    logos: [
      { alt: 'SEforALL', src: '/seforall.svg', height: 'h-9', wideHeight: 'h-14', className: 'brightness-0 invert' },
      { alt: 'GEAPP', src: '/Logos/geapp-trimmed.png', height: 'h-7', wideHeight: 'h-10' },
    ],
  },
] as const

export function PartnerLogos({ wide = false, className }: { wide?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', wide && 'sm:flex-row sm:flex-wrap sm:gap-x-14 sm:gap-y-6', className)}>
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-2xs font-medium tracking-wide text-white/60 uppercase">{group.label}</p>
          <div className={cn('mt-2 flex flex-wrap items-center gap-x-4 gap-y-2.5', wide && 'gap-x-7')}>
            {group.logos.map((logo) => (
              <img
                key={logo.alt}
                alt={logo.alt}
                src={logo.src}
                className={cn('w-auto shrink-0 object-contain', wide ? logo.wideHeight : logo.height, 'className' in logo && logo.className)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
