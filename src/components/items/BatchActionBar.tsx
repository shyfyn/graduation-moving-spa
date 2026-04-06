import { ITEM_DESTINATIONS, ITEM_STATUSES } from '../../constants/enums'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { AppSelect } from '../common/AppSelect'
import type { ItemDestination, ItemStatus } from '../../types'

export const BatchActionBar = ({ selectedCount, batchDestination, batchStatus, onDestinationChange, onStatusChange, onApply, onDelete }: { selectedCount: number; batchDestination: ItemDestination; batchStatus: ItemStatus; onDestinationChange: (value: ItemDestination) => void; onStatusChange: (value: ItemStatus) => void; onApply: () => void; onDelete: () => void }) => {
  if (!selectedCount) return null

  return (
    <AppCard className="space-y-3 border-dashed border-slate-300 bg-slate-50">
      <p className="text-sm font-medium text-ink">已选中 {selectedCount} 个物品</p>
      <div className="grid grid-cols-2 gap-2">
        <AppSelect value={batchDestination} onChange={(event) => onDestinationChange(event.target.value as ItemDestination)}>
          {ITEM_DESTINATIONS.map((option) => <option key={option}>{option}</option>)}
        </AppSelect>
        <AppSelect value={batchStatus} onChange={(event) => onStatusChange(event.target.value as ItemStatus)}>
          {ITEM_STATUSES.map((option) => <option key={option}>{option}</option>)}
        </AppSelect>
      </div>
      <div className="flex gap-2">
        <AppButton variant="secondary" fullWidth onClick={onApply}>批量更新</AppButton>
        <AppButton variant="danger" fullWidth onClick={onDelete}>批量删除</AppButton>
      </div>
    </AppCard>
  )
}
