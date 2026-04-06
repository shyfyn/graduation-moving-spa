import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { defaultChecklist } from '../../constants/checklist'
import { demoBoxes, demoChecklist, demoItems } from '../../constants/demoData'
import { boxesRepo } from '../../db/repositories/boxesRepo'
import { checklistRepo } from '../../db/repositories/checklistRepo'
import { itemsRepo } from '../../db/repositories/itemsRepo'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'
import { importSchema } from '../../schemas/importSchema'
import { useBoxesStore, useChecklistStore, useItemsStore } from '../../store'
import { formatDateTime } from '../../utils'
import { getLastBackupAt, markBackupNow } from '../../utils/backup'
import { downloadHtml } from '../../utils/downloadHtml'
import { downloadJson, readJsonFile } from '../../utils/exportImport'
import { inspectLocalData } from '../../utils/healthCheck'
import { createPosterHtml, createShareSnapshotHtml } from '../../utils/smartFeatures'

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
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(getLastBackupAt())
  const healthReport = useMemo(() => inspectLocalData({ items, boxes, checklist }), [boxes, checklist, items])

  const syncAll = async (next: { items: typeof items; boxes: typeof boxes; checklist: typeof checklist }) => {
    await Promise.all([itemsRepo.clear(), boxesRepo.clear(), checklistRepo.clear()])
    await Promise.all([itemsRepo.bulkPut(next.items), boxesRepo.bulkPut(next.boxes), checklistRepo.bulkPut(next.checklist)])
    setItems(next.items)
    setBoxes(next.boxes)
    setChecklist(next.checklist)
  }

  const markBackup = () => {
    markBackupNow()
    setLastBackupAt(new Date().toISOString())
  }

  return (
    <div className="space-y-4">
      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">本地数据状态</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">物品</p>
            <p className="mt-1 text-lg font-semibold text-ink">{items.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">箱子</p>
            <p className="mt-1 text-lg font-semibold text-ink">{boxes.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">清单项</p>
            <p className="mt-1 text-lg font-semibold text-ink">{checklist.length}</p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          最近一次 JSON 备份：{lastBackupAt ? formatDateTime(lastBackupAt) : '当前会话还没有导出备份'}
        </div>
      </AppCard>

      <AppCard className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-ink">本地数据健康检查</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">异常总数</p>
            <p className="mt-1 text-lg font-semibold text-ink">{healthReport.issueCount}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-3">
            <p className="text-xs text-rose-500">错误</p>
            <p className="mt-1 text-lg font-semibold text-rose-700">{healthReport.errorCount}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-amber-600">警告</p>
            <p className="mt-1 text-lg font-semibold text-amber-700">{healthReport.warningCount}</p>
          </div>
        </div>
        {healthReport.issues.length ? healthReport.issues.slice(0, 5).map((issue) => (
          <div key={issue.id} className={`rounded-xl px-3 py-3 text-sm ${issue.level === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
            <p className="font-semibold">{issue.title}</p>
            <p className="mt-1 text-xs opacity-90">{issue.detail}</p>
          </div>
        )) : <div className="rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700">当前没有发现明显的数据异常。</div>}
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">添加到手机桌面</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p>Android Chrome：打开本页面后，使用浏览器菜单中的“添加到主屏幕”或“安装应用”。</p>
          <p>iPhone Safari：点击底部分享按钮，再选择“添加到主屏幕”。</p>
          <p>通过桌面图标固定使用同一个浏览器内核，数据更稳定。</p>
        </div>
      </AppCard>

      <AppCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">数据备份</h2>
        <div className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-700">
          建议在做大批量操作、清空数据或换设备前先导出 JSON。这个项目是本地存储，备份文件就是你的恢复点。
        </div>
        <AppButton fullWidth onClick={() => {
          downloadJson({ version: '1.0.0', exportedAt: new Date().toISOString(), items, boxes, checklist })
          markBackup()
          toast.success('JSON 备份已导出')
        }}>导出 JSON</AppButton>
        <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          try {
            const parsed = importSchema.parse(await readJsonFile(file))
            const preview = inspectLocalData(parsed)
            const ok = await confirm({
              title: '确认导入这个 JSON？',
              description: `将导入 ${parsed.items.length} 个物品、${parsed.boxes.length} 个箱子、${parsed.checklist.length} 条清单。预检发现 ${preview.issueCount} 个异常。继续会覆盖当前本地数据。`,
              confirmText: '继续导入',
              destructive: true,
            })
            if (!ok) return
            await syncAll(parsed)
            markBackup()
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
        <h2 className="text-sm font-semibold text-ink">分享页与图鉴导出</h2>
        <p className="text-sm text-slate-600">可导出单文件 HTML，通过微信或文件传输助手发送给家人，对方打开就是只读页面。</p>
        <AppButton
          fullWidth
          variant="secondary"
          onClick={() => {
            downloadHtml('毕业搬家分享页.html', createShareSnapshotHtml({ items, boxes, checklist }))
            toast.success('分享页 HTML 已导出')
          }}
        >
          导出分享页 HTML
        </AppButton>
        <AppButton
          fullWidth
          variant="secondary"
          onClick={() => {
            downloadHtml('我的行李数字图鉴.html', createPosterHtml({ items, boxes }))
            toast.success('数字图鉴海报 HTML 已导出')
          }}
        >
          导出数字图鉴海报
        </AppButton>
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
          const ok = await confirm({ title: '清空全部数据？', description: '物品和箱子会被清空，耗材清单会重置为默认项。', confirmText: '清空', destructive: true })
          if (!ok) return
          await syncAll({ items: [], boxes: [], checklist: defaultChecklist() })
          toast.success('数据已清空并重置清单')
        }}>
          <AlertTriangle className="mr-1 size-4" />清空全部数据
        </AppButton>
      </AppCard>
    </div>
  )
}

