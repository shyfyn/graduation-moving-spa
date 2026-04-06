import { AppCard } from '../common/AppCard'
import { AppSelect } from '../common/AppSelect'
import type { Box } from '../../types'

export const PackingBoxSelector = ({ boxes, selectedBoxId, onChange }: { boxes: Box[]; selectedBoxId: string; onChange: (boxId: string) => void }) => (
  <AppCard className="space-y-2">
    <h3 className="text-sm font-semibold text-ink">选择箱子</h3>
    <AppSelect value={selectedBoxId} onChange={(event) => onChange(event.target.value)}>
      <option value="">请选择箱子</option>
      {boxes.map((box) => <option key={box.id} value={box.id}>{box.boxCode} · {box.destination}</option>)}
    </AppSelect>
  </AppCard>
)
