import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const isAnalyze = process.env.NODE_ENV === 'production' && process.env.VITE_ANALYZE === 'true';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          const isDev = process.env.NODE_ENV !== 'production';
          if (isDev) {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        },
      }
    }
  },
  build: {
    assetsDir: 'assets',
    // 确保资源使用正确的路径
    assetsInlineLimit: 4096,
    rollupOptions: {
      external: (id) => {
        // Mark Sentry as external since it's optional and may not be installed
        if (id === '@sentry/react' || id.startsWith('@sentry/')) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: (id) => {
          // More granular code splitting for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            // Other vendor chunks
            return 'vendor';
          }
          // Split large pages into separate chunks
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('/')[0];
            if (pageName && ['Builder', 'Interview', 'Dashboard'].includes(pageName)) {
              return `page-${pageName.toLowerCase()}`;
            }
          }
        },
        // 确保使用相对路径，避免绝对路径问题
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500, // Reduced from 1000 to catch more optimization opportunities
    // 确保源映射不会影响生产构建
    sourcemap: false,
    // 使用默认的 esbuild minifier（更快，无需额外依赖）
    minify: 'esbuild',
    // Enable compression
    cssCodeSplit: true,
    // Optimize chunk loading
    target: 'esnext',
    minifyWhitespace: true,
  },
});