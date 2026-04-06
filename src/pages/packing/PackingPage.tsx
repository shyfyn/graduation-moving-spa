import { useMemo, useState } from 'react'
import { AppButton } from '../../components/common/AppButton'
import { CandidateItemList } from '../../components/packing/CandidateItemList'
import { PackedItemList } from '../../components/packing/PackedItemList'
import { PackingBoxSelector } from '../../components/packing/PackingBoxSelector'
import { PackingSummary } from '../../components/packing/PackingSummary'
import { useToast } from '../../hooks/useToast'
import { useBoxesStore, useItemsStore } from '../../store'

export const PackingPage = () => {
  const boxes = useBoxesStore((state) => state.boxes)
  const items = useItemsStore((state) => state.items)
  const assignItemsToBox = useItemsStore((state) => state.assignItemsToBox)
  const removeItemFromBox = useItemsStore((state) => state.removeItemFromBox)
  const [selectedBoxId, setSelectedBoxId] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const toast = useToast()

  const box = boxes.find((entry) => entry.id === selectedBoxId)
  const candidateItems = useMemo(() => box ? items.filter((item) => item.destination === box.destination && item.status === '未处理' && !item.boxId) : [], [box, items])
  const packedItems = useMemo(() => items.filter((item) => item.boxId === selectedBoxId), [items, selectedBoxId])
  const totalValue = packedItems.reduce((sum, item) => sum + (item.estimatedValue ?? 0) * (item.quantity ?? 1), 0)
  const fragileCount = packedItems.filter((item) => item.isFragile).length

  const toggleItem = (id: string) => setSelectedItemIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

  const handleAssign = async () => {
    if (!selectedBoxId || !selectedItemIds.length) return
    try {
      await assignItemsToBox(selectedBoxId, selectedItemIds)
      setSelectedItemIds([])
      toast.success('物品已加入箱子')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '装箱失败')
    }
  }

  return (
    <div className="space-y-4">
      <PackingBoxSelector boxes={boxes} selectedBoxId={selectedBoxId} onChange={(value) => { setSelectedBoxId(value); setSelectedItemIds([]) }} />
      <PackingSummary count={packedItems.length} totalValue={totalValue} fragileCount={fragileCount} />
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink">候选物品</h2>
        <CandidateItemList items={candidateItems} selectedIds={selectedItemIds} onToggle={toggleItem} />
        <AppButton fullWidth onClick={handleAssign} disabled={!selectedItemIds.length || !selectedBoxId}>加入当前箱子</AppButton>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink">箱内物品</h2>
        <PackedItemList items={packedItems} onRemove={(item) => void removeItemFromBox(item.id).then(() => toast.success('物品已移出箱子')).catch((error) => toast.error(error instanceof Error ? error.message : '移除失败'))} />
      </div>
    </div>
  )
}
