import { AppButton } from './AppButton'
import { AppDialog } from './AppDialog'

export const ConfirmDialog = ({ open, title, description, confirmText = '确认', destructive = false, onCancel, onConfirm }: { open: boolean; title: string; description?: string; confirmText?: string; destructive?: boolean; onCancel: () => void; onConfirm: () => void }) => (
  <AppDialog
    open={open}
    title={title}
    description={description}
    onClose={onCancel}
    footer={
      <div className="flex gap-3">
        <AppButton variant="secondary" fullWidth onClick={onCancel}>
          取消
        </AppButton>
        <AppButton variant={destructive ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>
          {confirmText}
        </AppButton>
      </div>
    }
  />
)
