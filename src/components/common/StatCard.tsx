import type { ReactNode } from 'react'
import { AppCard } from './AppCard'

export const StatCard = ({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) => (
  <AppCard className="relative overflow-hidden">
    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-yizhuang-500/50 via-chaoyang-500/30 to-transparent" />
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        <span className="rounded-full bg-white/70 p-2">{icon}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight text-ink">{value}</div>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  </AppCard>
)
