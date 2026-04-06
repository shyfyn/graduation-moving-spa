import { BoxStatusBadge } from '../badges/BoxStatusBadge'
import { DestinationBadge } from '../badges/DestinationBadge'
import { AppCard } from '../common/AppCard'
import { currency, formatDateTime } from '../../utils'
import type { Box } from '../../types'

export const BoxSummary = ({ box, itemCount, totalValue }: { box: Box; itemCount: number; totalValue: number }) => (
  <AppCard className="overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-slate-50/80">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="section-kicker">Container Identity</p>
        <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-ink">{box.boxCode}</h2>
        <p className="mt-1 text-sm text-slate-500">这一箱的状态、物流和二维码都在这里集中处理。</p>
      </div>
      <BoxStatusBadge status={box.status} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <DestinationBadge destination={box.destination} />
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">箱内 {itemCount} 件</span>
      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">总估值 {currency(totalValue)}</span>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
      <div className="rounded-2xl bg-white/85 p-3 ring-1 ring-slate-100">封箱时间：{formatDateTime(box.sealedAt)}</div>
      <div className="rounded-2xl bg-white/85 p-3 ring-1 ring-slate-100">寄出时间：{formatDateTime(box.shippedAt)}</div>
      <div className="rounded-2xl bg-white/85 p-3 ring-1 ring-slate-100">签收时间：{formatDateTime(box.deliveredAt)}</div>
      <div className="rounded-2xl bg-white/85 p-3 ring-1 ring-slate-100">物流：{box.logisticsCompany ? `${box.logisticsCompany} / ${box.trackingNumber ?? '--'}` : '--'}</div>
    </div>
  </AppCard>
)
