/**
 * 함수형 데이터 관리 모듈
 * 데이터 파일 복사 및 관리를 위한 공통 기능
 */

import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'

interface DataConfig {
  projectRoot: string
  sourceDir: string
  targetDir: string
  dataFiles: string[]
  verbose: boolean
}

interface DataFile {
  source: string
  target: string
  size: number
  exists: boolean
}

/**
 * 데이터 파일 복사
 */
export function copyDataFiles(config: DataConfig): boolean {
  try {
    logStep('DATA', '데이터 파일 복사 중...')
    
    const dataFiles = scanDataFiles(config)
    let successCount = 0
    let failCount = 0
    
    for (const dataFile of dataFiles) {
      if (copyDataFile(dataFile, config)) {
        successCount++
        if (config.verbose) {
          logInfo(`✅ ${dataFile.source} -> ${dataFile.target}`)
        }
      } else {
        failCount++
        logError(`❌ ${dataFile.source} -> ${dataFile.target}`)
      }
    }
    
    logSuccess(`데이터 파일 복사 완료: 성공 ${successCount}개, 실패 ${failCount}개`)
    return failCount === 0

  } catch (error) {
    logError(`데이터 파일 복사 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 데이터 파일 스캔
 */
function scanDataFiles(config: DataConfig): DataFile[] {
  const dataFiles: DataFile[] = []
  
  try {
    const sourceDir = path.join(config.projectRoot, config.sourceDir)
    const targetDir = path.join(config.projectRoot, config.targetDir)
    
    if (!fs.existsSync(sourceDir)) {
      logWarning(`소스 디렉토리가 존재하지 않습니다: ${sourceDir}`)
      return dataFiles
    }
    
    // 대상 디렉토리 생성
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
      logInfo(`대상 디렉토리 생성: ${targetDir}`)
    }
    
    // 데이터 파일들 스캔
    for (const fileName of config.dataFiles) {
      const sourcePath = path.join(sourceDir, fileName)
      const targetPath = path.join(targetDir, fileName)
      
      if (fs.existsSync(sourcePath)) {
        const stat = fs.statSync(sourcePath)
        dataFiles.push({
          source: sourcePath,
          target: targetPath,
          size: stat.size,
          exists: true
        })
      } else {
        logWarning(`소스 파일이 존재하지 않습니다: ${sourcePath}`)
        dataFiles.push({
          source: sourcePath,
          target: targetPath,
          size: 0,
          exists: false
        })
      }
    }
    
    return dataFiles

  } catch (error) {
    logError(`데이터 파일 스캔 실패: ${(error as Error).message}`)
    return dataFiles
  }
}

/**
 * 단일 데이터 파일 복사
 */
function copyDataFile(dataFile: DataFile, config: DataConfig): boolean {
  try {
    if (!dataFile.exists) {
      return false
    }
    
    // 대상 디렉토리 생성
    const targetDir = path.dirname(dataFile.target)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    // 파일 복사
    fs.copyFileSync(dataFile.source, dataFile.target)
    
    // 복사 확인
    if (fs.existsSync(dataFile.target)) {
      const targetStat = fs.statSync(dataFile.target)
      if (targetStat.size === dataFile.size) {
        return true
      } else {
        logWarning(`파일 크기가 일치하지 않습니다: ${dataFile.target}`)
        return false
      }
    } else {
      logError(`복사된 파일이 존재하지 않습니다: ${dataFile.target}`)
      return false
    }

  } catch (error) {
    logError(`파일 복사 실패: ${dataFile.source} -> ${dataFile.target} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 데이터 파일 검증
 */
export function validateDataFiles(config: DataConfig): boolean {
  try {
    logStep('VALIDATE', '데이터 파일 검증 중...')
    
    const dataFiles = scanDataFiles(config)
    let validCount = 0
    let invalidCount = 0
    
    for (const dataFile of dataFiles) {
      if (validateDataFile(dataFile)) {
        validCount++
        if (config.verbose) {
          logInfo(`✅ ${dataFile.target} 검증 성공`)
        }
      } else {
        invalidCount++
        logError(`❌ ${dataFile.target} 검증 실패`)
      }
    }
    
    logSuccess(`데이터 파일 검증 완료: 성공 ${validCount}개, 실패 ${invalidCount}개`)
    return invalidCount === 0

  } catch (error) {
    logError(`데이터 파일 검증 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 단일 데이터 파일 검증
 */
function validateDataFile(dataFile: DataFile): boolean {
  try {
    if (!fs.existsSync(dataFile.target)) {
      return false
    }
    
    const targetStat = fs.statSync(dataFile.target)
    if (targetStat.size !== dataFile.size) {
      return false
    }
    
    // 파일 내용 검증 (간단한 체크섬)
    const sourceContent = fs.readFileSync(dataFile.source)
    const targetContent = fs.readFileSync(dataFile.target)
    
    return sourceContent.equals(targetContent)

  } catch (error) {
    logError(`파일 검증 실패: ${dataFile.target} - ${(error as Error).message}`)
    return false
  }
}

/**
 * 데이터 파일 정리
 */
export function cleanupDataFiles(config: DataConfig): boolean {
  try {
    logStep('CLEANUP', '데이터 파일 정리 중...')
    
    const targetDir = path.join(config.projectRoot, config.targetDir)
    
    if (!fs.existsSync(targetDir)) {
      logInfo(`대상 디렉토리가 존재하지 않습니다: ${targetDir}`)
      return true
    }
    
    let cleanedCount = 0
    
    for (const fileName of config.dataFiles) {
      const targetPath = path.join(targetDir, fileName)
      
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath)
        cleanedCount++
        if (config.verbose) {
          logInfo(`🗑️  ${targetPath} 삭제됨`)
        }
      }
    }
    
    logSuccess(`데이터 파일 정리 완료: ${cleanedCount}개 파일 삭제`)
    return true

  } catch (error) {
    logError(`데이터 파일 정리 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 데이터 파일 목록 출력
 */
export function listDataFiles(config: DataConfig): void {
  try {
    logStep('LIST', '데이터 파일 목록 출력 중...')
    
    const dataFiles = scanDataFiles(config)
    
    logInfo('\n📁 데이터 파일 목록:')
    logInfo(`- 소스 디렉토리: ${config.sourceDir}`)
    logInfo(`- 대상 디렉토리: ${config.targetDir}`)
    logInfo(`- 총 파일: ${dataFiles.length}개`)
    
    dataFiles.forEach((dataFile, index) => {
      const status = dataFile.exists ? '✅' : '❌'
      const size = dataFile.exists ? `${(dataFile.size / 1024).toFixed(2)}KB` : 'N/A'
      logInfo(`${index + 1}. ${status} ${path.basename(dataFile.source)} (${size})`)
    })

  } catch (error) {
    logError(`데이터 파일 목록 출력 실패: ${(error as Error).message}`)
  }
}

/**
 * 데이터 파일 통계
 */
export function getDataFileStats(config: DataConfig): any {
  try {
    const dataFiles = scanDataFiles(config)
    
    const stats = {
      totalFiles: dataFiles.length,
      existingFiles: dataFiles.filter(f => f.exists).length,
      missingFiles: dataFiles.filter(f => !f.exists).length,
      totalSize: dataFiles.reduce((sum, f) => sum + f.size, 0),
      averageSize: 0
    }
    
    if (stats.existingFiles > 0) {
      stats.averageSize = stats.totalSize / stats.existingFiles
    }
    
    return stats

  } catch (error) {
    logError(`데이터 파일 통계 생성 실패: ${(error as Error).message}`)
    return {
      totalFiles: 0,
      existingFiles: 0,
      missingFiles: 0,
      totalSize: 0,
      averageSize: 0
    }
  }
}

/**
 * 데이터 파일 통계 출력
 */
export function printDataFileStats(config: DataConfig): void {
  try {
    const stats = getDataFileStats(config)
    
    logInfo('\n📊 데이터 파일 통계:')
    logInfo(`- 총 파일: ${stats.totalFiles}개`)
    logInfo(`- 존재하는 파일: ${stats.existingFiles}개`)
    logInfo(`- 누락된 파일: ${stats.missingFiles}개`)
    logInfo(`- 총 크기: ${(stats.totalSize / 1024).toFixed(2)}KB`)
    logInfo(`- 평균 크기: ${(stats.averageSize / 1024).toFixed(2)}KB`)

  } catch (error) {
    logError(`데이터 파일 통계 출력 실패: ${(error as Error).message}`)
  }
}
