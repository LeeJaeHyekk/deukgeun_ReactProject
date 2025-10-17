// ============================================================================
// 성능 모니터링 모듈
// ============================================================================

import { performance } from "perf_hooks"

export interface PerformanceMetrics {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  memory?: NodeJS.MemoryUsage
  metadata?: Record<string, any>
}

/**
 * 성능 메트릭 저장소
 */
const performanceMetrics: Map<string, PerformanceMetrics> = new Map()

/**
 * 성능 측정을 시작합니다.
 */
export function startPerformanceTimer(name: string, metadata?: Record<string, any>): string {
  const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  performanceMetrics.set(timerId, {
    name,
    startTime: performance.now(),
    memory: process.memoryUsage(),
    metadata
  })
  
  console.log(`⏱️ Performance timer started: ${name}`)
  return timerId
}

/**
 * 성능 측정을 종료하고 결과를 반환합니다.
 */
export function endPerformanceTimer(timerId: string): PerformanceMetrics | null {
  const metric = performanceMetrics.get(timerId)
  if (!metric) {
    console.warn(`⚠️ Performance timer not found: ${timerId}`)
    return null
  }
  
  const endTime = performance.now()
  const duration = endTime - metric.startTime
  
  const finalMetric: PerformanceMetrics = {
    ...metric,
    endTime,
    duration,
    memory: process.memoryUsage()
  }
  
  performanceMetrics.set(timerId, finalMetric)
  
  console.log(`⏱️ Performance timer ended: ${metric.name} (${duration.toFixed(2)}ms)`)
  return finalMetric
}

/**
 * 성능 측정을 자동으로 관리하는 데코레이터 함수
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  metadata?: Record<string, any>
): T {
  return ((...args: any[]) => {
    const timerId = startPerformanceTimer(name, metadata)
    
    try {
      const result = fn(...args)
      
      // Promise인 경우 비동기 처리
      if (result instanceof Promise) {
        return result.finally(() => {
          endPerformanceTimer(timerId)
        })
      }
      
      // 동기 함수인 경우 즉시 종료
      endPerformanceTimer(timerId)
      return result
    } catch (error) {
      endPerformanceTimer(timerId)
      throw error
    }
  }) as T
}

/**
 * 비동기 함수의 성능을 측정하는 데코레이터
 */
export function measureAsyncPerformance<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  metadata?: Record<string, any>
): T {
  return (async (...args: any[]) => {
    const timerId = startPerformanceTimer(name, metadata)
    
    try {
      const result = await fn(...args)
      endPerformanceTimer(timerId)
      return result
    } catch (error) {
      endPerformanceTimer(timerId)
      throw error
    }
  }) as T
}

/**
 * 모든 성능 메트릭을 반환합니다.
 */
export function getAllPerformanceMetrics(): PerformanceMetrics[] {
  return Array.from(performanceMetrics.values())
}

/**
 * 특정 이름의 성능 메트릭을 반환합니다.
 */
export function getPerformanceMetricsByName(name: string): PerformanceMetrics[] {
  return Array.from(performanceMetrics.values()).filter(metric => metric.name === name)
}

/**
 * 성능 메트릭을 로그로 출력합니다.
 */
export function logPerformanceMetrics(): void {
  const metrics = getAllPerformanceMetrics()
  
  if (metrics.length === 0) {
    console.log("📊 No performance metrics available")
    return
  }
  
  console.log("📊 Performance Metrics:")
  console.log("=".repeat(60))
  
  // 이름별로 그룹화
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = []
    }
    acc[metric.name].push(metric)
    return acc
  }, {} as Record<string, PerformanceMetrics[]>)
  
  for (const [name, metricList] of Object.entries(groupedMetrics)) {
    const durations = metricList
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
    
    if (durations.length === 0) continue
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    
    console.log(`📈 ${name}:`)
    console.log(`   - Count: ${durations.length}`)
    console.log(`   - Average: ${avgDuration.toFixed(2)}ms`)
    console.log(`   - Min: ${minDuration.toFixed(2)}ms`)
    console.log(`   - Max: ${maxDuration.toFixed(2)}ms`)
    console.log("")
  }
  
  console.log("=".repeat(60))
}

/**
 * 성능 메트릭을 초기화합니다.
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.clear()
  console.log("🗑️ Performance metrics cleared")
}

/**
 * 메모리 사용량을 모니터링합니다.
 */
export function getMemoryUsage(): NodeJS.MemoryUsage {
  return process.memoryUsage()
}

/**
 * 메모리 사용량을 로그로 출력합니다.
 */
export function logMemoryUsage(): void {
  const memory = getMemoryUsage()
  
  console.log("💾 Memory Usage:")
  console.log(`   - RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   - Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   - Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   - External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   - Array Buffers: ${(memory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`)
}
