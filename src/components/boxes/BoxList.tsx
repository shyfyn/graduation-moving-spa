import { EmptyState } from '../common/EmptyState'
import { BoxCard } from './BoxCard'
import type { Box } from '../../types'

export const BoxList = ({
  boxes,
  getMeta,
  getLogisticsWarning,
  onEdit,
  onDelete,
}: {
  boxes: Box[]
  getMeta: (boxId: string) => { itemCount: number; totalValue: number }
  getLogisticsWarning: (box: Box) => string | undefined
  onEdit: (box: Box) => void
  onDelete: (box: Box) => void
}) => {
  if (!boxes.length) return <EmptyState title="还没有箱子" description="先创建一个箱子，再进入装箱工作台整理物品。" />

  return (
    <div className="space-y-3">
      {boxes.map((box) => {
        const meta = getMeta(box.id)
        return (
          <BoxCard
            key={box.id}
            box={box}
            itemCount={meta.itemCount}
            totalValue={meta.totalValue}
            logisticsWarning={getLogisticsWarning(box)}
            onEdit={() => onEdit(box)}
            onDelete={() => onDelete(box)}
          />
        )
      })}
    </div>
  )
}
