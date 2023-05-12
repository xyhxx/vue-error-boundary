import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import {resolve} from 'path';

export default defineConfig(function ({mode}) {
  const m = mode as 'es' | 'umd';

  const plugins = [vue()];

  m === 'es' &&
    plugins.push(
      dts({
        cleanVueFileName: true,
        exclude: ['**/node_modules/**', '**/dist/**', '**/env.d.ts'],
      }),
    );

  let define: Record<string, any>;
  if (m === 'es') {
    define = {
      __DEV__: `(process.env.NODE_ENV !== 'production')`,
    };
  } else {
    define = {
      __DEV__: false,
    };
  }

  return {
    plugins,
    define,
    test: {
      coverage: {
        include: ['src'],
        exclude: ['src/utils/*'],
      },
      include: ['__tests__/*.test.ts'],
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        '@src': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@hooks': resolve(__dirname, 'src/hooks'),
      },
    },
    optimizeDeps: {
      exclude: ['vue-demi'],
    },
    publicDir: false,
    build: {
      emptyOutDir: m === 'umd',
      target: 'esnext',
      lib: {
        entry: './src/index.ts',
        formats: [m],
        name: 'VueErrorBoundary',
        fileName: format => `index.${format}.js`,
      },
      rollupOptions: {
        external: ['vue', '@vue/devtools-api', 'vue-demi'],
        output: {
          globals: {
            vue: 'Vue',
            '@vue/devtools-api': 'VueDevtoolsApi',
            'vue-demi': 'VueDemi',
          },
        },
      },
    },
  };
});
