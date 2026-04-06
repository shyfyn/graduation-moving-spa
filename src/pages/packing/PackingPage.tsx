import { useEffect, useMemo, useState } from 'react'
import { ITEM_CATEGORIES } from '../../constants/enums'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { AppSelect } from '../../components/common/AppSelect'
import { SearchBar } from '../../components/common/SearchBar'
import { CandidateItemList } from '../../components/packing/CandidateItemList'
import { PackedItemList } from '../../components/packing/PackedItemList'
import { PackingBoxSelector } from '../../components/packing/PackingBoxSelector'
import { PackingSummary } from '../../components/packing/PackingSummary'
import { useToast } from '../../hooks/useToast'
import { useBoxesStore, useItemsStore } from '../../store'
import type { Item, ItemCategory } from '../../types'
import { getLastPackingBoxId, setLastPackingBoxId } from '../../utils/preferences'

export const PackingPage = () => {
  const boxes = useBoxesStore((state) => state.boxes)
  const items = useItemsStore((state) => state.items)
  const assignItemsToBox = useItemsStore((state) => state.assignItemsToBox)
  const removeItemFromBox = useItemsStore((state) => state.removeItemFromBox)
  const [selectedBoxId, setSelectedBoxId] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | '全部'>('全部')
  const [candidateSearch, setCandidateSearch] = useState('')
  const [packedSearch, setPackedSearch] = useState('')
  const toast = useToast()

  useEffect(() => {
    const remembered = getLastPackingBoxId()
    if (remembered && boxes.some((box) => box.id === remembered)) {
      setSelectedBoxId(remembered)
    }
  }, [boxes])

  const box = boxes.find((entry) => entry.id === selectedBoxId)
  const candidateItems = useMemo(() => {
    if (!box) return []
    return items.filter((item) => {
      if (item.destination !== box.destination || item.status !== '未处理' || item.boxId) return false
      if (categoryFilter !== '全部' && item.category !== categoryFilter) return false
      if (candidateSearch.trim() && !item.name.includes(candidateSearch.trim())) return false
      return true
    })
  }, [box, items, categoryFilter, candidateSearch])
  const packedItems = useMemo(() => items.filter((item) => item.boxId === selectedBoxId), [items, selectedBoxId])
  const filteredPackedItems = useMemo(() => packedItems.filter((item) => !packedSearch.trim() || item.name.includes(packedSearch.trim())), [packedItems, packedSearch])
  const packedGroups = useMemo(() => filteredPackedItems.reduce<Record<string, Item[]>>((groups, item) => {
    groups[item.category] = [...(groups[item.category] ?? []), item]
    return groups
  }, {}), [filteredPackedItems])
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

  const handleChangeBox = (value: string) => {
    setSelectedBoxId(value)
    setSelectedItemIds([])
    setPackedSearch('')
    setCandidateSearch('')
    if (value) setLastPackingBoxId(value)
  }

  return (
    <div className="space-y-4">
      <PackingBoxSelector boxes={boxes} selectedBoxId={selectedBoxId} onChange={handleChangeBox} />
      <PackingSummary count={packedItems.length} totalValue={totalValue} fragileCount={fragileCount} />
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink">候选物品</h2>
        <AppCard className="space-y-3">
          <SearchBar value={candidateSearch} onChange={setCandidateSearch} placeholder="搜索待装箱物品" />
          <AppSelect value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ItemCategory | '全部')}>
            <option value="全部">全部分类</option>
            {ITEM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </AppSelect>
        </AppCard>
        <CandidateItemList
          items={candidateItems}
          selectedIds={selectedItemIds}
          categoryFilter={categoryFilter}
          onToggle={toggleItem}
          onSelectAllVisible={() => setSelectedItemIds((current) => Array.from(new Set([...current, ...candidateItems.map((item) => item.id)])))}
          onClearVisible={() => setSelectedItemIds((current) => current.filter((id) => !candidateItems.some((item) => item.id === id)))}
        />
        <AppButton fullWidth onClick={handleAssign} disabled={!selectedItemIds.length || !selectedBoxId}>加入当前箱子</AppButton>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-ink">箱内物品</h2>
        <PackedItemList
          groups={packedGroups}
          search={packedSearch}
          onSearchChange={setPackedSearch}
          onRemove={(item) => void removeItemFromBox(item.id).then(() => toast.success('物品已移出箱子')).catch((error) => toast.error(error instanceof Error ? error.message : '移除失败'))}
        />
      </div>
    </div>
  )
}
