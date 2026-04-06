import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AppButton } from '../../components/common/AppButton'
import { AppDialog } from '../../components/common/AppDialog'
import { BoxForm } from '../../components/boxes/BoxForm'
import { BoxList } from '../../components/boxes/BoxList'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { useBoxesStore, useItemsStore } from '../../store'
import { ensureBoxCanDelete } from '../../utils/businessRules'
import { createId } from '../../utils'
import type { Box } from '../../types'

export const BoxesPage = () => {
  const boxes = useBoxesStore((state) => state.boxes)
  const createBox = useBoxesStore((state) => state.createBox)
  const updateBox = useBoxesStore((state) => state.updateBox)
  const deleteBox = useBoxesStore((state) => state.deleteBox)
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

  const handleSave = async (values: any) => {
    try {
      if (editingBox) {
        await updateBox(editingBox.id, values)
        toast.success('箱子已更新')
      } else {
        await createBox({ id: createId('box'), ...values })
        toast.success('箱子已创建')
      }
      setOpen(false)
      setEditingBox(null)
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

  return (
    <div className="space-y-4">
      <AppButton fullWidth onClick={() => { setEditingBox(null); setOpen(true) }}><Plus className="mr-1 size-4" />创建箱子</AppButton>
      <BoxList boxes={boxes} getMeta={getMeta} onEdit={(box) => { setEditingBox(box); setOpen(true) }} onDelete={handleDelete} />
      <AppDialog open={open} title={editingBox ? '编辑箱子' : '创建箱子'} onClose={() => { setOpen(false); setEditingBox(null) }}>
        <BoxForm defaultValues={editingBox ?? undefined} onSubmit={handleSave} submitText={editingBox ? '保存修改' : '创建箱子'} />
      </AppDialog>
    </div>
  )
}
