import { CopyPlus, Package2, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { DestinationBadge } from '../badges/DestinationBadge'
import { ItemStatusBadge } from '../badges/ItemStatusBadge'
import { currency } from '../../utils'
import type { Item } from '../../types'

export const ItemCard = ({ item, selected, onToggleSelect, onEdit, onDelete, onDuplicate }: { item: Item; selected?: boolean; onToggleSelect?: (checked: boolean) => void; onEdit: () => void; onDelete: () => void; onDuplicate: () => void }) => (
  <AppCard className={selected ? 'ring-2 ring-yizhuang-200 shadow-float' : 'bg-gradient-to-br from-white/90 to-slate-50/80'}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold tracking-tight text-ink">{item.name}</h3>
              {item.isFragile ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">易碎</span> : null}
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.category} · 数量 {item.quantity ?? 1}</p>
          </div>
          {onToggleSelect ? <input type="checkbox" checked={selected} onChange={(event) => onToggleSelect(event.target.checked)} className="mt-1 size-4" /> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <DestinationBadge destination={item.destination} />
          <ItemStatusBadge status={item.status} />
          {item.boxId ? <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200"><Package2 className="size-3" /> {item.boxId}</span> : null}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">估值</p>
            <p className="mt-1 text-sm font-semibold text-ink">{currency((item.estimatedValue ?? 0) * (item.quantity ?? 1))}</p>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">属性</p>
            <p className="mt-1 text-sm font-semibold text-ink">{item.isFragile ? '重点保护' : '常规处理'}</p>
          </div>
        </div>
        {item.notes ? <p className="rounded-2xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">{item.notes}</p> : null}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">
      <AppButton variant="secondary" fullWidth onClick={onEdit}><Pencil className="mr-1 size-4" />编辑</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onDuplicate}><CopyPlus className="mr-1 size-4" />复制</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onDelete}><Trash2 className="mr-1 size-4" />删除</AppButton>
    </div>
    {selected ? <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-yizhuang-50 px-3 py-1 text-[11px] font-semibold text-yizhuang-600"><Sparkles className="size-3" />已加入批量操作</div> : null}
  </AppCard>
)
