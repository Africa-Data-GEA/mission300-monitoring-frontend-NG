import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'

export function SideDialog({
  children,
  description,
  onClose,
  open,
  title,
}: {
  readonly children: ReactNode
  readonly description?: string
  readonly onClose: () => void
  readonly open: boolean
  readonly title: string
}) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Close dialog"
        className="water-blur-overlay absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <section
        aria-describedby={description ? 'side-dialog-description' : undefined}
        aria-labelledby="side-dialog-title"
        aria-modal="true"
        className="side-dialog-panel absolute inset-y-3 right-3 flex w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[1rem] bg-surface sm:inset-y-4 sm:right-4 sm:w-[70vw] sm:max-w-[64rem]"
        role="dialog"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border-default px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className="text-2xl font-semibold text-text-default" id="side-dialog-title">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-text-muted" id="side-dialog-description">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Close dialog"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {children}
        </div>
      </section>
    </div>,
    document.body,
  )
}
