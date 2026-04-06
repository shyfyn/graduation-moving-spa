import { useState } from 'react'
import { useDrag } from '@use-gesture/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { AppCard } from '../common/AppCard'
import { DestinationBadge } from '../badges/DestinationBadge'
import { currency } from '../../utils'
import type { Item, ItemCategory } from '../../types'

const SwipeCandidateCard = ({ item, selected, onToggle, onSwipePack, onSwipeDeclutter }: { item: Item; selected: boolean; onToggle: () => void; onSwipePack: () => void; onSwipeDeclutter: () => void }) => {
  const [offsetX, setOffsetX] = useState(0)

  const bind = useDrag(({ down, movement: [mx], last }) => {
    const clamped = Math.max(-120, Math.min(120, mx))
    setOffsetX(down ? clamped : 0)

    if (!last) return
    if (mx > 90) {
      onSwipePack()
      return
    }
    if (mx < -90) {
      onSwipeDeclutter()
    }
  }, { axis: 'x', filterTaps: true })

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 left-0 flex w-24 items-center justify-center rounded-l-2xl bg-rose-100 text-xs font-semibold text-rose-700">
        <ChevronLeft className="mr-1 size-4" />断舍离
      </div>
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center rounded-r-2xl bg-emerald-100 text-xs font-semibold text-emerald-700">
        装入箱子<ChevronRight className="ml-1 size-4" />
      </div>
      <div
        className="relative z-10 touch-pan-y transition-transform"
        {...bind()}
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        <AppCard className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 size-4" checked={selected} onChange={onToggle} />
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
      </div>
    </div>
  )
}

export const CandidateItemList = ({ items, selectedIds, categoryFilter, onToggle, onSelectAllVisible, onClearVisible, onSwipePack, onSwipeDeclutter }: { items: Item[]; selectedIds: string[]; categoryFilter: ItemCategory | '全部'; onToggle: (id: string) => void; onSelectAllVisible: () => void; onClearVisible: () => void; onSwipePack: (item: Item) => void; onSwipeDeclutter: (item: Item) => void }) => {
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
        <SwipeCandidateCard
          key={item.id}
          item={item}
          selected={selectedIds.includes(item.id)}
          onToggle={() => onToggle(item.id)}
          onSwipePack={() => onSwipePack(item)}
          onSwipeDeclutter={() => onSwipeDeclutter(item)}
        />
      ))}
    </div>
  )
}
