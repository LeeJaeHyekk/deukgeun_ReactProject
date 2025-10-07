#!/usr/bin/env node

/**
 * 빌드 안전 관리자
 * 변환과 빌드 과정에서 발생할 수 있는 문제들을 방지하고 복구하는 안전장치
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import crypto from 'crypto'

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
} as const

type ColorKey = keyof typeof colors

function log(message: string, color: ColorKey = 'reset'): void {
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

interface BuildState {
  phase: 'idle' | 'converting' | 'building' | 'completed' | 'failed'
  startTime: string | null
  endTime?: string
  conversionAttempts: number
  maxConversionAttempts: number
  backupCreated: boolean
  backupPath?: string
  filesModified: string[]
  errors: Array<{
    phase: string
    error: string
    timestamp: string
  }>
  lastUpdate?: string
}

interface ValidationResult {
  type: string
  file?: string
  message?: string
  critical: boolean
}

interface ConversionResult {
  success: boolean
  files?: string[]
  reason?: string
  details?: string[]
  error?: string
}

interface BuildResult {
  success: boolean
  error?: string
}

interface FileState {
  timestamp: string
  files: Record<string, {
    hash: string
    size: number
  }>
}

/**
 * 빌드 안전 관리자 클래스
 */
class BuildSafetyManager {
  private projectRoot: string
  private safetyDir: string
  private backupDir: string
  private stateFile: string
  private conversionLog: string
  private rollbackStack: any[]
  private buildState: BuildState

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.safetyDir = path.join(projectRoot, '.build-safety')
    this.backupDir = path.join(this.safetyDir, 'backups')
    this.stateFile = path.join(this.safetyDir, 'build-state.json')
    this.conversionLog = path.join(this.safetyDir, 'conversion.log')
    this.rollbackStack = []
    this.buildState = {
      phase: 'idle',
      startTime: null,
      conversionAttempts: 0,
      maxConversionAttempts: 3,
      backupCreated: false,
      filesModified: [],
      errors: []
    }
  }

  /**
   * 안전 디렉토리 초기화
   */
  initializeSafety(): boolean {
    logStep('SAFETY_INIT', '안전 관리자 초기화 중...')
    
    try {
      // 안전 디렉토리 생성
      if (!fs.existsSync(this.safetyDir)) {
        fs.mkdirSync(this.safetyDir, { recursive: true })
      }
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true })
      }
      
      // 기존 상태 파일 로드
      this.loadBuildState()
      
      logSuccess('안전 관리자 초기화 완료')
      return true
    } catch (error) {
      logError(`안전 관리자 초기화 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 빌드 상태 로드
   */
  private loadBuildState(): void {
    try {
      if (fs.existsSync(this.stateFile)) {
        const stateData = fs.readFileSync(this.stateFile, 'utf8')
        this.buildState = { ...this.buildState, ...JSON.parse(stateData) }
        log(`이전 빌드 상태 로드됨: ${this.buildState.phase}`, 'cyan')
      }
    } catch (error) {
      logWarning(`빌드 상태 로드 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 빌드 상태 저장
   */
  private saveBuildState(): void {
    try {
      this.buildState.lastUpdate = new Date().toISOString()
      fs.writeFileSync(this.stateFile, JSON.stringify(this.buildState, null, 2))
    } catch (error) {
      logWarning(`빌드 상태 저장 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 변환 전 사전 검증
   */
  async preConversionValidation(): Promise<boolean> {
    logStep('PRE_VALIDATE', '변환 전 사전 검증 중...')
    
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
      if (!fs.existsSync(fullPath)) {
        validations.push({ type: 'missing_file', file, critical: true })
      }
    }
    
    // 2. 디스크 공간 확인
    try {
      const stats = fs.statSync(this.projectRoot)
      if (stats.size === 0) {
        validations.push({ type: 'disk_space', message: '디스크 공간 부족', critical: true })
      }
    } catch (error) {
      validations.push({ type: 'disk_access', message: (error as Error).message, critical: true })
    }
    
    // 3. Node.js 버전 확인
    try {
      const nodeVersion = process.version
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
      if (majorVersion < 16) {
        validations.push({ type: 'node_version', message: `Node.js ${nodeVersion}는 너무 오래됨`, critical: false })
      }
    } catch (error) {
      validations.push({ type: 'node_check', message: (error as Error).message, critical: false })
    }
    
    // 4. 메모리 사용량 확인
    const memUsage = process.memoryUsage()
    const memUsageMB = memUsage.heapUsed / 1024 / 1024
    if (memUsageMB > 1000) { // 1GB 이상
      validations.push({ type: 'memory_usage', message: `높은 메모리 사용량: ${memUsageMB.toFixed(2)}MB`, critical: false })
    }
    
    // 검증 결과 처리
    const criticalErrors = validations.filter(v => v.critical)
    const warnings = validations.filter(v => !v.critical)
    
    if (criticalErrors.length > 0) {
      logError('사전 검증 실패:')
      criticalErrors.forEach(error => {
        logError(`- ${error.type}: ${error.message || error.file}`)
      })
      return false
    }
    
    if (warnings.length > 0) {
      logWarning('사전 검증 경고:')
      warnings.forEach(warning => {
        logWarning(`- ${warning.type}: ${warning.message}`)
      })
    }
    
    logSuccess('사전 검증 완료')
    return true
  }

  /**
   * 안전 백업 생성
   */
  async createSafetyBackup(): Promise<string | null> {
    logStep('SAFETY_BACKUP', '안전 백업 생성 중...')
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(this.backupDir, `safety-backup-${timestamp}`)
      
      // 백업 디렉토리 생성
      fs.mkdirSync(backupPath, { recursive: true })
      
      // 백업할 파일들
      const backupTargets = [
        'src/shared',
        'src/backend/src',
        'src/frontend/src',
        'package.json',
        'tsconfig.json',
        'vite.config.ts'
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
      
      this.buildState.backupCreated = true
      this.buildState.backupPath = backupPath
      this.saveBuildState()
      
      logSuccess(`안전 백업 생성 완료: ${backupCount}개 항목`)
      return backupPath
      
    } catch (error) {
      logError(`안전 백업 생성 실패: ${(error as Error).message}`)
      return null
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
   * 변환 실행 (안전 모드)
   */
  async executeSafeConversion(): Promise<ConversionResult> {
    logStep('SAFE_CONVERT', '안전 변환 실행 중...')
    
    this.buildState.phase = 'converting'
    this.buildState.conversionAttempts++
    this.saveBuildState()
    
    try {
      // 변환 전 상태 기록
      const preConversionState = await this.recordFileStates()
      
      // 변환 실행
      const conversionResult = await this.runConversionWithRetry()
      
      if (!conversionResult.success) {
        logWarning('변환 실패, 롤백을 시도합니다...')
        await this.rollbackToState(preConversionState)
        return { success: false, reason: 'conversion_failed' }
      }
      
      // 변환 후 검증
      const validationResult = await this.validateConversion()
      if (!validationResult.valid) {
        logWarning('변환 검증 실패, 롤백을 시도합니다...')
        await this.rollbackToState(preConversionState)
        return { success: false, reason: 'validation_failed', details: validationResult.errors }
      }
      
      logSuccess('안전 변환 완료')
      return { success: true, files: conversionResult.files }
      
    } catch (error) {
      logError(`안전 변환 실패: ${(error as Error).message}`)
      this.buildState.errors.push({
        phase: 'conversion',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      })
      this.saveBuildState()
      return { success: false, reason: 'exception', error: (error as Error).message }
    }
  }

  /**
   * 파일 상태 기록
   */
  private async recordFileStates(): Promise<FileState> {
    const state: FileState = {
      timestamp: new Date().toISOString(),
      files: {}
    }
    
    const targetFiles = [
      'src/shared/config/index.ts',
      'src/shared/lib/env.ts',
      'src/shared/api/client.ts',
      'src/shared/lib/recaptcha.ts'
    ]
    
    for (const file of targetFiles) {
      const fullPath = path.join(this.projectRoot, file)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        const hash = crypto.createHash('md5').update(content).digest('hex')
        state.files[file] = { hash, size: content.length }
      }
    }
    
    return state
  }

  /**
   * 재시도가 포함된 변환 실행
   */
  private async runConversionWithRetry(): Promise<ConversionResult> {
    const maxRetries = 3
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log(`변환 시도 ${attempt}/${maxRetries}...`, 'cyan')
        
        execSync('npm run convert:js-to-cjs', {
          stdio: 'inherit',
          timeout: 300000, // 5분
          cwd: this.projectRoot
        })
        
        logSuccess(`변환 성공 (시도 ${attempt})`)
        return { success: true, files: [] }
        
      } catch (error) {
        lastError = error as Error
        logWarning(`변환 시도 ${attempt} 실패: ${(error as Error).message}`)
        
        if (attempt < maxRetries) {
          log('잠시 대기 후 재시도...', 'yellow')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }
    
    return { success: false, error: lastError?.message || 'Unknown error' }
  }

  /**
   * 변환 결과 검증
   */
  private async validateConversion(): Promise<{ valid: boolean; errors: string[] }> {
    logStep('VALIDATE_CONVERSION', '변환 결과 검증 중...')
    
    const errors: string[] = []
    const targetFiles = [
      'src/shared/config/index.ts',
      'src/shared/lib/env.ts',
      'src/shared/api/client.ts',
      'src/shared/lib/recaptcha.ts'
    ]
    
    for (const file of targetFiles) {
      const fullPath = path.join(this.projectRoot, file)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        
        // import.meta.env가 남아있는지 확인
        if (content.includes('import.meta.env')) {
          errors.push(`${file}: import.meta.env가 변환되지 않음`)
        }
        
        // 문법 오류 확인 (기본적인)
        if (content.includes('import ') && !content.includes('require(')) {
          errors.push(`${file}: ES Module import가 남아있음`)
        }
        
        // 파일 크기 확인 (너무 작거나 크면 문제)
        if (content.length < 100) {
          errors.push(`${file}: 파일 크기가 너무 작음 (${content.length}바이트)`)
        }
      }
    }
    
    const isValid = errors.length === 0
    
    if (isValid) {
      logSuccess('변환 검증 통과')
    } else {
      logError('변환 검증 실패:')
      errors.forEach(error => logError(`- ${error}`))
    }
    
    return { valid: isValid, errors }
  }

  /**
   * 상태로 롤백
   */
  private async rollbackToState(state: FileState | null): Promise<boolean> {
    logStep('ROLLBACK', '이전 상태로 롤백 중...')
    
    try {
      // 백업에서 복원
      if (this.buildState.backupPath && fs.existsSync(this.buildState.backupPath)) {
        const backupInfoPath = path.join(this.buildState.backupPath, 'backup-info.json')
        if (fs.existsSync(backupInfoPath)) {
          const backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'))
          
          for (const target of backupInfo.targets) {
            const sourcePath = path.join(this.buildState.backupPath!, target)
            const destPath = path.join(this.projectRoot, target)
            
            if (fs.existsSync(sourcePath)) {
              if (fs.existsSync(destPath)) {
                fs.rmSync(destPath, { recursive: true, force: true })
              }
              
              const stat = fs.statSync(sourcePath)
              if (stat.isDirectory()) {
                this.copyDirectory(sourcePath, destPath)
              } else {
                fs.copyFileSync(sourcePath, destPath)
              }
            }
          }
        }
      }
      
      logSuccess('롤백 완료')
      return true
      
    } catch (error) {
      logError(`롤백 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 안전 빌드 실행
   */
  async executeSafeBuild(): Promise<BuildResult> {
    logStep('SAFE_BUILD', '안전 빌드 실행 중...')
    
    this.buildState.phase = 'building'
    this.saveBuildState()
    
    try {
      // 백엔드 빌드
      log('백엔드 빌드 중...', 'blue')
      execSync('npm run build:backend:production', {
        stdio: 'inherit',
        timeout: 300000,
        cwd: this.projectRoot
      })
      
      // 프론트엔드 빌드
      log('프론트엔드 빌드 중...', 'blue')
      execSync('npm run build:production', {
        stdio: 'inherit',
        timeout: 300000,
        cwd: this.projectRoot
      })
      
      // 빌드 결과 검증
      const buildValidation = await this.validateBuild()
      if (!buildValidation.valid) {
        throw new Error(`빌드 검증 실패: ${buildValidation.errors.join(', ')}`)
      }
      
      logSuccess('안전 빌드 완료')
      return { success: true }
      
    } catch (error) {
      logError(`안전 빌드 실패: ${(error as Error).message}`)
      this.buildState.errors.push({
        phase: 'building',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      })
      this.saveBuildState()
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 빌드 결과 검증
   */
  private async validateBuild(): Promise<{ valid: boolean; errors: string[] }> {
    logStep('VALIDATE_BUILD', '빌드 결과 검증 중...')
    
    const errors: string[] = []
    const requiredPaths = [
      'dist/backend',
      'dist'
    ]
    
    for (const buildPath of requiredPaths) {
      const fullPath = path.join(this.projectRoot, buildPath)
      if (!fs.existsSync(fullPath)) {
        errors.push(`빌드 결과 없음: ${buildPath}`)
      }
    }
    
    const isValid = errors.length === 0
    
    if (isValid) {
      logSuccess('빌드 검증 통과')
    } else {
      logError('빌드 검증 실패:')
      errors.forEach(error => logError(`- ${error}`))
    }
    
    return { valid: isValid, errors }
  }

  /**
   * 전체 안전 빌드 프로세스
   */
  async executeFullSafeBuild(): Promise<{ success: boolean; duration?: string; backupPath?: string; error?: string }> {
    const startTime = Date.now()
    
    try {
      log('🛡️  안전 빌드 프로세스를 시작합니다...', 'bright')
      
      // 1. 안전 관리자 초기화
      if (!this.initializeSafety()) {
        throw new Error('안전 관리자 초기화 실패')
      }
      
      // 2. 사전 검증
      if (!await this.preConversionValidation()) {
        throw new Error('사전 검증 실패')
      }
      
      // 3. 안전 백업 생성
      const backupPath = await this.createSafetyBackup()
      if (!backupPath) {
        throw new Error('안전 백업 생성 실패')
      }
      
      // 4. 안전 변환 실행
      const conversionResult = await this.executeSafeConversion()
      if (!conversionResult.success) {
        throw new Error(`변환 실패: ${conversionResult.reason}`)
      }
      
      // 5. 안전 빌드 실행
      const buildResult = await this.executeSafeBuild()
      if (!buildResult.success) {
        throw new Error(`빌드 실패: ${buildResult.error}`)
      }
      
      // 6. 성공 처리
      this.buildState.phase = 'completed'
      this.buildState.endTime = new Date().toISOString()
      this.saveBuildState()
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      logSuccess(`안전 빌드가 완료되었습니다! (소요시간: ${duration}초)`)
      
      return { success: true, duration, backupPath }
      
    } catch (error) {
      logError(`안전 빌드 실패: ${(error as Error).message}`)
      
      // 실패 시 롤백 시도
      if (this.buildState.backupCreated) {
        log('실패로 인한 롤백을 시도합니다...', 'yellow')
        await this.rollbackToState(null)
      }
      
      this.buildState.phase = 'failed'
      this.buildState.errors.push({
        phase: 'full_build',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      })
      this.saveBuildState()
      
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 정리 작업
   */
  cleanup(): void {
    logStep('CLEANUP', '정리 작업 중...')
    
    try {
      // 오래된 백업 정리 (7일 이상)
      if (fs.existsSync(this.backupDir)) {
        const backups = fs.readdirSync(this.backupDir)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        
        for (const backup of backups) {
          const backupPath = path.join(this.backupDir, backup)
          const stats = fs.statSync(backupPath)
          
          if (stats.mtime.getTime() < sevenDaysAgo) {
            fs.rmSync(backupPath, { recursive: true, force: true })
            log(`오래된 백업 삭제: ${backup}`, 'cyan')
          }
        }
      }
      
      // 임시 파일 정리
      const tempDirs = ['.temp-conversion', '.conversion-cache']
      for (const tempDir of tempDirs) {
        const tempPath = path.join(this.projectRoot, tempDir)
        if (fs.existsSync(tempPath)) {
          fs.rmSync(tempPath, { recursive: true, force: true })
          log(`임시 디렉토리 삭제: ${tempDir}`, 'cyan')
        }
      }
      
      logSuccess('정리 작업 완료')
      
    } catch (error) {
      logWarning(`정리 작업 실패: ${(error as Error).message}`)
    }
  }
}

// 메인 함수
async function main(): Promise<void> {
  const projectRoot = process.cwd()
  const safetyManager = new BuildSafetyManager(projectRoot)
  
  try {
    const result = await safetyManager.executeFullSafeBuild()
    
    if (result.success) {
      log('\n🎉 안전 빌드가 성공적으로 완료되었습니다!', 'green')
      log(`⏱️  소요시간: ${result.duration}초`, 'cyan')
      log(`💾 백업 위치: ${result.backupPath}`, 'cyan')
      
      // 정리 작업
      safetyManager.cleanup()
      
      process.exit(0)
    } else {
      log('\n❌ 안전 빌드가 실패했습니다.', 'red')
      log(`🔍 오류: ${result.error}`, 'red')
      
      process.exit(1)
    }
    
  } catch (error) {
    logError(`안전 빌드 실행 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { BuildSafetyManager, main }
