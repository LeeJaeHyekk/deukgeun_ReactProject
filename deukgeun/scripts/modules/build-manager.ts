/**
 * 빌드 관리 모듈
 * 프로젝트 빌드 과정을 관리하는 공통 기능
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger'
import { FileUtils } from './file-utils'
import { ErrorHandler } from './error-handler'

interface BuildOptions {
  timeout: number
  maxRetries: number
  parallel: boolean
  validate: boolean
  cleanup: boolean
  safety?: boolean
  backup?: boolean
}

interface BuildResult {
  success: boolean
  phase: string
  duration: number
  output?: string
  error?: string
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
 * 빌드 관리자 클래스
 */
export class BuildManager {
  private projectRoot: string
  private fileUtils: FileUtils
  private errorHandler: ErrorHandler
  private options: BuildOptions
  private config: BuildConfig

  constructor(projectRoot: string, options: Partial<BuildOptions> = {}) {
    this.projectRoot = projectRoot
    this.fileUtils = new FileUtils(projectRoot)
    this.errorHandler = new ErrorHandler(projectRoot)
    this.options = {
      timeout: 300000, // 5분
      maxRetries: 3,
      parallel: false,
      validate: true,
      cleanup: true,
      ...options
    }
    this.config = this.initializeBuildConfig()
  }

