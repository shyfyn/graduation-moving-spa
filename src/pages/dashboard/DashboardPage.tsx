import { Boxes, Clock3, Package, Truck } from 'lucide-react'
import { useBoxesStore, useItemsStore } from '../../store'
import { getDeliveredBoxes, getInTransitBoxes } from '../../store/selectors'
import { AppCard } from '../../components/common/AppCard'
import { EmptyState } from '../../components/common/EmptyState'
import { StatCard } from '../../components/common/StatCard'
import { DestinationBadge } from '../../components/badges/DestinationBadge'
import { BoxStatusBadge } from '../../components/badges/BoxStatusBadge'
import { ItemStatusBadge } from '../../components/badges/ItemStatusBadge'

export const DashboardPage = () => {
  const items = useItemsStore((state) => state.items)
  const boxes = useBoxesStore((state) => state.boxes)
  const inTransit = getInTransitBoxes(boxes)
  const delivered = getDeliveredBoxes(boxes)
  const pendingItems = items.filter((item) => item.status === '未处理').slice(0, 5)
  const recentBoxes = [...boxes].slice(0, 3)
  const destinationStats = ['北京-亦庄', '老家-朝阳', '随身携带', '二手转卖', '丢弃/赠送'].map((destination) => ({ destination, count: items.filter((item) => item.destination === destination).length }))

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="物品总数" value={String(items.length)} icon={<Package className="size-4 text-slate-400" />} hint="所有目的地汇总" />
        <StatCard label="箱子总数" value={String(boxes.length)} icon={<Boxes className="size-4 text-slate-400" />} hint="含已签收箱子" />
        <StatCard label="在途箱数" value={String(inTransit.length)} icon={<Truck className="size-4 text-slate-400" />} hint="已寄出未签收" />
        <StatCard label="待处理物品" value={String(items.filter((item) => item.status === '未处理').length)} icon={<Clock3 className="size-4 text-slate-400" />} hint="还未装箱或处置" />
      </section>

      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">按目的地统计</h2>
        <div className="grid grid-cols-1 gap-2">
          {destinationStats.map((entry) => (
            <div key={entry.destination} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <DestinationBadge destination={entry.destination as never} />
              <span className="text-sm font-medium text-slate-600">{entry.count} 件</span>
            </div>
          ))}
        </div>
      </AppCard>

      <section className="grid gap-4 md:grid-cols-2">
        <AppCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">最近创建的箱子</h2>
            <span className="text-xs text-slate-400">已签收 {delivered.length}</span>
          </div>
          {recentBoxes.length ? recentBoxes.map((box) => (
            <div key={box.id} className="rounded-xl bg-slate-50 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{box.boxCode}</p>
                  <p className="mt-1 text-xs text-slate-500">{box.logisticsCompany ? `${box.logisticsCompany} · ${box.trackingNumber ?? '--'}` : '暂无物流信息'}</p>
                </div>
                <BoxStatusBadge status={box.status} />
              </div>
            </div>
          )) : <EmptyState title="暂无箱子" description="先创建箱子，才能进入装箱和物流管理。" />}
        </AppCard>

        <AppCard className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">待处理物品</h2>
          {pendingItems.length ? pendingItems.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                </div>
                <ItemStatusBadge status={item.status} />
              </div>
            </div>
          )) : <EmptyState title="没有待处理物品" description="当前所有物品都已经进入后续流程。" />}
        </AppCard>
      </section>
    </div>
  )
}
