/**
 * 함수형 배포 관리 모듈
 * 프로젝트 배포 과정을 관리하는 공통 기능
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'
import { fileExists, readFile, writeFile, ensureDirectory, copyDirectory, moveFile, removeFile } from './file-functions'
import { executeBuild } from './build-functions'
import { convertFiles, scanConversionTargets } from './converter-functions'
import { executeSafetyGuard, preBuildSafetyCheck, postBuildSafetyCheck, initializeSafetyConfig } from './safety-functions'

interface DeployOptions {
  timeout: number
  maxRetries: number
  parallel: boolean
  validate: boolean
  cleanup: boolean
  backup: boolean
  autoRecovery: boolean
  safety: boolean
}

interface DeployResult {
  success: boolean
  phase: string
  duration: number
  output?: string
  error?: string
}

interface DeployConfig {
  pm2: {
    configFile: string
    env: string
    timeout: number
  }
  services: {
    backend: string
    frontend: string
  }
}

/**
 * 배포 설정 초기화
 */
function initializeDeployConfig(): DeployConfig {
  return {
    pm2: {
      configFile: './ecosystem.config.cjs',
      env: 'production',
      timeout: 60000
    },
    services: {
      backend: 'backend',
      frontend: 'frontend'
    }
  }
}

/**
 * 사전 배포 검증
 */
