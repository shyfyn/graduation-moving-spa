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
import { useItemsStore } from '../../store'
import type { Item } from '../../types'
import type { ItemFilters } from '../../types/filters'

const defaultFilters: ItemFilters = { destination: '全部', status: '全部', category: '全部', keyword: '' }

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
  const [batchDestination, setBatchDestination] = useState<'北京-亦庄' | '老家-朝阳' | '随身携带' | '二手转卖' | '丢弃/赠送'>('北京-亦庄')
  const [batchStatus, setBatchStatus] = useState<'未处理' | '已打包' | '已寄出' | '已送达'>('未处理')
  const filteredItems = useFilteredItems(items, filters)
  const confirm = useConfirm()
  const toast = useToast()

  const selectedCount = selectedIds.length
  const editingDefaults = useMemo(() => editingItem ? { ...editingItem } : undefined, [editingItem])

  const openCreate = () => {
    setEditingItem(null)
    setOpen(true)
  }

  const openEdit = (item: Item) => {
    setEditingItem(item)
    setOpen(true)
  }

  const handleSave = async (values: any) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, values)
        toast.success('物品已更新')
      } else {
        await createItem({ ...values, boxId: null })
        toast.success('物品已创建')
      }
      setOpen(false)
      setEditingItem(null)
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
    const ok = await confirm({ title: `删除选中的 ${selectedCount} 个物品？`, description: '删除后无法恢复。', confirmText: '批量删除', destructive: true })
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
      <BatchActionBar selectedCount={selectedCount} batchDestination={batchDestination} batchStatus={batchStatus} onDestinationChange={setBatchDestination} onStatusChange={setBatchStatus} onApply={handleBatchApply} onDelete={handleBulkDelete} />
      <ItemList items={filteredItems} selectedIds={selectedIds} onToggleSelect={toggleSelectedId} onEdit={openEdit} onDelete={handleDelete} />
      {selectedCount ? <AppButton variant="ghost" fullWidth onClick={clearSelectedIds}>清除已选</AppButton> : null}
      <AppDialog open={open} title={editingItem ? '编辑物品' : '新增物品'} onClose={() => { setOpen(false); setEditingItem(null) }}>
        <ItemForm defaultValues={editingDefaults} onSubmit={handleSave} submitText={editingItem ? '保存修改' : '创建物品'} />
      </AppDialog>
    </div>
  )
}
