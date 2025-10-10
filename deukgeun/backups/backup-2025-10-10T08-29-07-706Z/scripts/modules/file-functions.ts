/**
 * 함수형 파일 시스템 유틸리티 모듈
 * 파일/디렉토리 조작, 백업, 복사 등의 공통 기능
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { logError, logWarning, logSuccess, logInfo } from './logger-functions'

interface CopyOptions {
  overwrite?: boolean
  preserveTimestamps?: boolean
}

interface RemoveOptions {
  force?: boolean
  recursive?: boolean
}

interface BackupOptions {
  timestamp?: boolean
  preserveStructure?: boolean
  compression?: boolean
}

interface CleanupOptions {
  olderThan?: number
  dryRun?: boolean
}

interface WriteFileOptions {
  encoding?: BufferEncoding
  createDir?: boolean
}

interface ScanOptions {
  recursive?: boolean
  includeFiles?: boolean
  includeDirs?: boolean
  filter?: (filePath: string, stat: fs.Stats) => boolean
  extensions?: string[]
}

interface FileInfo {
  path: string
  relativePath: string
  type: 'file' | 'directory'
  stat: fs.Stats
}

/**
 * 디렉토리 존재 확인 및 생성
 */
export function ensureDirectory(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    return true
  }
  return false
}

/**
 * 디렉토리 재귀 복사
 */
