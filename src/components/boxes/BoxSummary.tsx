import { AppCard } from '../common/AppCard'
import { BoxStatusBadge } from '../badges/BoxStatusBadge'
import { DestinationBadge } from '../badges/DestinationBadge'
import { currency, formatDateTime } from '../../utils'
import type { Box } from '../../types'

export const BoxSummary = ({ box, itemCount, totalValue }: { box: Box; itemCount: number; totalValue: number }) => (
  <AppCard className="space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">箱号</p>
        <h2 className="text-xl font-semibold text-ink">{box.boxCode}</h2>
      </div>
      <BoxStatusBadge status={box.status} />
    </div>
    <div className="flex flex-wrap gap-2">
      <DestinationBadge destination={box.destination} />
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">箱内 {itemCount} 件</span>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">总估值 {currency(totalValue)}</span>
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm text-slate-500">
      <div className="rounded-xl bg-slate-50 p-3">封箱时间：{formatDateTime(box.sealedAt)}</div>
      <div className="rounded-xl bg-slate-50 p-3">寄出时间：{formatDateTime(box.shippedAt)}</div>
      <div className="rounded-xl bg-slate-50 p-3">签收时间：{formatDateTime(box.deliveredAt)}</div>
      <div className="rounded-xl bg-slate-50 p-3">物流：{box.logisticsCompany ? `${box.logisticsCompany} / ${box.trackingNumber ?? '--'}` : '--'}</div>
    </div>
  </AppCard>
)
