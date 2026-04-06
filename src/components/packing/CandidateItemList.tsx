import { EmptyState } from '../common/EmptyState'
import { AppCard } from '../common/AppCard'
import { DestinationBadge } from '../badges/DestinationBadge'
import { currency } from '../../utils'
import type { Item, ItemCategory } from '../../types'

export const CandidateItemList = ({ items, selectedIds, categoryFilter, onToggle, onSelectAllVisible, onClearVisible }: { items: Item[]; selectedIds: string[]; categoryFilter: ItemCategory | '全部'; onToggle: (id: string) => void; onSelectAllVisible: () => void; onClearVisible: () => void }) => {
  if (!items.length) return <EmptyState title="没有候选物品" description="当前箱子目的地没有待处理物品，或者这个箱子已装满。" />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <span>当前分类：{categoryFilter}</span>
        <div className="flex gap-3">
          <button type="button" onClick={onSelectAllVisible}>全选可见</button>
          <button type="button" onClick={onClearVisible}>清空可见</button>
        </div>
      </div>
      {items.map((item) => (
        <AppCard key={item.id} className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 size-4" checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
                <p className="text-xs text-slate-500">{item.category} · 数量 {item.quantity ?? 1}</p>
              </div>
              <span className="text-xs text-slate-500">{currency((item.estimatedValue ?? 0) * (item.quantity ?? 1))}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <DestinationBadge destination={item.destination} />
              {item.isFragile ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-700">易碎</span> : null}
            </div>
          </div>
        </AppCard>
      ))}
    </div>
  )
}