export function copyDirectory(source: string, destination: string, options: CopyOptions = {}): boolean {
  const { overwrite = true, preserveTimestamps = true } = options
  
  try {
    if (!fs.existsSync(source)) {
      throw new Error(`소스 디렉토리가 존재하지 않습니다: ${source}`)
    }

    ensureDirectory(destination)
    
    const items = fs.readdirSync(source)
    
    for (const item of items) {
      const sourcePath = path.join(source, item)
      const destPath = path.join(destination, item)
      const stat = fs.statSync(sourcePath)
      
      if (stat.isDirectory()) {
        copyDirectory(sourcePath, destPath, options)
      } else {
        if (fs.existsSync(destPath) && !overwrite) {
          continue
        }
        fs.copyFileSync(sourcePath, destPath)
        
        if (preserveTimestamps) {
          fs.utimesSync(destPath, stat.atime, stat.mtime)
        }
      }
    }
    
    return true
  } catch (error) {
    logError(`디렉토리 복사 실패: ${source} -> ${destination} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 파일 복사
 */
export function copyFile(source: string, destination: string, options: CopyOptions = {}): boolean {
  const { overwrite = true, preserveTimestamps = true } = options
  
  try {
    if (!fs.existsSync(source)) {
      throw new Error(`소스 파일이 존재하지 않습니다: ${source}`)
    }

    if (fs.existsSync(destination) && !overwrite) {
      return false
    }

    ensureDirectory(path.dirname(destination))
    fs.copyFileSync(source, destination)
    
    if (preserveTimestamps) {
      const stat = fs.statSync(source)
      fs.utimesSync(destination, stat.atime, stat.mtime)
    }
    
    return true
  } catch (error) {
    logError(`파일 복사 실패: ${source} -> ${destination} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 파일/디렉토리 삭제
 */
export function removeFile(target: string, options: RemoveOptions = {}): boolean {
  const { force = true, recursive = true } = options
  
  try {
    if (!fs.existsSync(target)) {
      return true
    }

    const stat = fs.statSync(target)
    
    if (stat.isDirectory()) {
      if (recursive) {
        fs.rmSync(target, { recursive: true, force })
      } else {
        fs.rmdirSync(target)
      }
    } else {
      fs.unlinkSync(target)
    }
    
    return true
  } catch (error) {
    if (force) {
      logWarning(`삭제 실패 (무시됨): ${target} - ${(error as Error).message}`)
      return true
    } else {
      logError(`삭제 실패: ${target} - ${(error as Error).message}`)
      return false
    }
  }
}

/**
 * 파일 이동/이름 변경
 */
export function moveFile(source: string, destination: string): boolean {
  try {
    if (!fs.existsSync(source)) {
      throw new Error(`소스가 존재하지 않습니다: ${source}`)
    }

    ensureDirectory(path.dirname(destination))
    fs.renameSync(source, destination)
    return true
  } catch (error) {
    logError(`이동 실패: ${source} -> ${destination} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 파일 해시 계산
 */
export function calculateHash(filePath: string, algorithm: string = 'md5'): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }
    
    const content = fs.readFileSync(filePath)
    return crypto.createHash(algorithm).update(content).digest('hex')
  } catch (error) {
    logError(`해시 계산 실패: ${filePath} - ${(error as Error).message}`)
    return null
  }
}

/**
 * 파일 크기 확인
 */
export function getFileSize(filePath: string): number {
  try {
    if (!fs.existsSync(filePath)) {
      return 0
    }
    
    const stat = fs.statSync(filePath)
    return stat.size
  } catch (error) {
    logError(`파일 크기 확인 실패: ${filePath} - ${(error as Error).message}`)
    return 0
  }
}

/**
 * 디렉토리 스캔
 */
export function scanDirectory(dirPath: string, options: ScanOptions = {}): FileInfo[] {
  const { 
    recursive = true, 
    includeFiles = true, 
    includeDirs = false,
    filter = null,
    extensions = null 
  } = options
  
  const results: FileInfo[] = []
  
  try {
    if (!fs.existsSync(dirPath)) {
      return results
    }

    const scan = (currentPath: string): void => {
      const items = fs.readdirSync(currentPath)
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item)
        const stat = fs.statSync(fullPath)
        const relativePath = path.relative(dirPath, fullPath)
        
        // 확장자 필터
        if (extensions && stat.isFile()) {
          const ext = path.extname(fullPath)
          if (!extensions.includes(ext)) {
            continue
          }
        }
        
        // 커스텀 필터
        if (filter && !filter(fullPath, stat)) {
          continue
        }
        
        if (stat.isDirectory()) {
          if (includeDirs) {
            results.push({ path: fullPath, relativePath, type: 'directory', stat })
          }
          if (recursive) {
            scan(fullPath)
          }
        } else if (stat.isFile() && includeFiles) {
          results.push({ path: fullPath, relativePath, type: 'file', stat })
        }
      }
    }
    
    scan(dirPath)
    return results
  } catch (error) {
    logError(`디렉토리 스캔 실패: ${dirPath} - ${(error as Error).message}`)
    return results
  }
}

/**
 * 백업 생성
 */
export function createBackup(sourcePath: string, backupDir: string, options: BackupOptions = {}): string | null {
  const { 
    timestamp = true, 
    preserveStructure = true,
    compression = false 
  } = options
  
  try {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`백업할 소스가 존재하지 않습니다: ${sourcePath}`)
    }

    ensureDirectory(backupDir)
    
    const timestampStr = timestamp ? `-${new Date().toISOString().replace(/[:.]/g, '-')}` : ''
    const baseName = path.basename(sourcePath)
    const backupName = `${baseName}${timestampStr}`
    const backupPath = path.join(backupDir, backupName)
    
    const stat = fs.statSync(sourcePath)
    
    if (stat.isDirectory()) {
      if (preserveStructure) {
        copyDirectory(sourcePath, backupPath)
      } else {
        // 디렉토리 내용만 복사
        ensureDirectory(backupPath)
        const items = fs.readdirSync(sourcePath)
        for (const item of items) {
          const sourceItem = path.join(sourcePath, item)
          const destItem = path.join(backupPath, item)
          copyFile(sourceItem, destItem)
        }
      }
    } else {
      copyFile(sourcePath, backupPath)
    }
    
    return backupPath
  } catch (error) {
    logError(`백업 생성 실패: ${sourcePath} - ${(error as Error).message}`)
    return null
  }
}

/**
 * 백업에서 복원
 */
export function restoreFromBackup(backupPath: string, targetPath: string): boolean {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`백업 파일이 존재하지 않습니다: ${backupPath}`)
    }

    const stat = fs.statSync(backupPath)
    
    if (stat.isDirectory()) {
      copyDirectory(backupPath, targetPath)
    } else {
      copyFile(backupPath, targetPath)
    }
    
    return true
  } catch (error) {
    logError(`백업 복원 실패: ${backupPath} -> ${targetPath} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 임시 디렉토리 생성
 */
export function createTempDir(projectRoot: string, prefix: string = 'temp'): string {
  const tempDir = path.join(projectRoot, `.${prefix}-${Date.now()}`)
  ensureDirectory(tempDir)
  return tempDir
}

/**
 * 정리 작업
 */
export function cleanup(directories: string[], options: CleanupOptions = {}): number {
  const { 
    olderThan = 7 * 24 * 60 * 60 * 1000, // 7일
    dryRun = false 
  } = options
  
  const cutoffTime = Date.now() - olderThan
  let cleanedCount = 0
  
  for (const dir of directories) {
    try {
      if (!fs.existsSync(dir)) {
        continue
      }

      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.mtime.getTime() < cutoffTime) {
          if (dryRun) {
            logInfo(`정리 대상: ${itemPath}`)
          } else {
            removeFile(itemPath, { recursive: true, force: true })
            cleanedCount++
          }
        }
      }
    } catch (error) {
      logWarning(`정리 실패: ${dir} - ${(error as Error).message}`)
    }
  }
  
  if (!dryRun) {
    logSuccess(`정리 완료: ${cleanedCount}개 항목 삭제`)
  }
  
  return cleanedCount
}

/**
 * 파일 존재 확인
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/**
 * 파일 읽기
 */
export function readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string | null {
  try {
    return fs.readFileSync(filePath, { encoding })
  } catch (error) {
    logError(`파일 읽기 실패: ${filePath} - ${(error as Error).message}`)
    return null
  }
}

/**
 * 파일 쓰기
 */
export function writeFile(filePath: string, content: string, options: WriteFileOptions = {}): boolean {
  const { encoding = 'utf8', createDir = true } = options
  
  try {
    if (createDir) {
      ensureDirectory(path.dirname(filePath))
    }
    
    fs.writeFileSync(filePath, content, { encoding })
    return true
  } catch (error) {
    logError(`파일 쓰기 실패: ${filePath} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 상대 경로를 절대 경로로 변환
 */
export function resolvePath(projectRoot: string, relativePath: string): string {
  return path.resolve(projectRoot, relativePath)
}

/**
 * 경로 정규화
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath)
}
