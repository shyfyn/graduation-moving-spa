import { AlertTriangle, Boxes, PackageSearch, Plus } from 'lucide-react'
import { useState } from 'react'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { AppDialog } from '../../components/common/AppDialog'
import { BoxForm } from '../../components/boxes/BoxForm'
import { BoxList } from '../../components/boxes/BoxList'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import type { BoxFormValues } from '../../schemas/boxSchema'
import { useBoxesStore, useItemsStore } from '../../store'
import { ensureBoxCanDelete } from '../../utils/businessRules'
import { createId } from '../../utils'
import type { Box } from '../../types'

export const BoxesPage = () => {
  const boxes = useBoxesStore((state) => state.boxes)
  const createBox = useBoxesStore((state) => state.createBox)
  const updateBox = useBoxesStore((state) => state.updateBox)
  const deleteBox = useBoxesStore((state) => state.deleteBox)
  const cloneBox = useBoxesStore((state) => state.cloneBox)
  const items = useItemsStore((state) => state.items)
  const [open, setOpen] = useState(false)
  const [editingBox, setEditingBox] = useState<Box | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  const getMeta = (boxId: string) => {
    const boxItems = items.filter((item) => item.boxId === boxId)
    return {
      itemCount: boxItems.length,
      totalValue: boxItems.reduce((sum, item) => sum + (item.estimatedValue ?? 0) * (item.quantity ?? 1), 0),
    }
  }

  const getLogisticsWarning = (box: Box) => {
    if (box.status === '已封箱' && (!box.logisticsCompany || !box.trackingNumber)) {
      return '已封箱但未填写物流信息，寄出前请先补全。'
    }
    if (box.status === '已寄出' && (!box.logisticsCompany || !box.trackingNumber)) {
      return '当前状态是已寄出，但物流信息不完整。'
    }
    return undefined
  }

  const closeDialog = () => {
    setOpen(false)
    setEditingBox(null)
  }

  const handleSave = async (values: BoxFormValues) => {
    try {
      if (editingBox) {
        await updateBox(editingBox.id, values)
        toast.success('箱子已更新')
      } else {
        await createBox({ id: createId('box'), ...values })
        toast.success('箱子已创建')
      }
      closeDialog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const handleDelete = async (box: Box) => {
    const itemCount = items.filter((item) => item.boxId === box.id).length
    try {
      ensureBoxCanDelete(itemCount)
      const ok = await confirm({ title: `删除 ${box.boxCode}？`, description: '只有空箱可以删除。', confirmText: '删除', destructive: true })
      if (!ok) return
      await deleteBox(box.id)
      toast.success('箱子已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handleClone = async (box: Box) => {
    try {
      const cloned = await cloneBox(box.id)
      toast.success(`已创建模板箱 ${cloned.boxCode}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '克隆失败')
    }
  }

  const logisticsMissing = boxes.filter((box) => (box.status === '已封箱' || box.status === '已寄出') && (!box.logisticsCompany || !box.trackingNumber)).length
  const activeBoxes = boxes.filter((box) => box.status !== '已签收').length

  return (
    <div className="space-y-5">
      <AppCard className="overflow-hidden bg-gradient-to-br from-white/92 via-white/82 to-chaoyang-50/70">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Box Control</p>
            <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-ink">把箱子当作容器管理，而不是一堆静态编号。</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">这页重点应该是箱子生命周期：创建、克隆、物流补全、查看箱内状态，而不是只有一个普通列表。</p>
          </div>
          <AppButton onClick={() => { setEditingBox(null); setOpen(true) }}><Plus className="mr-1 size-4" />创建箱子</AppButton>
        </div>
      </AppCard>

      <section className="grid grid-cols-2 gap-3">
        <AppCard className="space-y-2">
          <div className="flex items-center justify-between text-slate-500"><span>活跃箱子</span><Boxes className="size-4" /></div>
          <div className="text-3xl font-bold text-ink">{activeBoxes}</div>
          <p className="text-xs text-slate-400">还在流转中的箱子数量</p>
        </AppCard>
        <AppCard className="space-y-2">
          <div className="flex items-center justify-between text-slate-500"><span>待补物流</span><AlertTriangle className="size-4" /></div>
          <div className="text-3xl font-bold text-ink">{logisticsMissing}</div>
          <p className="text-xs text-slate-400">封箱后还没补齐物流信息的箱子</p>
        </AppCard>
      </section>

      <AppCard className="space-y-3 bg-gradient-to-br from-ink to-slate-700 text-white shadow-float">
        <div className="flex items-center gap-2"><PackageSearch className="size-4" /><span className="section-kicker !text-white/60">Workflow Tips</span></div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/8 p-3"><p className="text-sm font-semibold">模板箱子</p><p className="mt-1 text-xs text-white/70">书籍、衣物这类重复箱型可以直接克隆。</p></div>
          <div className="rounded-2xl bg-white/8 p-3"><p className="text-sm font-semibold">物流补全</p><p className="mt-1 text-xs text-white/70">封箱后先补物流，再切已寄出。</p></div>
          <div className="rounded-2xl bg-white/8 p-3"><p className="text-sm font-semibold">箱内明细</p><p className="mt-1 text-xs text-white/70">每个箱子都可以追溯到具体物品。</p></div>
        </div>
      </AppCard>

      <BoxList boxes={boxes} getMeta={getMeta} getLogisticsWarning={getLogisticsWarning} onEdit={(box) => { setEditingBox(box); setOpen(true) }} onClone={handleClone} onDelete={handleDelete} />
      <AppDialog open={open} title={editingBox ? '编辑箱子' : '创建箱子'} onClose={closeDialog}>
        <BoxForm defaultValues={editingBox ?? undefined} onSubmit={handleSave} submitText={editingBox ? '保存修改' : '创建箱子'} />
      </AppDialog>
    </div>
  )
}
