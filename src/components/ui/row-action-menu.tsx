import { Check, Copy, MoreHorizontal, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { cn } from '@/lib/utils'

export interface RowAction {
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  copyText?: string
  disabled?: boolean
  tone?: 'default' | 'danger'
}

export function RowActionMenu({
  label,
  actions,
}: {
  label: string
  actions: readonly RowAction[]
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function select(action: RowAction) {
    if (action.disabled) return

    if (action.copyText) {
      await navigator.clipboard?.writeText(action.copyText)
      setCopied(action.label)
      window.setTimeout(() => setCopied(null), 1600)
    }

    action.onSelect?.()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type={'button'}
          variant={'ghost'}
          size={'icon'}
          aria-label={label}
          className={'size-8'}
        >
          <MoreHorizontal aria-hidden={'true'} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={'end'}
        role={'menu'}
        aria-label={label}
        className={'w-48 p-1'}
      >
        {actions.map((action) => {
          const Icon = copied === action.label ? Check : action.icon ?? Copy

          return (
            <button
              key={action.label}
              type={'button'}
              role={'menuitem'}
              disabled={action.disabled}
              onClick={() => void select(action)}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-text-default transition-colors',
                'hover:bg-surface-sunken focus:bg-surface-sunken disabled:pointer-events-none disabled:opacity-50',
                action.tone === 'danger' && 'text-status-at-risk',
              )}
            >
              <Icon aria-hidden={'true'} className={'size-3.5'} />
              {copied === action.label ? 'Copied' : action.label}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
