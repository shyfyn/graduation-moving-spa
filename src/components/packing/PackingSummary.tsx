import { Sparkles } from 'lucide-react'
import { AppCard } from '../common/AppCard'
import { currency } from '../../utils'

export const PackingSummary = ({ count, totalValue, fragileCount }: { count: number; totalValue: number; fragileCount: number }) => (
  <AppCard className="relative overflow-hidden bg-gradient-to-br from-ink to-slate-700 text-white shadow-float">
    <div className="absolute right-4 top-4 rounded-full bg-white/10 p-3"><Sparkles className="size-4" /></div>
    <p className="section-kicker !text-white/60">Packing Snapshot</p>
    <h2 className="mt-2 text-2xl font-bold tracking-tight">当前箱内状态</h2>
    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
      <div className="rounded-2xl bg-white/8 px-3 py-4">
        <p className="text-xs text-white/65">箱内物品</p>
        <p className="mt-1 text-2xl font-bold">{count}</p>
      </div>
      <div className="rounded-2xl bg-white/8 px-3 py-4">
        <p className="text-xs text-white/65">总估值</p>
        <p className="mt-1 text-lg font-bold">{currency(totalValue)}</p>
      </div>
      <div className="rounded-2xl bg-white/8 px-3 py-4">
        <p className="text-xs text-white/65">易碎件数</p>
        <p className="mt-1 text-2xl font-bold">{fragileCount}</p>
      </div>
    </div>
  </AppCard>
)
