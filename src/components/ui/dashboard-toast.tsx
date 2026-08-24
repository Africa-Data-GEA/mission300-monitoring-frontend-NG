import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import toast, { Toaster, type Toast } from 'react-hot-toast'

export type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface ToastStyle {
  icon: LucideIcon
  iconClassName: string
}

const TONE_STYLES: Record<ToastTone, ToastStyle> = {
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-emerald-600',
  },
  error: {
    icon: XCircle,
    iconClassName: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-amber-600',
  },
  info: {
    icon: Info,
    iconClassName: 'text-brand-600',
  },
  loading: {
    icon: LoaderCircle,
    iconClassName: 'text-brand-600',
  },
}

export function DashboardToastCard({
  description,
  instance,
  title,
  tone,
}: {
  description?: string
  instance: Toast
  title: string
  tone: ToastTone
}) {
  const style = TONE_STYLES[tone]
  const Icon = style.icon

  return (
    <div
      className={`relative flex w-[min(22rem,calc(100vw-2rem))] items-start gap-2.5 rounded-lg border border-border-default bg-surface p-3 pr-9 text-left shadow-md transition duration-150 motion-reduce:transform-none motion-reduce:transition-none ${
        instance.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span
        className={`mt-0.5 flex shrink-0 ${style.iconClassName}`}
        aria-hidden="true"
      >
        <Icon className={tone === 'loading' ? 'size-4 animate-spin' : 'size-4'} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-text-default">{title}</span>
        {description ? (
          <span className="block text-xs leading-4 text-text-muted">{description}</span>
        ) : null}
      </span>
      <button
        aria-label="Dismiss notification"
        className="absolute right-2 top-2 rounded p-1 text-text-subtle transition hover:bg-surface-sunken hover:text-text-default"
        onClick={() => toast.dismiss(instance.id)}
        type="button"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function DashboardToaster() {
  return (
    <Toaster
      containerStyle={{ top: 20, zIndex: 100 }}
      gutter={8}
      position="top-right"
      toastOptions={{ duration: 5_000 }}
    />
  )
}
