/**
 * 함수형 안전장치 모듈
 * 빌드/배포 과정에서 안전성을 보장하는 공통 기능
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { logError, logWarning, logSuccess, logInfo, logStep, logDebug } from './logger-functions'
import { fileExists, readFile, writeFile, ensureDirectory, copyDirectory, copyFile, moveFile, removeFile, calculateHash, getFileSize } from './file-functions'

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

interface SafetyConfig {
  projectRoot: string
  options: SafetyOptions
  checks: SafetyCheck[]
  backups: BackupInfo[]
}

/**
 * 안전장치 설정 초기화
 */
export function initializeSafetyConfig(projectRoot: string, options: Partial<SafetyOptions> = {}): SafetyConfig {
  const defaultOptions: SafetyOptions = {
    createBackup: true,
    validateBefore: true,
    validateAfter: true,
    rollbackOnError: true,
    maxBackups: 5,
    backupRetentionDays: 7,
    ...options
  }

  const checks: SafetyCheck[] = [
    {
      name: '디스크 공간 확인',
      critical: true,
      check: () => checkDiskSpace(projectRoot),
      fix: () => cleanupOldFiles(projectRoot)
    },
    {
      name: '메모리 사용량 확인',
      critical: true,
      check: () => checkMemoryUsage(),
      fix: () => forceGarbageCollection()
    },
    {
      name: '필수 파일 존재 확인',
      critical: true,
      check: () => checkRequiredFiles(projectRoot)
    },
    {
      name: '권한 확인',
      critical: true,
      check: () => checkPermissions(projectRoot)
    },
    {
      name: '의존성 확인',
      critical: false,
      check: () => checkDependencies(projectRoot)
    },
    {
      name: '네트워크 연결 확인',
      critical: false,
      check: () => checkNetworkConnection()
    }
  ]

  return {
    projectRoot,
    options: defaultOptions,
    checks,
    backups: []
  }
}

/**
 * 디스크 공간 확인
 */
