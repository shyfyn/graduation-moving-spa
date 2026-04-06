import { create } from 'zustand'

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  tone: ToastTone
}

type ConfirmState = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  destructive?: boolean
  onConfirm?: () => void
}

type UiStore = {
  toasts: Toast[]
  confirm: ConfirmState
  pushToast: (title: string, tone?: ToastTone) => void
  removeToast: (id: string) => void
  openConfirm: (state: Omit<ConfirmState, 'open'>) => void
  closeConfirm: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  confirm: { open: false, title: '' },
  pushToast: (title, tone = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: `${Date.now()}-${Math.random()}`, title, tone }],
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  openConfirm: (confirm) => set({ confirm: { ...confirm, open: true } }),
  closeConfirm: () => set({ confirm: { open: false, title: '' } }),
}))
