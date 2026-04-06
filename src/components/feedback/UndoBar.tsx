import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { AppButton } from '../common/AppButton'
import { useToast } from '../../hooks/useToast'
import { useUiStore } from '../../store'

export const UndoBar = () => {
  const undoAction = useUiStore((state) => state.undoAction)
  const clearUndoAction = useUiStore((state) => state.clearUndoAction)
  const toast = useToast()

  useEffect(() => {
    if (!undoAction) return
    const timer = window.setTimeout(() => clearUndoAction(), 5000)
    return () => window.clearTimeout(timer)
  }, [clearUndoAction, undoAction])

  if (!undoAction) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
        <div>
          <p className="text-sm font-semibold text-ink">{undoAction.label}</p>
          <p className="text-xs text-slate-500">5 秒内可撤销</p>
        </div>
        <AppButton
          variant="secondary"
          onClick={async () => {
            try {
              await undoAction.run()
              clearUndoAction()
              toast.success('已撤销上一步操作')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : '撤销失败')
            }
          }}
        >
          <RotateCcw className="mr-1 size-4" />撤销
        </AppButton>
      </div>
    </div>
  )
}
