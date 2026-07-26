import { NavLink } from 'react-router'
import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

const links = [
  { to: '/state-disco', label: 'Performance overview', end: true },
  { to: '/state-disco/comparison', label: 'DisCo comparison' },
  { to: '/state-disco/supply-tariff', label: 'Supply & tariff' },
  { to: '/state-disco/delivery', label: 'Delivery & compliance' },
  { to: '/state-disco/states', label: 'State view' },
]

export function StateDiscoShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Monitoring & Analysis' }, { label: 'State & DisCo Performance' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">{description}</p>
      </div>
      <nav aria-label="State and DisCo views" className="overflow-x-auto border-b border-border-default">
        <div className="flex min-w-max gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => cn(
              'border-b-2 px-3 py-2 text-sm font-medium',
              isActive ? 'border-brand-700 text-brand-800' : 'border-transparent text-text-muted',
            )}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}