export function preDeployValidation(projectRoot: string): { success: boolean; error?: string } {
  logStep('VALIDATE', '사전 배포 검증 중...')

  try {
    // 1. 필수 파일 존재 확인
    const requiredFiles = [
      'dist/backend',
      'dist/frontend',
      'dist/shared',
      'ecosystem.config.cjs'
    ]

    for (const file of requiredFiles) {
      const fullPath = path.join(projectRoot, file)
      if (!fileExists(fullPath)) {
        return {
          success: false,
          error: `필수 파일/디렉토리가 없습니다: ${file}`
        }
      }
    }

    // 2. PM2 설치 확인
    try {
      execSync('pm2 --version', { stdio: 'ignore' })
    } catch {
      return {
        success: false,
        error: 'PM2가 설치되지 않았습니다'
      }
    }

    // 3. 포트 사용 확인
    const ports = [3000, 3001, 8080, 8081]
    for (const port of ports) {
      try {
        execSync(`netstat -an | grep :${port}`, { stdio: 'ignore' })
        logWarning(`포트 ${port}이 이미 사용 중입니다`)
      } catch {
        // 포트가 사용되지 않음
      }
    }

    logSuccess('사전 배포 검증 완료')
    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

/**
 * 기존 서비스 정리
 */
export function cleanupExistingServices(): void {
  logStep('CLEANUP', '기존 서비스 정리 중...')

  try {
    // PM2 프로세스 정리
    try {
      execSync('pm2 delete all', { stdio: 'ignore' })
    } catch {
      // 무시
    }

    // PM2 로그 정리
    try {
      execSync('pm2 flush', { stdio: 'ignore' })
    } catch {
      // 무시
    }

    logSuccess('기존 서비스 정리 완료')

  } catch (error) {
    logWarning(`서비스 정리 실패: ${(error as Error).message}`)
  }
}

/**
 * PM2 서비스 시작
 */
export function startPM2Services(projectRoot: string, config: DeployConfig): DeployResult {
  const startTime = Date.now()
  logStep('PM2', 'PM2 서비스 시작 중...')

  try {
    const configPath = path.join(projectRoot, config.pm2.configFile)
    
    if (!fileExists(configPath)) {
      return {
        success: false,
        phase: 'pm2',
        duration: Date.now() - startTime,
        error: 'PM2 설정 파일이 없습니다'
      }
    }

    // PM2로 서비스 시작
    execSync(`pm2 start ${configPath} --env ${config.pm2.env}`, { 
      stdio: 'inherit',
      timeout: config.pm2.timeout,
      cwd: projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess('PM2 서비스 시작 완료')

    return {
      success: true,
      phase: 'pm2',
      duration
    }

  } catch (error) {
    const duration = Date.now() - startTime
    return {
      success: false,
      phase: 'pm2',
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 서비스 상태 확인
 */
export function checkServiceStatus(): DeployResult {
  const startTime = Date.now()
  logStep('STATUS', '서비스 상태 확인 중...')

  try {
    // PM2 상태 확인
    execSync('pm2 status', { stdio: 'inherit' })

    const duration = Date.now() - startTime
    logSuccess('서비스 상태 확인 완료')

    return {
      success: true,
      phase: 'status',
      duration
    }

  } catch (error) {
    const duration = Date.now() - startTime
    return {
      success: false,
      phase: 'status',
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 헬스체크 실행
 */
export function runHealthCheck(projectRoot: string): DeployResult {
  const startTime = Date.now()
  logStep('HEALTH', '헬스체크 실행 중...')

  try {
    // 간단한 헬스체크
    const healthCheckScript = path.join(projectRoot, 'scripts', 'health-monitor.ts')
    
    if (fileExists(healthCheckScript)) {
      execSync(`npx ts-node ${healthCheckScript}`, { 
        stdio: 'inherit',
        timeout: 30000,
        cwd: projectRoot
      })
    } else {
      logWarning('헬스체크 스크립트가 없습니다')
    }

    const duration = Date.now() - startTime
    logSuccess('헬스체크 완료')

    return {
      success: true,
      phase: 'health',
      duration
    }

  } catch (error) {
    const duration = Date.now() - startTime
    return {
      success: false,
      phase: 'health',
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 배포 통계 출력
 */
export function printDeployStats(results: DeployResult[]): void {
  logInfo('\n📊 배포 통계:')
  
  const totalDuration = results.reduce((sum, result) => sum + result.duration, 0)
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  logInfo(`- 총 소요시간: ${(totalDuration / 1000).toFixed(2)}초`)
  logInfo(`- 성공: ${successCount}개`)
  logInfo(`- 실패: ${failCount}개`)

  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const duration = (result.duration / 1000).toFixed(2)
    logInfo(`- ${status} ${result.phase}: ${duration}초`)
  })
}

/**
 * 전체 배포 프로세스 실행
 */
export async function executeDeploy(projectRoot: string, options: DeployOptions): Promise<{ success: boolean; results: DeployResult[]; error?: string }> {
  const startTime = Date.now()
  const results: DeployResult[] = []
  const config = initializeDeployConfig()

  try {
    logStep('DEPLOY', '배포 프로세스 시작...')

    // 1. 사전 검증
    const preValidation = preDeployValidation(projectRoot)
    if (!preValidation.success) {
      return {
        success: false,
        results,
        error: preValidation.error
      }
    }

    // 1.5. 안전장치 실행
    if (options.safety) {
      const safetyResult = await executeSafetyGuard(projectRoot, {
        createBackup: options.backup,
        validateBefore: true,
        validateAfter: false,
        rollbackOnError: true
      })
      
      if (!safetyResult.success) {
        return {
          success: false,
          results,
          error: safetyResult.error
        }
      }
    }

    // 2. 기존 서비스 정리
    cleanupExistingServices()

    // 3. 변환 실행 (필요한 경우)
    if (options.backup) {
      const conversionTargets = scanConversionTargets(projectRoot)
      if (conversionTargets.length > 0) {
        logStep('CONVERT', '코드 변환 중...')
        const conversionResult = convertFiles(conversionTargets, {
          backup: options.backup,
          validate: options.validate,
          polyfill: true,
          parallel: options.parallel,
          maxWorkers: 4
        })
        
        if (conversionResult.failed.length > 0) {
          logWarning('일부 파일 변환에 실패했습니다')
        }
      }
    }

    // 4. 빌드 실행
    const buildResult = await executeBuild(projectRoot, {
      timeout: options.timeout,
      maxRetries: options.maxRetries,
      parallel: false,
      validate: options.validate,
      cleanup: options.cleanup,
      safety: options.safety || true,
      backup: options.backup || true
    })

    if (!buildResult.success) {
      return {
        success: false,
        results,
        error: '빌드 실패'
      }
    }

    // 5. PM2 서비스 시작
    const pm2Result = startPM2Services(projectRoot, config)
    results.push(pm2Result)

    if (!pm2Result.success) {
      return {
        success: false,
        results,
        error: 'PM2 서비스 시작 실패'
      }
    }

    // 6. 서비스 상태 확인
    const statusResult = checkServiceStatus()
    results.push(statusResult)

    // 7. 헬스체크 실행
    const healthResult = runHealthCheck(projectRoot)
    results.push(healthResult)

    // 7.5. 사후 안전 검사
    if (options.safety) {
      const safetyConfig = initializeSafetyConfig(projectRoot)
      const postCheck = await postBuildSafetyCheck(safetyConfig)
      if (!postCheck.success) {
        logWarning('사후 안전 검사에서 경고가 발생했습니다')
        postCheck.warnings.forEach(warning => logWarning(`- ${warning}`))
      }
    }

    const duration = Date.now() - startTime
    logSuccess(`배포 완료 (소요시간: ${(duration / 1000).toFixed(2)}초)`)

    return {
      success: true,
      results
    }

  } catch (error) {
    return {
      success: false,
      results,
      error: (error as Error).message
    }
  }
}
