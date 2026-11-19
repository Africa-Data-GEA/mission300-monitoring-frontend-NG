import toast from 'react-hot-toast'

export interface DashboardToastOptions {
  description?: string
  duration?: number
  id?: string
}

function message(title: string, options: DashboardToastOptions = {}) {
  return options.description ? `${title}\n${options.description}` : title
}

function settings(options: DashboardToastOptions = {}) {
  return { duration: options.duration, id: options.id, style: { whiteSpace: 'pre-line' as const } }
}

export const dashboardToast = {
  success: (title: string, options?: DashboardToastOptions) =>
    toast.success(message(title, options), settings(options)),
  error: (title: string, options?: DashboardToastOptions) =>
    toast.error(message(title, options), settings(options)),
  warning: (title: string, options?: DashboardToastOptions) =>
    toast(message(title, options), { ...settings(options), icon: '⚠️' }),
  info: (title: string, options?: DashboardToastOptions) =>
    toast(message(title, options), { ...settings(options), icon: 'ℹ️' }),
  loading: (title: string, options?: DashboardToastOptions) =>
    toast.loading(message(title, options), settings(options)),
  dismiss: (id?: string) => toast.dismiss(id),
}
