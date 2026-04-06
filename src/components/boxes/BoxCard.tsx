import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { BoxStatusBadge } from '../badges/BoxStatusBadge'
import { DestinationBadge } from '../badges/DestinationBadge'
import { currency } from '../../utils'
import type { Box } from '../../types'

export const BoxCard = ({ box, itemCount, totalValue, logisticsWarning, onEdit, onClone, onDelete }: { box: Box; itemCount: number; totalValue: number; logisticsWarning?: string; onEdit: () => void; onClone: () => void; onDelete: () => void }) => (
  <AppCard className="space-y-4 bg-gradient-to-br from-white/92 to-slate-50/82">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="section-kicker">Container</p>
        <h3 className="mt-1 text-[1.1rem] font-semibold tracking-tight text-ink">{box.boxCode}</h3>
        <p className="mt-1 text-xs text-slate-500">{box.logisticsCompany ? `${box.logisticsCompany} · ${box.trackingNumber ?? '--'}` : '暂未录入物流信息'}</p>
      </div>
      <BoxStatusBadge status={box.status} />
    </div>
    <div className="flex flex-wrap gap-2">
      <DestinationBadge destination={box.destination} />
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">物品 {itemCount}</span>
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">估值 {currency(totalValue)}</span>
    </div>
    {logisticsWarning ? <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-3 text-xs text-amber-700"><AlertTriangle className="size-4" />{logisticsWarning}</div> : null}
    {box.notes ? <p className="rounded-2xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">{box.notes}</p> : null}
    <div className="grid grid-cols-4 gap-2">
      <Link to={`/boxes/${box.id}`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-slate-300">详情</Link>
      <AppButton variant="ghost" fullWidth onClick={onEdit}>编辑</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onClone}>克隆</AppButton>
      <AppButton variant="ghost" fullWidth onClick={onDelete}>删除</AppButton>
    </div>
  </AppCard>
)
