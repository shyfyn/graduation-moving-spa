import { useEffect } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useUiStore } from '../../store'
import { cn } from '../../utils'
import { ConfirmDialog } from '../common/ConfirmDialog'

const toneClass = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-slate-200 bg-white text-slate-700',
}

const toneIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export const ToastProvider = () => {
  const toasts = useUiStore((state) => state.toasts)
  const removeToast = useUiStore((state) => state.removeToast)
  const confirm = useUiStore((state) => state.confirm)
  const closeConfirm = useUiStore((state) => state.closeConfirm)

  useEffect(() => {
    if (!toasts.length) return
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 2500))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [removeToast, toasts])

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col gap-2 px-4">
        {toasts.map((toast) => {
          const Icon = toneIcon[toast.tone]
          return (
            <div key={toast.id} className={cn('pointer-events-auto mx-auto flex w-full max-w-sm items-center gap-2 rounded-2xl border px-4 py-3 shadow-soft', toneClass[toast.tone])}>
              <Icon className="size-4" />
              <span className="text-sm font-medium">{toast.title}</span>
            </div>
          )
        })}
      </div>
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmText={confirm.confirmText}
        destructive={confirm.destructive}
        onCancel={closeConfirm}
        onConfirm={() => confirm.onConfirm?.()}
      />
    </>
  )
}
