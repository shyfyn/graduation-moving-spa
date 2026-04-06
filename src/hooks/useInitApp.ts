import { useEffect } from 'react'
import { demoBoxes, demoChecklist, demoItems } from '../constants/demoData'
import { boxesRepo } from '../db/repositories/boxesRepo'
import { checklistRepo } from '../db/repositories/checklistRepo'
import { itemsRepo } from '../db/repositories/itemsRepo'
import { useBoxesStore, useChecklistStore, useItemsStore } from '../store'

export const useInitApp = () => {
  const setItems = useItemsStore((state) => state.setItems)
  const setBoxes = useBoxesStore((state) => state.setBoxes)
  const setChecklist = useChecklistStore((state) => state.setChecklist)

  useEffect(() => {
    const init = async () => {
      let [items, boxes, checklist] = await Promise.all([itemsRepo.list(), boxesRepo.list(), checklistRepo.list()])
      if (!items.length && !boxes.length && !checklist.length) {
        await Promise.all([itemsRepo.bulkPut(demoItems), boxesRepo.bulkPut(demoBoxes), checklistRepo.bulkPut(demoChecklist)])
        items = demoItems
        boxes = demoBoxes
        checklist = demoChecklist
      }
      setItems(items)
      setBoxes(boxes)
      setChecklist(checklist)
    }

    void init()
  }, [setBoxes, setChecklist, setItems])
}
