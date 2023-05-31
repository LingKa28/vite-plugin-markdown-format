import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vitePluginMarkdownFormat from './plugin/vite-plugin-markdown-format'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginMarkdownFormat()],
})
