import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { AppDialog } from '../../components/common/AppDialog'
import { BatchActionBar } from '../../components/items/BatchActionBar'
import { ItemFiltersPanel } from '../../components/items/ItemFilters'
import { ItemForm } from '../../components/items/ItemForm'
import { ItemList } from '../../components/items/ItemList'
import { useConfirm } from '../../hooks/useConfirm'
import { useFilteredItems } from '../../hooks/useFilteredItems'
import { useToast } from '../../hooks/useToast'
import type { ItemFormValues } from '../../schemas/itemSchema'
import { useItemsStore } from '../../store'
import type { Item, ItemDestination, ItemStatus } from '../../types'
import type { ItemFilters } from '../../types/filters'
import { getItemFormDefaults, setItemFormDefaults } from '../../utils/preferences'

const defaultFilters: ItemFilters = {
  destination: '全部',
  status: '全部',
  category: '全部',
  keyword: '',
  pendingOnly: false,
  sortBy: 'updated_desc',
}

const blockedBatchStatuses: ItemStatus[] = ['已寄出', '已送达']

export const ItemsPage = () => {
  const items = useItemsStore((state) => state.items)
  const selectedIds = useItemsStore((state) => state.selectedIds)
  const toggleSelectedId = useItemsStore((state) => state.toggleSelectedId)
  const clearSelectedIds = useItemsStore((state) => state.clearSelectedIds)
  const createItem = useItemsStore((state) => state.createItem)
  const updateItem = useItemsStore((state) => state.updateItem)
  const deleteItem = useItemsStore((state) => state.deleteItem)
  const bulkDelete = useItemsStore((state) => state.bulkDelete)
  const bulkUpdate = useItemsStore((state) => state.bulkUpdate)
  const [filters, setFilters] = useState<ItemFilters>(defaultFilters)
  const [open, setOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formSeed, setFormSeed] = useState<Partial<ItemFormValues> | undefined>(undefined)
  const [batchDestination, setBatchDestination] = useState<ItemDestination>('北京-亦庄')
  const [batchStatus, setBatchStatus] = useState<ItemStatus>('未处理')
  const filteredItems = useFilteredItems(items, filters)
  const confirm = useConfirm()
  const toast = useToast()

  const selectedItems = useMemo(() => items.filter((item) => selectedIds.includes(item.id)), [items, selectedIds])
  const selectedCount = selectedIds.length
  const editingDefaults = useMemo(() => {
    if (editingItem) return { ...editingItem }
    if (formSeed) return formSeed
    return getItemFormDefaults() ?? undefined
  }, [editingItem, formSeed])

  const batchWarning = useMemo(() => {
    if (!selectedItems.length) return undefined
    if (blockedBatchStatuses.includes(batchStatus) && selectedItems.some((item) => !item.boxId)) {
      return '未装箱物品不能批量改成“已寄出”或“已送达”。请先装箱，或仅批量修改目的地。'
    }
    if (selectedItems.some((item) => item.boxId) && selectedItems.some((item) => item.destination !== batchDestination)) {
      return '部分选中物品已经在箱子里，批量改目的地前请先移出箱子。'
    }
    return undefined
  }, [batchDestination, batchStatus, selectedItems])

  const openCreate = () => {
    setEditingItem(null)
    setFormSeed(getItemFormDefaults() ?? undefined)
    setOpen(true)
  }

  const openDuplicate = (item: Item) => {
    setEditingItem(null)
    setFormSeed({
      name: `${item.name}（复制）`,
      category: item.category,
      destination: item.destination,
      status: '未处理',
      estimatedValue: item.estimatedValue,
      notes: item.notes,
      isFragile: item.isFragile,
      quantity: item.quantity ?? 1,
      boxId: null,
    })
    setOpen(true)
  }

  const openEdit = (item: Item) => {
    setEditingItem(item)
    setFormSeed(undefined)
    setOpen(true)
  }

  const closeDialog = () => {
    setOpen(false)
    setEditingItem(null)
    setFormSeed(undefined)
  }

  const handleSave = async (values: ItemFormValues) => {
    try {
      setItemFormDefaults({
        name: '',
        category: values.category,
        destination: values.destination,
        status: '未处理',
        estimatedValue: undefined,
        notes: '',
        isFragile: false,
        quantity: 1,
        boxId: null,
      })
      if (editingItem) {
        await updateItem(editingItem.id, values)
        toast.success('物品已更新')
      } else {
        await createItem({ ...values, boxId: null })
        toast.success('物品已创建')
      }
      closeDialog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const handleDelete = async (item: Item) => {
    const ok = await confirm({ title: `删除 ${item.name}？`, description: '删除后无法恢复。', confirmText: '删除', destructive: true })
    if (!ok) return
    await deleteItem(item.id)
    toast.success('物品已删除')
  }

  const handleBulkDelete = async () => {
    const ok = await confirm({ title: `删除选中的 ${selectedCount} 个物品？`, description: '删除后可在 5 秒内撤销。', confirmText: '批量删除', destructive: true })
    if (!ok) return
    await bulkDelete(selectedIds)
    toast.success('批量删除完成')
  }

  const handleBatchApply = async () => {
    try {
      await bulkUpdate(selectedIds, { destination: batchDestination, status: batchStatus })
      toast.success('批量更新成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '批量更新失败')
    }
  }

  return (
    <div className="space-y-5">
      <AppCard className="overflow-hidden bg-gradient-to-br from-white/92 via-white/78 to-yizhuang-50/70">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Inventory Studio</p>
            <h2 className="mt-2 text-[1.7rem] font-bold tracking-tight text-ink">先把每件东西定义清楚，再去谈装箱和物流。</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">这页应该像一个移动端清单编辑器：筛选紧凑、批量动作明确、单条信息一眼能判断去向和状态。</p>
          </div>
          <AppButton onClick={openCreate}><Plus className="mr-1 size-4" />新增物品</AppButton>
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-slate-400" />
          <div>
            <p className="section-kicker">Filters</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">筛选与排序</h2>
          </div>
        </div>
        <ItemFiltersPanel filters={filters} onChange={setFilters} />
      </AppCard>

      <BatchActionBar
        selectedCount={selectedCount}
        batchDestination={batchDestination}
        batchStatus={batchStatus}
        warning={batchWarning}
        onDestinationChange={setBatchDestination}
        onStatusChange={setBatchStatus}
        onApply={handleBatchApply}
        onDelete={handleBulkDelete}
      />

      <AppCard className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker">Items</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">当前结果</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{filteredItems.length} 条</span>
        </div>
        <ItemList items={filteredItems} selectedIds={selectedIds} onToggleSelect={toggleSelectedId} onEdit={openEdit} onDuplicate={openDuplicate} onDelete={handleDelete} />
      </AppCard>

      {selectedCount ? <AppButton variant="ghost" fullWidth onClick={clearSelectedIds}>清除已选</AppButton> : null}
      <AppDialog open={open} title={editingItem ? '编辑物品' : '新增物品'} onClose={closeDialog}>
        <ItemForm defaultValues={editingDefaults} onSubmit={handleSave} submitText={editingItem ? '保存修改' : formSeed ? '创建复制项' : '创建物品'} />
      </AppDialog>
    </div>
  )
}
