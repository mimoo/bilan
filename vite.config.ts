import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
const config = {
  plugins: [vue({      reactivityTransform: true  })],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
};

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return config;
  } else {
    return { base: '/bilan/', ...config };
  }
})
