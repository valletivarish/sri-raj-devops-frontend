import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './context/AuthContext.jsx'
import ThemeProvider from './context/ThemeContext.jsx'
import './styles/theme.css'
import App from './App'
import Home from './pages/Home.jsx'
import ItemDetail from './pages/ItemDetail.jsx'
import CreateItem from './pages/CreateItem.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import UserLayout from './layouts/UserLayout.jsx'
import AdminOverview from './pages/admin/Overview.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminItems from './pages/admin/Items.jsx'
import AdminReports from './pages/admin/Reports.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import UserDashboard from './pages/user/Dashboard.jsx'
import UserMyItems from './pages/user/MyItems.jsx'
import UserAddItem from './pages/user/AddItem.jsx'
import UserMyReports from './pages/user/MyReports.jsx'
import UserProfile from './pages/user/Profile.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'items/:id', element: <ItemDetail /> },
      { path: 'create', element: <CreateItem /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverview /> },
          { path: 'dashboard', element: <AdminOverview /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'items', element: <AdminItems /> },
          { path: 'reports', element: <AdminReports /> },
          { path: 'settings', element: <AdminSettings /> },
        ]
      },
      {
        path: 'user',
        element: <UserLayout />,
        children: [
          { index: true, element: <UserDashboard /> },
          { path: 'dashboard', element: <UserDashboard /> },
          { path: 'items', element: <UserMyItems /> },
          { path: 'add-item', element: <UserAddItem /> },
          { path: 'reports', element: <UserMyReports /> },
          { path: 'profile', element: <UserProfile /> },
        ]
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster
        position="top-right"
        containerStyle={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#111827',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'inherit',
          },
          success: {
            iconTheme: {
              primary: '#0B6E4F',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF6B35',
              secondary: '#fff',
            },
          },
        }}
      />
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)


