import { PackageMinus } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { currency } from '../../utils'
import type { Item } from '../../types'

export const PackedItemList = ({ groups, search, onSearchChange, onRemove }: { groups: Record<string, Item[]>; search: string; onSearchChange: (value: string) => void; onRemove: (item: Item) => void }) => {
  const entries = Object.entries(groups)
  if (!entries.length) return <EmptyState title="箱子还是空的" description="从候选物品中勾选后加入当前箱子。" />

  return (
    <div className="space-y-3">
      <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="在箱内搜索物品" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
      {entries.map(([category, items]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>{category}</span>
            <span>{items.length} 件</span>
          </div>
          {items.map((item) => (
            <AppCard key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.category} · 数量 {item.quantity ?? 1}</p>
                </div>
                <span className="text-xs text-slate-500">{currency((item.estimatedValue ?? 0) * (item.quantity ?? 1))}</span>
              </div>
              <AppButton variant="ghost" fullWidth onClick={() => onRemove(item)}><PackageMinus className="mr-1 size-4" />移出箱子</AppButton>
            </AppCard>
          ))}
        </div>
      ))}
    </div>
  )
}
