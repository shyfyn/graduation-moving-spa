import { create } from 'zustand'
import { itemsRepo } from '../db/repositories/itemsRepo'
import { createId, nowIso } from '../utils'
import { canItemBeBoxed, ensureBoxCanMutateItems, validateItemDestinationRules, validateItemForBox } from '../utils/businessRules'
import { useBoxesStore } from './boxesStore'
import { useUiStore } from './uiStore'
import type { Item, ItemStatus } from '../types'

type ItemStore = {
  items: Item[]
  initialized: boolean
  selectedIds: string[]
  setItems: (items: Item[]) => void
  setSelectedIds: (ids: string[]) => void
  toggleSelectedId: (id: string) => void
  clearSelectedIds: () => void
  createItem: (input: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Item>
  updateItem: (id: string, updates: Partial<Item>) => Promise<Item>
  deleteItem: (id: string) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
  bulkUpdate: (ids: string[], updates: Partial<Pick<Item, 'destination' | 'status'>>) => Promise<void>
  assignItemsToBox: (boxId: string, itemIds: string[]) => Promise<void>
  removeItemFromBox: (itemId: string) => Promise<void>
}

export const useItemsStore = create<ItemStore>((set, get) => ({
  items: [],
  initialized: false,
  selectedIds: [],
  setItems: (items) => set({ items, initialized: true }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectedId: (id) => set((state) => ({ selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter((value) => value !== id) : [...state.selectedIds, id] })),
  clearSelectedIds: () => set({ selectedIds: [] }),
  createItem: async (input) => {
    validateItemDestinationRules(input)
    const item: Item = { ...input, id: createId('item'), createdAt: nowIso(), updatedAt: nowIso(), quantity: input.quantity ?? 1 }
    await itemsRepo.put(item)
    useUiStore.getState().logActivity('创建了物品', `${item.name} · ${item.destination}`)
    set((state) => ({ items: [item, ...state.items] }))
    return item
  },
  updateItem: async (id, updates) => {
    const current = get().items.find((item) => item.id === id)
    if (!current) throw new Error('物品不存在')
    const next: Item = { ...current, ...updates, updatedAt: nowIso() }
    validateItemDestinationRules(next)
    if (current.boxId && updates.destination && updates.destination !== current.destination) throw new Error('箱内物品不能直接改目的地，请先移出箱子')
    await itemsRepo.put(next)
    useUiStore.getState().logActivity('更新了物品', next.name)
    set((state) => ({ items: state.items.map((item) => (item.id === id ? next : item)) }))
    return next
  },
  deleteItem: async (id) => {
    const current = get().items.find((item) => item.id === id)
    if (!current) return
    await itemsRepo.bulkDelete([id])
    useUiStore.getState().logActivity('删除了物品', current.name)
    useUiStore.getState().setUndoAction({
      label: `撤销删除 ${current.name}`,
      run: async () => {
        await itemsRepo.put(current)
        set((state) => ({ items: [current, ...state.items] }))
      },
    })
    set((state) => ({ items: state.items.filter((item) => item.id !== id), selectedIds: state.selectedIds.filter((value) => value !== id) }))
  },
  bulkDelete: async (ids) => {
    const removed = get().items.filter((item) => ids.includes(item.id))
    await itemsRepo.bulkDelete(ids)
    useUiStore.getState().logActivity('批量删除了物品', `${removed.length} 项`)
    useUiStore.getState().setUndoAction({
      label: `撤销批量删除 ${removed.length} 项`,
      run: async () => {
        await itemsRepo.bulkPut(removed)
        set((state) => ({ items: [...removed, ...state.items] }))
      },
    })
    set((state) => ({ items: state.items.filter((item) => !ids.includes(item.id)), selectedIds: [] }))
  },
  bulkUpdate: async (ids, updates) => {
    const nextItems = get().items.filter((item) => ids.includes(item.id)).map((item) => {
      const next: Item = { ...item, ...updates, updatedAt: nowIso() }
      if (updates.destination && !canItemBeBoxed({ destination: updates.destination }) && item.boxId) throw new Error('箱内物品不能批量改为不可装箱目的地')
      if (updates.status && ['已寄出', '已送达'].includes(updates.status) && !item.boxId) throw new Error('只有箱内物品才能批量标记为已寄出或已送达')
      validateItemDestinationRules(next)
      return next
    })
    await itemsRepo.bulkPut(nextItems)
    useUiStore.getState().logActivity('批量更新了物品', `${nextItems.length} 项`)
    set((state) => ({ items: state.items.map((item) => nextItems.find((next) => next.id === item.id) ?? item), selectedIds: [] }))
  },
  assignItemsToBox: async (boxId, itemIds) => {
    const box = useBoxesStore.getState().boxes.find((entry) => entry.id === boxId)
    if (!box) throw new Error('未找到箱子')
    ensureBoxCanMutateItems(box)
    const nextItems = get().items.filter((item) => itemIds.includes(item.id)).map((item) => {
      validateItemForBox(item, box)
      return { ...item, boxId, status: '已打包' as ItemStatus, updatedAt: nowIso() }
    })
    await itemsRepo.bulkPut(nextItems)
    useUiStore.getState().logActivity('装箱完成', `${box.boxCode} 加入 ${nextItems.length} 件物品`)
    useUiStore.getState().setUndoAction({
      label: `撤销装箱 ${nextItems.length} 件`,
      run: async () => {
        const reverted = nextItems.map((item) => ({ ...item, boxId: null, status: '未处理' as ItemStatus, updatedAt: nowIso() }))
        await itemsRepo.bulkPut(reverted)
        set((state) => ({ items: state.items.map((item) => reverted.find((target) => target.id === item.id) ?? item) }))
      },
    })
    set((state) => ({ items: state.items.map((item) => nextItems.find((next) => next.id === item.id) ?? item), selectedIds: [] }))
  },
  removeItemFromBox: async (itemId) => {
    const current = get().items.find((item) => item.id === itemId)
    if (!current || !current.boxId) return
    const box = useBoxesStore.getState().boxes.find((entry) => entry.id === current.boxId)
    if (!box) throw new Error('未找到箱子')
    ensureBoxCanMutateItems(box)
    const next: Item = { ...current, boxId: null, status: '未处理', updatedAt: nowIso() }
    await itemsRepo.put(next)
    useUiStore.getState().logActivity('移出了箱内物品', `${current.name} <- ${box.boxCode}`)
    useUiStore.getState().setUndoAction({
      label: `撤销移出 ${current.name}`,
      run: async () => {
        await itemsRepo.put(current)
        set((state) => ({ items: state.items.map((item) => (item.id === itemId ? current : item)) }))
      },
    })
    set((state) => ({ items: state.items.map((item) => (item.id === itemId ? next : item)) }))
  },
}))
