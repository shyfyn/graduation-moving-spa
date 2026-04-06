import type { Box, Item } from '../types'

export const getBoxItems = (items: Item[], boxId: string) => items.filter((item) => item.boxId === boxId)

export const getBoxStats = (items: Item[], boxId: string) => {
  const boxItems = getBoxItems(items, boxId)
  return {
    count: boxItems.length,
    totalValue: boxItems.reduce((sum, item) => sum + (item.estimatedValue ?? 0) * (item.quantity ?? 1), 0),
    fragileCount: boxItems.filter((item) => item.isFragile).length,
  }
}

export const getInTransitBoxes = (boxes: Box[]) => boxes.filter((box) => box.status === '已寄出')
export const getDeliveredBoxes = (boxes: Box[]) => boxes.filter((box) => box.status === '已签收')
