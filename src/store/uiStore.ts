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

type ActivityLog = {
  id: string
  title: string
  detail?: string
  createdAt: string
}

type UndoAction = {
  label: string
  run: () => Promise<void> | void
} | null

type UiStore = {
  toasts: Toast[]
  confirm: ConfirmState
  activityLogs: ActivityLog[]
  undoAction: UndoAction
  pushToast: (title: string, tone?: ToastTone) => void
  removeToast: (id: string) => void
  openConfirm: (state: Omit<ConfirmState, 'open'>) => void
  closeConfirm: () => void
  logActivity: (title: string, detail?: string) => void
  setUndoAction: (action: UndoAction) => void
  clearUndoAction: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  confirm: { open: false, title: '' },
  activityLogs: [],
  undoAction: null,
  pushToast: (title, tone = 'info') => set((state) => ({ toasts: [...state.toasts, { id: `${Date.now()}-${Math.random()}`, title, tone }] })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  openConfirm: (confirm) => set({ confirm: { ...confirm, open: true } }),
  closeConfirm: () => set({ confirm: { open: false, title: '' } }),
  logActivity: (title, detail) => set((state) => ({ activityLogs: [{ id: `${Date.now()}-${Math.random()}`, title, detail, createdAt: new Date().toISOString() }, ...state.activityLogs].slice(0, 12) })),
  setUndoAction: (undoAction) => set({ undoAction }),
  clearUndoAction: () => set({ undoAction: null }),
}))
