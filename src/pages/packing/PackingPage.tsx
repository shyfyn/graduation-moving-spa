import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, Sparkles } from 'lucide-react'
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
import { triggerHaptic } from '../../utils/haptics'
import { getLastPackingBoxId, setLastPackingBoxId } from '../../utils/preferences'
import { getCompanionSuggestions } from '../../utils/smartFeatures'

export const PackingPage = () => {
  const boxes = useBoxesStore((state) => state.boxes)
  const items = useItemsStore((state) => state.items)
  const assignItemsToBox = useItemsStore((state) => state.assignItemsToBox)
  const removeItemFromBox = useItemsStore((state) => state.removeItemFromBox)
  const moveItemToDeclutter = useItemsStore((state) => state.moveItemToDeclutter)
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
  const companionSuggestions = useMemo(() => getCompanionSuggestions({ packedItems, candidateItems }), [packedItems, candidateItems])

  const toggleItem = (id: string) => setSelectedItemIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

  const handleAssign = async () => {
    if (!selectedBoxId || !selectedItemIds.length) return
    try {
      await assignItemsToBox(selectedBoxId, selectedItemIds)
      triggerHaptic('pack')
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
    <div className="space-y-5">
      <AppCard className="overflow-hidden bg-gradient-to-br from-yizhuang-50/75 via-white/90 to-chaoyang-50/60">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Packing Motion</p>
            <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-ink">这页应该像分拣台，而不是普通待办列表。</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">右滑装箱，左滑断舍离。先选箱，再从同目的地候选物品里快速推进。</p>
          </div>
          <div className="hidden rounded-2xl bg-white/80 px-3 py-3 text-sm font-semibold text-cocoa md:block">
            当前交互：滑动优先
          </div>
        </div>
      </AppCard>

      <PackingBoxSelector boxes={boxes} selectedBoxId={selectedBoxId} onChange={handleChangeBox} />
      <PackingSummary count={packedItems.length} totalValue={totalValue} fragileCount={fragileCount} />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <AppCard className="space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-slate-400" />
              <div>
                <p className="section-kicker">Candidates</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">待装箱物品</h2>
              </div>
            </div>
            <div className="space-y-3">
              <SearchBar value={candidateSearch} onChange={setCandidateSearch} placeholder="搜索待装箱物品" />
              <AppSelect value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ItemCategory | '全部')}>
                <option value="全部">全部分类</option>
                {ITEM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </AppSelect>
            </div>
          </AppCard>
          <CandidateItemList
            items={candidateItems}
            selectedIds={selectedItemIds}
            categoryFilter={categoryFilter}
            onToggle={toggleItem}
            onSelectAllVisible={() => setSelectedItemIds((current) => Array.from(new Set([...current, ...candidateItems.map((item) => item.id)])))}
            onClearVisible={() => setSelectedItemIds((current) => current.filter((id) => !candidateItems.some((item) => item.id === id)))}
            onSwipePack={(item) => void assignItemsToBox(selectedBoxId, [item.id]).then(() => { triggerHaptic('pack'); toast.success(`${item.name} 已滑动装箱`) }).catch((error) => toast.error(error instanceof Error ? error.message : '滑动装箱失败'))}
            onSwipeDeclutter={(item) => void moveItemToDeclutter(item.id).then(() => { triggerHaptic('warning'); toast.success(`${item.name} 已标记为断舍离`) }).catch((error) => toast.error(error instanceof Error ? error.message : '断舍离失败'))}
          />
          <AppButton fullWidth onClick={handleAssign} disabled={!selectedItemIds.length || !selectedBoxId}>加入当前箱子</AppButton>
        </div>

        <div className="space-y-4">
          {companionSuggestions.length ? (
            <AppCard className="space-y-3 bg-gradient-to-br from-amber-50/90 to-white/85">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <div>
                  <p className="section-kicker">Companion Rules</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">打包关联推荐</h2>
                </div>
              </div>
              {companionSuggestions.map((entry) => (
                <div key={entry.source} className="rounded-2xl bg-white/85 px-3 py-3 text-sm text-amber-700 ring-1 ring-amber-100">
                  已装入“{entry.source}”，是否还要一起装：{entry.suggestions.join('、')}
                </div>
              ))}
            </AppCard>
          ) : null}

          <AppCard className="space-y-3">
            <div>
              <p className="section-kicker">Packed</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">箱内物品</h2>
            </div>
            <PackedItemList
              groups={packedGroups}
              search={packedSearch}
              onSearchChange={setPackedSearch}
              onRemove={(item) => void removeItemFromBox(item.id).then(() => toast.success('物品已移出箱子')).catch((error) => toast.error(error instanceof Error ? error.message : '移除失败'))}
            />
          </AppCard>
        </div>
      </div>
    </div>
  )
}
