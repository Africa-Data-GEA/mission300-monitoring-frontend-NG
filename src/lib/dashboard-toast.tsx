import toast from 'react-hot-toast'
import { DashboardToastCard, type ToastTone } from '@/components/ui/dashboard-toast'

export interface DashboardToastOptions {
  description?: string
  duration?: number
  id?: string
}

function showToast(tone: ToastTone, title: string, options: DashboardToastOptions = {}) {
  const duration = options.duration ?? (tone === 'loading' ? Number.POSITIVE_INFINITY : 5_000)
  return toast.custom(
    (instance) => (
      <DashboardToastCard
        description={options.description}
        instance={instance}
        title={title}
        tone={tone}
      />
    ),
    { duration, id: options.id },
  )
}

export const dashboardToast = {
  success: (title: string, options?: DashboardToastOptions) =>
    showToast('success', title, options),
  error: (title: string, options?: DashboardToastOptions) => showToast('error', title, options),
  warning: (title: string, options?: DashboardToastOptions) =>
    showToast('warning', title, options),
  info: (title: string, options?: DashboardToastOptions) => showToast('info', title, options),
  loading: (title: string, options?: DashboardToastOptions) =>
    showToast('loading', title, options),
  dismiss: (id?: string) => toast.dismiss(id),
}
