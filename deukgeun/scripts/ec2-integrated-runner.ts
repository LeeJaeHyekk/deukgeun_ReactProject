#!/usr/bin/env node

/**
 * EC2 통합 실행 스크립트
 * 모든 모듈화된 기능을 통합하여 EC2 환경에서 실행
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { 
  logStep, 
  logSuccess, 
  logError, 
  logInfo, 
  logWarning,
  logSeparator,
  configureLogger,
  setLogLevel,
  setLogPrefix
} from './modules/logger-functions'
import { runConvertScript } from './convert-script'
import { runBuildScript } from './build-script'
import { runDeployScript } from './deploy-script'
import { runSafetyScript } from './safety-script'
import { runEnvScript } from './env-script'
import { runPM2Script } from './pm2-script'
import { runHealthScript } from './health-script'
import { handleError, ErrorType, ErrorSeverity } from './modules/error-recovery-functions'
import { PerformanceMonitor, ParallelProcessor, performanceUtils } from './modules/performance-functions'

// 실행 옵션 인터페이스
interface EC2RunOptions {
  environment: 'production' | 'staging' | 'development'
  skipTests: boolean
  skipBackup: boolean
  skipDatabase: boolean
  skipFirewall: boolean
  parallel: boolean
  maxWorkers: number
  timeout: number
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: EC2RunOptions = {
  environment: 'production',
  skipTests: false,
  skipBackup: false,
  skipDatabase: false,
  skipFirewall: false,
  parallel: true,
  maxWorkers: performanceUtils.getOptimalWorkerCount(),
  timeout: 600000, // 10분
  verbose: true,
  dryRun: false
}

/**
 * EC2 통합 실행기 클래스
 */
class EC2IntegratedRunner {
  private options: EC2RunOptions
  private performanceMonitor: PerformanceMonitor
  private startTime: number
  private projectRoot: string
  private logDir: string
  private backupDir: string

  constructor(options: Partial<EC2RunOptions> = {}) {
    this.options = { ...defaultOptions, ...options }
    this.performanceMonitor = new PerformanceMonitor()
    this.startTime = Date.now()
    this.projectRoot = process.cwd()
    this.logDir = path.join(this.projectRoot, 'logs')
    this.backupDir = path.join(this.projectRoot, 'backups')
    
    // 로그 디렉토리 생성
    this.ensureDirectories()
    
    // 로거 설정
    configureLogger({
      level: this.options.verbose ? 'debug' : 'info',
      prefix: 'EC2-RUNNER'
    })
  }

  /**
   * 필요한 디렉토리들 생성
   */
  private ensureDirectories(): void {
    const dirs = [this.logDir, this.backupDir, 'dist']
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  }

