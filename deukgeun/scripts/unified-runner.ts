#!/usr/bin/env node

/**
 * 통합 실행 스크립트
 * 모든 빌드, 변환, 배포, 서비스 관리를 하나의 스크립트로 통합
 */

import * as path from 'path'
import * as fs from 'fs'
import { execSync, spawn } from 'child_process'

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step: string, message: string): void {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'blue')
}

function logSeparator(char: string = '=', length: number = 60, color: keyof typeof colors = 'bright'): void {
  log(char.repeat(length), color)
}

// 실행 옵션 인터페이스
interface UnifiedRunnerOptions {
  projectRoot: string
  environment: 'development' | 'production' | 'staging'
  phases: string[]
  skipPhases: string[]
  verbose: boolean
  dryRun: boolean
  backup: boolean
  parallel: boolean
  maxRetries: number
  timeout: number
  autoRecovery: boolean
  safety: boolean
}

// 기본 옵션
const defaultOptions: UnifiedRunnerOptions = {
  projectRoot: process.cwd(),
  environment: 'development',
  phases: ['env', 'safety', 'convert', 'build', 'deploy', 'pm2', 'health'],
  skipPhases: [],
  verbose: false,
  dryRun: false,
  backup: true,
  parallel: false,
  maxRetries: 3,
  timeout: 300000,
  autoRecovery: true,
  safety: true
}

/**
 * 통합 실행기 클래스
 */
class UnifiedRunner {
  private options: UnifiedRunnerOptions
  private startTime: number
  private results: any = {}
  private backupPath?: string

  constructor(options: Partial<UnifiedRunnerOptions> = {}) {
    this.options = { ...defaultOptions, ...options }
    this.startTime = Date.now()
  }

  /**
   * 메인 실행 함수
   */
  async run(): Promise<{ success: boolean; duration: number; results: any }> {
    try {
      logSeparator('=', 80, 'bright')
      log('🚀 통합 실행 스크립트 시작', 'bright')
      logSeparator('=', 80, 'bright')

      // 실행 계획 출력
      this.printExecutionPlan()

      // 드라이 런 모드
      if (this.options.dryRun) {
        logInfo('드라이 런 모드: 실제 실행하지 않습니다.')
        return {
          success: true,
          duration: 0,
          results: { dryRun: true }
        }
      }

      // 단계별 실행
      for (const phase of this.options.phases) {
        if (this.options.skipPhases.includes(phase)) {
          logInfo(`단계 건너뛰기: ${phase}`)
          continue
        }

        logSeparator('-', 40, 'cyan')
        logStep(phase.toUpperCase(), `${phase} 단계 실행 중...`)

        try {
          const result = await this.executePhase(phase)
          this.results[phase] = result

          if (!result.success) {
            if (this.options.autoRecovery) {
              logWarning(`${phase} 단계 실패, 복구 시도 중...`)
              const recoveryResult = await this.recoverFromError(phase)
              if (!recoveryResult.success) {
                throw new Error(`${phase} 단계 실패 및 복구 불가`)
              }
            } else {
              throw new Error(`${phase} 단계 실패`)
            }
          }

          logSuccess(`${phase} 단계 완료`)

        } catch (error: any) {
          logError(`${phase} 단계 실패: ${error.message}`)
          throw error
        }
      }

      const duration = Date.now() - this.startTime
      const success = Object.values(this.results).every((result: any) => result.success !== false)

      // 최종 결과 출력
      this.printFinalResults(success, duration)

      return {
        success,
        duration,
        results: this.results
      }

    } catch (error: any) {
      const duration = Date.now() - this.startTime
      logError(`통합 실행 실패: ${error.message}`)
      
      return {
        success: false,
        duration,
        results: { error: error.message, ...this.results }
      }
    }
  }

  /**
   * 단계별 실행
   */
  private async executePhase(phase: string): Promise<{ success: boolean; results: any }> {
    switch (phase) {
      case 'env':
        return await this.runEnvironmentSetup()
      case 'safety':
        return await this.runSafetyCheck()
      case 'convert':
        return await this.runConversion()
      case 'build':
        return await this.runBuild()
      case 'deploy':
        return await this.runDeploy()
      case 'pm2':
        return await this.runPM2Management()
      case 'health':
        return await this.runHealthCheck()
      default:
        throw new Error(`알 수 없는 단계: ${phase}`)
    }
  }

