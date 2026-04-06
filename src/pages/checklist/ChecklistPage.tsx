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

  return (
    <div className="space-y-4">
      <AppCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">准备进度</h2>
          <span className="text-sm font-medium text-ink">{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
        </div>
        <AppButton variant="secondary" fullWidth onClick={() => void resetChecklist()}>重置默认清单</AppButton>
      </AppCard>
      <ChecklistList items={checklist} onToggle={(id) => void toggleChecklist(id)} />
    </div>
  )
}
