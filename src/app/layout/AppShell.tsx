import { Outlet } from 'react-router-dom'
import { MobileTabBar } from './MobileTabBar'
import { PageContainer } from './PageContainer'
import { TopBar } from './TopBar'

export const AppShell = () => (
  <div className="min-h-screen bg-cream bg-paper-grid bg-grid">
    <TopBar />
    <PageContainer>
      <Outlet />
    </PageContainer>
    <MobileTabBar />
  </div>
)
