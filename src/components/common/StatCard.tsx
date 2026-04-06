import type { ReactNode } from 'react'
import { AppCard } from './AppCard'

export const StatCard = ({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) => (
  <AppCard className="space-y-2">
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-semibold text-ink">{value}</div>
    {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
  </AppCard>
)
