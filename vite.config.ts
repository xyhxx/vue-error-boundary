import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      cleanVueFileName: true,
      exclude: ['**/node_modules/**', '**/dist/**', '**/env.d.ts'],
    }),
  ],
  test: {
    include: ['__tests__/*.test.ts'],
    environment: 'jsdom',
    globals: true,
  },
  build: {
    target: 'esnext',
    lib: {
      entry: './src/index.ts',
      name: 'VueErrorBoundary',
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
