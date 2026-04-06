import type { ReactNode } from 'react'
import { AppCard } from './AppCard'

export const EmptyState = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <AppCard className="py-10 text-center">
    <div className="mx-auto max-w-xs space-y-2">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  </AppCard>
)
