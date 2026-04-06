import { ITEM_DESTINATIONS, ITEM_STATUSES } from '../../constants/enums'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { AppSelect } from '../common/AppSelect'
import type { ItemDestination, ItemStatus } from '../../types'

export const BatchActionBar = ({ selectedCount, batchDestination, batchStatus, warning, onDestinationChange, onStatusChange, onApply, onDelete }: { selectedCount: number; batchDestination: ItemDestination; batchStatus: ItemStatus; warning?: string; onDestinationChange: (value: ItemDestination) => void; onStatusChange: (value: ItemStatus) => void; onApply: () => void; onDelete: () => void }) => {
  if (!selectedCount) return null

  return (
    <AppCard className="overflow-hidden border-dashed border-slate-300/70 bg-gradient-to-br from-white/88 to-slate-50/90">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Batch Actions</p>
          <p className="mt-2 text-base font-semibold text-ink">已选中 {selectedCount} 个物品</p>
          <p className="mt-1 text-sm text-slate-500">统一调整目的地或状态，避免来回进入每条详情。</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <AppSelect value={batchDestination} onChange={(event) => onDestinationChange(event.target.value as ItemDestination)}>
          {ITEM_DESTINATIONS.map((option) => <option key={option}>{option}</option>)}
        </AppSelect>
        <AppSelect value={batchStatus} onChange={(event) => onStatusChange(event.target.value as ItemStatus)}>
          {ITEM_STATUSES.map((option) => <option key={option}>{option}</option>)}
        </AppSelect>
      </div>
      {warning ? <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-700">{warning}</p> : null}
      <div className="mt-4 flex gap-2">
        <AppButton variant="secondary" fullWidth onClick={onApply}>批量更新</AppButton>
        <AppButton variant="danger" fullWidth onClick={onDelete}>批量删除</AppButton>
      </div>
    </AppCard>
  )
}
