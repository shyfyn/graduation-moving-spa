import type { PropsWithChildren, ReactNode } from 'react'
import { AppButton } from './AppButton'

export const AppDialog = ({ open, title, description, onClose, children, footer }: PropsWithChildren<{ open: boolean; title: string; description?: string; onClose: () => void; footer?: ReactNode }>) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <AppButton variant="ghost" className="px-2 py-1" onClick={onClose}>
            关闭
          </AppButton>
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>
    </div>
  )
}
