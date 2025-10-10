#!/usr/bin/env node

/**
 * 통합 실행 스크립트
 * 모든 빌드, 변환, 배포, 서비스 관리를 하나의 스크립트로 통합
 */

import * as path from 'path'
import * as fs from 'fs'
import { execSync, spawn, exec } from 'child_process'
import { promisify } from 'util'

// 보안을 위한 유틸리티 함수들
const execAsync = promisify(exec)

/**
 * 보안 유틸리티 클래스
 */
class SecurityUtils {
  /**
   * 경로 검증 - Path Traversal 방지
   */
  static validatePath(inputPath: string, basePath: string): boolean {
    try {
      const resolvedPath = path.resolve(inputPath)
      const resolvedBase = path.resolve(basePath)
      return resolvedPath.startsWith(resolvedBase)
    } catch {
      return false
    }
  }

  /**
   * 안전한 명령어 실행
   */
  static async safeExec(command: string, options: any = {}): Promise<{ stdout: string; stderr: string }> {
    // 명령어 화이트리스트 검증
    const allowedCommands = ['npm', 'npx', 'tsc', 'vite', 'pm2', 'node']
    const commandParts = command.trim().split(' ')
    const baseCommand = commandParts[0]
    
    if (!allowedCommands.includes(baseCommand)) {
      throw new Error(`허용되지 않은 명령어: ${baseCommand}`)
    }

    // 위험한 문자 필터링
    const dangerousChars = [';', '&', '|', '`', '$', '(', ')', '<', '>']
    if (dangerousChars.some(char => command.includes(char))) {
      throw new Error(`위험한 문자가 포함된 명령어: ${command}`)
    }

    return await execAsync(command, {
      timeout: options.timeout || 300000,
      maxBuffer: 1024 * 1024 * 10, // 10MB
      ...options
    })
  }

  /**
   * 파일 권한 검증
   */
  static validateFilePermissions(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath)
      // 시스템 파일이나 중요한 파일 보호
      const systemPaths = [
        '/etc/', '/usr/', '/bin/', '/sbin/', '/var/log/',
        'C:\\Windows\\', 'C:\\Program Files\\', 'C:\\ProgramData\\'
      ]
      
