import { z } from 'zod'
import { BOX_DESTINATIONS, BOX_STATUSES, LOGISTICS_COMPANIES } from '../constants/enums'

export const boxSchema = z.object({
  boxCode: z.string().trim().min(1, '请输入箱号'),
  destination: z.enum(BOX_DESTINATIONS),
  status: z.enum(BOX_STATUSES),
  weight: z.coerce.number().optional().refine((value) => value === undefined || (!Number.isNaN(value) && value >= 0), '重量不能为负'),
  logisticsCompany: z.enum(LOGISTICS_COMPANIES).optional(),
  trackingNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export const logisticsSchema = z.object({
  logisticsCompany: z.enum(LOGISTICS_COMPANIES),
  trackingNumber: z.string().trim().min(1, '请输入物流单号'),
})

export type BoxFormValues = z.infer<typeof boxSchema>
export type LogisticsFormValues = z.infer<typeof logisticsSchema>
