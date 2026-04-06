import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BOX_DESTINATIONS, BOX_STATUSES, LOGISTICS_COMPANIES } from '../../constants/enums'
import { boxSchema, logisticsSchema, type BoxFormValues, type LogisticsFormValues } from '../../schemas/boxSchema'
import { AppButton } from '../common/AppButton'
import { AppInput } from '../common/AppInput'
import { AppSelect } from '../common/AppSelect'

export const BoxForm = ({ defaultValues, onSubmit, submitText = '保存' }: { defaultValues?: Partial<BoxFormValues>; onSubmit: (values: BoxFormValues) => void | Promise<void>; submitText?: string }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema) as never,
    defaultValues: { boxCode: '', destination: '北京-亦庄', status: '打包中', ...defaultValues },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">箱号</label>
        <AppInput {...register('boxCode')} placeholder="例如：BJ-YZ-001" />
        {errors.boxCode ? <p className="text-xs text-rose-600">{errors.boxCode.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">目的地</label>
          <AppSelect {...register('destination')}>
            {BOX_DESTINATIONS.map((option) => <option key={option}>{option}</option>)}
          </AppSelect>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">状态</label>
          <AppSelect {...register('status')}>
            {BOX_STATUSES.map((option) => <option key={option}>{option}</option>)}
          </AppSelect>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">重量 (kg)</label>
        <AppInput type="number" step="0.1" min={0} {...register('weight')} />
        {errors.weight ? <p className="text-xs text-rose-600">{errors.weight.message}</p> : null}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">备注</label>
        <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" {...register('notes')} />
      </div>
      <AppButton fullWidth type="submit" disabled={isSubmitting}>{submitText}</AppButton>
    </form>
  )
}

export const LogisticsForm = ({ defaultValues, onSubmit }: { defaultValues?: Partial<LogisticsFormValues>; onSubmit: (values: LogisticsFormValues) => void | Promise<void> }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LogisticsFormValues>({
    resolver: zodResolver(logisticsSchema) as never,
    defaultValues: { logisticsCompany: '顺丰', trackingNumber: '', ...defaultValues },
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">物流公司</label>
        <AppSelect {...register('logisticsCompany')}>
          {LOGISTICS_COMPANIES.map((option) => <option key={option}>{option}</option>)}
        </AppSelect>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">物流单号</label>
        <AppInput {...register('trackingNumber')} placeholder="请输入物流单号" />
        {errors.trackingNumber ? <p className="text-xs text-rose-600">{errors.trackingNumber.message}</p> : null}
      </div>
      <AppButton fullWidth type="submit" disabled={isSubmitting}>保存物流信息</AppButton>
    </form>
  )
}
