import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider, RequireStaff } from '@/features/auth/AuthProvider'
import { LoginPage } from '@/features/auth/LoginPage'
import { NoAccess } from '@/features/auth/NoAccess'
import '@/styles/index.css'
import './admin.css'
import AdminApp from './AdminApp'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RequireStaff login={<LoginPage />} denied={<NoAccess />}><AdminApp /></RequireStaff>
    </AuthProvider>
  </React.StrictMode>,
)
