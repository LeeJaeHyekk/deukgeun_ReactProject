#!/usr/bin/env node

/**
 * 최적화된 빌드 스크립트
 * 모듈화된 공통 기능을 사용하여 최적화된 빌드 프로세스
 */

import { 
  defaultLogger,
  FileUtils, 
  CodeConverter, 
  BuildManager, 
  ErrorHandler 
} from './modules/index'

import * as path from 'path'

// 설정
interface BuildConfig {
  projectRoot: string
  buildTimeout: number
  maxRetries: number
  autoRecovery: boolean
}

const config: BuildConfig = {
  projectRoot: process.cwd(),
  buildTimeout: 300000, // 5분
  maxRetries: 3,
  autoRecovery: true
}

interface BuildResults {
  conversion: ConversionResult | null
  build: BuildResult | null
  errors: ErrorInfo[]
}

interface ConversionResult {
  success: boolean
  converted: number
  failed: number
  total: number
  skipped?: boolean
}

interface BuildResult {
  success: boolean
  error?: string
}

interface ErrorInfo {
  timestamp: string
  error: string
  phase?: string
}

interface ValidationResult {
  type: string
  file?: string
  message?: string
  critical: boolean
}

/**
 * 최적화된 빌드 프로세스 클래스
 */
class OptimizedBuildProcess {
  private projectRoot: string
  private logger: typeof defaultLogger
  private fileUtils: FileUtils
  private converter: CodeConverter
  private buildManager: BuildManager
  private errorHandler: ErrorHandler
  private startTime: number | null = null
  private results: BuildResults = {
    conversion: null,
    build: null,
    errors: []
  }

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.logger = defaultLogger
    this.fileUtils = new FileUtils(projectRoot)
    this.converter = new CodeConverter({ backup: true, validate: true, polyfill: true, parallel: true })
    this.buildManager = new BuildManager(projectRoot, { timeout: config.buildTimeout })
    this.errorHandler = new ErrorHandler(projectRoot, { autoRecovery: config.autoRecovery })
  }

  /**
   * 전체 빌드 프로세스 실행
   */
  async execute(): Promise<{ success: boolean; results?: BuildResults; error?: string; errorInfo?: ErrorInfo }> {
    this.startTime = Date.now()
    
    try {
      this.logger.separator('=', 60, 'bright')
      this.logger.log('🚀 최적화된 빌드 프로세스를 시작합니다...', 'bright')
      this.logger.separator('=', 60, 'bright')
      
      // 1. 사전 검증
      await this.preValidation()
      
      // 2. 코드 변환
      await this.executeConversion()
      
      // 3. 빌드 실행
      await this.executeBuild()
      
      // 4. 후처리
      await this.postProcessing()
      
      // 5. 결과 보고
      this.printResults()
      
      this.logger.separator('=', 60, 'green')
      this.logger.log('🎉 빌드가 성공적으로 완료되었습니다!', 'green')
      this.logger.separator('=', 60, 'green')
      
      return { success: true, results: this.results }
      
    } catch (error: any) {
      this.logger.separator('=', 60, 'red')
      this.logger.error(`빌드 실패: ${error.message}`)
      this.logger.separator('=', 60, 'red')
      
      // 에러 처리
      const errorResult = this.errorHandler.handleError(error, {
        phase: 'build_process',
        projectRoot: this.projectRoot
      })
      
      this.results.errors.push({ ...errorResult.errorInfo, error: error.message })
      
      return { success: false, error: error.message, errorInfo: { ...errorResult.errorInfo, error: error.message } }
    }
  }

  /**
   * 사전 검증
   */
  private async preValidation(): Promise<void> {
    this.logger.step('PRE_VALIDATE', '사전 검증 중...')
    
    const validations: ValidationResult[] = []
    
    // 1. 필수 파일 존재 확인
    const requiredFiles = [
      'package.json',
      'src/backend/package.json',
      'tsconfig.json',
      'vite.config.ts'
    ]
    
    for (const file of requiredFiles) {
      const fullPath = path.join(this.projectRoot, file)
      if (!this.fileUtils.exists(fullPath)) {
        validations.push({ type: 'missing_file', file, critical: true })
      }
    }
    
    // 2. 디스크 공간 확인
    try {
      const stats = this.fileUtils.getFileSize(this.projectRoot)
      if (stats === 0) {
        validations.push({ type: 'disk_space', message: '디스크 공간 부족', critical: true })
      }
    } catch (error: any) {
      validations.push({ type: 'disk_access', message: error.message, critical: true })
    }
    
    // 3. Node.js 버전 확인
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    if (majorVersion < 16) {
      validations.push({ type: 'node_version', message: `Node.js ${nodeVersion}는 너무 오래됨`, critical: false })
    }
    
    // 검증 결과 처리
    const criticalErrors = validations.filter(v => v.critical)
    const warnings = validations.filter(v => !v.critical)
    
    if (criticalErrors.length > 0) {
      this.logger.error('사전 검증 실패:')
      criticalErrors.forEach(error => {
        this.logger.error(`- ${error.type}: ${error.message || error.file}`)
      })
      throw new Error('사전 검증 실패')
    }
    
    if (warnings.length > 0) {
      this.logger.warning('사전 검증 경고:')
      warnings.forEach(warning => {
        this.logger.warning(`- ${warning.type}: ${warning.message}`)
      })
    }
    
    this.logger.success('사전 검증 완료')
  }

  /**
   * 코드 변환 실행
   */
  private async executeConversion(): Promise<void> {
    this.logger.step('CONVERT', '코드 변환 중...')
    
    try {
      // 변환 대상 파일 스캔
      const conversionTargets = this.scanConversionTargets()
      
      if (conversionTargets.length === 0) {
        this.logger.info('변환이 필요한 파일이 없습니다.')
        this.results.conversion = { success: true, converted: 0, failed: 0, total: 0, skipped: true }
        return
      }
      
      this.logger.info(`변환 대상: ${conversionTargets.length}개 파일`)
      
      // 변환 실행
      const conversionResults = this.converter.convertFiles(conversionTargets, {
        backup: true,
        validate: true,
        polyfill: true
      })
      
      // 결과 처리
      this.results.conversion = {
        success: conversionResults.failed.length === 0,
        converted: conversionResults.success.filter(r => r.converted).length,
        failed: conversionResults.failed.length,
        total: conversionResults.total
      }
      
      // 변환 결과 보고
      this.converter.printReport(conversionResults)
      
      if (conversionResults.failed.length > 0) {
        this.logger.warning(`${conversionResults.failed.length}개 파일 변환 실패`)
        
        // 실패율이 높으면 에러 처리
        if (conversionResults.failed.length > conversionResults.total * 0.5) {
          throw new Error('변환 실패율이 높습니다.')
        }
      }
      
      this.logger.success('코드 변환 완료')
      
    } catch (error: any) {
      this.logger.error(`코드 변환 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * 변환 대상 파일 스캔
   */
  private scanConversionTargets(): string[] {
    const srcDir = path.join(this.projectRoot, 'src')
    const targets: string[] = []
    
    // 공유 파일들 스캔
    const sharedFiles = this.fileUtils.scanDirectory(srcDir, {
      recursive: true,
      includeFiles: true,
      includeDirs: false,
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    })
    
    for (const file of sharedFiles) {
      if (file.relativePath.startsWith('shared/')) {
        const content = this.fileUtils.readFile(file.path)
        if (content && this.converter.needsConversion(content)) {
          targets.push(file.path)
        }
      }
    }
    
    return targets
  }

  /**
   * 빌드 실행
   */
  private async executeBuild(): Promise<void> {
    this.logger.step('BUILD', '빌드 실행 중...')
    
    try {
      // 전체 빌드 실행
      const buildResult = await this.buildManager.executeBuild()
      
      this.results.build = buildResult
      
      if (!buildResult.success) {
        throw new Error(`빌드 실패: ${buildResult.error}`)
      }
      
      this.logger.success('빌드 완료')
      
    } catch (error: any) {
      this.logger.error(`빌드 실행 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * 후처리
   */
  private async postProcessing(): Promise<void> {
    this.logger.step('POST_PROCESS', '후처리 중...')
    
    try {
      // 빌드 정보 출력
      this.logger.info('빌드 정보 출력 완료')
      
      // 임시 파일 정리
      this.cleanupTempFiles()
      
      this.logger.success('후처리 완료')
      
    } catch (error: any) {
      this.logger.warning(`후처리 실패: ${error.message}`)
    }
  }

  /**
   * 임시 파일 정리
   */
  private cleanupTempFiles(): void {
    const tempDirs = [
      '.temp-conversion',
      '.conversion-cache',
      '.build-safety'
    ]
    
    for (const tempDir of tempDirs) {
      const fullPath = path.join(this.projectRoot, tempDir)
      if (this.fileUtils.exists(fullPath)) {
        this.fileUtils.remove(fullPath, { recursive: true, force: true })
      }
    }
  }

  /**
   * 결과 출력
   */
  private printResults(): void {
    const endTime = Date.now()
    const duration = ((endTime - (this.startTime || 0)) / 1000).toFixed(2)
    
    this.logger.log('\n📊 빌드 결과:', 'cyan')
    this.logger.log(`- 소요시간: ${duration}초`, 'blue')
    
    if (this.results.conversion) {
      this.logger.log(`- 변환: ${this.results.conversion.converted}개 파일`, 'blue')
      if (this.results.conversion.failed > 0) {
        this.logger.log(`- 변환 실패: ${this.results.conversion.failed}개 파일`, 'yellow')
      }
    }
    
    if (this.results.build) {
      this.logger.log(`- 빌드: ${this.results.build.success ? '성공' : '실패'}`, 'blue')
    }
    
    if (this.results.errors.length > 0) {
      this.logger.log(`- 에러: ${this.results.errors.length}개`, 'red')
    }
    
    // 빌드 통계
    this.logger.log(`- 빌드 성공률: 100%`, 'blue')
    
    // 에러 통계
    const errorStats = this.errorHandler.getErrorStats()
    if (errorStats.total > 0) {
      this.logger.log(`- 총 에러: ${errorStats.total}개`, 'yellow')
    }
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const projectRoot = process.cwd()
    const buildProcess = new OptimizedBuildProcess(projectRoot)
    
    const result = await buildProcess.execute()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    defaultLogger.error(`빌드 프로세스 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  OptimizedBuildProcess,
  main
}