  /**
   * 빌드 설정 초기화
   */
  private initializeBuildConfig(): BuildConfig {
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
   * 전체 빌드 프로세스 실행
   */
  async executeBuild(): Promise<{ success: boolean; results: BuildResult[]; error?: string }> {
    const startTime = Date.now()
    const results: BuildResult[] = []

    try {
      logStep('BUILD', '빌드 프로세스 시작...')

      // 1. 사전 검증
      const preValidation = await this.preBuildValidation()
      if (!preValidation.success) {
        return {
          success: false,
          results,
          error: preValidation.error
        }
      }

      // 2. 기존 빌드 결과 정리
      if (this.options.cleanup) {
        await this.cleanupPreviousBuild()
      }

      // 3. 백엔드 빌드
      const backendResult = await this.buildBackend()
      results.push(backendResult)

      if (!backendResult.success) {
        return {
          success: false,
          results,
          error: '백엔드 빌드 실패'
        }
      }

      // 4. 프론트엔드 빌드
      const frontendResult = await this.buildFrontend()
      results.push(frontendResult)

      if (!frontendResult.success) {
        return {
          success: false,
          results,
          error: '프론트엔드 빌드 실패'
        }
      }

      // 5. 빌드 결과 정리
      await this.organizeBuildOutput()

      // 6. 빌드 검증
      if (this.options.validate) {
        const validation = await this.validateBuild()
        if (!validation.success) {
          return {
            success: false,
            results,
            error: '빌드 검증 실패'
          }
        }
      }

      const duration = Date.now() - startTime
      logSuccess(`빌드 완료 (소요시간: ${(duration / 1000).toFixed(2)}초)`)

      return {
        success: true,
        results
      }

    } catch (error) {
      const errorResult = this.errorHandler.handleError(error as Error, {
        phase: 'build_process',
        projectRoot: this.projectRoot
      })

      return {
        success: false,
        results,
        error: (error as Error).message
      }
    }
  }

  /**
   * 사전 빌드 검증
   */
  private async preBuildValidation(): Promise<{ success: boolean; error?: string }> {
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
        const fullPath = path.join(this.projectRoot, file)
        if (!this.fileUtils.exists(fullPath)) {
          return {
            success: false,
            error: `필수 파일/디렉토리가 없습니다: ${file}`
          }
        }
      }

      // 2. 의존성 확인
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules')
      if (!this.fileUtils.exists(nodeModulesPath)) {
        logWarning('node_modules가 없습니다. 의존성 설치가 필요합니다.')
      }

      // 3. 디스크 공간 확인
      const freeSpace = this.getFreeDiskSpace()
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
  private async cleanupPreviousBuild(): Promise<void> {
    logStep('CLEANUP', '이전 빌드 결과 정리 중...')

    const cleanupTargets = [
      'dist',
      '.next',
      '.nuxt',
      'build',
      'out'
    ]

    for (const target of cleanupTargets) {
      const fullPath = path.join(this.projectRoot, target)
      if (this.fileUtils.exists(fullPath)) {
        this.fileUtils.remove(fullPath, { recursive: true, force: true })
      }
    }

    logSuccess('이전 빌드 결과 정리 완료')
  }

  /**
   * 백엔드 빌드
   */
  private async buildBackend(): Promise<BuildResult> {
    const startTime = Date.now()
    logStep('BACKEND', '백엔드 빌드 중...')

    try {
      execSync(this.config.backend.command, {
        stdio: 'inherit',
        timeout: this.config.backend.timeout,
        cwd: this.projectRoot
      })

      const duration = Date.now() - startTime
      logSuccess('백엔드 빌드 완료')

      return {
        success: true,
        phase: 'backend',
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorResult = this.errorHandler.handleError(error as Error, {
        phase: 'backend_build',
        command: this.config.backend.command
      })

      return {
        success: false,
        phase: 'backend',
        duration,
        error: (error as Error).message
      }
    }
  }

  /**
   * 프론트엔드 빌드
   */
  private async buildFrontend(): Promise<BuildResult> {
    const startTime = Date.now()
    logStep('FRONTEND', '프론트엔드 빌드 중...')

    try {
      execSync(this.config.frontend.command, {
        stdio: 'inherit',
        timeout: this.config.frontend.timeout,
        cwd: this.projectRoot
      })

      const duration = Date.now() - startTime
      logSuccess('프론트엔드 빌드 완료')

      return {
        success: true,
        phase: 'frontend',
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      const errorResult = this.errorHandler.handleError(error as Error, {
        phase: 'frontend_build',
        command: this.config.frontend.command
      })

      return {
        success: false,
        phase: 'frontend',
        duration,
        error: (error as Error).message
      }
    }
  }

  /**
   * 빌드 결과 정리
   */
  private async organizeBuildOutput(): Promise<void> {
    logStep('ORGANIZE', '빌드 결과 정리 중...')

    try {
      const distPath = path.join(this.projectRoot, 'dist')
      if (!this.fileUtils.exists(distPath)) {
        logWarning('dist 폴더가 존재하지 않습니다')
        return
      }

      // 1. frontend 폴더 생성 및 파일 이동
      const frontendPath = path.join(distPath, 'frontend')
      this.fileUtils.ensureDirectory(frontendPath)

      // 프론트엔드 파일들을 frontend 폴더로 이동
      const items = fs.readdirSync(distPath)
      for (const item of items) {
        const itemPath = path.join(distPath, item)
        const stat = fs.statSync(itemPath)

        if (stat.isFile() && (item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.js'))) {
          const newPath = path.join(frontendPath, item)
          this.fileUtils.move(itemPath, newPath)
        } else if (stat.isDirectory() && (item === 'assets' || item === 'js' || item === 'fonts' || item === 'img' || item === 'video')) {
          const newPath = path.join(frontendPath, item)
          this.fileUtils.move(itemPath, newPath)
        }
      }

      // 2. shared 폴더 처리
      const backendSharedPath = path.join(distPath, 'backend', 'shared')
      const distSharedPath = path.join(distPath, 'shared')

      if (this.fileUtils.exists(backendSharedPath)) {
        if (this.fileUtils.exists(distSharedPath)) {
          this.fileUtils.remove(distSharedPath, { recursive: true, force: true })
        }
        this.fileUtils.move(backendSharedPath, distSharedPath)
      }

      // 3. data 폴더 생성
      const srcDataPath = path.join(this.projectRoot, 'src', 'data')
      const distDataPath = path.join(distPath, 'data')

      if (this.fileUtils.exists(srcDataPath)) {
        if (this.fileUtils.exists(distDataPath)) {
          this.fileUtils.remove(distDataPath, { recursive: true, force: true })
        }
        this.fileUtils.copyDirectory(srcDataPath, distDataPath)
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
  private async validateBuild(): Promise<{ success: boolean; errors: string[] }> {
    logStep('VALIDATE', '빌드 결과 검증 중...')

    const errors: string[] = []
    const requiredPaths = [
      'dist/backend',
      'dist/frontend',
      'dist/shared'
    ]

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(this.projectRoot, requiredPath)
      if (!this.fileUtils.exists(fullPath)) {
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
  private getFreeDiskSpace(): number {
    try {
      const stats = fs.statSync(this.projectRoot)
      // 간단한 구현 - 실제로는 더 정확한 방법 필요
      return 1024 * 1024 * 1024 // 1GB 가정
    } catch {
      return 0
    }
  }

  /**
   * 빌드 통계 출력
   */
  printBuildStats(results: BuildResult[]): void {
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
}