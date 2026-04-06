import type { BOX_DESTINATIONS, BOX_STATUSES, ITEM_CATEGORIES, ITEM_DESTINATIONS, ITEM_STATUSES, LOGISTICS_COMPANIES } from '../constants/enums'

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]
export type ItemDestination = (typeof ITEM_DESTINATIONS)[number]
export type ItemStatus = (typeof ITEM_STATUSES)[number]
export type BoxDestination = (typeof BOX_DESTINATIONS)[number]
export type BoxStatus = (typeof BOX_STATUSES)[number]
export type LogisticsCompany = (typeof LOGISTICS_COMPANIES)[number]

export type Item = {
  id: string
  name: string
  category: ItemCategory
  destination: ItemDestination
  status: ItemStatus
  boxId: string | null
  estimatedValue?: number
  notes?: string
  createdAt: string
  updatedAt: string
  isFragile?: boolean
  quantity?: number
}

export type Box = {
  id: string
  boxCode: string
  destination: BoxDestination
  status: BoxStatus
  weight?: number
  logisticsCompany?: LogisticsCompany
  trackingNumber?: string
  notes?: string
  qrCodeValue?: string
  createdAt: string
  updatedAt: string
  sealedAt?: string
  shippedAt?: string
  deliveredAt?: string
}

export type ChecklistItem = {
  id: string
  name: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export type ExportPayload = {
  version: string
  exportedAt: string
  items: Item[]
  boxes: Box[]
  checklist: ChecklistItem[]
}
