import { CheckCircle2, RotateCcw, ShoppingBag } from 'lucide-react'
import { useMemo } from 'react'
import { AppButton } from '../../components/common/AppButton'
import { AppCard } from '../../components/common/AppCard'
import { ChecklistList } from '../../components/checklist/ChecklistList'
import { useChecklistStore } from '../../store'

export const ChecklistPage = () => {
  const checklist = useChecklistStore((state) => state.checklist)
  const toggleChecklist = useChecklistStore((state) => state.toggleChecklist)
  const resetChecklist = useChecklistStore((state) => state.resetChecklist)
  const completed = useMemo(() => checklist.filter((item) => item.done).length, [checklist])
  const percent = checklist.length ? Math.round((completed / checklist.length) * 100) : 0
  const remaining = checklist.length - completed

  return (
    <div className="space-y-5">
      <AppCard className="overflow-hidden bg-gradient-to-br from-white/92 via-white/82 to-emerald-50/70">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Supplies Board</p>
            <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-ink">别让纸箱、胶带和泡沫拖慢整个搬家节奏。</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">这页不只是一个勾选清单，它应该告诉你准备进度、还差多少，以及是否已经可以开始高强度装箱。</p>
          </div>
          <ShoppingBag className="hidden size-10 text-emerald-500 md:block" />
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker">Progress</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">准备进度</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-slate-200">{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-yizhuang-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-slate-500"><CheckCircle2 className="size-4" /><span>已完成</span></div>
            <p className="mt-2 text-2xl font-bold text-ink">{completed}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-slate-500"><RotateCcw className="size-4" /><span>待准备</span></div>
            <p className="mt-2 text-2xl font-bold text-ink">{remaining}</p>
          </div>
        </div>
        <AppButton variant="secondary" fullWidth onClick={() => void resetChecklist()}>重置默认清单</AppButton>
      </AppCard>

      <ChecklistList items={checklist} onToggle={(id) => void toggleChecklist(id)} />
    </div>
  )
}
