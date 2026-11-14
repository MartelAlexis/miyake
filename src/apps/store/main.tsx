import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@/features/auth/AuthProvider'
import '@/styles/index.css'
import './store.css'
import StoreApp from './StoreApp'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider><StoreApp /></AuthProvider>
  </React.StrictMode>,
)
