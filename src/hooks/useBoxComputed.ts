import { useMemo } from 'react'
import type { Item } from '../types'
import { getBoxStats } from '../store/selectors'

export const useBoxComputed = (items: Item[], boxId?: string) =>
  useMemo(() => (boxId ? getBoxStats(items, boxId) : { count: 0, totalValue: 0, fragileCount: 0 }), [boxId, items])
