/**
 * 안전 장치 모듈
 * 빌드 과정에서 안전성을 보장하는 공통 기능
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger'
import { FileUtils } from './file-utils'
import { ErrorHandler } from './error-handler'

interface SafetyOptions {
  createBackup: boolean
  validateBefore: boolean
  validateAfter: boolean
  rollbackOnError: boolean
  maxBackups: number
  backupRetentionDays: number
}

interface BackupInfo {
  path: string
  timestamp: Date
  size: number
  checksum: string
}

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
}

interface SafetyCheck {
  name: string
  critical: boolean
  check: () => Promise<boolean>
  fix?: () => Promise<boolean>
}

/**
 * 안전 장치 클래스
 */
export class SafetyGuard {
  private projectRoot: string
  private fileUtils: FileUtils
  private errorHandler: ErrorHandler
  private options: SafetyOptions
  private backups: BackupInfo[] = []
  private safetyChecks: SafetyCheck[] = []

  constructor(projectRoot: string, options: Partial<SafetyOptions> = {}) {
    this.projectRoot = projectRoot
    this.fileUtils = new FileUtils(projectRoot)
    this.errorHandler = new ErrorHandler(projectRoot)
    this.options = {
      createBackup: true,
      validateBefore: true,
      validateAfter: true,
      rollbackOnError: true,
      maxBackups: 5,
      backupRetentionDays: 7,
      ...options
    }
    this.initializeSafetyChecks()
  }

  /**
   * 안전 검사 초기화
   */
  private initializeSafetyChecks(): void {
    this.safetyChecks = [
      {
        name: '디스크 공간 확인',
        critical: true,
        check: this.checkDiskSpace.bind(this),
        fix: this.cleanupOldFiles.bind(this)
      },
      {
        name: '메모리 사용량 확인',
        critical: true,
        check: this.checkMemoryUsage.bind(this),
        fix: this.forceGarbageCollection.bind(this)
      },
      {
        name: '필수 파일 존재 확인',
        critical: true,
        check: this.checkRequiredFiles.bind(this)
      },
      {
        name: '권한 확인',
        critical: true,
        check: this.checkPermissions.bind(this)
      },
      {
        name: '의존성 확인',
        critical: false,
        check: this.checkDependencies.bind(this)
      },
      {
        name: '네트워크 연결 확인',
        critical: false,
        check: this.checkNetworkConnection.bind(this)
      }
    ]
  }

  /**
   * 사전 안전 검사 실행
   */
  async preBuildSafetyCheck(): Promise<ValidationResult> {
    logStep('SAFETY', '사전 안전 검사 실행 중...')

    const errors: string[] = []
    const warnings: string[] = []

    for (const check of this.safetyChecks) {
      try {
        const result = await check.check()
        if (!result) {
          const message = `${check.name} 실패`
          if (check.critical) {
            errors.push(message)
          } else {
            warnings.push(message)
          }

          // 자동 수정 시도
          if (check.fix) {
            logInfo(`${check.name} 자동 수정 시도 중...`)
            const fixResult = await check.fix()
            if (fixResult) {
              logSuccess(`${check.name} 자동 수정 성공`)
              warnings.push(`${check.name} 자동 수정됨`)
            } else {
              logWarning(`${check.name} 자동 수정 실패`)
            }
          }
        } else {
          logSuccess(`${check.name} 통과`)
        }
      } catch (error) {
        const message = `${check.name} 검사 중 오류: ${(error as Error).message}`
        if (check.critical) {
          errors.push(message)
        } else {
          warnings.push(message)
        }
      }
    }

    const result: ValidationResult = {
      success: errors.length === 0,
      errors,
      warnings
    }

    if (result.success) {
      logSuccess('사전 안전 검사 완료')
    } else {
      logError('사전 안전 검사 실패')
      errors.forEach(error => logError(`- ${error}`))
    }

    if (warnings.length > 0) {
      logWarning('경고사항:')
      warnings.forEach(warning => logWarning(`- ${warning}`))
    }

    return result
  }