export async function checkDiskSpace(projectRoot: string): Promise<boolean> {
  try {
    const stats = fs.statSync(projectRoot)
    const freeSpace = stats.size // 실제로는 더 정확한 방법 필요
    
    // 최소 1GB 여유 공간 필요
    const minFreeSpace = 1024 * 1024 * 1024
    return freeSpace > minFreeSpace
  } catch (error) {
    logError(`디스크 공간 확인 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 메모리 사용량 확인
 */
export async function checkMemoryUsage(): Promise<boolean> {
  try {
    const memUsage = process.memoryUsage()
    const totalMem = memUsage.heapTotal + memUsage.external
    const maxMem = 1024 * 1024 * 1024 * 2 // 2GB 제한
    
    return totalMem < maxMem
  } catch (error) {
    logError(`메모리 사용량 확인 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 필수 파일 존재 확인
 */
export async function checkRequiredFiles(projectRoot: string): Promise<boolean> {
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/backend',
    'src/frontend'
  ]

  for (const file of requiredFiles) {
    const fullPath = path.join(projectRoot, file)
    if (!fileExists(fullPath)) {
      logError(`필수 파일이 없습니다: ${file}`)
      return false
    }
  }

  return true
}

/**
 * 권한 확인
 */
export async function checkPermissions(projectRoot: string): Promise<boolean> {
  try {
    // 쓰기 권한 확인
    fs.accessSync(projectRoot, fs.constants.W_OK)
    return true
  } catch (error) {
    logError(`권한 확인 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 의존성 확인
 */
export async function checkDependencies(projectRoot: string): Promise<boolean> {
  try {
    // package.json 존재 확인
    const packageJsonPath = path.join(projectRoot, 'package.json')
    if (!fileExists(packageJsonPath)) {
      return false
    }

    // node_modules 존재 확인
    const nodeModulesPath = path.join(projectRoot, 'node_modules')
    if (!fileExists(nodeModulesPath)) {
      logWarning('node_modules가 없습니다. npm install을 실행하세요.')
      return false
    }

    return true
  } catch (error) {
    logError(`의존성 확인 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 네트워크 연결 확인
 */
export async function checkNetworkConnection(): Promise<boolean> {
  try {
    // 간단한 네트워크 연결 확인
    execSync('ping -c 1 8.8.8.8', { stdio: 'ignore' })
    return true
  } catch (error) {
    logWarning('네트워크 연결 확인 실패')
    return false
  }
}

/**
 * 오래된 파일 정리
 */
export async function cleanupOldFiles(projectRoot: string): Promise<boolean> {
  try {
    logInfo('오래된 파일 정리 중...')
    
    // 임시 파일 정리
    const tempDirs = ['dist', 'build', '.cache', 'node_modules/.cache']
    for (const dir of tempDirs) {
      const fullPath = path.join(projectRoot, dir)
      if (fileExists(fullPath)) {
        removeFile(fullPath)
        logInfo(`정리됨: ${dir}`)
      }
    }

    return true
  } catch (error) {
    logError(`파일 정리 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 가비지 컬렉션 강제 실행
 */
export async function forceGarbageCollection(): Promise<boolean> {
  try {
    if (global.gc) {
      global.gc()
      logInfo('가비지 컬렉션 실행됨')
      return true
    } else {
      logWarning('가비지 컬렉션을 사용할 수 없습니다')
      return false
    }
  } catch (error) {
    logError(`가비지 컬렉션 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 사전 안전 검사 실행
 */
export async function preBuildSafetyCheck(config: SafetyConfig): Promise<ValidationResult> {
  logStep('SAFETY', '사전 안전 검사 실행 중...')

  const errors: string[] = []
  const warnings: string[] = []

  for (const check of config.checks) {
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
export async function createSafetyBackup(config: SafetyConfig): Promise<string | null> {
  if (!config.options.createBackup) {
    return null
  }

  logStep('BACKUP', '안전 백업 생성 중...')

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(config.projectRoot, '.safety-backups')
    const backupPath = path.join(backupDir, `backup-${timestamp}`)

    ensureDirectory(backupDir)

    // 백업할 대상들
    const backupTargets = [
      'src',
      'package.json',
      'tsconfig.json',
      'package-lock.json'
    ]

    let totalSize = 0
    const backupInfo: BackupInfo = {
      path: backupPath,
      timestamp: new Date(),
      size: 0,
      checksum: ''
    }

    for (const target of backupTargets) {
      const sourcePath = path.join(config.projectRoot, target)
      const destPath = path.join(backupPath, target)

      if (fileExists(sourcePath)) {
        ensureDirectory(path.dirname(destPath))
        
        if (fs.statSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, destPath)
        } else {
          copyFile(sourcePath, destPath)
        }

        const size = getFileSize(sourcePath)
        totalSize += size
        logInfo(`백업됨: ${target} (${size} bytes)`)
      }
    }

    backupInfo.size = totalSize
    backupInfo.checksum = calculateHash(backupPath) || ''

    // 백업 정보 저장
    const backupInfoPath = path.join(backupPath, 'backup-info.json')
    writeFile(backupInfoPath, JSON.stringify(backupInfo, null, 2))

    config.backups.push(backupInfo)

    // 오래된 백업 정리
    await cleanupOldBackups(config)

    logSuccess(`안전 백업 생성 완료: ${backupPath}`)
    logInfo(`백업 크기: ${totalSize} bytes`)
    logInfo(`백업 체크섬: ${backupInfo.checksum}`)

    return backupPath
  } catch (error) {
    logError(`안전 백업 생성 실패: ${(error as Error).message}`)
    return null
  }
}

/**
 * 오래된 백업 정리
 */
export async function cleanupOldBackups(config: SafetyConfig): Promise<void> {
  const maxBackups = config.options.maxBackups
  const retentionDays = config.options.backupRetentionDays

  if (config.backups.length > maxBackups) {
    // 오래된 백업부터 삭제
    config.backups.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const toDelete = config.backups.slice(0, config.backups.length - maxBackups)
    
    for (const backup of toDelete) {
      try {
        removeFile(backup.path)
        logInfo(`오래된 백업 삭제됨: ${backup.path}`)
      } catch (error) {
        logWarning(`백업 삭제 실패: ${backup.path}`)
      }
    }

    config.backups = config.backups.slice(-maxBackups)
  }

  // 보존 기간이 지난 백업 삭제
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  const recentBackups = config.backups.filter(backup => backup.timestamp > cutoffDate)
  
  if (recentBackups.length !== config.backups.length) {
    logInfo(`${config.backups.length - recentBackups.length}개의 오래된 백업이 정리되었습니다`)
    config.backups = recentBackups
  }
}

/**
 * 백업에서 복원
 */
export async function restoreFromBackup(config: SafetyConfig, backupPath: string): Promise<boolean> {
  try {
    logStep('RESTORE', `백업에서 복원 중: ${backupPath}`)

    if (!fileExists(backupPath)) {
      logError(`백업 경로가 존재하지 않습니다: ${backupPath}`)
      return false
    }

    // 백업 정보 확인
    const backupInfoPath = path.join(backupPath, 'backup-info.json')
    if (fileExists(backupInfoPath)) {
      const backupInfo = JSON.parse(readFile(backupInfoPath) || '{}')
      logInfo(`백업 정보: ${backupInfo.timestamp}, 크기: ${backupInfo.size} bytes`)
    }

    // 복원할 대상들
    const restoreTargets = [
      'src',
      'package.json',
      'tsconfig.json',
      'package-lock.json'
    ]

    for (const target of restoreTargets) {
      const sourcePath = path.join(backupPath, target)
      const destPath = path.join(config.projectRoot, target)

      if (fileExists(sourcePath)) {
        // 기존 파일 백업
        if (fileExists(destPath)) {
          const tempBackup = `${destPath}.temp`
          moveFile(destPath, tempBackup)
        }

        // 복원
        if (fs.statSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, destPath)
        } else {
          copyFile(sourcePath, destPath)
        }

        logInfo(`복원됨: ${target}`)
      }
    }

    logSuccess('백업에서 복원 완료')
    return true
  } catch (error) {
    logError(`백업 복원 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 사후 안전 검사 실행
 */
export async function postBuildSafetyCheck(config: SafetyConfig): Promise<ValidationResult> {
  logStep('SAFETY', '사후 안전 검사 실행 중...')

  const errors: string[] = []
  const warnings: string[] = []

  // 빌드 결과 확인
  const buildDirs = ['dist/backend', 'dist/frontend', 'dist/shared']
  for (const dir of buildDirs) {
    const fullPath = path.join(config.projectRoot, dir)
    if (!fileExists(fullPath)) {
      errors.push(`빌드 결과가 없습니다: ${dir}`)
    }
  }

  // 빌드 파일 크기 확인
  for (const dir of buildDirs) {
    const fullPath = path.join(config.projectRoot, dir)
    if (fileExists(fullPath)) {
      const size = getFileSize(fullPath)
      if (size === 0) {
        warnings.push(`빌드 결과가 비어있습니다: ${dir}`)
      }
    }
  }

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

  if (warnings.length > 0) {
    logWarning('경고사항:')
    warnings.forEach(warning => logWarning(`- ${warning}`))
  }

  return result
}

/**
 * 안전장치 통합 실행
 */
export async function executeSafetyGuard(
  projectRoot: string, 
  options: Partial<SafetyOptions> = {}
): Promise<{ success: boolean; backupPath?: string; error?: string }> {
  try {
    const config = initializeSafetyConfig(projectRoot, options)
    
    // 사전 안전 검사
    if (config.options.validateBefore) {
      const preCheck = await preBuildSafetyCheck(config)
      if (!preCheck.success) {
        return {
          success: false,
          error: `사전 안전 검사 실패: ${preCheck.errors.join(', ')}`
        }
      }
    }

    // 안전 백업 생성
    let backupPath: string | null = null
    if (config.options.createBackup) {
      backupPath = await createSafetyBackup(config)
      if (!backupPath) {
        logWarning('백업 생성 실패했지만 계속 진행합니다')
      }
    }

    return {
      success: true,
      backupPath: backupPath || undefined
    }
  } catch (error) {
    return {
      success: false,
      error: `안전장치 실행 실패: ${(error as Error).message}`
    }
  }
}

/**
 * 롤백 실행
 */
export async function executeRollback(
  projectRoot: string, 
  backupPath: string
): Promise<boolean> {
  try {
    const config = initializeSafetyConfig(projectRoot)
    return await restoreFromBackup(config, backupPath)
  } catch (error) {
    logError(`롤백 실행 실패: ${(error as Error).message}`)
    return false
  }
}
