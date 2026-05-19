export function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function safeWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function safeReadText(key, fallback = '') {
  try {
    const raw = localStorage.getItem(key)
    return raw ?? fallback
  } catch {
    return fallback
  }
}

export function safeWriteText(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}
