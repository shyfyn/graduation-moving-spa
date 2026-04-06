import type { ChecklistItem } from '../../types'
import { AppCard } from '../common/AppCard'

export const ChecklistItemRow = ({ item, onToggle }: { item: ChecklistItem; onToggle: () => void }) => (
  <AppCard className="flex items-center gap-3">
    <input type="checkbox" className="size-5" checked={item.done} onChange={onToggle} />
    <div className="flex-1">
      <p className={`text-sm font-medium ${item.done ? 'text-slate-400 line-through' : 'text-ink'}`}>{item.name}</p>
      <p className="text-xs text-slate-400">准备好了就勾选，避免临时漏买。</p>
    </div>
  </AppCard>
)
