import { cn } from '@/lib/utils'

const GROUPS = [
  {
    id: 'funders',
    logos: [
      { alt: 'World Bank Group', src: '/Logos/partners/worldbank-white.png', height: 'h-5', wideHeight: 'h-8' },
      { alt: 'African Development Bank', src: '/Logos/partners/afdb-white.png', height: 'h-9', wideHeight: 'h-14' },
      { alt: 'The Rockefeller Foundation', src: '/Logos/rockefeller-foundation-white.png', height: 'h-8', wideHeight: 'h-12' },
    ],
  },
  {
    id: 'delivery',
    logos: [
      { alt: 'SEforALL', src: '/seforall.svg', height: 'h-9', wideHeight: 'h-14', className: 'brightness-0 invert' },
      { alt: 'GEAPP', src: '/Logos/geapp-trimmed.png', height: 'h-7', wideHeight: 'h-10' },
    ],
  },
] as const

export function PartnerLogos({ wide = false, className }: { wide?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', wide && 'lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-0 lg:gap-y-6', className)}>
      {GROUPS.map((group, index) => (
        <div
          key={group.id}
          className={cn(
            'flex flex-wrap items-center gap-x-3 gap-y-3',
            wide && 'gap-x-8 lg:px-10',
            wide && index === 0 && 'lg:pl-0',
            wide && index > 0 && 'lg:border-l lg:border-white/20',
          )}
        >
          {group.logos.map((logo) => (
            <img
              key={logo.alt}
              alt={logo.alt}
              src={logo.src}
              className={cn('w-auto shrink-0 object-contain', wide ? logo.wideHeight : logo.height, 'className' in logo && logo.className)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
