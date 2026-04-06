import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import type { BoxStatus } from '../../types'

export const BoxStatusActions = ({ status, onPack, onSeal, onShip, onDeliver }: { status: BoxStatus; onPack: () => void; onSeal: () => void; onShip: () => void; onDeliver: () => void }) => (
  <AppCard className="space-y-3">
    <h3 className="text-sm font-semibold text-ink">状态操作</h3>
    <div className="grid grid-cols-2 gap-2">
      <AppButton variant="secondary" onClick={onPack} disabled={status === '打包中'}>恢复打包</AppButton>
      <AppButton variant="secondary" onClick={onSeal} disabled={status !== '打包中'}>封箱</AppButton>
      <AppButton variant="secondary" onClick={onShip} disabled={status !== '已封箱'}>标记已寄出</AppButton>
      <AppButton variant="secondary" onClick={onDeliver} disabled={status !== '已寄出'}>标记已签收</AppButton>
    </div>
  </AppCard>
)
