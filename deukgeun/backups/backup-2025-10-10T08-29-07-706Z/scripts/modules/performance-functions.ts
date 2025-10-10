/**
 * 성능 최적화 함수 모듈
 * 메모리 관리, 병렬 처리, 캐싱 등의 성능 최적화 기능 제공
 */

import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { logInfo, logWarning, logError } from './logger-functions'

// 성능 메트릭 인터페이스
export interface PerformanceMetrics {
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  cpuUsage: {
    user: number
    system: number
  }
  systemResources: {
    totalMemory: number
    freeMemory: number
    cpuCount: number
    loadAverage: number[]
  }
  timestamp: string
}

// 병렬 처리 옵션
export interface ParallelOptions {
  maxWorkers: number
  timeout: number
  retryCount: number
  retryDelay: number
}

// 캐시 옵션
export interface CacheOptions {
  maxSize: number
  ttl: number
  compression: boolean
}

// 성능 모니터링 클래스
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private startTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  // 메모리 사용량 확인
  checkMemoryUsage(maxMemoryMB: number = 1000): boolean {
    const memUsage = process.memoryUsage()
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024

    if (heapUsedMB > maxMemoryMB) {
      logWarning(`높은 메모리 사용량: ${heapUsedMB.toFixed(2)}MB`)
      return false
    }

    return true
  }

  // CPU 사용량 확인
  checkCpuUsage(): boolean {
    const loadAverage = os.loadavg()
    const cpuCount = os.cpus().length

    if (loadAverage[0] > cpuCount * 0.8) {
      logWarning(`높은 CPU 사용량: ${loadAverage[0].toFixed(2)} (${cpuCount} 코어)`)
      return false
    }

    return true
  }

  // 성능 메트릭 수집
  collectMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    const systemResources = {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg()
    }

    return {
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      systemResources,
      timestamp: new Date().toISOString()
    }
  }

  // 성능 메트릭 저장
  saveMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    // 최대 1000개까지만 저장
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // 성능 리포트 생성
  generateReport(): string {
    const latest = this.metrics[this.metrics.length - 1]
    if (!latest) return 'No metrics available'

    return `
성능 리포트:
- 메모리 사용량: ${(latest.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB
- 총 메모리: ${(latest.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB
- CPU 사용량: ${latest.cpuUsage.user}μs
- 시스템 리소스: ${latest.systemResources.cpuCount} 코어
- 로드 평균: ${latest.systemResources.loadAverage[0].toFixed(2)}
- 수집 시간: ${latest.timestamp}
    `.trim()
  }

  // 성능 통계 생성
  generateStats(): {
    totalMetrics: number
    averageMemory: number
    peakMemory: number
    averageCpu: number
    peakCpu: number
    duration: number
  } {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageMemory: 0,
        peakMemory: 0,
        averageCpu: 0,
        peakCpu: 0,
        duration: 0
      }
    }

    const totalMemory = this.metrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0)
    const peakMemory = Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed))
    const totalCpu = this.metrics.reduce((sum, m) => sum + m.cpuUsage.user, 0)
    const peakCpu = Math.max(...this.metrics.map(m => m.cpuUsage.user))
    const duration = Date.now() - this.startTime

    return {
      totalMetrics: this.metrics.length,
      averageMemory: totalMemory / this.metrics.length,
      peakMemory,
      averageCpu: totalCpu / this.metrics.length,
      peakCpu,
      duration
    }
  }
}

// 병렬 처리 클래스
export class ParallelProcessor {
  private workers: Worker[] = []
  private errors: Error[] = []

  constructor(private maxWorkers: number = 4) {}

  // 병렬 작업 실행
  async executeParallel<T>(
    tasks: (() => Promise<T>)[],
    options: Partial<ParallelOptions> = {}
  ): Promise<T[]> {
    const finalOptions: ParallelOptions = {
      maxWorkers: this.maxWorkers,
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      ...options
    }

    this.errors = []

    logInfo(`병렬 처리 시작: ${tasks.length}개 작업, ${finalOptions.maxWorkers}개 워커`)

    // 워커 실행
    const results = await this.runWorkers(tasks, finalOptions)

    if (this.errors.length > 0) {
      logError(`병렬 처리 중 ${this.errors.length}개 오류 발생`)
      throw new Error(`병렬 처리 실패: ${this.errors.map(e => e.message).join(', ')}`)
    }

    return results
  }

