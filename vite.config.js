import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path must match your GitHub repository name
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/toefl/',
})