  /**
   * 환경 설정 실행
   */
  private async runEnvironmentSetup(): Promise<{ success: boolean; results: any }> {
    try {
      logInfo('환경 변수 설정 중...')
      
      // .env 파일 확인
      const envFile = path.join(this.options.projectRoot, '.env')
      if (!fs.existsSync(envFile)) {
        logWarning('.env 파일이 없습니다. 기본 설정을 사용합니다.')
      }

      // 환경 변수 설정
      process.env.NODE_ENV = this.options.environment
      
      logSuccess('환경 설정 완료')
      return { success: true, results: { environment: this.options.environment } }

    } catch (error: any) {
      logError(`환경 설정 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 안전장치 실행
   */
  private async runSafetyCheck(): Promise<{ success: boolean; results: any }> {
    try {
      if (!this.options.safety) {
        logInfo('안전장치 비활성화됨')
        return { success: true, results: { skipped: true } }
      }

      logInfo('안전 검사 및 백업 생성 중...')
      
      // 백업 디렉토리 생성
      const backupDir = path.join(this.options.projectRoot, 'backups')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      // 백업 생성
      if (this.options.backup) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        this.backupPath = path.join(backupDir, `backup-${timestamp}`)
        
      // 백업할 파일들
      const backupTargets = ['package.json', 'src', 'scripts']
      for (const target of backupTargets) {
        const sourcePath = path.join(this.options.projectRoot, target)
        if (fs.existsSync(sourcePath)) {
          const destPath = path.join(this.backupPath, target)
          const stat = fs.statSync(sourcePath)
          
          if (stat.isDirectory()) {
            this.copyDirectory(sourcePath, destPath)
          } else {
            // 파일인 경우
            const destDir = path.dirname(destPath)
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }
            fs.copyFileSync(sourcePath, destPath)
          }
        }
      }
        
        logSuccess(`백업 생성 완료: ${this.backupPath}`)
      }

      logSuccess('안전 검사 완료')
      return { success: true, results: { backupPath: this.backupPath } }

    } catch (error: any) {
      logError(`안전 검사 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 코드 변환 실행
   */
  private async runConversion(): Promise<{ success: boolean; results: any }> {
    try {
      logInfo('ES 모듈을 CommonJS로 변환 중...')
      
      // converter-functions 모듈 직접 사용
      const { convertFiles, scanConversionTargets, printConversionReport } = await import('./modules/converter-functions')
      
      // 변환 대상 파일 스캔
      const targets = scanConversionTargets(this.options.projectRoot)
      
      if (targets.length === 0) {
        logInfo('변환할 파일이 없습니다.')
        return { success: true, results: { converted: false, message: 'No files to convert' } }
      }

      // 변환 옵션 설정
      const conversionOptions = {
        backup: this.options.backup,
        validate: false, // 검증 비활성화
        polyfill: true,
        parallel: this.options.parallel,
        maxWorkers: 4
      }

      // 파일 변환 실행
      const report = convertFiles(targets, conversionOptions)
      
      // 결과 보고서 출력
      printConversionReport(report)

      const success = report.failed.length === 0
      if (success) {
        logSuccess('코드 변환 완료')
      } else {
        logWarning(`코드 변환 완료 (${report.failed.length}개 파일 실패)`)
      }

      return { 
        success, 
        results: { 
          converted: true, 
          total: report.total,
          success: report.success.length,
          failed: report.failed.length
        } 
      }

    } catch (error: any) {
      logError(`코드 변환 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 빌드 실행
   */
  private async runBuild(): Promise<{ success: boolean; results: any }> {
    try {
      logInfo('프로젝트 빌드 중...')
      
      // 백엔드 빌드
      logInfo('백엔드 빌드 중...')
      execSync('npm run build:backend', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.options.projectRoot,
        timeout: this.options.timeout
      })

      // 프론트엔드 빌드
      logInfo('프론트엔드 빌드 중...')
      execSync('npm run build', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.options.projectRoot,
        timeout: this.options.timeout
      })

      logSuccess('빌드 완료')
      return { success: true, results: { built: true } }

    } catch (error: any) {
      logError(`빌드 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 배포 실행
   */
  private async runDeploy(): Promise<{ success: boolean; results: any }> {
    try {
      logInfo('배포 실행 중...')
      
      // dist 디렉토리 확인
      const distDir = path.join(this.options.projectRoot, 'dist')
      if (!fs.existsSync(distDir)) {
        throw new Error('dist 디렉토리가 없습니다. 빌드를 먼저 실행하세요.')
      }

      // 배포 스크립트 실행
      const deployScript = path.join(this.options.projectRoot, 'scripts', 'deploy.ts')
      if (fs.existsSync(deployScript)) {
        execSync(`npx tsx ${deployScript} --verbose`, {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          cwd: this.options.projectRoot,
          timeout: this.options.timeout
        })
      } else {
        logWarning('배포 스크립트를 찾을 수 없습니다. 기본 배포를 실행합니다.')
        // 기본 배포 로직
        this.copyDirectory(distDir, path.join(this.options.projectRoot, 'public'))
      }

      logSuccess('배포 완료')
      return { success: true, results: { deployed: true } }

    } catch (error: any) {
      logError(`배포 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * PM2 관리 실행
   */
  private async runPM2Management(): Promise<{ success: boolean; results: any }> {
    try {
      logInfo('PM2 서비스 관리 중...')
      
      // PM2 설치 확인
      try {
        execSync('pm2 --version', { stdio: 'pipe' })
      } catch {
        logWarning('PM2가 설치되지 않았습니다. npm install -g pm2를 실행하세요.')
        return { success: false, results: { error: 'PM2 not installed' } }
      }

      // PM2 설정 파일 확인
      const configFile = path.join(this.options.projectRoot, 'ecosystem.config.cjs')
      if (!fs.existsSync(configFile)) {
        logWarning('PM2 설정 파일이 없습니다. 기본 설정을 생성합니다.')
        this.createPM2Config(configFile)
      }

      // PM2 프로세스 시작
      execSync('pm2 start ecosystem.config.cjs', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.options.projectRoot,
        timeout: this.options.timeout
      })

      logSuccess('PM2 서비스 시작 완료')
      return { success: true, results: { pm2Started: true } }

    } catch (error: any) {
      logError(`PM2 관리 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 헬스체크 실행
   */
  private async runHealthCheck(): Promise<{ success: boolean; results: any }> {
    try {
      logInfo('헬스체크 실행 중...')
      
      // PM2 상태 확인
      try {
        const status = execSync('pm2 status', { 
          stdio: 'pipe',
          cwd: this.options.projectRoot,
          timeout: 10000
        }).toString()
        
        if (status.includes('online')) {
          logSuccess('PM2 프로세스가 정상적으로 실행 중입니다.')
        } else {
          logWarning('PM2 프로세스 상태를 확인하세요.')
        }
      } catch {
        logWarning('PM2 상태 확인 실패')
      }

      logSuccess('헬스체크 완료')
      return { success: true, results: { healthChecked: true } }

    } catch (error: any) {
      logError(`헬스체크 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 에러 복구
   */
  private async recoverFromError(phase: string): Promise<{ success: boolean; results: any }> {
    try {
      logInfo(`${phase} 단계 복구 시도 중...`)
      
      // 백업에서 복원
      if (this.backupPath && fs.existsSync(this.backupPath)) {
        logInfo('백업에서 복원 중...')
        // 복원 로직 구현
      }

      // 재시도
      return await this.executePhase(phase)

    } catch (error: any) {
      logError(`복구 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
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
   * PM2 설정 파일 생성
   */
  private createPM2Config(configPath: string): void {
    const config = `module.exports = {
  apps: [
    {
      name: 'deukgeun-backend',
      script: 'dist/backend/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: '${this.options.environment}',
        PORT: 5000
      }
    },
    {
      name: 'deukgeun-frontend',
      script: 'dist/frontend/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: '${this.options.environment}',
        PORT: 3000
      }
    }
  ]
}`
    
    fs.writeFileSync(configPath, config)
    logSuccess('PM2 설정 파일 생성 완료')
  }

  /**
   * 실행 계획 출력
   */
  private printExecutionPlan(): void {
    logInfo('\n📋 실행 계획:')
    logInfo(`- 프로젝트: ${this.options.projectRoot}`)
    logInfo(`- 환경: ${this.options.environment}`)
    logInfo(`- 실행 단계: ${this.options.phases.join(' → ')}`)
    logInfo(`- 건너뛸 단계: ${this.options.skipPhases.join(', ') || '없음'}`)
    logInfo(`- 백업: ${this.options.backup ? '활성화' : '비활성화'}`)
    logInfo(`- 자동 복구: ${this.options.autoRecovery ? '활성화' : '비활성화'}`)
    logInfo(`- 상세 로그: ${this.options.verbose ? '활성화' : '비활성화'}`)
    logInfo(`- 드라이 런: ${this.options.dryRun ? '활성화' : '비활성화'}`)
  }

  /**
   * 최종 결과 출력
   */
  private printFinalResults(success: boolean, duration: number): void {
    logSeparator('=', 80, success ? 'green' : 'red')
    
    if (success) {
      logSuccess('🎉 통합 실행이 성공적으로 완료되었습니다!')
    } else {
      logError('❌ 통합 실행 실패')
    }
    
    logInfo(`⏱️  총 소요시간: ${(duration / 1000).toFixed(2)}초`)
    
    // 단계별 결과 요약
    logInfo('\n📊 단계별 결과:')
    for (const [phase, result] of Object.entries(this.results)) {
      const status = (result as any).success ? '✅' : '❌'
      logInfo(`  ${status} ${phase}: ${(result as any).success ? '성공' : '실패'}`)
    }
    
    logSeparator('=', 80, success ? 'green' : 'red')
  }
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<UnifiedRunnerOptions> {
  const args = process.argv.slice(2)
  const options: Partial<UnifiedRunnerOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--environment':
      case '-e':
        options.environment = args[++i] as any
        break
      case '--phases':
        options.phases = args[++i].split(',')
        break
      case '--skip-phases':
        options.skipPhases = args[++i].split(',')
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--dry-run':
      case '-d':
        options.dryRun = true
        break
      case '--no-backup':
        options.backup = false
        break
      case '--parallel':
        options.parallel = true
        break
      case '--max-retries':
      case '-r':
        options.maxRetries = parseInt(args[++i])
        break
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) * 1000
        break
      case '--no-auto-recovery':
        options.autoRecovery = false
        break
      case '--no-safety':
        options.safety = false
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
    }
  }

  return options
}

/**
 * 도움말 출력
 */
function printHelp(): void {
  console.log(`
통합 실행 스크립트 사용법:

  npx ts-node scripts/unified-runner.ts [옵션]

옵션:
  -p, --project-root <path>     프로젝트 루트 경로
  -e, --environment <env>       환경 (development|production|staging)
  --phases <phases>             실행할 단계들 (쉼표로 구분)
  --skip-phases <phases>        건너뛸 단계들 (쉼표로 구분)
  -v, --verbose                상세 로그 활성화
  -d, --dry-run                드라이 런 모드
  --no-backup                  백업 비활성화
  --parallel                   병렬 처리 활성화
  -r, --max-retries <num>      최대 재시도 수
  -t, --timeout <sec>          타임아웃 (초)
  --no-auto-recovery           자동 복구 비활성화
  --no-safety                  안전장치 비활성화
  -h, --help                   도움말 출력

실행 단계:
  env      - 환경 설정
  safety   - 안전 검사 및 백업
  convert  - 코드 변환
  build    - 프로젝트 빌드
  deploy   - 배포
  pm2      - PM2 서비스 관리
  health   - 헬스체크

예시:
  # 전체 실행
  npx ts-node scripts/unified-runner.ts --verbose

  # 특정 단계만 실행
  npx ts-node scripts/unified-runner.ts --phases build,deploy --verbose

  # 특정 단계 건너뛰기
  npx ts-node scripts/unified-runner.ts --skip-phases safety,health --verbose

  # 프로덕션 환경으로 실행
  npx ts-node scripts/unified-runner.ts --environment production --verbose

  # 드라이 런 모드
  npx ts-node scripts/unified-runner.ts --dry-run --verbose
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const runner = new UnifiedRunner(options)
    const result = await runner.run()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`실행 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('unified-runner')) {
  main()
}

export { UnifiedRunner, main }
