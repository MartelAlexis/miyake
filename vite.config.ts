import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Dos aplicaciones en un mismo proyecto:
//   /            -> tienda online  (index.html)
//   /admin.html  -> GesCOM admin   (admin.html)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      input: {
        tienda: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
})
