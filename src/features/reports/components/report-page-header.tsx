import { Breadcrumb } from '@/components/ui/breadcrumb'

export function ReportPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Data operations' },
          { label: 'Reports & Exports', to: '/reports' },
          { label: title },
        ]}
      />
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">{title}</h1>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  )
}
