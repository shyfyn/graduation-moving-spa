import { ToastProvider } from '../components/feedback/ToastProvider'
import { useInitApp } from '../hooks/useInitApp'

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  useInitApp()

  return (
    <>
      {children}
      <ToastProvider />
    </>
  )
}
