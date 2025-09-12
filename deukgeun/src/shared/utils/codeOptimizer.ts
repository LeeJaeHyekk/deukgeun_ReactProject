// ============================================================================
// 코드 최적화 유틸리티
// 번들 크기 최적화, 트리 쉐이킹, 코드 분할 등을 위한 도구들
// ============================================================================

import React from 'react'

// 동적 임포트 헬퍼
export const dynamicImport = <T = any>(
  importFunction: () => Promise<{ default: T }>
): Promise<T> => {
  return importFunction().then(module => module.default)
}

// 조건부 임포트
export const conditionalImport = <T = any>(
  condition: boolean,
  importFunction: () => Promise<{ default: T }>,
  fallback: T
): Promise<T> => {
  if (condition) {
    return dynamicImport(importFunction)
  }
  return Promise.resolve(fallback)
}

// 지연 로딩 컴포넌트 래퍼
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return React.lazy(importFunction)
}

// 번들 분석 유틸리티
export const analyzeBundle = (bundleStats: any) => {
  const chunks: Array<{
    name: string
    size: number
    gzippedSize: number
    dependencies: string[]
  }> = []

  let totalSize = 0
  let totalGzippedSize = 0

  if (bundleStats.chunks) {
    bundleStats.chunks.forEach((chunk: any) => {
      const size = chunk.size || 0
      const gzippedSize = Math.round(size * 0.3) // 대략적인 gzip 압축률

      chunks.push({
        name: chunk.name || 'unknown',
        size,
        gzippedSize,
        dependencies: chunk.modules?.map((mod: any) => mod.name) || [],
      })

      totalSize += size
      totalGzippedSize += gzippedSize
    })
  }

  const recommendations: string[] = []

  // 번들 크기 권장사항
  if (totalSize > 1024 * 1024) {
    recommendations.push(
      '번들 크기가 1MB를 초과합니다. 코드 분할을 고려하세요.'
    )
  }

  // 큰 청크 권장사항
  const largeChunks = chunks.filter(chunk => chunk.size > 500 * 1024)
  if (largeChunks.length > 0) {
    recommendations.push(
      `큰 청크가 ${largeChunks.length}개 있습니다: ${largeChunks.map(c => c.name).join(', ')}`
    )
  }

  // 중복 의존성 권장사항
  const duplicateDeps = findDuplicateDependencies(chunks)
  if (duplicateDeps.length > 0) {
    recommendations.push(
      `중복 의존성이 발견되었습니다: ${duplicateDeps.join(', ')}`
    )
  }

  return {
    chunks,
    totalSize,
    totalGzippedSize,
    recommendations,
    stats: {
      chunkCount: chunks.length,
      averageChunkSize: totalSize / chunks.length,
      largestChunk: chunks.reduce(
        (max, chunk) => (chunk.size > max.size ? chunk : max),
        chunks[0] || { size: 0, name: '' }
      ),
    },
  }
}

