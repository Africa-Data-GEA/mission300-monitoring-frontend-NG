import { Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * A single-sentence field hint tucked behind an info icon instead of printed
 * permanently under the field. A form with a dozen fields each carrying a
 * full sentence of always-visible help text reads as cluttered and forces
 * scrolling before the reader can even see every field — this keeps the
 * label row clean and puts the explanation one hover/click away.
 */
export function FieldHint({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        onFocus={() => setOpen(true)}
        className="inline-flex size-4 items-center justify-center rounded-full text-text-subtle transition-colors hover:text-text-muted"
      >
        <Info aria-hidden="true" className="size-3.5" />
      </button>

      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-control border border-border-default bg-surface p-2.5 text-left text-xs leading-relaxed text-text-muted shadow-lg transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {text}
      </span>
    </span>
  )
}
