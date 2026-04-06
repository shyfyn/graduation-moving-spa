import { STORAGE_KEYS } from '../constants/storage'
import type { ItemFormValues } from '../schemas/itemSchema'

export const getItemFormDefaults = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.itemFormDefaults)
    if (!raw) return null
    return JSON.parse(raw) as Partial<ItemFormValues>
  } catch {
    return null
  }
}

export const setItemFormDefaults = (payload: Partial<ItemFormValues>) => {
  window.localStorage.setItem(STORAGE_KEYS.itemFormDefaults, JSON.stringify(payload))
}

export const getLastPackingBoxId = () => window.localStorage.getItem(STORAGE_KEYS.lastPackingBoxId) ?? ''
export const setLastPackingBoxId = (boxId: string) => window.localStorage.setItem(STORAGE_KEYS.lastPackingBoxId, boxId)