  /**
   * 시스템 요구사항 확인
   */
  async checkSystemRequirements(): Promise<boolean> {
    logStep('SYSTEM_CHECK', '시스템 요구사항 확인 중...')
    
    try {
      // Node.js 버전 확인
      const nodeVersion = process.version
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
      if (majorVersion < 16) {
        logError(`Node.js ${nodeVersion}는 너무 오래됨. 16 이상 필요`)
        return false
      }

      // 메모리 확인
      const memUsage = process.memoryUsage()
      const memUsageMB = memUsage.heapUsed / 1024 / 1024
      if (memUsageMB > 1000) {
        logWarning(`높은 메모리 사용량: ${memUsageMB.toFixed(2)}MB`)
      }

      // 디스크 공간 확인
      const stats = fs.statSync(this.projectRoot)
      if (stats.size === 0) {
        logError('디스크 공간 부족')
        return false
      }

      // 필수 파일 확인
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'ecosystem.config.cjs'
      ]

      for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(this.projectRoot, file))) {
          logError(`필수 파일 누락: ${file}`)
          return false
        }
      }

      logSuccess('시스템 요구사항 확인 완료')
      return true

    } catch (error) {
      logError(`시스템 확인 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 환경 설정
   */
  async setupEnvironment(): Promise<boolean> {
    logStep('ENV_SETUP', '환경 설정 중...')
    
    try {
      // 환경 변수 설정
      process.env.NODE_ENV = this.options.environment
      
      // .env 파일 확인
      const envFile = path.join(this.projectRoot, '.env')
      if (!fs.existsSync(envFile)) {
        logWarning('.env 파일이 없습니다. 기본 설정을 사용합니다.')
      }

      // 환경 스크립트 실행
      if (!this.options.dryRun) {
        const envResult = await runEnvScript({
          verbose: this.options.verbose
        })

        if (!envResult.success) {
          logError('환경 설정 실패')
          return false
        }
      }

      logSuccess('환경 설정 완료')
      return true

    } catch (error) {
      logError(`환경 설정 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 백업 생성
   */
  async createBackup(): Promise<boolean> {
    if (this.options.skipBackup) {
      logInfo('백업 생성을 건너뜁니다.')
      return true
    }

    logStep('BACKUP', '백업 생성 중...')
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(this.backupDir, `backup-${timestamp}`)
      
      // 백업 디렉토리 생성
      fs.mkdirSync(backupPath, { recursive: true })
      
      // 백업할 파일들
      const backupTargets = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'ecosystem.config.cjs',
        '.env',
        'src'
      ]
      
      let backupCount = 0
      for (const target of backupTargets) {
        const sourcePath = path.join(this.projectRoot, target)
        const destPath = path.join(backupPath, target)
        
        if (fs.existsSync(sourcePath)) {
          const stat = fs.statSync(sourcePath)
          if (stat.isDirectory()) {
            this.copyDirectory(sourcePath, destPath)
          } else {
            fs.copyFileSync(sourcePath, destPath)
          }
          backupCount++
        }
      }
      
      // 백업 정보 저장
      const backupInfo = {
        timestamp,
        path: backupPath,
        fileCount: backupCount,
        targets: backupTargets.filter(t => fs.existsSync(path.join(this.projectRoot, t)))
      }
      
      fs.writeFileSync(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(backupInfo, null, 2)
      )
      
      logSuccess(`백업 생성 완료: ${backupCount}개 항목`)
      return true
      
    } catch (error) {
      logError(`백업 생성 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 디렉토리 복사 (재귀)
   */
  private copyDirectory(source: string, destination: string): void {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true })
    }
    
    const items = fs.readdirSync(source)
    
    for (const item of items) {
      const sourcePath = path.join(source, item)
      const destPath = path.join(destination, item)
      const stat = fs.statSync(sourcePath)
      
      if (stat.isDirectory()) {
        this.copyDirectory(sourcePath, destPath)
      } else {
        fs.copyFileSync(sourcePath, destPath)
      }
    }
  }

  /**
   * 변환 실행
   */
  async runConversion(): Promise<boolean> {
    logStep('CONVERSION', '코드 변환 실행 중...')
    
    try {
      const convertResult = await runConvertScript({
        verbose: this.options.verbose,
        validate: true
      })

      if (!convertResult.success) {
        logError('변환 실패')
        return false
      }

      logSuccess('코드 변환 완료')
      return true

    } catch (error) {
      logError(`변환 실행 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 빌드 실행
   */
  async runBuild(): Promise<boolean> {
    logStep('BUILD', '프로젝트 빌드 실행 중...')
    
    try {
      const buildResult = await runBuildScript({
        verbose: this.options.verbose,
        validate: true,
        safety: true,
        backup: true
      })

      if (!buildResult.success) {
        logError('빌드 실패')
        return false
      }

      logSuccess('프로젝트 빌드 완료')
      return true

    } catch (error) {
      logError(`빌드 실행 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 배포 실행
   */
  async runDeploy(): Promise<boolean> {
    logStep('DEPLOY', '배포 실행 중...')
    
    try {
      const deployResult = await runDeployScript({
        verbose: this.options.verbose,
        validate: true,
        safety: true,
        backup: true
      })

      if (!deployResult.success) {
        logError('배포 실패')
        return false
      }

      logSuccess('배포 완료')
      return true

    } catch (error) {
      logError(`배포 실행 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * PM2 서비스 관리
   */
  async manageServices(): Promise<boolean> {
    logStep('SERVICES', 'PM2 서비스 관리 중...')
    
    try {
      const pm2Result = await runPM2Script({
        action: 'restart',
        verbose: this.options.verbose
      })

      if (!pm2Result.success) {
        logError('PM2 서비스 관리 실패')
        return false
      }

      logSuccess('PM2 서비스 관리 완료')
      return true

    } catch (error) {
      logError(`PM2 서비스 관리 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 헬스체크 실행
   */
  async runHealthCheck(): Promise<boolean> {
    logStep('HEALTH', '헬스체크 실행 중...')
    
    try {
      const healthResult = await runHealthScript({
        verbose: this.options.verbose
      })

      if (!healthResult.success) {
        logWarning('헬스체크 실패')
        return false
      }

      logSuccess('헬스체크 완료')
      return true

    } catch (error) {
      logWarning(`헬스체크 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 안전 검사 실행
   */
  async runSafetyCheck(): Promise<boolean> {
    logStep('SAFETY', '안전 검사 실행 중...')
    
    try {
      const safetyResult = await runSafetyScript({
        verbose: this.options.verbose
      })

      if (!safetyResult.success) {
        logWarning('안전 검사 실패')
        return false
      }

      logSuccess('안전 검사 완료')
      return true

    } catch (error) {
      logWarning(`안전 검사 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 전체 실행 프로세스
   */
  async execute(): Promise<{ success: boolean; duration: number; results: any }> {
    const startTime = Date.now()
    const results: any = {}

    try {
      logSeparator('=', 60, 'bright')
      logInfo('🚀 EC2 통합 실행을 시작합니다...')
      logSeparator('=', 60, 'bright')

      // 1. 시스템 요구사항 확인
      if (!await this.checkSystemRequirements()) {
        throw new Error('시스템 요구사항 확인 실패')
      }

      // 2. 환경 설정
      if (!await this.setupEnvironment()) {
        throw new Error('환경 설정 실패')
      }

      // 3. 백업 생성
      if (!await this.createBackup()) {
        throw new Error('백업 생성 실패')
      }

      // 4. 변환 실행
      if (!await this.runConversion()) {
        throw new Error('변환 실행 실패')
      }

      // 5. 빌드 실행
      if (!await this.runBuild()) {
        throw new Error('빌드 실행 실패')
      }

      // 6. 배포 실행
      if (!await this.runDeploy()) {
        throw new Error('배포 실행 실패')
      }

      // 7. PM2 서비스 관리
      if (!await this.manageServices()) {
        throw new Error('PM2 서비스 관리 실패')
      }

      // 8. 헬스체크
      await this.runHealthCheck()

      // 9. 안전 검사
      await this.runSafetyCheck()

      // 성공 처리
      const duration = Date.now() - startTime
      results.duration = duration
      results.success = true

      logSeparator('=', 60, 'green')
      logSuccess('🎉 EC2 통합 실행이 성공적으로 완료되었습니다!')
      logInfo(`⏱️  소요시간: ${(duration / 1000).toFixed(2)}초`)
      logSeparator('=', 60, 'green')

      return { success: true, duration, results }

    } catch (error) {
      const duration = Date.now() - startTime
      logError(`EC2 통합 실행 실패: ${(error as Error).message}`)
      
      return { success: false, duration, results }
    }
  }
}

/**
 * EC2 통합 실행 함수
 */
export async function runEC2Integrated(options: Partial<EC2RunOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const runner = new EC2IntegratedRunner(options)
  return await runner.execute()
}

// 메인 실행 함수
async function main(): Promise<void> {
  try {
    // 명령행 인수 파싱
    const args = process.argv.slice(2)
    const options: Partial<EC2RunOptions> = {}

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--environment':
        case '-e':
          options.environment = args[++i] as 'production' | 'staging' | 'development'
          break
        case '--skip-tests':
          options.skipTests = true
          break
        case '--skip-backup':
          options.skipBackup = true
          break
        case '--skip-database':
          options.skipDatabase = true
          break
        case '--skip-firewall':
          options.skipFirewall = true
          break
        case '--no-parallel':
          options.parallel = false
          break
        case '--max-workers':
          options.maxWorkers = parseInt(args[++i])
          break
        case '--timeout':
          options.timeout = parseInt(args[++i])
          break
        case '--verbose':
        case '-v':
          options.verbose = true
          break
        case '--dry-run':
          options.dryRun = true
          break
        case '--help':
        case '-h':
          console.log(`
EC2 통합 실행 스크립트

사용법: npx ts-node ec2-integrated-runner.ts [옵션]

옵션:
  -e, --environment <env>     환경 설정 (production, staging, development)
  --skip-tests               테스트 건너뛰기
  --skip-backup              백업 건너뛰기
  --skip-database            데이터베이스 설정 건너뛰기
  --skip-firewall            방화벽 설정 건너뛰기
  --no-parallel              병렬 처리 비활성화
  --max-workers <num>        최대 워커 수
  --timeout <ms>             타임아웃 (밀리초)
  -v, --verbose              상세 로그
  --dry-run                  실제 실행 없이 시뮬레이션
  -h, --help                 도움말 표시
          `)
          process.exit(0)
          break
      }
    }

    const result = await runEC2Integrated(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }

  } catch (error) {
    logError(`실행 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { EC2IntegratedRunner, runEC2Integrated } - 이미 위에서 export됨
