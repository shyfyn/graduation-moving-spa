import { AppCard } from '../common/AppCard'
import { currency } from '../../utils'

export const PackingSummary = ({ count, totalValue, fragileCount }: { count: number; totalValue: number; fragileCount: number }) => (
  <AppCard className="grid grid-cols-3 gap-3 text-center">
    <div>
      <p className="text-xs text-slate-500">箱内物品</p>
      <p className="mt-1 text-lg font-semibold text-ink">{count}</p>
    </div>
    <div>
      <p className="text-xs text-slate-500">总估值</p>
      <p className="mt-1 text-lg font-semibold text-ink">{currency(totalValue)}</p>
    </div>
    <div>
      <p className="text-xs text-slate-500">易碎件数</p>
      <p className="mt-1 text-lg font-semibold text-ink">{fragileCount}</p>
    </div>
  </AppCard>
)
