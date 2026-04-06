import type { ChecklistItem } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { ChecklistItemRow } from './ChecklistItemRow'

export const ChecklistList = ({ items, onToggle }: { items: ChecklistItem[]; onToggle: (id: string) => void }) => {
  if (!items.length) return <EmptyState title="清单为空" description="初始化演示数据或重置默认耗材清单后，这里会显示搬家准备项。" />
  return <div className="space-y-3">{items.map((item) => <ChecklistItemRow key={item.id} item={item} onToggle={() => onToggle(item.id)} />)}</div>
}
