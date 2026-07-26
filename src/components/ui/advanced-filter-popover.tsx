import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function FilterButtonContent({ activeCount }: { readonly activeCount: number }) {
  return (
    <>
      <SlidersHorizontal aria-hidden="true" className="size-4" />
      Filters
      {activeCount > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-pill bg-brand-700 px-1.5 py-0.5 text-2xs text-white">
          {activeCount}
        </span>
      ) : null}
    </>
  )
}

export function AdvancedFilterPopover({
  activeCount,
  children,
  onReset,
  title,
}: {
  readonly activeCount: number
  readonly children: ReactNode
  readonly onReset: () => void
  readonly title: string
}) {
  const [desktopOpen, setDesktopOpen] = useState(false)

  return (
    <Popover open={desktopOpen} onOpenChange={setDesktopOpen}>
      <PopoverTrigger className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-control border border-border-default bg-surface px-3 text-sm font-medium text-text-default transition-colors hover:bg-surface-sunken [&_svg]:size-4">
        <FilterButtonContent activeCount={activeCount} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label={title}
        className="w-[calc(100vw-2rem)] max-w-[22rem] overflow-hidden p-0"
        sideOffset={6}
      >
            <div className="border-b border-border-default px-3 py-2.5">
              <h2 className="text-base font-semibold text-text-default">{title}</h2>
            </div>
            <div className="grid max-h-[52vh] gap-2.5 overflow-y-auto p-3">
              {children}
            </div>
            <div className="flex items-center justify-between border-t border-border-default px-3 py-2.5">
              <Button disabled={activeCount === 0} onClick={onReset} size="sm" type="button" variant="ghost">
                <RotateCcw aria-hidden="true" /> Reset
              </Button>
              <Button onClick={() => setDesktopOpen(false)} size="sm" type="button">View results</Button>
            </div>
      </PopoverContent>
    </Popover>
  )
}
