import { Boxes, Clock3, History, Package, Truck } from 'lucide-react'
import { AppCard } from '../../components/common/AppCard'
import { EmptyState } from '../../components/common/EmptyState'
import { StatCard } from '../../components/common/StatCard'
import { BoxStatusBadge } from '../../components/badges/BoxStatusBadge'
import { DestinationBadge } from '../../components/badges/DestinationBadge'
import { ItemStatusBadge } from '../../components/badges/ItemStatusBadge'
import { useBoxesStore, useItemsStore, useUiStore } from '../../store'
import { getDeliveredBoxes, getInTransitBoxes } from '../../store/selectors'
import { formatDateTime } from '../../utils'

export const DashboardPage = () => {
  const items = useItemsStore((state) => state.items)
  const boxes = useBoxesStore((state) => state.boxes)
  const activityLogs = useUiStore((state) => state.activityLogs)
  const inTransit = getInTransitBoxes(boxes)
  const delivered = getDeliveredBoxes(boxes)
  const pendingItems = items.filter((item) => item.status === '未处理').slice(0, 5)
  const recentBoxes = [...boxes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
  const destinationStats = ['北京-亦庄', '老家-朝阳', '随身携带', '二手转卖', '丢弃/赠送'].map((destination) => ({ destination, count: items.filter((item) => item.destination === destination).length }))
  const missingLogisticsCount = boxes.filter((box) => (box.status === '已封箱' || box.status === '已寄出') && (!box.logisticsCompany || !box.trackingNumber)).length
  const totalItems = Math.max(items.length, 1)
  const statusStats = ['未处理', '已打包', '已寄出', '已送达'].map((status) => ({ status, count: items.filter((item) => item.status === status).length }))

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="物品总数" value={String(items.length)} icon={<Package className="size-4 text-slate-400" />} hint="所有目的地汇总" />
        <StatCard label="箱子总数" value={String(boxes.length)} icon={<Boxes className="size-4 text-slate-400" />} hint="含已签收箱子" />
        <StatCard label="在途箱数" value={String(inTransit.length)} icon={<Truck className="size-4 text-slate-400" />} hint="已寄出未签收" />
        <StatCard label="待处理物品" value={String(items.filter((item) => item.status === '未处理').length)} icon={<Clock3 className="size-4 text-slate-400" />} hint="还未装箱或处置" />
      </section>

      <AppCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">按目的地统计</h2>
          <span className="text-xs text-slate-400">物流缺失 {missingLogisticsCount} 箱</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {destinationStats.map((entry) => (
            <div key={entry.destination} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <DestinationBadge destination={entry.destination as never} />
              <span className="text-sm font-medium text-slate-600">{entry.count} 件</span>
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">轻量数据可视化</h2>
        <div className="space-y-3">
          {destinationStats.map((entry) => (
            <div key={entry.destination} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{entry.destination}</span>
                <span>{entry.count} 件</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${entry.destination === '北京-亦庄' ? 'bg-sky-500' : entry.destination === '老家-朝阳' ? 'bg-orange-500' : 'bg-slate-400'}`} style={{ width: `${(entry.count / totalItems) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {statusStats.map((entry) => (
            <div key={entry.status} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{entry.status}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{entry.count}</p>
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

      <AppCard className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-ink">最近操作</h2>
        </div>
        {activityLogs.length ? activityLogs.map((log) => (
          <div key={log.id} className="rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{log.title}</p>
              <span className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
            </div>
            {log.detail ? <p className="mt-1 text-xs text-slate-500">{log.detail}</p> : null}
          </div>
        )) : <EmptyState title="还没有最近操作" description="你后续的新增、装箱、状态流转都会记录在这里。" />}
      </AppCard>
    </div>
  )
}
