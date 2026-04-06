import { STORAGE_KEYS } from '../constants/storage'

export const getLastBackupAt = () => window.localStorage.getItem(STORAGE_KEYS.lastBackupAt)
export const markBackupNow = () => window.localStorage.setItem(STORAGE_KEYS.lastBackupAt, new Date().toISOString())

export const shouldShowBackupReminder = () => {
  const lastBackupAt = getLastBackupAt()
  const lastReminderAt = window.localStorage.getItem(STORAGE_KEYS.lastBackupReminderAt)
  const now = Date.now()
  if (!lastBackupAt) {
    if (!lastReminderAt || now - new Date(lastReminderAt).getTime() > 24 * 60 * 60 * 1000) {
      window.localStorage.setItem(STORAGE_KEYS.lastBackupReminderAt, new Date().toISOString())
      return true
    }
    return false
  }
  const daysSinceBackup = (now - new Date(lastBackupAt).getTime()) / (24 * 60 * 60 * 1000)
  if (daysSinceBackup >= 7 && (!lastReminderAt || now - new Date(lastReminderAt).getTime() > 24 * 60 * 60 * 1000)) {
    window.localStorage.setItem(STORAGE_KEYS.lastBackupReminderAt, new Date().toISOString())
    return true
  }
  return false
}
