import { CopyPlus, Package2, Pencil, Trash2 } from 'lucide-react'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { DestinationBadge } from '../badges/DestinationBadge'
import { ItemStatusBadge } from '../badges/ItemStatusBadge'
import { currency } from '../../utils'
import type { Item } from '../../types'

export const ItemCard = ({ item, selected, onToggleSelect, onEdit, onDelete, onDuplicate }: { item: Item; selected?: boolean; onToggleSelect?: (checked: boolean) => void; onEdit: () => void; onDelete: () => void; onDuplicate: () => void }) => (
  <AppCard className={selected ? 'ring-2 ring-slate-300' : ''}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
            <p className="text-xs text-slate-500">{item.category} · 数量 {item.quantity ?? 1}</p>
          </div>
          {onToggleSelect ? <input type="checkbox" checked={selected} onChange={(event) => onToggleSelect(event.target.checked)} className="mt-1 size-4" /> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <DestinationBadge destination={item.destination} />
          <ItemStatusBadge status={item.status} />
          {item.boxId ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"><Package2 className="size-3" /> {item.boxId}</span> : null}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{item.isFragile ? '易碎物品' : '普通物品'}</span>
          <span>{currency((item.estimatedValue ?? 0) * (item.quantity ?? 1))}</span>
        </div>
        {item.notes ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{item.notes}</p> : null}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">
      <AppButton variant="secondary" fullWidth onClick={onEdit}><Pencil className="mr-1 size-4" />编辑</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onDuplicate}><CopyPlus className="mr-1 size-4" />复制</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onDelete}><Trash2 className="mr-1 size-4" />删除</AppButton>
    </div>
  </AppCard>
)
