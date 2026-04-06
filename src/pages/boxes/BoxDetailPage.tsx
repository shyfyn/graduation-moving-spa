import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { EmptyState } from '../../components/common/EmptyState'
import { SearchBar } from '../../components/common/SearchBar'
import { BoxStatusActions } from '../../components/boxes/BoxStatusActions'
import { BoxSummary } from '../../components/boxes/BoxSummary'
import { LogisticsForm } from '../../components/boxes/BoxForm'
import { QRCodePanel } from '../../components/boxes/QRCodePanel'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { LogisticsFormValues } from '../../schemas/boxSchema'
import { useBoxesStore, useItemsStore } from '../../store'
import { triggerHaptic } from '../../utils/haptics'

export const BoxDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const boxes = useBoxesStore((state) => state.boxes)
  const items = useItemsStore((state) => state.items)
  const removeItemFromBox = useItemsStore((state) => state.removeItemFromBox)
  const clearBoxItems = useItemsStore((state) => state.clearBoxItems)
  const changeBoxStatus = useBoxesStore((state) => state.changeBoxStatus)
  const updateLogistics = useBoxesStore((state) => state.updateLogistics)
  const toast = useToast()
  const confirm = useConfirm()
  const [showLogistics, setShowLogistics] = useState(false)
  const [search, setSearch] = useState('')

  const box = boxes.find((entry) => entry.id === id)
  const boxItems = useMemo(() => items.filter((item) => item.boxId === id), [id, items])
  const filteredBoxItems = useMemo(() => boxItems.filter((item) => item.name.includes(search.trim())), [boxItems, search])
  const groupedItems = useMemo(() => filteredBoxItems.reduce<Record<string, typeof filteredBoxItems>>((groups, item) => {
    groups[item.category] = [...(groups[item.category] ?? []), item]
    return groups
  }, {}), [filteredBoxItems])
  const totalValue = boxItems.reduce((sum, item) => sum + (item.estimatedValue ?? 0) * (item.quantity ?? 1), 0)

  if (!box) {
    return <EmptyState title="箱子不存在" description="可能已被删除，返回箱子列表重新选择。" action={<AppButton onClick={() => navigate('/boxes')}>返回箱子列表</AppButton>} />
  }

  const shipWarning = [
    boxItems.length === 0 ? '当前箱子还是空的，先确认是否误封箱。' : '',
    !box.logisticsCompany ? '缺少物流公司。' : '',
    !box.trackingNumber ? '缺少物流单号。' : '',
  ].filter(Boolean).join(' ')

  const safeChangeStatus = async (status: '打包中' | '已封箱' | '已寄出' | '已签收') => {
    try {
      await changeBoxStatus(box.id, status)
      if (status === '已封箱') triggerHaptic('confirm')
      toast.success(`箱子状态已更新为 ${status}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '状态更新失败')
    }
  }

  const handleLogisticsSave = async (values: LogisticsFormValues) => {
    try {
      await updateLogistics(box.id, values)
      toast.success('物流信息已保存')
      setShowLogistics(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const handleRemove = async (itemId: string) => {
    try {
      await removeItemFromBox(itemId)
      toast.success('物品已移出箱子')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '移除失败')
    }
  }

  const handleScatter = async () => {
    const ok = await confirm({
      title: `打散 ${box.boxCode}？`,
      description: '箱内物品会全部退回未处理状态，5 秒内可撤销。',
      confirmText: '打散箱子',
      destructive: true,
    })
    if (!ok) return
    try {
      await clearBoxItems(box.id)
      triggerHaptic('warning')
      toast.success('箱内物品已全部打散')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '打散失败')
    }
  }

  return (
    <div className="space-y-5">
      <BoxSummary box={box} itemCount={boxItems.length} totalValue={totalValue} />
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <BoxStatusActions
            status={box.status}
            shipWarning={box.status === '已封箱' ? shipWarning || undefined : undefined}
            onPack={() => safeChangeStatus('打包中')}
            onSeal={() => safeChangeStatus('已封箱')}
            onShip={() => safeChangeStatus('已寄出')}
            onDeliver={() => safeChangeStatus('已签收')}
          />
          <AppButton fullWidth variant="secondary" onClick={handleScatter} disabled={box.status !== '打包中' || !boxItems.length}>
            一键清空并打散箱子
          </AppButton>
          <AppCard className="space-y-3 bg-gradient-to-br from-white/92 to-slate-50/92">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Logistics</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">物流信息</h3>
              </div>
              <AppButton variant="ghost" onClick={() => setShowLogistics((value) => !value)}>{showLogistics ? '收起' : '编辑物流'}</AppButton>
            </div>
            <p className="text-sm leading-6 text-slate-500">{box.logisticsCompany ? `${box.logisticsCompany} / ${box.trackingNumber ?? '--'}` : '当前尚未填写物流信息。'}</p>
            {showLogistics ? <LogisticsForm defaultValues={{ logisticsCompany: box.logisticsCompany, trackingNumber: box.trackingNumber }} onSubmit={handleLogisticsSave} /> : null}
          </AppCard>
          <QRCodePanel value={box.qrCodeValue} onCopy={async () => {
            if (!box.qrCodeValue) return
            await navigator.clipboard.writeText(box.qrCodeValue)
            triggerHaptic('success')
            toast.success('二维码内容已复制')
          }} />
        </div>

        <AppCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Contents</p>
              <h3 className="mt-1 text-lg font-semibold text-ink">箱内物品</h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{filteredBoxItems.length}/{boxItems.length} 件</span>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="搜索箱内物品" />
          {Object.keys(groupedItems).length ? Object.entries(groupedItems).map(([category, group]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                <span>{category}</span>
                <span>{group.length} 件</span>
              </div>
              {group.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white/70 px-3 py-3 ring-1 ring-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">数量 {item.quantity ?? 1}{item.isFragile ? ' · 易碎' : ''}</p>
                    </div>
                    <AppButton variant="ghost" onClick={() => void handleRemove(item.id)} disabled={box.status !== '打包中'}>移出</AppButton>
                  </div>
                </div>
              ))}
            </div>
          )) : <EmptyState title={boxItems.length ? '没有搜索结果' : '箱子为空'} description={boxItems.length ? '换个关键词试试。' : '到装箱工作台把对应目的地的物品加入这个箱子。'} />}
        </AppCard>
      </div>
    </div>
  )
}
