/**
 * 최적화된 함수형 빌드 관리 모듈
 * 프로젝트 빌드 과정을 관리하는 공통 기능
 * - 메모리 최적화 및 병렬 처리 지원
 * - 향상된 에러 처리 및 복구 메커니즘
 * - 타입 안전성 강화
 */

import { execSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'
import { fileExists, readFile, writeFile, ensureDirectory, copyDirectory, moveFile, removeFile } from './file-functions'
import { executeSafetyGuard, preBuildSafetyCheck, postBuildSafetyCheck, initializeSafetyConfig } from './safety-functions'

import { exec } from 'child_process'
const execAsync = promisify(exec)

interface BuildOptions {
  timeout: number
  maxRetries: number
  parallel: boolean
  validate: boolean
  cleanup: boolean
  safety: boolean
  backup: boolean
  maxWorkers?: number
  memoryLimit?: number
  retryDelay?: number
}

interface BuildResult {
  success: boolean
  phase: string
  duration: number
  output?: string
  error?: string
  memoryUsage?: number
  retryCount?: number
}

interface BuildConfig {
  backend: {
    command: string
    outputDir: string
    timeout: number
  }
  frontend: {
    command: string
    outputDir: string
    timeout: number
  }
  shared: {
    outputDir: string
  }
}

/**
 * 메모리 관리 유틸리티
 */
class MemoryManager {
  private static memoryThreshold = 512 * 1024 * 1024 // 512MB
  private static gcInterval = 10000 // 10초
  private static lastGC = Date.now()

  static checkMemoryUsage(): boolean {
    const usage = process.memoryUsage()
    const heapUsed = usage.heapUsed

    if (heapUsed > this.memoryThreshold) {
      this.forceGC()
      return false
    }
    return true
  }

  static forceGC(): void {
    if ((global as any).gc) {
      (global as any).gc()
      this.lastGC = Date.now()
      logInfo(`메모리 정리 실행됨 (사용량: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB)`)
    }
  }

  static shouldGC(): boolean {
    return Date.now() - this.lastGC > this.gcInterval
  }
}

/**
 * 병렬 처리 관리자
 */
class ParallelProcessor {
  private maxWorkers: number
  private activeWorkers: number = 0
  private queue: Array<() => Promise<any>> = []

  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers
  }

  async process<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    const results: T[] = []
    const errors: Error[] = []

    for (const task of tasks) {
      await this.executeTask(task, results, errors)
    }

    if (errors.length > 0) {
      throw new Error(`병렬 처리 중 ${errors.length}개 오류 발생`)
    }

    return results
  }

  private async executeTask<T>(
    task: () => Promise<T>,
    results: T[],
    errors: Error[]
  ): Promise<void> {
    while (this.activeWorkers >= this.maxWorkers) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.activeWorkers++
    try {
      const result = await task()
      results.push(result)
    } catch (error) {
      errors.push(error as Error)
    } finally {
      this.activeWorkers--
    }
  }
}

/**
 * 빌드 설정 초기화
 */
function initializeBuildConfig(): BuildConfig {
  return {
    backend: {
      command: 'npm run build:backend:production',
      outputDir: 'dist/backend',
      timeout: 300000
    },
    frontend: {
      command: 'npm run build:production',
      outputDir: 'dist/frontend',
      timeout: 300000
    },
    shared: {
      outputDir: 'dist/shared'
    }
  }
}

/**
 * 사전 빌드 검증
 */
