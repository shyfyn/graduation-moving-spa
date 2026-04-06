import { EmptyState } from '../common/EmptyState'
import { AppCard } from '../common/AppCard'
import { DestinationBadge } from '../badges/DestinationBadge'
import { currency } from '../../utils'
import type { Item } from '../../types'

export const CandidateItemList = ({ items, selectedIds, onToggle }: { items: Item[]; selectedIds: string[]; onToggle: (id: string) => void }) => {
  if (!items.length) return <EmptyState title="没有候选物品" description="当前箱子目的地没有待处理物品，或者这个箱子已装满。" />

  return (
    <div className="space-y-3">
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
