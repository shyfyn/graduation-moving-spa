import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { ItemsPage } from '../pages/items/ItemsPage'
import { BoxesPage } from '../pages/boxes/BoxesPage'
import { BoxDetailPage } from '../pages/boxes/BoxDetailPage'
import { PackingPage } from '../pages/packing/PackingPage'
import { ChecklistPage } from '../pages/checklist/ChecklistPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'items', element: <ItemsPage /> },
      { path: 'boxes', element: <BoxesPage /> },
      { path: 'boxes/:id', element: <BoxDetailPage /> },
      { path: 'packing', element: <PackingPage /> },
      { path: 'checklist', element: <ChecklistPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
