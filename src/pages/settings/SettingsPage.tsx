import { useRef } from 'react'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { downloadJson, readJsonFile } from '../../utils/exportImport'
import { demoBoxes, demoChecklist, demoItems } from '../../constants/demoData'
import { boxesRepo } from '../../db/repositories/boxesRepo'
import { checklistRepo } from '../../db/repositories/checklistRepo'
import { itemsRepo } from '../../db/repositories/itemsRepo'
import { useBoxesStore, useChecklistStore, useItemsStore } from '../../store'
import { importSchema } from '../../schemas/importSchema'

export const SettingsPage = () => {
  const items = useItemsStore((state) => state.items)
  const boxes = useBoxesStore((state) => state.boxes)
  const checklist = useChecklistStore((state) => state.checklist)
  const setItems = useItemsStore((state) => state.setItems)
  const setBoxes = useBoxesStore((state) => state.setBoxes)
  const setChecklist = useChecklistStore((state) => state.setChecklist)
  const confirm = useConfirm()
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const syncAll = async (next: { items: typeof items; boxes: typeof boxes; checklist: typeof checklist }) => {
    await Promise.all([itemsRepo.clear(), boxesRepo.clear(), checklistRepo.clear()])
    await Promise.all([itemsRepo.bulkPut(next.items), boxesRepo.bulkPut(next.boxes), checklistRepo.bulkPut(next.checklist)])
    setItems(next.items)
    setBoxes(next.boxes)
    setChecklist(next.checklist)
  }

  return (
    <div className="space-y-4">
      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">添加到手机桌面</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p>Android Chrome：打开本页面后，使用浏览器菜单中的“添加到主屏幕”或“安装应用”。</p>
          <p>iPhone Safari：点击底部分享按钮，再选择“添加到主屏幕”。</p>
          <p>首次添加前，建议使用正式地址或 `npm run preview -- --host` 提供的预览地址。</p>
        </div>
      </AppCard>
      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">数据备份</h2>
        <AppButton fullWidth onClick={() => downloadJson({ version: '1.0.0', exportedAt: new Date().toISOString(), items, boxes, checklist })}>导出 JSON</AppButton>
        <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          try {
            const parsed = importSchema.parse(await readJsonFile(file))
            await syncAll(parsed as any)
            toast.success('JSON 导入成功')
          } catch (error) {
            toast.error(error instanceof Error ? error.message : '导入失败')
          } finally {
            event.target.value = ''
          }
        }} />
        <AppButton variant="secondary" fullWidth onClick={() => inputRef.current?.click()}>导入 JSON</AppButton>
      </AppCard>
      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">初始化与清空</h2>
        <AppButton fullWidth variant="secondary" onClick={async () => {
          const ok = await confirm({ title: '初始化演示数据？', description: '当前数据会被覆盖。', confirmText: '初始化', destructive: true })
          if (!ok) return
          await syncAll({ items: demoItems, boxes: demoBoxes, checklist: demoChecklist })
          toast.success('演示数据已初始化')
        }}>初始化演示数据</AppButton>
        <AppButton fullWidth variant="danger" onClick={async () => {
          const ok = await confirm({ title: '清空全部数据？', description: '物品、箱子和清单都会被清空。', confirmText: '清空', destructive: true })
          if (!ok) return
          await syncAll({ items: [], boxes: [], checklist: [] })
          toast.success('全部数据已清空')
        }}>清空全部数据</AppButton>
      </AppCard>
    </div>
  )
}
