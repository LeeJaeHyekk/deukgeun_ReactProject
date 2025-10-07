/**
 * 빌드 관리 모듈
 * 백엔드/프론트엔드 빌드 실행 및 관리
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger'
import { FileUtils } from './file-utils'

interface BuildOptions {
  timeout: number
  maxRetries: number
  cleanup: boolean
  validate: boolean
}

interface BuildResult {
  success: boolean
  error?: string
  duration?: string
  backend?: BuildResult
  frontend?: BuildResult
}

interface BuildHistoryEntry {
  type: string
  timestamp: string
  success: boolean
  error?: string
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 빌드 관리자 클래스
 */
export class BuildManager {
  private projectRoot: string
  private fileUtils: FileUtils
  private options: BuildOptions
  private buildHistory: BuildHistoryEntry[] = []

  constructor(projectRoot: string, options: Partial<BuildOptions> = {}) {
    this.projectRoot = projectRoot
    this.fileUtils = new FileUtils(projectRoot)
    this.options = {
      timeout: 300000, // 5분
      maxRetries: 3,
      cleanup: true,
      validate: true,
      ...options
    }
  }

  /**
   * 백엔드 빌드
   */
  async buildBackend(options: Partial<BuildOptions> = {}): Promise<BuildResult> {
    const mergedOptions = { ...this.options, ...options }
    
    logStep('BACKEND', '백엔드 빌드 중...')
    
    try {
      execSync('npm run build:backend:production', {
        stdio: 'inherit',
        timeout: mergedOptions.timeout,
        cwd: this.projectRoot
      })
      
      logSuccess('백엔드 빌드 완료')
      
      // 빌드 결과 검증
      if (mergedOptions.validate) {
        const validation = await this.validateBackendBuild()
        if (!validation.valid) {
          throw new Error(`백엔드 빌드 검증 실패: ${validation.errors.join(', ')}`)
        }
      }
      
      this.buildHistory.push({
        type: 'backend',
        timestamp: new Date().toISOString(),
        success: true
      })
      
      return { success: true }
      
    } catch (error) {
      logError(`백엔드 빌드 실패: ${(error as Error).message}`)
      
      this.buildHistory.push({
        type: 'backend',
        timestamp: new Date().toISOString(),
        success: false,
        error: (error as Error).message
      })
      
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 프론트엔드 빌드
   */
  async buildFrontend(options: Partial<BuildOptions> = {}): Promise<BuildResult> {
    const mergedOptions = { ...this.options, ...options }
    
    logStep('FRONTEND', '프론트엔드 빌드 중...')
    
    try {
      execSync('npm run build:production', {
        stdio: 'inherit',
        timeout: mergedOptions.timeout,
        cwd: this.projectRoot
      })
      
      logSuccess('프론트엔드 빌드 완료')
      
      // 빌드 결과 검증
      if (mergedOptions.validate) {
        const validation = await this.validateFrontendBuild()
        if (!validation.valid) {
          throw new Error(`프론트엔드 빌드 검증 실패: ${validation.errors.join(', ')}`)
        }
      }
      
      this.buildHistory.push({
        type: 'frontend',
        timestamp: new Date().toISOString(),
        success: true
      })
      
      return { success: true }
      
    } catch (error) {
      logError(`프론트엔드 빌드 실패: ${(error as Error).message}`)
      
      this.buildHistory.push({
        type: 'frontend',
        timestamp: new Date().toISOString(),
        success: false,
        error: (error as Error).message
      })
      
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 전체 빌드 실행
   */
  async buildAll(options: Partial<BuildOptions> = {}): Promise<BuildResult> {
    const mergedOptions = { ...this.options, ...options }
    const startTime = Date.now()
    
    logStep('BUILD_ALL', '전체 빌드 시작...')
    
    try {
      // 1. 기존 dist 폴더 정리
      if (mergedOptions.cleanup) {
        await this.cleanupDist()
      }
      
      // 2. 백엔드 빌드
      const backendResult = await this.buildBackend(mergedOptions)
      if (!backendResult.success) {
        throw new Error(`백엔드 빌드 실패: ${backendResult.error}`)
      }
      
      // 3. 프론트엔드 빌드
      const frontendResult = await this.buildFrontend(mergedOptions)
      if (!frontendResult.success) {
        throw new Error(`프론트엔드 빌드 실패: ${frontendResult.error}`)
      }
      
      // 4. dist 폴더 구조 정리
      await this.organizeDistStructure()
      
      // 5. 최종 검증
      if (mergedOptions.validate) {
        const finalValidation = await this.validateBuild()
        if (!finalValidation.valid) {
          throw new Error(`최종 빌드 검증 실패: ${finalValidation.errors.join(', ')}`)
        }
      }
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      logSuccess(`전체 빌드 완료 (소요시간: ${duration}초)`)
      
      return {
        success: true,
        duration,
        backend: backendResult,
        frontend: frontendResult
      }
      
    } catch (error) {
      logError(`전체 빌드 실패: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * dist 폴더 정리
   */
  private async cleanupDist(): Promise<void> {
    logStep('CLEANUP', '기존 dist 폴더 정리 중...')
    
    const distPath = path.join(this.projectRoot, 'dist')
    
    if (this.fileUtils.exists(distPath)) {
      this.fileUtils.remove(distPath, { recursive: true, force: true })
      logSuccess('기존 dist 폴더 정리 완료')
    }
  }

  /**
   * dist 폴더 구조 정리
   */
  private async organizeDistStructure(): Promise<void> {
    logStep('ORGANIZE', 'dist 폴더 구조 정리 중...')
    
    try {
      const distPath = path.join(this.projectRoot, 'dist')
      
      if (!this.fileUtils.exists(distPath)) {
        throw new Error('dist 폴더가 존재하지 않습니다.')
      }
      
      // 1. frontend 폴더 생성 및 파일 이동
      const frontendPath = path.join(distPath, 'frontend')
      this.fileUtils.ensureDirectory(frontendPath)
      
      // 프론트엔드 파일들을 frontend 폴더로 이동
      const items = fs.readdirSync(distPath)
      for (const item of items) {
        const itemPath = path.join(distPath, item)
        const stat = fs.statSync(itemPath)
        
        // HTML, CSS, JS 파일과 assets 폴더들을 frontend로 이동
        if (stat.isFile() && (item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.js'))) {
          const newPath = path.join(frontendPath, item)
          this.fileUtils.move(itemPath, newPath)
          logInfo(`프론트엔드 파일 이동: ${item}`)
        } else if (stat.isDirectory() && (item === 'assets' || item === 'js' || item === 'fonts' || item === 'img' || item === 'video')) {
          const newPath = path.join(frontendPath, item)
          if (this.fileUtils.exists(newPath)) {
            this.fileUtils.remove(newPath, { recursive: true, force: true })
          }
          this.fileUtils.move(itemPath, newPath)
          logInfo(`프론트엔드 폴더 이동: ${item}`)
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
        logInfo('shared 폴더를 dist 루트로 이동')
      }
      
      // 3. data 폴더 생성 (src/data 복사)
      const srcDataPath = path.join(this.projectRoot, 'src', 'data')
      const distDataPath = path.join(distPath, 'data')
      
      if (this.fileUtils.exists(srcDataPath)) {
        if (this.fileUtils.exists(distDataPath)) {
          this.fileUtils.remove(distDataPath, { recursive: true, force: true })
        }
        this.fileUtils.copyDirectory(srcDataPath, distDataPath)
        logInfo('data 폴더 복사 완료')
      }
      
      logSuccess('dist 폴더 구조 정리 완료')
      
    } catch (error) {
      logError(`dist 폴더 구조 정리 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 백엔드 빌드 검증
   */
  private async validateBackendBuild(): Promise<ValidationResult> {
    const requiredPaths = [
      'dist/backend',
      'dist/backend/index.js'
    ]
    
    const errors: string[] = []
    
    for (const buildPath of requiredPaths) {
      const fullPath = path.join(this.projectRoot, buildPath)
      if (!this.fileUtils.exists(fullPath)) {
        errors.push(`백엔드 빌드 결과 없음: ${buildPath}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 프론트엔드 빌드 검증
   */
  private async validateFrontendBuild(): Promise<ValidationResult> {
    const requiredPaths = [
      'dist',
      'dist/index.html'
    ]
    
    const errors: string[] = []
    
    for (const buildPath of requiredPaths) {
      const fullPath = path.join(this.projectRoot, buildPath)
      if (!this.fileUtils.exists(fullPath)) {
        errors.push(`프론트엔드 빌드 결과 없음: ${buildPath}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 전체 빌드 검증
   */
  private async validateBuild(): Promise<ValidationResult> {
    const buildPaths = [
      'dist/backend',
      'dist/frontend',
      'dist/shared',
      'dist/data'
    ]
    
    const errors: string[] = []
    
    for (const buildPath of buildPaths) {
      const fullPath = path.join(this.projectRoot, buildPath)
      if (!this.fileUtils.exists(fullPath)) {
        errors.push(`빌드 결과를 찾을 수 없습니다: ${buildPath}`)
      }
    }
    
    const isValid = errors.length === 0
    
    if (isValid) {
      logSuccess('빌드 결과 검증 완료')
    } else {
      logError('빌드 결과 검증 실패:')
      errors.forEach(error => logError(`- ${error}`))
    }
    
    return { valid: isValid, errors }
  }

  /**
   * 빌드 정보 출력
   */
  printBuildInfo(): void {
    logInfo('\n📊 빌드 결과:')
    logInfo('- 백엔드: dist/backend/')
    logInfo('- 프론트엔드: dist/frontend/')
    logInfo('- 공유 모듈: dist/shared/')
    logInfo('- 데이터: dist/data/')
    
    logInfo('\n🔗 서비스 시작:')
    logInfo('- 백엔드: node dist/backend/index.js')
    logInfo('- 프론트엔드: node scripts/serve-frontend-simple.cjs')
  }

  /**
   * 빌드 히스토리 조회
   */
  getBuildHistory(): BuildHistoryEntry[] {
    return this.buildHistory
  }

  /**
   * 최근 빌드 상태 조회
   */
  getLastBuildStatus(): BuildHistoryEntry | null {
    if (this.buildHistory.length === 0) {
      return null
    }
    
    return this.buildHistory[this.buildHistory.length - 1]
  }

  /**
   * 빌드 통계 생성
   */
  getBuildStats(): {
    total: number
    successful: number
    failed: number
    successRate: string
  } {
    const total = this.buildHistory.length
    const successful = this.buildHistory.filter(build => build.success).length
    const failed = total - successful
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) : '0'
    }
  }
}
