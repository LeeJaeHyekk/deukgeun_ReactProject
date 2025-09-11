/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/frontend/shared/utils/testSetup.ts'],
    css: true,
    typecheck: {
      tsconfig: './tsconfig.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/frontend/shared/utils/testSetup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/mocks/**',
        '**/testUtils.*',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    teardownTimeout: 5000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@frontend': path.resolve(__dirname, './src/frontend'),
      '@backend': path.resolve(__dirname, './src/backend'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@pages': path.resolve(__dirname, './src/frontend/pages'),
      '@widgets': path.resolve(__dirname, './src/frontend/widgets'),
      '@features': path.resolve(__dirname, './src/frontend/features'),
      '@entities': path.resolve(__dirname, './src/frontend/entities'),
      '@assets': path.resolve(__dirname, './src/frontend/assets'),
      '@components': path.resolve(
        __dirname,
        './src/frontend/shared/components'
      ),
      '@hooks': path.resolve(__dirname, './src/frontend/shared/hooks'),
      '@utils': path.resolve(__dirname, './src/frontend/shared/utils'),
      '@types': path.resolve(__dirname, './src/shared/types'),
      '@constants': path.resolve(__dirname, './src/shared/constants'),
      '@validation': path.resolve(__dirname, './src/shared/validation'),
      '@api': path.resolve(__dirname, './src/shared/api'),
      '@dto': path.resolve(__dirname, './src/shared/types/dto'),
    },
  },
})
