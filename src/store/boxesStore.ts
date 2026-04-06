import { create } from 'zustand'
import { boxesRepo } from '../db/repositories/boxesRepo'
import { generateBoxQrPayload, nowIso } from '../utils'
import { validateShipBox } from '../utils/businessRules'
import { useUiStore } from './uiStore'
import type { Box, BoxStatus, LogisticsCompany } from '../types'
import { suggestNextBoxCode } from '../utils/boxCode'

type BoxStore = {
  boxes: Box[]
  initialized: boolean
  setBoxes: (boxes: Box[]) => void
  createBox: (input: Omit<Box, 'createdAt' | 'updatedAt' | 'qrCodeValue' | 'sealedAt' | 'shippedAt' | 'deliveredAt'>) => Promise<Box>
  updateBox: (id: string, updates: Partial<Box>) => Promise<Box>
  deleteBox: (id: string) => Promise<void>
  cloneBox: (id: string) => Promise<Box>
  changeBoxStatus: (id: string, status: BoxStatus) => Promise<Box>
  updateLogistics: (id: string, payload: { logisticsCompany: LogisticsCompany; trackingNumber: string }) => Promise<Box>
}

export const useBoxesStore = create<BoxStore>((set, get) => ({
  boxes: [],
  initialized: false,
  setBoxes: (boxes) => set({ boxes, initialized: true }),
  createBox: async (input) => {
    if (get().boxes.some((box) => box.boxCode === input.boxCode)) throw new Error('箱号已存在')
    const box: Box = { ...input, createdAt: nowIso(), updatedAt: nowIso() }
    await boxesRepo.put(box)
    useUiStore.getState().logActivity('创建了箱子', `${box.boxCode} · ${box.destination}`)
    set((state) => ({ boxes: [box, ...state.boxes] }))
    return box
  },
  updateBox: async (id, updates) => {
    const current = get().boxes.find((box) => box.id === id)
    if (!current) throw new Error('箱子不存在')
    if (updates.boxCode && updates.boxCode !== current.boxCode && get().boxes.some((box) => box.boxCode === updates.boxCode)) throw new Error('箱号已存在')
    if (current.status !== '打包中' && (updates.destination || updates.boxCode)) throw new Error('已封箱或已寄出的箱子不能直接修改箱号和目的地')
    const next: Box = { ...current, ...updates, updatedAt: nowIso() }
    await boxesRepo.put(next)
    useUiStore.getState().logActivity('更新了箱子', next.boxCode)
    set((state) => ({ boxes: state.boxes.map((box) => (box.id === id ? next : box)) }))
    return next
  },
  deleteBox: async (id) => {
    const current = get().boxes.find((box) => box.id === id)
    await boxesRepo.delete(id)
    if (current) useUiStore.getState().logActivity('删除了箱子', current.boxCode)
    set((state) => ({ boxes: state.boxes.filter((box) => box.id !== id) }))
  },
  cloneBox: async (id) => {
    const current = get().boxes.find((box) => box.id === id)
    if (!current) throw new Error('箱子不存在')
    const next: Box = {
      ...current,
      id: `box-${Math.random().toString(36).slice(2, 10)}`,
      boxCode: suggestNextBoxCode(current.boxCode, get().boxes.map((box) => box.boxCode)),
      status: '打包中',
      trackingNumber: undefined,
      qrCodeValue: undefined,
      sealedAt: undefined,
      shippedAt: undefined,
      deliveredAt: undefined,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    await boxesRepo.put(next)
    useUiStore.getState().logActivity('克隆了箱子模板', `${current.boxCode} -> ${next.boxCode}`)
    set((state) => ({ boxes: [next, ...state.boxes] }))
    return next
  },
  changeBoxStatus: async (id, status) => {
    const current = get().boxes.find((box) => box.id === id)
    if (!current) throw new Error('箱子不存在')
    if (status === '已寄出') validateShipBox(current)
    const previousStatus = current.status
    const now = nowIso()
    const next: Box = {
      ...current,
      status,
      updatedAt: now,
      qrCodeValue: status === '打包中' ? undefined : generateBoxQrPayload({ boxCode: current.boxCode, destination: current.destination, status, trackingNumber: current.trackingNumber }),
      sealedAt: status === '已封箱' && !current.sealedAt ? now : status === '打包中' ? undefined : current.sealedAt,
      shippedAt: status === '已寄出' && !current.shippedAt ? now : status === '打包中' ? undefined : current.shippedAt,
      deliveredAt: status === '已签收' && !current.deliveredAt ? now : status !== '已签收' ? undefined : current.deliveredAt,
    }
    await boxesRepo.put(next)
    useUiStore.getState().logActivity('更新了箱子状态', `${current.boxCode}：${previousStatus} -> ${status}`)
    useUiStore.getState().setUndoAction({
      label: `撤销状态变更 ${current.boxCode}`,
      run: async () => {
        await boxesRepo.put(current)
        set((state) => ({ boxes: state.boxes.map((box) => (box.id === id ? current : box)) }))
      },
    })
    set((state) => ({ boxes: state.boxes.map((box) => (box.id === id ? next : box)) }))
    return next
  },
  updateLogistics: async (id, payload) => {
    const current = get().boxes.find((box) => box.id === id)
    if (!current) throw new Error('箱子不存在')
    const next: Box = {
      ...current,
      logisticsCompany: payload.logisticsCompany,
      trackingNumber: payload.trackingNumber,
      updatedAt: nowIso(),
      qrCodeValue: current.status === '打包中' ? undefined : generateBoxQrPayload({ boxCode: current.boxCode, destination: current.destination, status: current.status, trackingNumber: payload.trackingNumber }),
    }
    await boxesRepo.put(next)
    useUiStore.getState().logActivity('更新了物流信息', `${current.boxCode} · ${payload.logisticsCompany}`)
    set((state) => ({ boxes: state.boxes.map((box) => (box.id === id ? next : box)) }))
    return next
  },
}))
