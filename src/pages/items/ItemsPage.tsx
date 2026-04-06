import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AppButton } from '../../components/common/AppButton'
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
      status: item.destination === '北京-亦庄' || item.destination === '老家-朝阳' ? '未处理' : '未处理',
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
    <div className="space-y-4">
      <AppButton fullWidth onClick={openCreate}><Plus className="mr-1 size-4" />新增物品</AppButton>
      <ItemFiltersPanel filters={filters} onChange={setFilters} />
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
      <ItemList items={filteredItems} selectedIds={selectedIds} onToggleSelect={toggleSelectedId} onEdit={openEdit} onDuplicate={openDuplicate} onDelete={handleDelete} />
      {selectedCount ? <AppButton variant="ghost" fullWidth onClick={clearSelectedIds}>清除已选</AppButton> : null}
      <AppDialog open={open} title={editingItem ? '编辑物品' : '新增物品'} onClose={closeDialog}>
        <ItemForm defaultValues={editingDefaults} onSubmit={handleSave} submitText={editingItem ? '保存修改' : formSeed ? '创建复制项' : '创建物品'} />
      </AppDialog>
    </div>
  )
}