      const normalizedPath = path.resolve(filePath)
      return !systemPaths.some(systemPath => normalizedPath.includes(systemPath))
    } catch {
      return false
    }
  }

  /**
   * 디렉토리 크기 제한 검증
   */
  static async validateDirectorySize(dirPath: string, maxSizeMB: number = 1000): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`du -sm "${dirPath}" 2>/dev/null || echo "0"`)
      const sizeMB = parseInt(stdout.split('\t')[0]) || 0
      return sizeMB <= maxSizeMB
    } catch {
      return false
    }
  }
}

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
      
      // dist 디렉토리 생성 및 정리
      const distDir = path.join(this.options.projectRoot, 'dist')
      if (fs.existsSync(distDir)) {
        logInfo('기존 dist 디렉토리 정리 중...')
        fs.rmSync(distDir, { recursive: true, force: true })
      }
      fs.mkdirSync(distDir, { recursive: true })

      // 원본 소스 코드를 dist로 복사 (변환을 위한 준비)
      logInfo('소스 코드를 dist로 복사 중...')
      this.copyDirectory(path.join(this.options.projectRoot, 'src'), path.join(distDir, 'src'))
      
      // package.json과 기타 설정 파일들 복사
      const filesToCopy = ['package.json', 'tsconfig.json', 'vite.config.ts', 'tailwind.config.js', 'postcss.config.mjs']
      for (const file of filesToCopy) {
        const sourcePath = path.join(this.options.projectRoot, file)
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, path.join(distDir, file))
        }
      }

      // 변환 대상 파일 스캔 (dist 내부에서)
      const { scanConversionTargets, convertFiles, printConversionReport } = await import('./modules/converter-functions')
      const targets = scanConversionTargets(distDir)
      
      if (targets.length === 0) {
        logInfo('변환할 파일이 없습니다.')
        return { success: true, results: { converted: false, message: 'No files to convert' } }
      }

      // 변환 옵션 설정
      const conversionOptions = {
        backup: false, // dist 내부에서는 백업 불필요
        validate: true, // CJS 변환 검증 활성화
        polyfill: true,
        parallel: this.options.parallel,
        maxWorkers: 4,
        targetDir: distDir // 변환 대상 디렉토리 지정
      }

      // 파일 변환 실행
      const report = convertFiles(targets, conversionOptions)
      
      // 결과 보고서 출력
      printConversionReport(report)

      // CJS 변환 검증
      const cjsValidation = this.validateCJSConversion(distDir)
      if (!cjsValidation.isValid) {
        logWarning(`CJS 변환 검증 실패: ${cjsValidation.errors.join(', ')}`)
      }

      const success = report.failed.length === 0 && cjsValidation.isValid
      if (success) {
        logSuccess('코드 변환 완료 (100% CJS)')
      } else {
        logWarning(`코드 변환 완료 (${report.failed.length}개 파일 실패, CJS 검증: ${cjsValidation.isValid ? '통과' : '실패'})`)
      }

      return { 
        success, 
        results: { 
          converted: true, 
          total: report.total,
          success: report.success.length,
          failed: report.failed.length,
          cjsValid: cjsValidation.isValid,
          cjsErrors: cjsValidation.errors
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
      
      const distDir = path.join(this.options.projectRoot, 'dist')
      
      // dist 디렉토리 확인
      if (!fs.existsSync(distDir)) {
        throw new Error('dist 디렉토리가 없습니다. 변환을 먼저 실행하세요.')
      }

      // 백엔드 빌드 (dist 내부에서)
      logInfo('백엔드 빌드 중...')
      const backendDistDir = path.join(distDir, 'backend')
      if (!fs.existsSync(backendDistDir)) {
        fs.mkdirSync(backendDistDir, { recursive: true })
      }

      // 백엔드 TypeScript 컴파일 (dist/src/backend에서 dist/backend로)
      const backendSrcDir = path.join(distDir, 'src', 'backend')
      if (fs.existsSync(backendSrcDir)) {
        const tscCommand = `npx tsc --project ${path.join(distDir, 'tsconfig.json')} --outDir ${backendDistDir}`
        await SecurityUtils.safeExec(tscCommand, {
          cwd: distDir,
          timeout: this.options.timeout
        })
      }

      // 프론트엔드 빌드 (dist 내부에서)
      logInfo('프론트엔드 빌드 중...')
      const frontendDistDir = path.join(distDir, 'frontend')
      if (!fs.existsSync(frontendDistDir)) {
        fs.mkdirSync(frontendDistDir, { recursive: true, mode: 0o755 })
      }

      // Vite 빌드 실행 (dist 내부에서) - 안전한 명령어 실행
      await SecurityUtils.safeExec('npx vite build', {
        cwd: distDir,
        timeout: this.options.timeout,
        env: {
          ...process.env,
          NODE_ENV: this.options.environment
        }
      })

      // 빌드 결과 검증
      const buildValidation = this.validateBuildOutput(distDir)
      if (!buildValidation.isValid) {
        logWarning(`빌드 검증 실패: ${buildValidation.errors.join(', ')}`)
      }

      logSuccess('빌드 완료')
      return { 
        success: true, 
        results: { 
          built: true,
          backendBuilt: fs.existsSync(path.join(backendDistDir, 'index.js')),
          frontendBuilt: fs.existsSync(path.join(frontendDistDir, 'index.html')),
          buildValid: buildValidation.isValid,
          buildErrors: buildValidation.errors
        } 
      }

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

      // 빌드 결과물 검증
      const buildValidation = this.validateBuildOutput(distDir)
      if (!buildValidation.isValid) {
        throw new Error(`빌드 결과물이 올바르지 않습니다: ${buildValidation.errors.join(', ')}`)
      }

      // 공유 모듈을 dist/shared로 복사 (프로젝트 구조 유지)
      logInfo('공유 모듈 배포 중...')
      const sharedSrcDir = path.join(distDir, 'src', 'shared')
      const sharedDistDir = path.join(distDir, 'shared')
      
      if (fs.existsSync(sharedSrcDir)) {
        if (fs.existsSync(sharedDistDir)) {
          fs.rmSync(sharedDistDir, { recursive: true, force: true })
        }
        this.copyDirectory(sharedSrcDir, sharedDistDir)
      }

      // 데이터 파일 복사
      logInfo('데이터 파일 배포 중...')
      const dataDir = path.join(distDir, 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      const sourceDataDir = path.join(this.options.projectRoot, 'src', 'data')
      if (fs.existsSync(sourceDataDir)) {
        this.copyDirectory(sourceDataDir, dataDir)
      }

      // 배포 스크립트 실행 (dist 디렉토리 기준) - 안전한 명령어 실행
      const deployScript = path.join(this.options.projectRoot, 'scripts', 'deploy.ts')
      if (fs.existsSync(deployScript)) {
        const deployCommand = `npx tsx ${deployScript} --verbose --dist-dir ${distDir}`
        await SecurityUtils.safeExec(deployCommand, {
          cwd: this.options.projectRoot,
          timeout: this.options.timeout
        })
      } else {
        logWarning('배포 스크립트를 찾을 수 없습니다. 기본 배포를 실행합니다.')
        // 기본 배포 로직 - dist 폴더 구조 유지
        this.ensureDistStructure(distDir)
      }

      // 배포 결과 검증
      const deployValidation = this.validateDeployOutput(distDir)
      if (!deployValidation.isValid) {
        logWarning(`배포 검증 실패: ${deployValidation.errors.join(', ')}`)
      }

      logSuccess('배포 완료')
      return { 
        success: true, 
        results: { 
          deployed: true,
          deployValid: deployValidation.isValid,
          deployErrors: deployValidation.errors
        } 
      }

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
        await SecurityUtils.safeExec('pm2 --version', { timeout: 10000 })
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

      // PM2 프로세스 시작 - 안전한 명령어 실행
      await SecurityUtils.safeExec('pm2 start ecosystem.config.cjs', {
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
      
      // PM2 상태 확인 - 안전한 명령어 실행
      try {
        const { stdout } = await SecurityUtils.safeExec('pm2 status', {
          cwd: this.options.projectRoot,
          timeout: 10000
        })
        
        if (stdout.includes('online')) {
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
   * 에러 복구 - 완전한 복구 로직 구현
   */
  private async recoverFromError(phase: string): Promise<{ success: boolean; results: any }> {
    try {
      logInfo(`${phase} 단계 복구 시도 중...`)
      
      // 1. 백업에서 복원
      if (this.backupPath && fs.existsSync(this.backupPath)) {
        logInfo('백업에서 복원 중...')
        await this.restoreFromBackup()
      }

      // 2. dist 디렉토리 정리
      const distDir = path.join(this.options.projectRoot, 'dist')
      if (fs.existsSync(distDir)) {
        logInfo('dist 디렉토리 정리 중...')
        fs.rmSync(distDir, { recursive: true, force: true })
      }

      // 3. 임시 파일 정리
      await this.cleanupTempFiles()

      // 4. 의존성 재설치 (필요한 경우)
      if (phase === 'build' || phase === 'convert') {
        logInfo('의존성 확인 중...')
        await this.verifyDependencies()
      }

      // 5. 재시도 (최대 3회)
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          retryCount++
          logInfo(`재시도 ${retryCount}/${maxRetries}...`)
          
          const result = await this.executePhase(phase)
          if (result.success) {
            logSuccess(`${phase} 단계 복구 성공`)
            return result
          }
          
          if (retryCount < maxRetries) {
            // 재시도 전 대기
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
          }
        } catch (error: any) {
          if (retryCount >= maxRetries) {
            throw error
          }
          logWarning(`재시도 ${retryCount} 실패: ${error.message}`)
        }
      }

      throw new Error(`${phase} 단계 복구 실패 (${maxRetries}회 재시도)`)

    } catch (error: any) {
      logError(`복구 실패: ${error.message}`)
      return { success: false, results: { error: error.message } }
    }
  }

  /**
   * 백업에서 복원
   */
  private async restoreFromBackup(): Promise<void> {
    if (!this.backupPath || !fs.existsSync(this.backupPath)) {
      throw new Error('백업 경로가 유효하지 않습니다')
    }

    try {
      // 백업된 파일들을 원본 위치로 복원
      const backupTargets = ['package.json', 'src', 'scripts']
      
      for (const target of backupTargets) {
        const backupPath = path.join(this.backupPath, target)
        const restorePath = path.join(this.options.projectRoot, target)
        
        if (fs.existsSync(backupPath)) {
          if (fs.existsSync(restorePath)) {
            fs.rmSync(restorePath, { recursive: true, force: true })
          }
          
          const stat = fs.statSync(backupPath)
          if (stat.isDirectory()) {
            this.copyDirectory(backupPath, restorePath)
          } else {
            const destDir = path.dirname(restorePath)
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }
            fs.copyFileSync(backupPath, restorePath)
          }
          
          logInfo(`${target} 복원 완료`)
        }
      }
    } catch (error: any) {
      throw new Error(`백업 복원 실패: ${error.message}`)
    }
  }

  /**
   * 임시 파일 정리
   */
  private async cleanupTempFiles(): Promise<void> {
    try {
      const tempDirs = [
        path.join(this.options.projectRoot, 'dist'),
        path.join(this.options.projectRoot, 'node_modules', '.cache'),
        path.join(this.options.projectRoot, '.vite'),
        path.join(this.options.projectRoot, '.tsbuildinfo')
      ]

      for (const tempDir of tempDirs) {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true })
          logInfo(`임시 파일 정리: ${path.basename(tempDir)}`)
        }
      }
    } catch (error: any) {
      logWarning(`임시 파일 정리 실패: ${error.message}`)
    }
  }

  /**
   * 의존성 검증
   */
  private async verifyDependencies(): Promise<void> {
    try {
      // 필수 도구들 확인
      const requiredTools = ['npm', 'node', 'tsc']
      
      for (const tool of requiredTools) {
        try {
          await SecurityUtils.safeExec(`${tool} --version`, { timeout: 10000 })
        } catch {
          throw new Error(`필수 도구가 설치되지 않음: ${tool}`)
        }
      }

      // package.json 확인
      const packageJsonPath = path.join(this.options.projectRoot, 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json 파일이 없습니다')
      }

      // node_modules 확인
      const nodeModulesPath = path.join(this.options.projectRoot, 'node_modules')
      if (!fs.existsSync(nodeModulesPath)) {
        logWarning('node_modules가 없습니다. npm install을 실행합니다...')
        await SecurityUtils.safeExec('npm install', { 
          cwd: this.options.projectRoot,
          timeout: 300000 
        })
      }

    } catch (error: any) {
      throw new Error(`의존성 검증 실패: ${error.message}`)
    }
  }

  /**
   * 안전한 디렉토리 복사 (재귀) - 보안 강화
   */
  private copyDirectory(source: string, destination: string): void {
    // 경로 검증
    if (!SecurityUtils.validatePath(source, this.options.projectRoot)) {
      throw new Error(`잘못된 소스 경로: ${source}`)
    }
    
    if (!SecurityUtils.validatePath(destination, this.options.projectRoot)) {
      throw new Error(`잘못된 대상 경로: ${destination}`)
    }

    // 파일 권한 검증
    if (!SecurityUtils.validateFilePermissions(source)) {
      throw new Error(`접근 권한이 없는 소스 경로: ${source}`)
    }

    // 디렉토리 크기 검증 (비동기이므로 경고만)
    SecurityUtils.validateDirectorySize(source, 500).then(isValid => {
      if (!isValid) {
        logWarning(`소스 디렉토리가 너무 큽니다: ${source}`)
      }
    }).catch(() => {
      // 크기 검증 실패는 무시
    })

    try {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true, mode: 0o755 })
      }
      
      const items = fs.readdirSync(source)
      
      // 파일 개수 제한 (DoS 방지)
      if (items.length > 10000) {
        throw new Error(`너무 많은 파일: ${items.length}개 (최대 10,000개)`)
      }
      
      for (const item of items) {
        // 파일명 검증 (위험한 문자 제거)
        const sanitizedItem = item.replace(/[<>:"|?*\x00-\x1f]/g, '_')
        if (sanitizedItem !== item) {
          logWarning(`파일명 정리됨: ${item} → ${sanitizedItem}`)
        }
        
        const sourcePath = path.join(source, item)
        const destPath = path.join(destination, sanitizedItem)
        
        // 심볼릭 링크 검증
        const stat = fs.lstatSync(sourcePath)
        if (stat.isSymbolicLink()) {
          logWarning(`심볼릭 링크 건너뜀: ${sourcePath}`)
          continue
        }
        
        if (stat.isDirectory()) {
          this.copyDirectory(sourcePath, destPath)
        } else {
          // 파일 크기 제한 (100MB)
          if (stat.size > 100 * 1024 * 1024) {
            logWarning(`큰 파일 건너뜀: ${sourcePath} (${Math.round(stat.size / 1024 / 1024)}MB)`)
            continue
          }
          
          fs.copyFileSync(sourcePath, destPath)
          // 파일 권한 설정
          fs.chmodSync(destPath, 0o644)
        }
      }
    } catch (error: any) {
      throw new Error(`디렉토리 복사 실패: ${error.message}`)
    }
  }

  /**
   * CJS 변환 검증
   */
  private validateCJSConversion(distDir: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      // dist/src 디렉토리에서 .js 파일들을 검사
      const srcDir = path.join(distDir, 'src')
      if (!fs.existsSync(srcDir)) {
        errors.push('src 디렉토리가 없습니다')
        return { isValid: false, errors }
      }

      // 모든 .js 파일을 검사하여 ES 모듈 문법이 있는지 확인
      const jsFiles = this.findFiles(srcDir, '.js')
      let esModuleCount = 0
      
      for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf-8')
        
        // ES 모듈 문법 검사
        if (content.includes('import ') || content.includes('export ')) {
          esModuleCount++
          errors.push(`${path.relative(distDir, file)}: ES 모듈 문법 발견`)
        }
        
        // require 문법이 있는지 확인 (CJS)
        if (!content.includes('require(') && !content.includes('module.exports')) {
          // 빈 파일이 아닌 경우에만 체크
          if (content.trim().length > 0) {
            errors.push(`${path.relative(distDir, file)}: CJS 문법이 없습니다`)
          }
        }
      }

      if (esModuleCount > 0) {
        errors.push(`${esModuleCount}개 파일에서 ES 모듈 문법 발견`)
      }

      return { isValid: errors.length === 0, errors }

    } catch (error: any) {
      errors.push(`검증 중 오류: ${error.message}`)
      return { isValid: false, errors }
    }
  }

  /**
   * 빌드 결과 검증
   */
  private validateBuildOutput(distDir: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      // 백엔드 빌드 결과 확인
      const backendIndex = path.join(distDir, 'backend', 'index.js')
      if (!fs.existsSync(backendIndex)) {
        errors.push('백엔드 index.js 파일이 없습니다')
      }

      // 프론트엔드 빌드 결과 확인
      const frontendIndex = path.join(distDir, 'frontend', 'index.html')
      if (!fs.existsSync(frontendIndex)) {
        errors.push('프론트엔드 index.html 파일이 없습니다')
      }

      // 공유 모듈 확인
      const sharedDir = path.join(distDir, 'shared')
      if (!fs.existsSync(sharedDir)) {
        errors.push('shared 디렉토리가 없습니다')
      }

      // 구조 검증
      const expectedStructure = [
        'backend',
        'frontend', 
        'shared'
      ]

      for (const dir of expectedStructure) {
        const dirPath = path.join(distDir, dir)
        if (!fs.existsSync(dirPath)) {
          errors.push(`${dir} 디렉토리가 없습니다`)
        }
      }

      return { isValid: errors.length === 0, errors }

    } catch (error: any) {
      errors.push(`빌드 검증 중 오류: ${error.message}`)
      return { isValid: false, errors }
    }
  }

  /**
   * 파일 찾기 (재귀)
   */
  private findFiles(dir: string, extension: string): string[] {
    const files: string[] = []
    
    if (!fs.existsSync(dir)) {
      return files
    }

    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, extension))
      } else if (item.endsWith(extension)) {
        files.push(fullPath)
      }
    }
    
    return files
  }

  /**
   * 배포 결과 검증
   */
  private validateDeployOutput(distDir: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      // 필수 디렉토리 확인
      const requiredDirs = ['backend', 'frontend', 'shared', 'data']
      for (const dir of requiredDirs) {
        const dirPath = path.join(distDir, dir)
        if (!fs.existsSync(dirPath)) {
          errors.push(`${dir} 디렉토리가 없습니다`)
        }
      }

      // 백엔드 필수 파일 확인
      const backendFiles = ['index.js', 'app.js']
      for (const file of backendFiles) {
        const filePath = path.join(distDir, 'backend', file)
        if (!fs.existsSync(filePath)) {
          errors.push(`백엔드 ${file} 파일이 없습니다`)
        }
      }

      // 프론트엔드 필수 파일 확인
      const frontendFiles = ['index.html']
      for (const file of frontendFiles) {
        const filePath = path.join(distDir, 'frontend', file)
        if (!fs.existsSync(filePath)) {
          errors.push(`프론트엔드 ${file} 파일이 없습니다`)
        }
      }

      // 공유 모듈 확인
      const sharedFiles = this.findFiles(path.join(distDir, 'shared'), '.js')
      if (sharedFiles.length === 0) {
        errors.push('공유 모듈 파일이 없습니다')
      }

      return { isValid: errors.length === 0, errors }

    } catch (error: any) {
      errors.push(`배포 검증 중 오류: ${error.message}`)
      return { isValid: false, errors }
    }
  }

  /**
   * dist 구조 보장
   */
  private ensureDistStructure(distDir: string): void {
    try {
      // 필수 디렉토리 생성
      const requiredDirs = ['backend', 'frontend', 'shared', 'data']
      for (const dir of requiredDirs) {
        const dirPath = path.join(distDir, dir)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
          logInfo(`${dir} 디렉토리 생성`)
        }
      }

      // 프로젝트 구조와 동일하게 유지
      const structureMap = {
        'src/backend': 'backend',
        'src/frontend': 'frontend', 
        'src/shared': 'shared',
        'src/data': 'data'
      }

      for (const [srcPath, destPath] of Object.entries(structureMap)) {
        const fullSrcPath = path.join(distDir, srcPath)
        const fullDestPath = path.join(distDir, destPath)
        
        if (fs.existsSync(fullSrcPath) && !fs.existsSync(fullDestPath)) {
          this.copyDirectory(fullSrcPath, fullDestPath)
          logInfo(`${srcPath} → ${destPath} 복사 완료`)
        }
      }

    } catch (error: any) {
      logError(`구조 보장 중 오류: ${error.message}`)
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
