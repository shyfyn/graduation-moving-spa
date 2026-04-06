import { useEffect, useState } from 'react'
import ReactQRCode from 'react-qr-code'
import { Copy, Download } from 'lucide-react'
import { AppCard } from '../common/AppCard'
import { AppButton } from '../common/AppButton'
import { createQrDataUrl } from '../../utils/qrcode'

export const QRCodePanel = ({ value, onCopy }: { value?: string; onCopy: () => void }) => {
  const [downloadUrl, setDownloadUrl] = useState('')

  useEffect(() => {
    if (!value) return
    void createQrDataUrl(value).then(setDownloadUrl)
  }, [value])

  if (!value) return null

  return (
    <AppCard className="space-y-4">
      <h3 className="text-sm font-semibold text-ink">封箱二维码</h3>
      <div className="rounded-2xl bg-white p-4">
        <ReactQRCode value={value} className="mx-auto h-40 w-40" />
      </div>
      <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 break-all">{value}</div>
      <div className="flex gap-2">
        <AppButton variant="secondary" fullWidth onClick={onCopy}><Copy className="mr-1 size-4" />复制内容</AppButton>
        <AppButton variant="ghost" fullWidth onClick={() => downloadUrl && window.open(downloadUrl, '_blank')}><Download className="mr-1 size-4" />打开二维码</AppButton>
      </div>
    </AppCard>
  )
}
