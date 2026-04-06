import { PackageMinus } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { currency } from '../../utils'
import type { Item } from '../../types'

export const PackedItemList = ({ items, onRemove }: { items: Item[]; onRemove: (item: Item) => void }) => {
  if (!items.length) return <EmptyState title="箱子还是空的" description="从左侧候选物品中勾选后加入当前箱子。" />
  return (
    <div className="space-y-3">
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
  )
}
