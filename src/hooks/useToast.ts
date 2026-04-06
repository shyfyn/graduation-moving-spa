import { useUiStore } from '../store'

export const useToast = () => {
  const pushToast = useUiStore((state) => state.pushToast)
  return {
    success: (message: string) => pushToast(message, 'success'),
    error: (message: string) => pushToast(message, 'error'),
    info: (message: string) => pushToast(message, 'info'),
  }
}
