// Vite 설정 및 환경 변수 로드 함수 import
import { defineConfig, loadEnv } from 'vite'
// React SWC 플러그인 import (빠른 컴파일을 위한)
import react from '@vitejs/plugin-react-swc'
// 파일 경로 처리 유틸리티 import
import path from 'path'

export default defineConfig(({ mode }) => {
  // 환경 변수 로드 (프로젝트 루트와 src/frontend 디렉토리에서)
  const env = loadEnv(mode, process.cwd(), '') // 프로젝트 루트의 환경 변수
  const frontendEnv = loadEnv(
    mode,
    path.resolve(process.cwd(), 'src/frontend'), // 프론트엔드 전용 환경 변수
    ''
  )

  // 환경 변수 병합 (frontend가 우선순위를 가짐)
  const mergedEnv = { ...env, ...frontendEnv }

  // NODE_ENV를 Vite 설정에서 직접 설정하여 경고 방지
  if (mode === 'production') {
    process.env.NODE_ENV = 'production'
    // production 환경에서는 .env.production 파일 로드
    if (
      mergedEnv.VITE_BACKEND_URL &&
      mergedEnv.VITE_BACKEND_URL.includes('localhost')
    ) {
      console.warn(
        '⚠️ Production mode detected but using localhost backend URL'
      )
    }
  }

  return {
    // Vite 플러그인 설정
    plugins: [react()], // React SWC 플러그인 활성화

    // 개발 서버 설정 (개발 환경에서만 활성화)
    server:
      mode === 'development'
        ? {
            port: process.env.FRONTEND_PORT
              ? parseInt(process.env.FRONTEND_PORT)
              : 5173,
            host: true,
            strictPort: false,
            proxy: {
              '/api': {
                target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: path => path.replace(/^\/api/, '/api'),
              },
            },
          }
        : undefined,

    // 에셋 포함 설정
    assetsInclude: ['*.mp4'], // MP4 파일을 에셋으로 포함

    // 의존성 최적화 설정
    optimizeDeps: {
      exclude: ['*.mp4'], // MP4 파일은 최적화에서 제외
      include: [
        // 사전 번들링할 라이브러리들
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
      ],
      force: true, // 의존성 강제 재번들링
    },

    // 모듈 해석 설정
    resolve: {
      alias: {
        // 경로 별칭 설정 (절대 경로 사용 가능)
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

    // 빌드 설정
    build: {
      rollupOptions: {
        // Rollup 번들러 설정
        input: {
          main: path.resolve(__dirname, 'index.html'), // 진입점 HTML 파일
        },
        output: {
          // 청크 분할 최적화 - 순환 import 방지를 위해 기본 청킹 사용
          // manualChunks: undefined, // 기본 Vite 청킹 사용

          // 청크 파일명 최적화 - 캐싱을 위한 해시 포함
          chunkFileNames: chunkInfo => {
            return `js/[name]-[hash].js`
          },

          // 에셋 파일명 최적화 - 파일 타입별로 다른 디렉토리에 저장
          assetFileNames: assetInfo => {
            if (!assetInfo.name) return `assets/[name]-[hash].[ext]`

            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1] // 파일 확장자

            // 미디어 파일 (비디오, 오디오)
            if (
              /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
            ) {
              return `media/[name]-[hash].[ext]`
            }

            // 이미지 파일
            if (
              /\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)
            ) {
              return `img/[name]-[hash].[ext]`
            }

            // 폰트 파일
            if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              return `fonts/[name]-[hash].[ext]`
            }

            // CSS 파일
            if (/\.css$/i.test(assetInfo.name)) {
              return `css/[name]-[hash].[ext]`
            }

            // 기타 에셋
            return `assets/[name]-[hash].[ext]`
          },
        },
      },

      outDir: 'dist/frontend', // 프론트엔드 전용 출력 디렉토리
      emptyOutDir: true, // 빌드 전 출력 디렉토리 비우기

      // 번들 크기 최적화 설정
      minify: mode === 'production' ? 'terser' : false, // 개발에서는 압축 비활성화
      terserOptions:
        mode === 'production'
          ? {
              compress: {
                drop_console: true, // 프로덕션에서 console.log 제거
                drop_debugger: true, // 프로덕션에서 debugger 제거
                pure_funcs: ['console.log', 'console.info', 'console.debug'], // 특정 함수 제거
              },
              mangle: {
                safari10: true, // Safari 10 호환성
              },
              format: {
                comments: false, // 주석 제거
              },
            }
          : undefined,

      // 소스맵 설정 - 개발에서는 활성화, 프로덕션에서는 비활성화
      sourcemap: mode === 'development',

      // 청크 크기 경고 임계값 (KB 단위)
      chunkSizeWarningLimit: 1000,

      // 빌드 타겟 설정
      target: 'esnext',

      // CSS 코드 분할
      cssCodeSplit: true,

      // 에셋 인라인 임계값 (4KB 미만은 인라인)
      assetsInlineLimit: 4096,
    },

    // ESBuild 설정
    esbuild: {
      exclude: ['**/*.js', '**/*.jsx'], // JS/JSX 파일은 ESBuild에서 제외
    },

    // 환경 변수 정의 - 클라이언트에서 사용할 수 있도록
    define: {
      // 카카오맵 API 키들
      'import.meta.env.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY': JSON.stringify(
        mergedEnv.VITE_LOCATION_JAVASCRIPT_MAP_API_KEY
      ),
      'import.meta.env.VITE_LOCATION_REST_MAP_API_KEY': JSON.stringify(
        mergedEnv.VITE_LOCATION_REST_MAP_API_KEY
      ),

      // 헬스장 API 키
      'import.meta.env.VITE_GYM_API_KEY': JSON.stringify(
        mergedEnv.VITE_GYM_API_KEY
      ),

      // 백엔드 URL
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
        mergedEnv.VITE_BACKEND_URL
      ),

      // reCAPTCHA 사이트 키
      'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(
        mergedEnv.VITE_RECAPTCHA_SITE_KEY
      ),
    },
  }
})
