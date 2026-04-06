import { create } from 'zustand'
import { checklistRepo } from '../db/repositories/checklistRepo'
import { defaultChecklist } from '../constants/checklist'
import { nowIso } from '../utils'
import type { ChecklistItem } from '../types'

type ChecklistStore = {
  checklist: ChecklistItem[]
  initialized: boolean
  setChecklist: (items: ChecklistItem[]) => void
  toggleChecklist: (id: string) => Promise<void>
  resetChecklist: () => Promise<void>
}

export const useChecklistStore = create<ChecklistStore>((set, get) => ({
  checklist: [],
  initialized: false,
  setChecklist: (items) => set({ checklist: items, initialized: true }),
  toggleChecklist: async (id) => {
    const target = get().checklist.find((item) => item.id === id)
    if (!target) return
    const next = { ...target, done: !target.done, updatedAt: nowIso() }
    await checklistRepo.put(next)
    set((state) => ({ checklist: state.checklist.map((item) => (item.id === id ? next : item)) }))
  },
  resetChecklist: async () => {
    const next = defaultChecklist()
    await checklistRepo.clear()
    await checklistRepo.bulkPut(next)
    set({ checklist: next, initialized: true })
  },
}))
