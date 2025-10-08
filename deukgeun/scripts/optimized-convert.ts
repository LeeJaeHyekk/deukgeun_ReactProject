#!/usr/bin/env node

/**
 * 최적화된 변환 스크립트
 * 모듈화된 공통 기능을 사용하여 최적화된 코드 변환 프로세스
 */

import { 
  defaultLogger,
  FileUtils, 
  CodeConverter, 
  ErrorHandler 
} from './modules/index'

import * as path from 'path'

// 설정
interface ConvertConfig {
  projectRoot: string
  maxRetries: number
  autoRecovery: boolean
  backup: boolean
  validate: boolean
}

const config: ConvertConfig = {
  projectRoot: process.cwd(),
  maxRetries: 3,
  autoRecovery: true,
  backup: true,
  validate: true
}

interface ConvertResults {
  conversion: ConversionResult | null
  errors: ErrorInfo[]
}

interface ConversionResult {
  success: boolean
  converted: number
  failed: number
  total: number
  skipped?: boolean
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
 * 최적화된 변환 프로세스 클래스
 */
class OptimizedConvertProcess {
  private projectRoot: string
  private logger: typeof defaultLogger
  private fileUtils: FileUtils
  private converter: CodeConverter
  private errorHandler: ErrorHandler
  private startTime: number | null = null
  private results: ConvertResults = {
    conversion: null,
    errors: []
  }
  private conversionTargets: string[] = []

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.logger = defaultLogger
    this.fileUtils = new FileUtils(projectRoot)
    this.converter = new CodeConverter({ 
      backup: config.backup, 
      validate: config.validate,
      polyfill: true,
      parallel: true
    })
    this.errorHandler = new ErrorHandler(projectRoot, { autoRecovery: config.autoRecovery })
  }

  /**
   * 전체 변환 프로세스 실행
   */
  async execute(): Promise<{ success: boolean; results?: ConvertResults; error?: string; errorInfo?: ErrorInfo }> {
    this.startTime = Date.now()
    
    try {
      this.logger.separator('=', 60, 'bright')
      this.logger.log('🚀 최적화된 변환 프로세스를 시작합니다...', 'bright')
      this.logger.separator('=', 60, 'bright')
      
      // 1. 사전 검증
      await this.preValidation()
      
      // 2. 변환 대상 스캔
      await this.scanTargets()
      
      // 3. 변환 실행
      await this.executeConversion()
      
      // 4. 후처리
      await this.postProcessing()
      
      // 5. 결과 보고
      this.printResults()
      
      this.logger.separator('=', 60, 'green')
      this.logger.log('🎉 변환이 성공적으로 완료되었습니다!', 'green')
      this.logger.separator('=', 60, 'green')
      
      return { success: true, results: this.results }
      
    } catch (error: any) {
      this.logger.separator('=', 60, 'red')
      this.logger.error(`변환 실패: ${error.message}`)
      this.logger.separator('=', 60, 'red')
      
      // 에러 처리
      const errorResult = this.errorHandler.handleError(error, {
        phase: 'conversion_process',
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
      'src/shared/config/index.ts',
      'src/shared/lib/env.ts',
      'src/shared/api/client.ts',
      'src/shared/lib/recaptcha.ts'
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
    
    // 3. 메모리 사용량 확인
    const memUsage = process.memoryUsage()
    const memUsageMB = memUsage.heapUsed / 1024 / 1024
    if (memUsageMB > 1000) { // 1GB 이상
      validations.push({ type: 'memory_usage', message: `높은 메모리 사용량: ${memUsageMB.toFixed(2)}MB`, critical: false })
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
   * 변환 대상 스캔
   */
  private async scanTargets(): Promise<void> {
    this.logger.step('SCAN', '변환 대상 스캔 중...')
    
    try {
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
      
      this.logger.info(`변환 대상: ${targets.length}개 파일`)
      
      if (targets.length === 0) {
        this.logger.info('변환이 필요한 파일이 없습니다.')
        this.results.conversion = { success: true, converted: 0, failed: 0, total: 0, skipped: true }
        return
      }
      
      this.conversionTargets = targets
      this.logger.success('변환 대상 스캔 완료')
      
    } catch (error: any) {
      this.logger.error(`변환 대상 스캔 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * 변환 실행
   */
  private async executeConversion(): Promise<void> {
    this.logger.step('CONVERT', '변환 실행 중...')
    
    try {
      if (!this.conversionTargets || this.conversionTargets.length === 0) {
        this.logger.info('변환할 파일이 없습니다.')
        return
      }
      
      // 변환 실행
      const conversionResults = this.converter.convertFiles(this.conversionTargets, {
        backup: config.backup,
        validate: config.validate,
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
      
      this.logger.success('변환 완료')
      
    } catch (error: any) {
      this.logger.error(`변환 실행 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * 후처리
   */
  private async postProcessing(): Promise<void> {
    this.logger.step('POST_PROCESS', '후처리 중...')
    
    try {
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
    
    this.logger.log('\n📊 변환 결과:', 'cyan')
    this.logger.log(`- 소요시간: ${duration}초`, 'blue')
    
    if (this.results.conversion) {
      this.logger.log(`- 총 파일: ${this.results.conversion.total}개`, 'blue')
      this.logger.log(`- 변환됨: ${this.results.conversion.converted}개`, 'blue')
      this.logger.log(`- 실패: ${this.results.conversion.failed}개`, 'blue')
      
      if (this.results.conversion.skipped) {
        this.logger.log(`- 건너뜀: 변환이 필요한 파일이 없음`, 'blue')
      }
    }
    
    if (this.results.errors.length > 0) {
      this.logger.log(`- 에러: ${this.results.errors.length}개`, 'red')
    }
    
    // 변환 통계
    if (this.results.conversion && this.results.conversion.total > 0) {
      const successRate = ((this.results.conversion.converted / this.results.conversion.total) * 100).toFixed(2)
      this.logger.log(`- 성공률: ${successRate}%`, 'blue')
    }
    
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
    const convertProcess = new OptimizedConvertProcess(projectRoot)
    
    const result = await convertProcess.execute()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    defaultLogger.error(`변환 프로세스 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  OptimizedConvertProcess,
  main
}
