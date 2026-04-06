import type { BoxDestination, BoxStatus } from '../types'

export const nowIso = () => new Date().toISOString()
export const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`
export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
export const currency = (value?: number) => `¥${(value ?? 0).toFixed(0)}`

export const formatDateTime = (value?: string) => {
  if (!value) return '--'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export const generateBoxQrPayload = (payload: {
  boxCode: string
  destination: BoxDestination
  status: BoxStatus
  trackingNumber?: string
}) => `BOX:${payload.boxCode}|DEST:${payload.destination}|STATUS:${payload.status}|TRACK:${payload.trackingNumber ?? '-'}`