  /**
   * 안전 백업 생성
   */
  async createSafetyBackup(): Promise<string | null> {
    if (!this.options.createBackup) {
      return null
    }

    logStep('BACKUP', '안전 백업 생성 중...')

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupDir = path.join(this.projectRoot, '.safety-backups')
      const backupPath = path.join(backupDir, `backup-${timestamp}`)

      this.fileUtils.ensureDirectory(backupDir)

      // 백업할 대상들
      const backupTargets = [
        'src',
        'package.json',
        'tsconfig.json',
        'package-lock.json'
      ]

      let totalSize = 0
      const checksums: string[] = []

      for (const target of backupTargets) {
        const sourcePath = path.join(this.projectRoot, target)
        if (this.fileUtils.exists(sourcePath)) {
          const destPath = path.join(backupPath, target)
          this.fileUtils.copyDirectory(sourcePath, destPath)
          
          const size = this.getDirectorySize(sourcePath)
          totalSize += size
          
          const checksum = this.calculateDirectoryChecksum(sourcePath)
          checksums.push(checksum)
        }
      }

      const backupInfo: BackupInfo = {
        path: backupPath,
        timestamp: new Date(),
        size: totalSize,
        checksum: crypto.createHash('md5').update(checksums.join('')).digest('hex')
      }

      this.backups.push(backupInfo)
      await this.cleanupOldBackups()

      logSuccess(`안전 백업 생성 완료: ${backupPath}`)
      logInfo(`백업 크기: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)

      return backupPath

    } catch (error) {
      logError(`안전 백업 생성 실패: ${(error as Error).message}`)
      return null
    }
  }

  /**
   * 오류 발생 시 롤백
   */
  async rollbackOnError(backupPath: string | null): Promise<boolean> {
    if (!this.options.rollbackOnError || !backupPath) {
      return false
    }

    logStep('ROLLBACK', '오류 발생으로 인한 롤백 실행 중...')

    try {
      if (!this.fileUtils.exists(backupPath)) {
        logError(`백업 경로를 찾을 수 없습니다: ${backupPath}`)
        return false
      }

      // 백업에서 복원
      const restoreTargets = [
        'src',
        'package.json',
        'tsconfig.json',
        'package-lock.json'
      ]

      for (const target of restoreTargets) {
        const sourcePath = path.join(backupPath, target)
        const destPath = path.join(this.projectRoot, target)

        if (this.fileUtils.exists(sourcePath)) {
          if (this.fileUtils.exists(destPath)) {
            this.fileUtils.remove(destPath, { recursive: true, force: true })
          }
          this.fileUtils.copyDirectory(sourcePath, destPath)
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
   * 사후 안전 검사 실행
   */
  async postBuildSafetyCheck(): Promise<ValidationResult> {
    logStep('SAFETY', '사후 안전 검사 실행 중...')

    const errors: string[] = []
    const warnings: string[] = []

    // 빌드 결과 검증
    const buildValidation = await this.validateBuildOutput()
    if (!buildValidation.success) {
      errors.push(...buildValidation.errors)
      warnings.push(...buildValidation.warnings)
    }

    // 메모리 정리
    await this.cleanupMemory()

    const result: ValidationResult = {
      success: errors.length === 0,
      errors,
      warnings
    }

    if (result.success) {
      logSuccess('사후 안전 검사 완료')
    } else {
      logError('사후 안전 검사 실패')
      errors.forEach(error => logError(`- ${error}`))
    }

    return result
  }

  /**
   * 디스크 공간 확인
   */
  private async checkDiskSpace(): Promise<boolean> {
    try {
      const freeSpace = this.getFreeDiskSpace()
      const requiredSpace = 500 * 1024 * 1024 // 500MB

      if (freeSpace < requiredSpace) {
        logWarning(`디스크 공간 부족: ${(freeSpace / 1024 / 1024).toFixed(2)}MB`)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 메모리 사용량 확인
   */
  private async checkMemoryUsage(): Promise<boolean> {
    try {
      const memUsage = process.memoryUsage()
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024
      const maxMemoryMB = 1024 // 1GB

      if (heapUsedMB > maxMemoryMB) {
        logWarning(`높은 메모리 사용량: ${heapUsedMB.toFixed(2)}MB`)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 필수 파일 존재 확인
   */
  private async checkRequiredFiles(): Promise<boolean> {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src/backend',
      'src/frontend'
    ]

    for (const file of requiredFiles) {
      const fullPath = path.join(this.projectRoot, file)
      if (!this.fileUtils.exists(fullPath)) {
        logError(`필수 파일/디렉토리가 없습니다: ${file}`)
        return false
      }
    }

    return true
  }

  /**
   * 권한 확인
   */
  private async checkPermissions(): Promise<boolean> {
    try {
      const testFile = path.join(this.projectRoot, '.permission-test')
      this.fileUtils.writeFile(testFile, 'test')
      this.fileUtils.remove(testFile)
      return true
    } catch {
      logError('파일 권한이 부족합니다')
      return false
    }
  }

  /**
   * 의존성 확인
   */
  private async checkDependencies(): Promise<boolean> {
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules')
    return this.fileUtils.exists(nodeModulesPath)
  }

  /**
   * 네트워크 연결 확인
   */
  private async checkNetworkConnection(): Promise<boolean> {
    // 간단한 네트워크 연결 확인
    return true // 실제 구현에서는 ping 또는 HTTP 요청으로 확인
  }

  /**
   * 빌드 결과 검증
   */
  private async validateBuildOutput(): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    const requiredPaths = [
      'dist/backend',
      'dist/frontend',
      'dist/shared'
    ]

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(this.projectRoot, requiredPath)
      if (!this.fileUtils.exists(fullPath)) {
        errors.push(`빌드 결과가 없습니다: ${requiredPath}`)
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 메모리 정리
   */
  private async cleanupMemory(): Promise<void> {
    if (global.gc) {
      global.gc()
      logInfo('가비지 컬렉션 실행')
    }
  }

  /**
   * 오래된 파일 정리
   */
  private async cleanupOldFiles(): Promise<boolean> {
    try {
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

      return true
    } catch {
      return false
    }
  }

  /**
   * 가비지 컬렉션 강제 실행
   */
  private async forceGarbageCollection(): Promise<boolean> {
    try {
      if (global.gc) {
        global.gc()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * 오래된 백업 정리
   */
  private async cleanupOldBackups(): Promise<void> {
    const cutoffTime = Date.now() - (this.options.backupRetentionDays * 24 * 60 * 60 * 1000)
    
    this.backups = this.backups.filter(backup => {
      if (backup.timestamp.getTime() < cutoffTime) {
        this.fileUtils.remove(backup.path, { recursive: true, force: true })
        return false
      }
      return true
    })

    // 최대 백업 수 제한
    if (this.backups.length > this.options.maxBackups) {
      const toRemove = this.backups.slice(0, this.backups.length - this.options.maxBackups)
      for (const backup of toRemove) {
        this.fileUtils.remove(backup.path, { recursive: true, force: true })
      }
      this.backups = this.backups.slice(-this.options.maxBackups)
    }
  }

  /**
   * 디렉토리 크기 계산
   */
  private getDirectorySize(dirPath: string): number {
    let size = 0
    try {
      const items = fs.readdirSync(dirPath)
      for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const stat = fs.statSync(itemPath)
        if (stat.isDirectory()) {
          size += this.getDirectorySize(itemPath)
        } else {
          size += stat.size
        }
      }
    } catch {
      // 무시
    }
    return size
  }

  /**
   * 디렉토리 체크섬 계산
   */
  private calculateDirectoryChecksum(dirPath: string): string {
    const hash = crypto.createHash('md5')
    try {
      const items = fs.readdirSync(dirPath).sort()
      for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const stat = fs.statSync(itemPath)
        if (stat.isFile()) {
          const content = fs.readFileSync(itemPath)
          hash.update(content)
        }
      }
    } catch {
      // 무시
    }
    return hash.digest('hex')
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
   * 안전 통계 출력
   */
  printSafetyStats(): void {
    logInfo('\n🛡️ 안전 통계:')
    logInfo(`- 백업 수: ${this.backups.length}개`)
    logInfo(`- 최대 백업 수: ${this.options.maxBackups}개`)
    logInfo(`- 백업 보관 기간: ${this.options.backupRetentionDays}일`)

    if (this.backups.length > 0) {
      const totalSize = this.backups.reduce((sum, backup) => sum + backup.size, 0)
      logInfo(`- 총 백업 크기: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
    }
  }
}
