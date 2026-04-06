import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { BoxStatusBadge } from '../badges/BoxStatusBadge'
import { DestinationBadge } from '../badges/DestinationBadge'
import { currency } from '../../utils'
import type { Box } from '../../types'

export const BoxCard = ({ box, itemCount, totalValue, logisticsWarning, onEdit, onClone, onDelete }: { box: Box; itemCount: number; totalValue: number; logisticsWarning?: string; onEdit: () => void; onClone: () => void; onDelete: () => void }) => (
  <AppCard className="space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-ink">{box.boxCode}</h3>
        <p className="text-xs text-slate-500">{box.logisticsCompany ? `${box.logisticsCompany} · ${box.trackingNumber ?? '--'}` : '暂未录入物流信息'}</p>
      </div>
      <BoxStatusBadge status={box.status} />
    </div>
    <div className="flex flex-wrap gap-2">
      <DestinationBadge destination={box.destination} />
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">物品 {itemCount}</span>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">估值 {currency(totalValue)}</span>
    </div>
    {logisticsWarning ? <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700"><AlertTriangle className="size-4" />{logisticsWarning}</div> : null}
    {box.notes ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{box.notes}</p> : null}
    <div className="grid grid-cols-4 gap-2">
      <Link to={`/boxes/${box.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:border-slate-300">详情</Link>
      <AppButton variant="ghost" fullWidth onClick={onEdit}>编辑</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onClone}>克隆</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onDelete}>删除</AppButton>
    </div>
  </AppCard>
)
