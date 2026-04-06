import { Outlet } from 'react-router-dom'
import { MobileTabBar } from './MobileTabBar'
import { PageContainer } from './PageContainer'
import { TopBar } from './TopBar'

export const AppShell = () => (
  <div className="min-h-screen bg-shell-radial">
    <div className="mx-auto min-h-screen max-w-3xl px-0 md:px-4">
      <TopBar />
      <PageContainer>
        <Outlet />
      </PageContainer>
      <MobileTabBar />
    </div>
  </div>
)
