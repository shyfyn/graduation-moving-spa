import { useEffect } from 'react'
import { ToastProvider } from '../components/feedback/ToastProvider'
import { UndoBar } from '../components/feedback/UndoBar'
import { useInitApp } from '../hooks/useInitApp'
import { useToast } from '../hooks/useToast'
import { shouldShowBackupReminder } from '../utils/backup'

const BackupReminder = () => {
  const toast = useToast()

  useEffect(() => {
    if (shouldShowBackupReminder()) {
      toast.info('建议尽快到设置页导出一次 JSON 备份，避免浏览器数据丢失。')
    }
  }, [toast])

  return null
}

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  useInitApp()

  return (
    <>
      {children}
      <BackupReminder />
      <UndoBar />
      <ToastProvider />
    </>
  )
}
