import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Lets you open the dev server from your phone at http://<seu-ip-local>:5173
    // while testing on the same Wi-Fi, without any extra setup.
    host: true,
  },
})
