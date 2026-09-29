import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'

/**
 * Centred yes/no confirmation modal — no equivalent existed anywhere in
 * this app before (every destructive action either had no confirmation
 * step at all, or none had been built yet). Kept deliberately small and
 * generic so any future delete/destructive action can reuse it rather than
 * inventing its own confirm step.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isPending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        aria-label="Close dialog"
        className="water-blur-overlay absolute inset-0"
        onClick={onCancel}
        type="button"
      />
      <section
        aria-describedby={description ? 'confirm-dialog-description' : undefined}
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-card border border-border-default bg-surface p-5 shadow-xl"
        role="alertdialog"
      >
        <h2 className="text-lg font-semibold text-text-default" id="confirm-dialog-title">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-text-muted" id="confirm-dialog-description">
            {description}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button disabled={isPending} onClick={onCancel} type="button" variant="secondary">
            {cancelLabel}
          </Button>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant={isDestructive ? 'danger' : 'primary'}
          >
            {isPending ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