// 중복 의존성 찾기
const findDuplicateDependencies = (
  chunks: Array<{ dependencies: string[] }>
): string[] => {
  const allDeps = chunks.flatMap(chunk => chunk.dependencies)
  const depCount = allDeps.reduce(
    (acc, dep) => {
      acc[dep] = (acc[dep] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return Object.entries(depCount)
    .filter(([_, count]) => count > 1)
    .map(([dep, _]) => dep)
}

// 코드 분할 전략
export const createCodeSplittingStrategy = () => {
  return {
    // 라우트 기반 분할
    routeBased: (
      routes: Array<{ path: string; component: () => Promise<any> }>
    ) => {
      return routes.map(route => ({
        ...route,
        component: React.lazy(route.component),
      }))
    },

    // 기능 기반 분할
    featureBased: (
      features: Array<{ name: string; import: () => Promise<any> }>
    ) => {
      return features.reduce(
        (acc, feature) => {
          acc[feature.name] = React.lazy(feature.import)
          return acc
        },
        {} as Record<string, React.LazyExoticComponent<any>>
      )
    },

    // 컴포넌트 기반 분할
    componentBased: (
      components: Array<{ name: string; import: () => Promise<any> }>
    ) => {
      return components.reduce(
        (acc, component) => {
          acc[component.name] = React.lazy(component.import)
          return acc
        },
        {} as Record<string, React.LazyExoticComponent<any>>
      )
    },
  }
}

// 트리 쉐이킹 최적화
export const optimizeTreeShaking = {
  // 사용하지 않는 export 제거
  removeUnusedExports: (exports: string[], usedExports: string[]) => {
    return exports.filter(exportName => usedExports.includes(exportName))
  },

  // 사이드 이펙트 없는 모듈 마킹
  markSideEffectFree: (modules: string[]) => {
    return modules.map(module => ({
      module,
      sideEffects: false,
    }))
  },

  // 네임스페이스 임포트 최적화
  optimizeNamespaceImports: (
    imports: Array<{ from: string; imports: string[] }>
  ) => {
    return imports.map(imp => ({
      ...imp,
      // 네임스페이스 임포트를 개별 임포트로 변환
      optimized: imp.imports.map(
        name => `import { ${name} } from '${imp.from}'`
      ),
    }))
  },
}

// 메모리 사용량 최적화
export const optimizeMemoryUsage = {
  // 객체 풀링
  createObjectPool: <T>(factory: () => T, maxSize = 100) => {
    const pool: T[] = []
    let currentSize = 0

    return {
      acquire: (): T => {
        if (pool.length > 0) {
          return pool.pop()!
        }
        return factory()
      },
      release: (obj: T): void => {
        if (currentSize < maxSize) {
          pool.push(obj)
          currentSize++
        }
      },
      clear: (): void => {
        pool.length = 0
        currentSize = 0
      },
      size: (): number => pool.length,
    }
  },

  // 약한 참조 캐시
  createWeakCache: <K extends object, V>() => {
    const cache = new WeakMap<K, V>()

    return {
      get: (key: K): V | undefined => cache.get(key),
      set: (key: K, value: V): void => {
        cache.set(key, value)
      },
      has: (key: K): boolean => cache.has(key),
      delete: (key: K): boolean => cache.delete(key),
    }
  },

  // 메모리 누수 감지
  detectMemoryLeaks: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      }
    }
    return null
  },
}

// 성능 최적화 도구
export const performanceOptimizer = {
  // 함수 메모이제이션
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map()

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)

      if (cache.has(key)) {
        return cache.get(key)
      }

      const result = fn(...args)
      cache.set(key, result)
      return result
    }) as T
  },

  // 디바운싱
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout

    return ((...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  },

  // 스로틀링
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean

    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }) as T
  },

  // 배치 처리
  batch: <T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => void
  ) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      processor(batch)
    }
  },
}

// 번들 최적화 설정
export const bundleOptimizationConfig = {
  // Vite 설정
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['lodash', 'date-fns'],
          },
        },
      },
    },
  },

  // Webpack 설정
  webpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
  },
}

// 코드 압축 도구
export const codeCompression = {
  // CSS 압축
  compressCSS: (css: string): string => {
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .trim()
  },

  // JavaScript 압축 (기본적인 공백 제거)
  compressJS: (js: string): string => {
    return js
      .replace(/\s+/g, ' ')
      .replace(/;\s*/g, ';')
      .replace(/{\s*/g, '{')
      .replace(/}\s*/g, '}')
      .trim()
  },

  // HTML 압축
  compressHTML: (html: string): string => {
    return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
  },
}

// 최적화 검증 도구
export const optimizationValidator = {
  // 번들 크기 검증
  validateBundleSize: (size: number, maxSize = 1024 * 1024): boolean => {
    return size <= maxSize
  },

  // 로딩 시간 검증
  validateLoadingTime: (time: number, maxTime = 3000): boolean => {
    return time <= maxTime
  },

  // 메모리 사용량 검증
  validateMemoryUsage: (usage: number, maxUsage = 0.8): boolean => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return usage <= memory.jsHeapSizeLimit * maxUsage
    }
    return true
  },

  // 종합 검증
  validateOptimization: (metrics: {
    bundleSize: number
    loadingTime: number
    memoryUsage: number
  }): {
    isValid: boolean
    issues: string[]
  } => {
    const issues: string[] = []

    if (!optimizationValidator.validateBundleSize(metrics.bundleSize)) {
      issues.push('번들 크기가 너무 큽니다')
    }

    if (!optimizationValidator.validateLoadingTime(metrics.loadingTime)) {
      issues.push('로딩 시간이 너무 깁니다')
    }

    if (!optimizationValidator.validateMemoryUsage(metrics.memoryUsage)) {
      issues.push('메모리 사용량이 너무 높습니다')
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  },
}
