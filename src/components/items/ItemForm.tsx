import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ITEM_CATEGORIES, ITEM_DESTINATIONS, ITEM_STATUSES } from '../../constants/enums'
import { itemSchema, type ItemFormValues } from '../../schemas/itemSchema'
import { AppButton } from '../common/AppButton'
import { AppInput } from '../common/AppInput'
import { AppSelect } from '../common/AppSelect'

export const ItemForm = ({ defaultValues, onSubmit, submitText = '保存' }: { defaultValues?: Partial<ItemFormValues>; onSubmit: (values: ItemFormValues) => void | Promise<void>; submitText?: string }) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema) as never,
    defaultValues: {
      name: '',
      category: '生活用品',
      destination: '北京-亦庄',
      status: '未处理',
      quantity: 1,
      isFragile: false,
      ...defaultValues,
    },
  })

  const destination = watch('destination')

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">物品名称</label>
        <AppInput {...register('name')} placeholder="例如：冬季衣物" />
        {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">分类</label>
          <AppSelect {...register('category')}>
            {ITEM_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
          </AppSelect>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">状态</label>
          <AppSelect {...register('status')}>
            {ITEM_STATUSES.map((option) => <option key={option}>{option}</option>)}
          </AppSelect>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">目的地</label>
        <AppSelect {...register('destination')}>
          {ITEM_DESTINATIONS.map((option) => <option key={option}>{option}</option>)}
        </AppSelect>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">数量</label>
          <AppInput type="number" min={1} {...register('quantity')} />
          {errors.quantity ? <p className="text-xs text-rose-600">{errors.quantity.message}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">估值</label>
          <AppInput type="number" min={0} step="1" {...register('estimatedValue')} />
          {errors.estimatedValue ? <p className="text-xs text-rose-600">{errors.estimatedValue.message}</p> : null}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">备注</label>
        <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" {...register('notes')} placeholder="可记录打包提醒、特殊说明" />
      </div>
      <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <input type="checkbox" {...register('isFragile')} />
        易碎物品
      </label>
      {['随身携带', '二手转卖', '丢弃/赠送'].includes(destination) ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">当前目的地不允许装箱，保存后 `boxId` 会保持为空。</p> : null}
      <AppButton fullWidth type="submit" disabled={isSubmitting}>{submitText}</AppButton>
    </form>
  )
}
