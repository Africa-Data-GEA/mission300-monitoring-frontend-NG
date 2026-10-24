import { useId, type ReactNode } from 'react'

export const REFORM_INPUT_CLASS =
  'w-full rounded-control border border-border-strong bg-surface px-3.5 py-2.5 text-base text-text-default placeholder:text-text-subtle'

export function ReformField({
  label,
  children,
}: {
  label: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-default" htmlFor={id}>
        {label}
      </label>
      {children(id)}
    </div>
  )
}
