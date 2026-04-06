import type { ChecklistItem } from '../../types'
import { AppCard } from '../common/AppCard'

export const ChecklistItemRow = ({ item, onToggle }: { item: ChecklistItem; onToggle: () => void }) => (
  <AppCard className={`flex items-center gap-3 ${item.done ? 'bg-gradient-to-r from-emerald-50/90 to-white/80' : 'bg-gradient-to-r from-white/92 to-slate-50/80'}`}>
    <input type="checkbox" className="size-5 rounded-full" checked={item.done} onChange={onToggle} />
    <div className="flex-1">
      <p className={`text-sm font-semibold ${item.done ? 'text-emerald-700 line-through' : 'text-ink'}`}>{item.name}</p>
      <p className="mt-1 text-xs text-slate-400">准备好了就勾选，避免临时漏买。</p>
    </div>
  </AppCard>
)
