import type { ExportPayload } from '../types'

export const downloadJson = (payload: ExportPayload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `graduation-moving-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const readJsonFile = async (file: File) => JSON.parse(await file.text())
