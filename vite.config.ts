import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for better debugging without performance impact
    sourcemap: false,
    // Use esbuild for minification (built into Vite, no extra dependency needed)
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Aggressive code splitting for optimal caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            return 'vendor';
          }
          
          // Dashboard components by feature
          if (id.includes('/components/dashboard/')) {
            if (id.includes('Sales') || id.includes('Revenue')) {
              return 'dashboard-sales';
            }
            if (id.includes('Client') || id.includes('Conversion')) {
              return 'dashboard-clients';
            }
            if (id.includes('Trainer') || id.includes('Performance')) {
              return 'dashboard-trainers';
            }
            if (id.includes('Class') || id.includes('Session')) {
              return 'dashboard-classes';
            }
            if (id.includes('Discount') || id.includes('Promotion')) {
              return 'dashboard-discounts';
            }
            if (id.includes('PowerCycle') || id.includes('Barre') || id.includes('Strength')) {
              return 'dashboard-formats';
            }
            if (id.includes('Funnel') || id.includes('Lead')) {
              return 'dashboard-funnel';
            }
            if (id.includes('Executive') || id.includes('Summary')) {
              return 'dashboard-executive';
            }
            return 'dashboard-misc';
          }
          
          // UI components
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          
          // Pages
          if (id.includes('/pages/')) {
            return 'pages';
          }
          
          // Hooks and utilities
          if (id.includes('/hooks/') || id.includes('/utils/')) {
            return 'utils';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          return `assets/${name}-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // External dependencies that should not be bundled
      external: (id) => {
        // Keep all dependencies bundled for better performance in production
        return false;
      }
    },
    // Optimize chunk size limits
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: true,
    // Target modern browsers for better performance
    target: 'esnext',
  },
  // Enhanced performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'date-fns',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@tanstack/react-query'
    ],
    // Force optimization of these deps
    force: true,
  },
  // Enable experimental features for better performance
  esbuild: {
    // Drop console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Enable tree shaking
    treeShaking: true,
  }
}));
