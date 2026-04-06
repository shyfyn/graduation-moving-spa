import { useMemo } from 'react'
import type { Item } from '../types'
import type { ItemFilters } from '../types/filters'

export const useFilteredItems = (items: Item[], filters: ItemFilters) =>
  useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesDestination = filters.destination === '全部' || item.destination === filters.destination
      const matchesStatus = filters.status === '全部' || item.status === filters.status
      const matchesCategory = filters.category === '全部' || item.category === filters.category
      const matchesPendingOnly = !filters.pendingOnly || item.status === '未处理'
      const matchesKeyword = !filters.keyword.trim() || item.name.toLowerCase().includes(filters.keyword.trim().toLowerCase())
      return matchesDestination && matchesStatus && matchesCategory && matchesPendingOnly && matchesKeyword
    })

    return [...filtered].sort((left, right) => {
      switch (filters.sortBy) {
        case 'updated_asc':
          return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()
        case 'name_asc':
          return left.name.localeCompare(right.name, 'zh-CN')
        case 'value_desc':
          return (right.estimatedValue ?? 0) - (left.estimatedValue ?? 0)
        case 'updated_desc':
        default:
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      }
    })
  }, [filters, items])
