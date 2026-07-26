import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Button } from './button'

export function FilterSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
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
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={'fixed inset-0 z-50 lg:hidden'}>
      <button
        type={'button'}
        aria-label={'Close filters'}
        onClick={onClose}
        className={'absolute inset-0 bg-black/45'}
      />

      <section
        role={'dialog'}
        aria-modal={'true'}
        aria-label={title}
        className={
          'absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-card bg-surface shadow-xl'
        }
      >
        <div className={'mx-auto mt-2 h-1 w-10 rounded-pill bg-border-strong'} />
        <header
          className={
            'flex items-center justify-between border-b border-border-default px-4 py-3'
          }
        >
          <h2 className={'text-lg font-semibold text-text-default'}>{title}</h2>
          <Button
            type={'button'}
            variant={'ghost'}
            size={'icon'}
            onClick={onClose}
            aria-label={'Close filters'}
          >
            <X aria-hidden={'true'} />
          </Button>
        </header>

        <div className={'min-h-0 flex-1 overflow-y-auto p-4'}>{children}</div>

        <footer className={'border-t border-border-default p-3'}>
          <Button type={'button'} onClick={onClose} className={'w-full'}>
            View results
          </Button>
        </footer>
      </section>
    </div>
  )
}
