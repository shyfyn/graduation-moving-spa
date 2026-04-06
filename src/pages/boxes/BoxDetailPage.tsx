import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { BoxStatusActions } from '../../components/boxes/BoxStatusActions'
import { BoxSummary } from '../../components/boxes/BoxSummary'
import { LogisticsForm } from '../../components/boxes/LogisticsForm'
import { QRCodePanel } from '../../components/boxes/QRCodePanel'
import { EmptyState } from '../../components/common/EmptyState'
import { useToast } from '../../hooks/useToast'
import { useBoxesStore, useItemsStore } from '../../store'

export const BoxDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const boxes = useBoxesStore((state) => state.boxes)
  const items = useItemsStore((state) => state.items)
  const removeItemFromBox = useItemsStore((state) => state.removeItemFromBox)
  const changeBoxStatus = useBoxesStore((state) => state.changeBoxStatus)
  const updateLogistics = useBoxesStore((state) => state.updateLogistics)
  const toast = useToast()
  const [showLogistics, setShowLogistics] = useState(false)

  const box = boxes.find((entry) => entry.id === id)
  const boxItems = useMemo(() => items.filter((item) => item.boxId === id), [id, items])
  const totalValue = boxItems.reduce((sum, item) => sum + (item.estimatedValue ?? 0) * (item.quantity ?? 1), 0)

  if (!box) return <EmptyState title="箱子不存在" description="可能已被删除，返回箱子列表重新选择。" action={<AppButton onClick={() => navigate('/boxes')}>返回箱子列表</AppButton>} />

  const safeChangeStatus = async (status: '打包中' | '已封箱' | '已寄出' | '已签收') => {
    try {
      await changeBoxStatus(box.id, status)
      toast.success(`箱子状态已更新为 ${status}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '状态更新失败')
    }
  }

  return (
    <div className="space-y-4">
      <BoxSummary box={box} itemCount={boxItems.length} totalValue={totalValue} />
      <BoxStatusActions status={box.status} onPack={() => safeChangeStatus('打包中')} onSeal={() => safeChangeStatus('已封箱')} onShip={() => safeChangeStatus('已寄出')} onDeliver={() => safeChangeStatus('已签收')} />
      <AppCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">物流信息</h3>
          <AppButton variant="ghost" onClick={() => setShowLogistics((value) => !value)}>{showLogistics ? '收起' : '编辑物流'}</AppButton>
        </div>
        <p className="text-sm text-slate-500">{box.logisticsCompany ? `${box.logisticsCompany} / ${box.trackingNumber ?? '--'}` : '当前尚未填写物流信息。'}</p>
        {showLogistics ? <LogisticsForm defaultValues={{ logisticsCompany: box.logisticsCompany, trackingNumber: box.trackingNumber }} onSubmit={async (values) => { try { await updateLogistics(box.id, values); toast.success('物流信息已保存'); setShowLogistics(false) } catch (error) { toast.error(error instanceof Error ? error.message : '保存失败') } }} /> : null}
      </AppCard>
      <QRCodePanel value={box.qrCodeValue} onCopy={async () => { if (!box.qrCodeValue) return; await navigator.clipboard.writeText(box.qrCodeValue); toast.success('二维码内容已复制') }} />
      <AppCard className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">箱内物品</h3>
        {boxItems.length ? boxItems.map((item) => (
          <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.category} · 数量 {item.quantity ?? 1}</p>
              </div>
              <AppButton variant="ghost" onClick={() => void removeItemFromBox(item.id).then(() => toast.success('物品已移出箱子')).catch((error) => toast.error(error instanceof Error ? error.message : '移除失败'))}>移出</AppButton>
            </div>
          </div>
        )) : <EmptyState title="箱子为空" description="到装箱工作台把对应目的地的物品加入这个箱子。" />}
      </AppCard>
    </div>
  )
}
