import React from 'react'
import ReactDOM from 'react-dom/client'
import Store from './Store'
import '../index.css'
import './store.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Store />
  </React.StrictMode>,
)
