export type HapticPattern = 'success' | 'pack' | 'warning' | 'confirm'

const patterns: Record<HapticPattern, number | number[]> = {
  success: [40, 30, 40],
  pack: 25,
  warning: [20, 40, 20],
  confirm: 50,
}

export const triggerHaptic = (pattern: HapticPattern) => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(patterns[pattern])
}
