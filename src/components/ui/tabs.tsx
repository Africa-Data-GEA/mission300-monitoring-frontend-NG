import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tabs components must be used inside Tabs')
  return context
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string
  defaultValue: string
  onValueChange?: (value: string) => void
  className?: string
  children: ReactNode
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue ?? internalValue
  const baseId = useId()

  function setValue(next: string) {
    if (controlledValue === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  orientation = 'horizontal',
  ...props
}: ComponentPropsWithoutRef<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const forwardKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const backKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    if (![forwardKey, backKey, 'Home', 'End'].includes(event.key)) return

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role=tab]:not(:disabled)',
      ),
    )
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement)
    if (current < 0) return

    event.preventDefault()
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (current + (event.key === forwardKey ? 1 : -1) + tabs.length) %
            tabs.length
    tabs[next]?.focus()
    tabs[next]?.click()
  }

  return (
    <div
      role={'tablist'}
      aria-orientation={orientation}
      onKeyDown={moveFocus}
      className={cn(
        orientation === 'vertical'
          ? 'flex flex-col gap-0.5'
          : 'flex gap-1 overflow-x-auto border-b border-border-default px-1',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  orientation = 'horizontal',
  ...props
}: Omit<ComponentPropsWithoutRef<'button'>, 'value'> & {
  value: string
  orientation?: 'horizontal' | 'vertical'
}) {
  const tabs = useTabsContext()
  const selected = tabs.value === value

  return (
    <button
      type={'button'}
      role={'tab'}
      id={`${tabs.baseId}-tab-${value}`}
      aria-controls={`${tabs.baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => tabs.setValue(value)}
      className={cn(
        orientation === 'vertical'
          ? cn(
              'relative flex w-full items-center rounded-control px-3 py-2.5 text-left text-sm font-medium text-text-muted transition-colors',
              'hover:bg-surface-sunken hover:text-text-default',
              selected && 'bg-brand-50 text-brand-700',
            )
          : cn(
              'relative min-w-max px-4 py-3 text-sm font-medium text-text-muted transition-colors',
              'hover:text-text-default',
              selected &&
                'text-brand-700 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-pill after:bg-brand-700',
            ),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<'div'>, 'value'> & { value: string }) {
  const tabs = useTabsContext()
  if (tabs.value !== value) return null

  return (
    <div
      role={'tabpanel'}
      id={`${tabs.baseId}-panel-${value}`}
      aria-labelledby={`${tabs.baseId}-tab-${value}`}
      className={cn('pt-4', className)}
      {...props}
    />
  )
}
