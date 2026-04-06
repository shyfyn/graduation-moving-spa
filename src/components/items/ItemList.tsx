import { EmptyState } from '../common/EmptyState'
import { ItemCard } from './ItemCard'
import type { Item } from '../../types'

export const ItemList = ({ items, selectedIds, onToggleSelect, onEdit, onDelete, onDuplicate }: { items: Item[]; selectedIds: string[]; onToggleSelect: (id: string) => void; onEdit: (item: Item) => void; onDelete: (item: Item) => void; onDuplicate: (item: Item) => void }) => {
  if (!items.length) return <EmptyState title="没有找到物品" description="调整筛选条件，或者新建一个物品开始管理。" />
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} selected={selectedIds.includes(item.id)} onToggleSelect={() => onToggleSelect(item.id)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} onDuplicate={() => onDuplicate(item)} />
      ))}
    </div>
  )
}
