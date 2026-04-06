import { useMemo } from 'react'
import type { Item } from '../types'
import type { ItemFilters } from '../types/filters'

export const useFilteredItems = (items: Item[], filters: ItemFilters) =>
  useMemo(
    () => items.filter((item) => {
      const matchesDestination = filters.destination === '全部' || item.destination === filters.destination
      const matchesStatus = filters.status === '全部' || item.status === filters.status
      const matchesCategory = filters.category === '全部' || item.category === filters.category
      const matchesKeyword = !filters.keyword.trim() || item.name.toLowerCase().includes(filters.keyword.trim().toLowerCase())
      return matchesDestination && matchesStatus && matchesCategory && matchesKeyword
    }),
    [filters, items],
  )
