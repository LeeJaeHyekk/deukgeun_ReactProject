#!/usr/bin/env node

/**
 * 변환 가드 스크립트
 * 중복 변환을 방지하고 변환 상태를 관리하는 안전장치
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

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

interface ConversionState {
  isConverting: boolean
  lastConversion: string | null
  convertedFiles: string[]
  fileHashes: Record<string, string>
  errors: ErrorInfo[]
  lastUpdate?: string
}

interface ErrorInfo {
  timestamp: string
  error: string
}

interface LockData {
  pid: number
  timestamp: string
  projectRoot: string
}

interface ConversionCheckResult {
  needed: boolean
  reason?: string
  fileStates?: Record<string, FileState>
}

interface FileState {
  exists: boolean
  currentHash: string | null
  lastHash: string | null
  changed: boolean
}

interface ConversionResult {
  success: boolean
  reason?: string
  error?: string
}

interface ConversionStatus {
  isConverting: boolean
  lastConversion: string | null
  convertedFiles: number
  errors: number
}

/**
 * 변환 가드 클래스
 */
class ConversionGuard {
  private projectRoot: string
  private guardDir: string
  private stateFile: string
  private lockFile: string
  private conversionState: ConversionState

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.guardDir = path.join(projectRoot, '.conversion-guard')
    this.stateFile = path.join(this.guardDir, 'conversion-state.json')
    this.lockFile = path.join(this.guardDir, 'conversion.lock')
    this.conversionState = {
      isConverting: false,
      lastConversion: null,
      convertedFiles: [],
      fileHashes: {},
      errors: []
    }
  }

  /**
   * 가드 초기화
   */
  initialize(): boolean {
    logStep('GUARD_INIT', '변환 가드 초기화 중...')
    
    try {
      // 가드 디렉토리 생성
      if (!fs.existsSync(this.guardDir)) {
        fs.mkdirSync(this.guardDir, { recursive: true })
      }
      
      // 기존 상태 로드
      this.loadState()
      
      logSuccess('변환 가드 초기화 완료')
      return true
    } catch (error: any) {
      logError(`변환 가드 초기화 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 상태 로드
   */
  private loadState(): void {
    try {
      if (fs.existsSync(this.stateFile)) {
        const stateData = fs.readFileSync(this.stateFile, 'utf8')
        this.conversionState = { ...this.conversionState, ...JSON.parse(stateData) }
      }
    } catch (error: any) {
      logWarning(`상태 로드 실패: ${error.message}`)
    }
  }

  /**
   * 상태 저장
   */
  private saveState(): void {
    try {
      this.conversionState.lastUpdate = new Date().toISOString()
      fs.writeFileSync(this.stateFile, JSON.stringify(this.conversionState, null, 2))
    } catch (error: any) {
      logWarning(`상태 저장 실패: ${error.message}`)
    }
  }

  /**
   * 변환 잠금 확인
   */
  checkConversionLock(): boolean {
    if (fs.existsSync(this.lockFile)) {
      try {
        const lockData: LockData = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'))
        const lockTime = new Date(lockData.timestamp).getTime()
        const now = Date.now()
        const lockAge = now - lockTime
        
        // 10분 이상 된 잠금은 무효로 처리
        if (lockAge > 10 * 60 * 1000) {
          logWarning('오래된 변환 잠금을 해제합니다.')
          this.releaseLock()
          return false
        }
        
        logError(`변환이 이미 진행 중입니다. (PID: ${lockData.pid}, 시작: ${lockData.timestamp})`)
        return true
      } catch (error: any) {
        logWarning(`잠금 파일 읽기 실패: ${error.message}`)
        this.releaseLock()
        return false
      }
    }
    
    return false
  }

  /**
   * 변환 잠금 설정
   */
  setLock(): boolean {
    try {
      const lockData: LockData = {
        pid: process.pid,
        timestamp: new Date().toISOString(),
        projectRoot: this.projectRoot
      }
      
      fs.writeFileSync(this.lockFile, JSON.stringify(lockData, null, 2))
      this.conversionState.isConverting = true
      this.saveState()
      
      log('변환 잠금 설정됨', 'cyan')
      return true
    } catch (error: any) {
      logError(`잠금 설정 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 변환 잠금 해제
   */
  releaseLock(): boolean {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile)
      }
      
      this.conversionState.isConverting = false
      this.saveState()
      
      log('변환 잠금 해제됨', 'cyan')
      return true
    } catch (error: any) {
      logWarning(`잠금 해제 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 파일 해시 계산
   */
  private calculateFileHash(filePath: string): string | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null
      }
      
      const content = fs.readFileSync(filePath, 'utf8')
      return crypto.createHash('md5').update(content).digest('hex')
    } catch (error: any) {
      logWarning(`파일 해시 계산 실패: ${filePath} - ${error.message}`)
      return null
    }
  }

  /**
   * 변환 필요성 확인
   */
  checkConversionNeeded(): ConversionCheckResult {
    logStep('CHECK_CONVERSION', '변환 필요성 확인 중...')
    
    const targetFiles = [
      'src/shared/config/index.ts',
      'src/shared/lib/env.ts',
      'src/shared/api/client.ts',
      'src/shared/lib/recaptcha.ts'
    ]
    
    let needsConversion = false
    const fileStates: Record<string, FileState> = {}
    
    for (const file of targetFiles) {
      const fullPath = path.join(this.projectRoot, file)
      const currentHash = this.calculateFileHash(fullPath)
      const lastHash = this.conversionState.fileHashes[file]
      
      fileStates[file] = {
        exists: fs.existsSync(fullPath),
        currentHash,
        lastHash,
        changed: currentHash !== lastHash
      }
      
      if (currentHash && currentHash !== lastHash) {
        needsConversion = true
        log(`파일 변경 감지: ${file}`, 'yellow')
      }
    }
    
    // 변환이 필요한지 확인
    if (!needsConversion && this.conversionState.lastConversion) {
      const lastConversionTime = new Date(this.conversionState.lastConversion).getTime()
      const now = Date.now()
      const timeSinceConversion = now - lastConversionTime
      
      // 1시간 이내에 변환했다면 변환 불필요
      if (timeSinceConversion < 60 * 60 * 1000) {
        logSuccess('최근에 변환되었습니다. 변환을 건너뜁니다.')
        return { needed: false, reason: 'recent_conversion' }
      }
    }
    
    if (needsConversion) {
      log('변환이 필요합니다.', 'cyan')
      return { needed: true, fileStates }
    } else {
      logSuccess('변환이 필요하지 않습니다.')
      return { needed: false, reason: 'no_changes' }
    }
  }

  /**
   * 안전 변환 실행
   */
  async executeSafeConversion(): Promise<ConversionResult> {
    logStep('SAFE_CONVERT', '안전 변환 실행 중...')
    
    try {
      // 잠금 확인
      if (this.checkConversionLock()) {
        return { success: false, reason: 'already_converting' }
      }
      
      // 변환 필요성 확인
      const conversionCheck = this.checkConversionNeeded()
      if (!conversionCheck.needed) {
        return { success: true, reason: conversionCheck.reason }
      }
      
      // 잠금 설정
      if (!this.setLock()) {
        return { success: false, reason: 'lock_failed' }
      }
      
      // 변환 실행
      const { execSync } = await import('child_process')
      execSync('npm run convert:js-to-cjs', {
        stdio: 'inherit',
        timeout: 300000, // 5분
        cwd: this.projectRoot
      })
      
      // 변환 후 상태 업데이트
      this.updateConversionState()
      
      logSuccess('안전 변환 완료')
      return { success: true }
      
    } catch (error: any) {
      logError(`안전 변환 실패: ${error.message}`)
      this.conversionState.errors.push({
        timestamp: new Date().toISOString(),
        error: error.message
      })
      this.saveState()
      return { success: false, error: error.message }
    } finally {
      // 잠금 해제
      this.releaseLock()
    }
  }

  /**
   * 변환 상태 업데이트
   */
  private updateConversionState(): void {
    const targetFiles = [
      'src/shared/config/index.ts',
      'src/shared/lib/env.ts',
      'src/shared/api/client.ts',
      'src/shared/lib/recaptcha.ts'
    ]
    
    // 파일 해시 업데이트
    for (const file of targetFiles) {
      const fullPath = path.join(this.projectRoot, file)
      const hash = this.calculateFileHash(fullPath)
      if (hash) {
        this.conversionState.fileHashes[file] = hash
      }
    }
    
    this.conversionState.lastConversion = new Date().toISOString()
    this.conversionState.convertedFiles = targetFiles.filter(file => 
      fs.existsSync(path.join(this.projectRoot, file))
    )
    
    this.saveState()
  }

  /**
   * 변환 상태 확인
   */
  getConversionStatus(): ConversionStatus {
    return {
      isConverting: this.conversionState.isConverting,
      lastConversion: this.conversionState.lastConversion,
      convertedFiles: this.conversionState.convertedFiles.length,
      errors: this.conversionState.errors.length
    }
  }

  /**
   * 정리 작업
   */
  cleanup(): void {
    logStep('CLEANUP', '변환 가드 정리 중...')
    
    try {
      // 오래된 에러 로그 정리 (7일 이상)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      this.conversionState.errors = this.conversionState.errors.filter(error => {
        const errorTime = new Date(error.timestamp).getTime()
        return errorTime > sevenDaysAgo
      })
      
      // 상태 저장
      this.saveState()
      
      logSuccess('변환 가드 정리 완료')
      
    } catch (error: any) {
      logWarning(`정리 작업 실패: ${error.message}`)
    }
  }
}

// 메인 함수
async function main(): Promise<void> {
  const projectRoot = process.cwd()
  const guard = new ConversionGuard(projectRoot)
  
  try {
    // 가드 초기화
    if (!guard.initialize()) {
      process.exit(1)
    }
    
    // 안전 변환 실행
    const result = await guard.executeSafeConversion()
    
    if (result.success) {
      logSuccess('변환 가드 작업 완료')
      
      // 상태 출력
      const status = guard.getConversionStatus()
      log(`\n📊 변환 상태:`, 'cyan')
      log(`- 마지막 변환: ${status.lastConversion || '없음'}`, 'blue')
      log(`- 변환된 파일: ${status.convertedFiles}개`, 'blue')
      log(`- 에러 수: ${status.errors}개`, 'blue')
      
      // 정리 작업
      guard.cleanup()
      
      process.exit(0)
    } else {
      logError(`변환 가드 작업 실패: ${result.reason || result.error}`)
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`변환 가드 실행 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('conversion-guard')) {
  main()
}

export { ConversionGuard, main }
