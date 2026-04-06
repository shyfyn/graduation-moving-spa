import { useUiStore } from '../store'

export const useConfirm = () => {
  const openConfirm = useUiStore((state) => state.openConfirm)
  const closeConfirm = useUiStore((state) => state.closeConfirm)

  return ({ title, description, confirmText, destructive = false }: { title: string; description?: string; confirmText?: string; destructive?: boolean }) =>
    new Promise<boolean>((resolve) => {
      let settled = false
      const unsubscribe = useUiStore.subscribe((state) => {
        if (!state.confirm.open && !settled) {
          settled = true
          unsubscribe()
          resolve(false)
        }
      })

      openConfirm({
        title,
        description,
        confirmText,
        destructive,
        onConfirm: () => {
          if (!settled) {
            settled = true
            unsubscribe()
            closeConfirm()
            resolve(true)
          }
        },
      })
    })
}
