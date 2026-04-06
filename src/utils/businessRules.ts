import type { Box, Item } from '../types'

const boxEligibleDestinations = ['北京-亦庄', '老家-朝阳'] as const

export const canItemBeBoxed = (item: Pick<Item, 'destination'>) =>
  boxEligibleDestinations.includes(item.destination as (typeof boxEligibleDestinations)[number])

export const validateBoxableItem = (item: Item) => {
  if (!canItemBeBoxed(item)) {
    throw new Error('该物品目的地不允许装箱')
  }
}

export const validateItemForBox = (item: Item, box: Box) => {
  validateBoxableItem(item)
  if (item.boxId) throw new Error('物品已经在其它箱子中')
  if (item.destination !== box.destination) throw new Error('箱子目的地与物品目的地不一致')
  if (box.status !== '打包中') throw new Error('只有打包中的箱子可以继续装箱')
}

export const validateItemDestinationRules = (item: Pick<Item, 'destination' | 'boxId'>) => {
  if (!canItemBeBoxed(item) && item.boxId) throw new Error('该目的地的物品不能装箱')
}

export const ensureBoxCanMutateItems = (box: Box) => {
  if (box.status !== '打包中') throw new Error('当前箱子状态不允许修改箱内物品')
}

export const validateShipBox = (box: Pick<Box, 'logisticsCompany' | 'trackingNumber'>) => {
  if (!box.logisticsCompany || !box.trackingNumber?.trim()) throw new Error('箱子寄出前必须填写物流公司和物流单号')
}

export const ensureBoxCanDelete = (itemCount: number) => {
  if (itemCount > 0) throw new Error('箱内还有物品，不能删除')
}
