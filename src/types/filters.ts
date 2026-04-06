import type { ItemCategory, ItemDestination, ItemStatus } from './index'

export type ItemFilters = {
  destination: ItemDestination | '全部'
  status: ItemStatus | '全部'
  category: ItemCategory | '全部'
  keyword: string
  pendingOnly: boolean
  sortBy: 'updated_desc' | 'updated_asc' | 'name_asc' | 'value_desc'
}
