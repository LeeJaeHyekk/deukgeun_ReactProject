/**
 * 성능 모니터링 및 최적화 유틸리티
 */

// ============================================================================
// 성능 측정
// ============================================================================

/**
 * 함수 실행 시간 측정
 */
export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start
  
  if (label && import.meta.env.DEV) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
  }
  
  return { result, duration }
}

/**
 * 비동기 함수 실행 시간 측정
 */
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  if (label && import.meta.env.DEV) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
  }
  
  return { result, duration }
}

// ============================================================================
// 메모리 관리
// ============================================================================

/**
 * 메모리 사용량 체크
 */
export function checkMemoryUsage(): {
  used: number
  total: number
  percentage: number
} {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const used = memory.usedJSHeapSize
    const total = memory.totalJSHeapSize
    const percentage = (used / total) * 100
    
    return { used, total, percentage }
  }
  
  return { used: 0, total: 0, percentage: 0 }
}

/**
 * 메모리 누수 감지
 */
export function detectMemoryLeak(): boolean {
  const { percentage } = checkMemoryUsage()
  return percentage > 80 // 80% 이상 사용 시 누수 의심
}

// ============================================================================
// 디바운싱 및 스로틀링
// ============================================================================

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 스로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// ============================================================================
// 지연 로딩
// ============================================================================

/**
 * 지연 로딩을 위한 Intersection Observer
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  })
}

/**
 * 이미지 지연 로딩
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): void {
  if (placeholder) {
    img.src = placeholder
  }
  
  const observer = createLazyLoader((entry) => {
    if (entry.isIntersecting) {
      img.src = src
      observer.unobserve(img)
    }
  })
  
  observer.observe(img)
}

// ============================================================================
// 가상화
// ============================================================================

/**
 * 가상 스크롤 계산
 */
export function calculateVirtualScroll(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
): {
  startIndex: number
  endIndex: number
  offsetY: number
} {
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  )
  const offsetY = startIndex * itemHeight
  
  return { startIndex, endIndex, offsetY }
}

// ============================================================================
// 캐싱
// ============================================================================

/**
 * LRU 캐시 구현
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 최근 사용된 항목을 맨 뒤로 이동
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// ============================================================================
// 성능 모니터링
// ============================================================================

/**
 * 성능 메트릭 수집
 */
export function collectPerformanceMetrics(): {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
  memoryUsage: ReturnType<typeof checkMemoryUsage>
} {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')
  
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    memoryUsage: checkMemoryUsage()
  }
}

/**
 * 성능 경고 체크
 */
export function checkPerformanceWarnings(): string[] {
  const warnings: string[] = []
  const metrics = collectPerformanceMetrics()
  
  if (metrics.loadTime > 3000) {
    warnings.push('페이지 로딩 시간이 3초를 초과했습니다.')
  }
  
  if (metrics.firstContentfulPaint > 1500) {
    warnings.push('첫 번째 콘텐츠 페인트가 1.5초를 초과했습니다.')
  }
  
  if (metrics.memoryUsage.percentage > 70) {
    warnings.push('메모리 사용량이 70%를 초과했습니다.')
  }
  
  return warnings
}
