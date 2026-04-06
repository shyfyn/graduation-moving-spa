import { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { LoadingBlock } from '../components/feedback/LoadingBlock'

const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ItemsPage = lazy(() => import('../pages/items/ItemsPage').then((module) => ({ default: module.ItemsPage })))
const BoxesPage = lazy(() => import('../pages/boxes/BoxesPage').then((module) => ({ default: module.BoxesPage })))
const BoxDetailPage = lazy(() => import('../pages/boxes/BoxDetailPage').then((module) => ({ default: module.BoxDetailPage })))
const PackingPage = lazy(() => import('../pages/packing/PackingPage').then((module) => ({ default: module.PackingPage })))
const ChecklistPage = lazy(() => import('../pages/checklist/ChecklistPage').then((module) => ({ default: module.ChecklistPage })))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

const withSuspense = (element: React.ReactNode) => ({
  element: <Suspense fallback={<LoadingBlock label="页面加载中..." />}>{element}</Suspense>,
})

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', ...withSuspense(<DashboardPage />) },
      { path: 'items', ...withSuspense(<ItemsPage />) },
      { path: 'boxes', ...withSuspense(<BoxesPage />) },
      { path: 'boxes/:id', ...withSuspense(<BoxDetailPage />) },
      { path: 'packing', ...withSuspense(<PackingPage />) },
      { path: 'checklist', ...withSuspense(<ChecklistPage />) },
      { path: 'settings', ...withSuspense(<SettingsPage />) },
      { path: '*', ...withSuspense(<NotFoundPage />) },
    ],
  },
])
