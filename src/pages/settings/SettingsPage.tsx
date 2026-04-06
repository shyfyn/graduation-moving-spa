import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, Download, ShieldCheck, Sparkles } from 'lucide-react'
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
    <div className="space-y-5">
      <AppCard className="overflow-hidden bg-gradient-to-br from-white/92 via-white/82 to-slate-100/80">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Control Room</p>
            <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-ink">本地工具也需要恢复能力、分享出口和健康检查。</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">设置页现在不只是“危险操作集合”，而是整个系统的控制台：备份、导入、分享、重置都应该清楚可控。</p>
          </div>
          <div className="hidden rounded-2xl bg-white/80 px-3 py-3 text-sm font-semibold text-cocoa md:block">Local-only / Recoverable</div>
        </div>
      </AppCard>

      <section className="grid grid-cols-3 gap-3">
        <AppCard className="space-y-2 text-center"><p className="text-xs text-slate-500">物品</p><p className="text-2xl font-bold text-ink">{items.length}</p></AppCard>
        <AppCard className="space-y-2 text-center"><p className="text-xs text-slate-500">箱子</p><p className="text-2xl font-bold text-ink">{boxes.length}</p></AppCard>
        <AppCard className="space-y-2 text-center"><p className="text-xs text-slate-500">清单项</p><p className="text-2xl font-bold text-ink">{checklist.length}</p></AppCard>
      </section>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-slate-400" />
          <div>
            <p className="section-kicker">Backup</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">数据备份与恢复</h2>
          </div>
        </div>
        <div className="rounded-2xl bg-amber-50 px-3 py-3 text-sm text-amber-700">建议在做大批量操作、清空数据或换设备前先导出 JSON。这个项目是本地存储，备份文件就是你的恢复点。</div>
        <div className="rounded-2xl bg-white/80 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-100">最近一次 JSON 备份：{lastBackupAt ? formatDateTime(lastBackupAt) : '当前会话还没有导出备份'}</div>
        <div className="grid gap-3 md:grid-cols-2">
          <AppButton fullWidth onClick={() => {
            downloadJson({ version: '1.0.0', exportedAt: new Date().toISOString(), items, boxes, checklist })
            markBackup()
            toast.success('JSON 备份已导出')
          }}>导出 JSON</AppButton>
          <>
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
          </>
        </div>
      </AppCard>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <AppCard className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-slate-400" />
            <div>
              <p className="section-kicker">Health Check</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">本地数据健康检查</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">异常总数</p><p className="mt-1 text-lg font-semibold text-ink">{healthReport.issueCount}</p></div>
            <div className="rounded-2xl bg-rose-50 p-3"><p className="text-xs text-rose-500">错误</p><p className="mt-1 text-lg font-semibold text-rose-700">{healthReport.errorCount}</p></div>
            <div className="rounded-2xl bg-amber-50 p-3"><p className="text-xs text-amber-600">警告</p><p className="mt-1 text-lg font-semibold text-amber-700">{healthReport.warningCount}</p></div>
          </div>
          {healthReport.issues.length ? healthReport.issues.slice(0, 5).map((issue) => (
            <div key={issue.id} className={`rounded-2xl px-3 py-3 text-sm ${issue.level === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
              <p className="font-semibold">{issue.title}</p>
              <p className="mt-1 text-xs opacity-90">{issue.detail}</p>
            </div>
          )) : <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700">当前没有发现明显的数据异常。</div>}
        </AppCard>

        <AppCard className="space-y-3 bg-gradient-to-br from-ink to-slate-700 text-white shadow-float">
          <div className="flex items-center gap-2"><Sparkles className="size-4" /><span className="section-kicker !text-white/60">Share</span></div>
          <h2 className="text-xl font-semibold">分享页与图鉴导出</h2>
          <p className="text-sm leading-6 text-white/70">可以导出单文件 HTML，通过微信或文件传输助手发送给家人，对方点开就是只读页面。</p>
          <div className="grid gap-3 md:grid-cols-2">
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
          </div>
        </AppCard>
      </div>

      <AppCard className="space-y-3">
        <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-slate-400" /><div><p className="section-kicker">Reset</p><h2 className="mt-1 text-lg font-semibold text-ink">初始化与清空</h2></div></div>
        <div className="grid gap-3 md:grid-cols-2">
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
          }}>清空全部数据</AppButton>
        </div>
      </AppCard>
    </div>
  )
}