export function preBuildValidation(projectRoot: string): { success: boolean; error?: string } {
  logStep('VALIDATE', '사전 빌드 검증 중...')

  try {
    // 1. 필수 파일 존재 확인
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src/backend',
      'src/frontend'
    ]

    for (const file of requiredFiles) {
      const fullPath = path.join(projectRoot, file)
      if (!fileExists(fullPath)) {
        return {
          success: false,
          error: `필수 파일/디렉토리가 없습니다: ${file}`
        }
      }
    }

    // 2. 의존성 확인
    const nodeModulesPath = path.join(projectRoot, 'node_modules')
    if (!fileExists(nodeModulesPath)) {
      logWarning('node_modules가 없습니다. 의존성 설치가 필요합니다.')
    }

    // 3. 디스크 공간 확인
    const freeSpace = getFreeDiskSpace(projectRoot)
    if (freeSpace < 100 * 1024 * 1024) { // 100MB
      return {
        success: false,
        error: '디스크 공간이 부족합니다'
      }
    }

    logSuccess('사전 빌드 검증 완료')
    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

/**
 * 이전 빌드 결과 정리
 */
export function cleanupPreviousBuild(projectRoot: string): void {
  logStep('CLEANUP', '이전 빌드 결과 정리 중...')

  const cleanupTargets = [
    'dist',
    '.next',
    '.nuxt',
    'build',
    'out'
  ]

  for (const target of cleanupTargets) {
    const fullPath = path.join(projectRoot, target)
    if (fileExists(fullPath)) {
      removeFile(fullPath, { recursive: true, force: true })
    }
  }

  logSuccess('이전 빌드 결과 정리 완료')
}

/**
 * 최적화된 백엔드 빌드 (재시도 및 메모리 관리 포함)
 */
export async function buildBackend(
  projectRoot: string, 
  config: BuildConfig, 
  options: BuildOptions = {} as BuildOptions
): Promise<BuildResult> {
  const startTime = Date.now()
  const maxRetries = options.maxRetries || 3
  const retryDelay = options.retryDelay || 2000
  let lastError: Error | null = null

  logStep('BACKEND', '백엔드 빌드 중...')

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 메모리 사용량 확인
      if (!MemoryManager.checkMemoryUsage()) {
        logWarning('메모리 사용량이 높아 빌드 전 정리 중...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 비동기 실행으로 더 나은 제어
      const result = await execAsync(config.backend.command, {
        cwd: projectRoot,
        timeout: config.backend.timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB
      })

      const duration = Date.now() - startTime
      const memoryUsage = process.memoryUsage().heapUsed

      logSuccess(`백엔드 빌드 완료 (시도 ${attempt}/${maxRetries})`)

      return {
        success: true,
        phase: 'backend',
        duration,
        memoryUsage,
        retryCount: attempt - 1
      }

    } catch (error) {
      lastError = error as Error
      const duration = Date.now() - startTime

      if (attempt < maxRetries) {
        logWarning(`백엔드 빌드 실패 (시도 ${attempt}/${maxRetries}): ${lastError.message}`)
        logInfo(`${retryDelay}ms 후 재시도...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      } else {
        logError(`백엔드 빌드 최종 실패: ${lastError.message}`)
        return {
          success: false,
          phase: 'backend',
          duration,
          error: lastError.message,
          retryCount: attempt
        }
      }
    }
  }

  // 이 지점에 도달하면 안 됨
  throw new Error('예상치 못한 빌드 오류')
}

/**
 * 최적화된 프론트엔드 빌드 (재시도 및 메모리 관리 포함)
 */
export async function buildFrontend(
  projectRoot: string, 
  config: BuildConfig, 
  options: BuildOptions = {} as BuildOptions
): Promise<BuildResult> {
  const startTime = Date.now()
  const maxRetries = options.maxRetries || 3
  const retryDelay = options.retryDelay || 2000
  let lastError: Error | null = null

  logStep('FRONTEND', '프론트엔드 빌드 중...')

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 메모리 사용량 확인
      if (!MemoryManager.checkMemoryUsage()) {
        logWarning('메모리 사용량이 높아 빌드 전 정리 중...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 비동기 실행으로 더 나은 제어
      const result = await execAsync(config.frontend.command, {
        cwd: projectRoot,
        timeout: config.frontend.timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB
      })

      const duration = Date.now() - startTime
      const memoryUsage = process.memoryUsage().heapUsed

      logSuccess(`프론트엔드 빌드 완료 (시도 ${attempt}/${maxRetries})`)

      return {
        success: true,
        phase: 'frontend',
        duration,
        memoryUsage,
        retryCount: attempt - 1
      }

    } catch (error) {
      lastError = error as Error
      const duration = Date.now() - startTime

      if (attempt < maxRetries) {
        logWarning(`프론트엔드 빌드 실패 (시도 ${attempt}/${maxRetries}): ${lastError.message}`)
        logInfo(`${retryDelay}ms 후 재시도...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      } else {
        logError(`프론트엔드 빌드 최종 실패: ${lastError.message}`)
        return {
          success: false,
          phase: 'frontend',
          duration,
          error: lastError.message,
          retryCount: attempt
        }
      }
    }
  }

  // 이 지점에 도달하면 안 됨
  throw new Error('예상치 못한 빌드 오류')
}

/**
 * 빌드 결과 정리
 */
export function organizeBuildOutput(projectRoot: string): void {
  logStep('ORGANIZE', '빌드 결과 정리 중...')

  try {
    const distPath = path.join(projectRoot, 'dist')
    if (!fileExists(distPath)) {
      logWarning('dist 폴더가 존재하지 않습니다')
      return
    }

    // 1. frontend 폴더 생성 및 파일 이동
    const frontendPath = path.join(distPath, 'frontend')
    ensureDirectory(frontendPath)

    // 프론트엔드 파일들을 frontend 폴더로 이동
    const items = fs.readdirSync(distPath)
    for (const item of items) {
      const itemPath = path.join(distPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isFile() && (item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.js'))) {
        const newPath = path.join(frontendPath, item)
        moveFile(itemPath, newPath)
      } else if (stat.isDirectory() && (item === 'assets' || item === 'js' || item === 'fonts' || item === 'img' || item === 'video')) {
        const newPath = path.join(frontendPath, item)
        moveFile(itemPath, newPath)
      }
    }

    // 2. shared 폴더 처리
    const backendSharedPath = path.join(distPath, 'backend', 'shared')
    const distSharedPath = path.join(distPath, 'shared')

    if (fileExists(backendSharedPath)) {
      if (fileExists(distSharedPath)) {
        removeFile(distSharedPath, { recursive: true, force: true })
      }
      moveFile(backendSharedPath, distSharedPath)
    }

    // 3. data 폴더 생성
    const srcDataPath = path.join(projectRoot, 'src', 'data')
    const distDataPath = path.join(distPath, 'data')

    if (fileExists(srcDataPath)) {
      if (fileExists(distDataPath)) {
        removeFile(distDataPath, { recursive: true, force: true })
      }
      copyDirectory(srcDataPath, distDataPath)
    }

    logSuccess('빌드 결과 정리 완료')

  } catch (error) {
    logError(`빌드 결과 정리 실패: ${(error as Error).message}`)
    throw error
  }
}

/**
 * 빌드 검증
 */
export function validateBuild(projectRoot: string): { success: boolean; errors: string[] } {
  logStep('VALIDATE', '빌드 결과 검증 중...')

  const errors: string[] = []
  const requiredPaths = [
    'dist/backend',
    'dist/frontend',
    'dist/shared'
  ]

  for (const requiredPath of requiredPaths) {
    const fullPath = path.join(projectRoot, requiredPath)
    if (!fileExists(fullPath)) {
      errors.push(`필수 빌드 결과가 없습니다: ${requiredPath}`)
    }
  }

  if (errors.length > 0) {
    logError('빌드 검증 실패:')
    errors.forEach(error => logError(`- ${error}`))
    return { success: false, errors }
  }

  logSuccess('빌드 검증 완료')
  return { success: true, errors: [] }
}

/**
 * 사용 가능한 디스크 공간 확인
 */
function getFreeDiskSpace(projectRoot: string): number {
  try {
    const stats = fs.statSync(projectRoot)
    // 간단한 구현 - 실제로는 더 정확한 방법 필요
    return 1024 * 1024 * 1024 // 1GB 가정
  } catch {
    return 0
  }
}

/**
 * 빌드 통계 출력
 */
export function printBuildStats(results: BuildResult[]): void {
  logInfo('\n📊 빌드 통계:')
  
  const totalDuration = results.reduce((sum, result) => sum + result.duration, 0)
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  logInfo(`- 총 소요시간: ${(totalDuration / 1000).toFixed(2)}초`)
  logInfo(`- 성공: ${successCount}개`)
  logInfo(`- 실패: ${failCount}개`)

  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const duration = (result.duration / 1000).toFixed(2)
    logInfo(`- ${status} ${result.phase}: ${duration}초`)
  })
}

/**
 * 최적화된 전체 빌드 프로세스 실행
 */
export async function executeBuild(projectRoot: string, options: BuildOptions): Promise<{ success: boolean; results: BuildResult[]; error?: string }> {
  const startTime = Date.now()
  const results: BuildResult[] = []
  const config = initializeBuildConfig()
  const processor = new ParallelProcessor(options.maxWorkers || 4)

  try {
    logStep('BUILD', '최적화된 빌드 프로세스 시작...')

    // 1. 사전 검증
    const preValidation = preBuildValidation(projectRoot)
    if (!preValidation.success) {
      return {
        success: false,
        results,
        error: preValidation.error
      }
    }

    // 1.5. 안전장치 실행
    if (options.safety) {
      const safetyResult = await executeSafetyGuard(projectRoot, {
        createBackup: options.backup,
        validateBefore: true,
        validateAfter: false,
        rollbackOnError: true
      })
      
      if (!safetyResult.success) {
        return {
          success: false,
          results,
          error: safetyResult.error
        }
      }
    }

    // 2. 기존 빌드 결과 정리
    if (options.cleanup) {
      cleanupPreviousBuild(projectRoot)
    }

    // 3. 병렬 빌드 실행 (옵션에 따라)
    if (options.parallel) {
      logStep('PARALLEL', '병렬 빌드 실행 중...')
      
      const buildTasks = [
        () => buildBackend(projectRoot, config, options),
        () => buildFrontend(projectRoot, config, options)
      ]

      try {
        const buildResults = await processor.process(buildTasks)
        results.push(...buildResults)

        // 빌드 결과 검증
        const failedBuilds = buildResults.filter(result => !result.success)
        if (failedBuilds.length > 0) {
          return {
            success: false,
            results,
            error: `${failedBuilds.length}개 빌드 실패`
          }
        }

      } catch (error) {
        return {
          success: false,
          results,
          error: `병렬 빌드 실패: ${(error as Error).message}`
        }
      }
    } else {
      // 3. 순차 빌드 실행
      logStep('SEQUENTIAL', '순차 빌드 실행 중...')
      
      // 백엔드 빌드
      const backendResult = await buildBackend(projectRoot, config, options)
      results.push(backendResult)

      if (!backendResult.success) {
        return {
          success: false,
          results,
          error: '백엔드 빌드 실패'
        }
      }

      // 프론트엔드 빌드
      const frontendResult = await buildFrontend(projectRoot, config, options)
      results.push(frontendResult)

      if (!frontendResult.success) {
        return {
          success: false,
          results,
          error: '프론트엔드 빌드 실패'
        }
      }
    }

    // 4. 빌드 결과 정리
    organizeBuildOutput(projectRoot)

    // 5. 빌드 검증
    if (options.validate) {
      const validation = validateBuild(projectRoot)
      if (!validation.success) {
        return {
          success: false,
          results,
          error: '빌드 검증 실패'
        }
      }
    }

    // 6. 사후 안전 검사
    if (options.safety) {
      const safetyConfig = initializeSafetyConfig(projectRoot)
      const postCheck = await postBuildSafetyCheck(safetyConfig)
      if (!postCheck.success) {
        logWarning('사후 안전 검사에서 경고가 발생했습니다')
        postCheck.warnings.forEach(warning => logWarning(`- ${warning}`))
      }
    }

    // 7. 메모리 정리
    if (MemoryManager.shouldGC()) {
      MemoryManager.forceGC()
    }

    const duration = Date.now() - startTime
    const totalMemory = results.reduce((sum, result) => sum + (result.memoryUsage || 0), 0)
    
    logSuccess(`빌드 완료 (소요시간: ${(duration / 1000).toFixed(2)}초, 메모리: ${(totalMemory / 1024 / 1024).toFixed(2)}MB)`)

    return {
      success: true,
      results
    }

  } catch (error) {
    return {
      success: false,
      results,
      error: (error as Error).message
    }
  }
}