  // 워커 실행
  private async runWorkers<T>(
    tasks: (() => Promise<T>)[],
    options: ParallelOptions
  ): Promise<T[]> {
    const results: T[] = []
    const chunks = this.chunkArray(tasks, options.maxWorkers)

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(task => this.executeWithRetry(task, options))
      )

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          this.errors.push(result.reason)
        }
      }
    }

    return results
  }

  // 재시도가 포함된 작업 실행
  private async executeWithRetry<T>(
    task: () => Promise<T>,
    options: ParallelOptions
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= options.retryCount; attempt++) {
      try {
        return await Promise.race([
          task(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), options.timeout)
          )
        ])
      } catch (error) {
        lastError = error as Error
        
        if (attempt < options.retryCount) {
          logWarning(`작업 실패 (시도 ${attempt}/${options.retryCount}): ${lastError.message}`)
          await new Promise(resolve => setTimeout(resolve, options.retryDelay))
        }
      }
    }

    throw lastError || new Error('Unknown error')
  }

  // 배열을 청크로 분할
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}

// 캐시 클래스
export class CacheManager<T = any> {
  private cache = new Map<string, { value: T; expiry: number }>()
  private maxSize: number
  private ttl: number

  constructor(options: CacheOptions) {
    this.maxSize = options.maxSize
    this.ttl = options.ttl
  }

  // 캐시에서 값 가져오기
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) return undefined
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.value
  }

  // 캐시에 값 저장
  set(key: string, value: T): void {
    // 캐시 크기 확인
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    })
  }

  // 캐시 삭제
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 캐시 초기화
  clear(): void {
    this.cache.clear()
  }

  // 캐시 크기
  size(): number {
    return this.cache.size
  }
}

// 파일 처리 최적화 클래스
export class FileProcessor {
  private cache: CacheManager<any>

  constructor(cacheOptions: CacheOptions = { maxSize: 1000, ttl: 300000, compression: false }) {
    this.cache = new CacheManager(cacheOptions)
  }

  // 파일들을 병렬로 처리
  async processFiles<T>(
    files: string[],
    fileProcessor: (filePath: string) => Promise<T>
  ): Promise<{ results: T[]; errors: Error[] }> {
    const tasks = files.map(filePath => async () => {
      // 캐시 확인
      const cacheKey = `file:${filePath}:${fs.statSync(filePath).mtime.getTime()}`
      const cached = this.cache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      // 파일 처리
      const result = await fileProcessor(filePath)
      
      // 캐시 저장
      this.cache.set(cacheKey, result)
      
      return result
    })

    const parallelProcessor = new ParallelProcessor()
    const results = await parallelProcessor.executeParallel(tasks)
    
    return { results, errors: [] }
  }

  // 디렉토리 스캔 최적화
  async scanDirectory(
    dirPath: string,
    options: {
      includeDirs?: boolean
      extensions?: string[]
      maxDepth?: number
    } = {}
  ): Promise<string[]> {
    const cacheKey = `scan:${dirPath}:${JSON.stringify(options)}`
    const cached = this.cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    const files: string[] = []
    const scanDir = async (dir: string, depth: number = 0) => {
      if (options.maxDepth && depth > options.maxDepth) return

      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          if (options.includeDirs) {
            files.push(fullPath)
          }
          await scanDir(fullPath, depth + 1)
        } else {
          if (options.extensions) {
            const ext = path.extname(item)
            if (options.extensions.includes(ext)) {
              files.push(fullPath)
            }
          } else {
            files.push(fullPath)
          }
        }
      }
    }

    await scanDir(dirPath)
    
    // 캐시 저장
    this.cache.set(cacheKey, files)
    
    return files
  }
}

// 성능 유틸리티 함수들
export const performanceUtils = {
  // 메모리 사용량 최적화
  optimizeMemory(): void {
    if (global.gc) {
      global.gc()
    }
  },

  // 최적 워커 수 계산
  getOptimalWorkerCount(): number {
    const cpuCount = os.cpus().length
    const memUsage = process.memoryUsage()
    const availableMemory = os.freemem()
    
    // CPU 코어 수의 75% 또는 메모리 기반 계산
    const cpuBased = Math.max(1, Math.floor(cpuCount * 0.75))
    const memoryBased = Math.max(1, Math.floor(availableMemory / (1024 * 1024 * 1024))) // 1GB당 1개 워커
    
    return Math.min(cpuBased, memoryBased, 8) // 최대 8개
  },

  // 시스템 리소스 확인
  checkSystemResources(): {
    available: boolean
    memory: boolean
    cpu: boolean
    disk: boolean
  } {
    const memUsage = process.memoryUsage()
    const systemMemory = os.freemem()
    const loadAverage = os.loadavg()
    const cpuCount = os.cpus().length

    return {
      available: true,
      memory: systemMemory > 100 * 1024 * 1024, // 100MB 이상
      cpu: loadAverage[0] < cpuCount * 0.9, // 90% 미만
      disk: true // TODO: 디스크 공간 확인 구현
    }
  }
}
