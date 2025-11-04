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
 * 사전 배포 검증 (안전장치 강화)
 */
export function preDeployValidation(projectRoot: string): { success: boolean; error?: string; warnings?: string[] } {
  logStep('VALIDATE', '사전 배포 검증 중...')

  const warnings: string[] = []

  try {
    // 1. 필수 파일 존재 확인
    const requiredFiles = [
      'dist/backend',
      'dist/frontend',
      'ecosystem.config.cjs'
    ]

    const missingFiles: string[] = []
    for (const file of requiredFiles) {
      const fullPath = path.join(projectRoot, file)
      if (!fileExists(fullPath)) {
        missingFiles.push(file)
      }
    }

    if (missingFiles.length > 0) {
      return {
        success: false,
        error: `필수 파일/디렉토리가 없습니다: ${missingFiles.join(', ')}`
      }
    }

    // 2. 필수 빌드 파일 확인
    const requiredBuildFiles = [
      'dist/backend/backend/index.cjs',
      'dist/frontend/index.html'
    ]

    const missingBuildFiles: string[] = []
    for (const file of requiredBuildFiles) {
      const fullPath = path.join(projectRoot, file)
      if (!fileExists(fullPath)) {
        missingBuildFiles.push(file)
      }
    }

    if (missingBuildFiles.length > 0) {
      return {
        success: false,
        error: `필수 빌드 파일이 없습니다: ${missingBuildFiles.join(', ')}`
      }
    }

    // 3. PM2 설치 확인
    try {
      execSync('pm2 --version', { stdio: 'ignore', timeout: 5000 })
    } catch {
      return {
        success: false,
        error: 'PM2가 설치되지 않았습니다. "npm install -g pm2"로 설치하세요.'
      }
    }

    // 4. 포트 사용 확인 (경고만)
    const ports = [80, 443, 5000]
    for (const port of ports) {
      try {
        // Windows와 Linux 모두 지원
        const isWindows = process.platform === 'win32'
        const command = isWindows 
          ? `netstat -an | findstr :${port}`
          : `netstat -tlnp 2>/dev/null | grep :${port} || ss -tlnp 2>/dev/null | grep :${port} || true`
        
        execSync(command, { stdio: 'ignore', timeout: 5000 })
        warnings.push(`포트 ${port}이 이미 사용 중일 수 있습니다`)
      } catch {
        // 포트가 사용되지 않음
      }
    }

    // 5. nginx 설치 확인 (경고만)
    try {
      execSync('nginx -v', { stdio: 'ignore', timeout: 5000 })
    } catch {
      warnings.push('nginx가 설치되지 않았을 수 있습니다. 프론트엔드 서빙에 필요합니다.')
    }

    // 6. 환경 변수 확인 (경고만)
    const requiredEnvVars = ['NODE_ENV', 'PORT', 'CORS_ORIGIN']
    const missingEnvVars: string[] = []
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingEnvVars.push(envVar)
      }
    }

    if (missingEnvVars.length > 0) {
      warnings.push(`환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(', ')}`)
    }

    // 7. 디스크 공간 확인 (경고만)
    try {
      const distPath = path.join(projectRoot, 'dist')
      if (fileExists(distPath)) {
        const stats = fs.statSync(distPath)
        // 디스크 공간 확인은 복잡하므로 경고만
      }
    } catch {
      // 무시
    }

    logSuccess('사전 배포 검증 완료')
    return { 
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined
    }

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

/**
 * 기존 서비스 정리 (안전장치 강화)
 */
export function cleanupExistingServices(): { success: boolean; error?: string } {
  logStep('CLEANUP', '기존 서비스 정리 중...')

  try {
    // PM2 프로세스 확인
    try {
      const pm2List = execSync('pm2 jlist', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000
      })
      
      const pm2Processes = JSON.parse(pm2List)
      const runningProcesses = pm2Processes.filter((p: any) => 
        p.pm2_env?.status === 'online' || p.pm2_env?.status === 'restarting'
      )

      if (runningProcesses.length > 0) {
        logInfo(`실행 중인 PM2 프로세스: ${runningProcesses.length}개`)
        
        // PM2 프로세스 정리 (안전하게)
        try {
          execSync('pm2 delete all', { 
            stdio: 'inherit',
            timeout: 30000
          })
          logSuccess('PM2 프로세스 정리 완료')
        } catch (error) {
          logWarning(`PM2 프로세스 정리 실패: ${(error as Error).message}`)
          // 계속 진행
        }
      } else {
        logInfo('실행 중인 PM2 프로세스가 없습니다')
      }
    } catch (error) {
      // PM2가 설치되지 않았거나 실행 중이 아닐 수 있음
      logWarning(`PM2 프로세스 확인 실패: ${(error as Error).message}`)
    }

    // PM2 로그 정리
    try {
      execSync('pm2 flush', { 
        stdio: 'ignore',
        timeout: 10000
      })
      logSuccess('PM2 로그 정리 완료')
    } catch (error) {
      logWarning(`PM2 로그 정리 실패: ${(error as Error).message}`)
      // 계속 진행
    }

    logSuccess('기존 서비스 정리 완료')
    return { success: true }

  } catch (error) {
    const errorMessage = (error as Error).message
    logWarning(`서비스 정리 실패: ${errorMessage}`)
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * PM2 서비스 시작 (안전장치 강화)
 */
export async function startPM2Services(projectRoot: string, config: DeployConfig): Promise<DeployResult> {
  const startTime = Date.now()
  logStep('PM2', 'PM2 서비스 시작 중...')

  try {
    const configPath = path.join(projectRoot, config.pm2.configFile)
    
    if (!fileExists(configPath)) {
      return {
        success: false,
        phase: 'pm2',
        duration: Date.now() - startTime,
        error: `PM2 설정 파일이 없습니다: ${configPath}`
      }
    }

    // PM2 설정 파일 검증
    try {
      const configContent = readFile(configPath)
      if (!configContent || configContent.trim().length === 0) {
        return {
          success: false,
          phase: 'pm2',
          duration: Date.now() - startTime,
          error: 'PM2 설정 파일이 비어있습니다'
        }
      }
    } catch (error) {
      return {
        success: false,
        phase: 'pm2',
        duration: Date.now() - startTime,
        error: `PM2 설정 파일을 읽을 수 없습니다: ${(error as Error).message}`
      }
    }

    // PM2로 서비스 시작 (재시도 포함)
    let lastError: Error | null = null
    const maxRetries = 3
    const retryDelay = 5000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          logInfo(`PM2 서비스 시작 재시도 ${attempt}/${maxRetries}...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }

        execSync(`pm2 start ${configPath} --env ${config.pm2.env}`, { 
          stdio: 'inherit',
          timeout: config.pm2.timeout,
          cwd: projectRoot
        })

        // PM2 상태 확인
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const pm2Status = execSync('pm2 jlist', { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        })
        
        const pm2Processes = JSON.parse(pm2Status)
        const onlineProcesses = pm2Processes.filter((p: any) => 
          p.pm2_env?.status === 'online'
        )

        if (onlineProcesses.length === 0) {
          throw new Error('PM2 프로세스가 시작되지 않았습니다')
        }

        logSuccess(`PM2 서비스 시작 완료 (${onlineProcesses.length}개 프로세스 실행 중)`)

        const duration = Date.now() - startTime
        return {
          success: true,
          phase: 'pm2',
          duration,
          output: `${onlineProcesses.length}개 프로세스 실행 중`
        }
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          logWarning(`PM2 서비스 시작 실패 (시도 ${attempt}/${maxRetries}): ${lastError.message}`)
          continue
        } else {
          throw error
        }
      }
    }

    throw lastError || new Error('PM2 서비스 시작 실패')

  } catch (error) {
    const duration = Date.now() - startTime
    
    // PM2 로그 확인
    try {
      const pm2Logs = execSync('pm2 logs --lines 20 --nostream', { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000
      })
      logInfo(`PM2 로그 (최근 20줄):\n${pm2Logs}`)
    } catch {
      // 무시
    }
    
    return {
      success: false,
      phase: 'pm2',
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 서비스 상태 확인 (안전장치 강화)
 */
export function checkServiceStatus(): DeployResult {
  const startTime = Date.now()
  logStep('STATUS', '서비스 상태 확인 중...')

  try {
    // PM2 상태 확인
    const pm2Status = execSync('pm2 jlist', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000
    })
    
    const pm2Processes = JSON.parse(pm2Status)
    const onlineProcesses = pm2Processes.filter((p: any) => 
      p.pm2_env?.status === 'online'
    )
    const errorProcesses = pm2Processes.filter((p: any) => 
      p.pm2_env?.status === 'errored' || p.pm2_env?.status === 'stopped'
    )

    logInfo(`PM2 프로세스 상태:`)
    logInfo(`  - 실행 중: ${onlineProcesses.length}개`)
    logInfo(`  - 에러/중지: ${errorProcesses.length}개`)

    if (errorProcesses.length > 0) {
      errorProcesses.forEach((p: any) => {
        logWarning(`  - ${p.name}: ${p.pm2_env?.status} (에러: ${p.pm2_env?.pm_err_log_path || 'N/A'})`)
      })
    }

    // PM2 상태 출력
    execSync('pm2 status', { 
      stdio: 'inherit',
      timeout: 10000
    })

    const duration = Date.now() - startTime
    
    if (errorProcesses.length > 0 && onlineProcesses.length === 0) {
      return {
        success: false,
        phase: 'status',
        duration,
        error: `모든 PM2 프로세스가 에러 상태입니다 (${errorProcesses.length}개)`
      }
    }

    logSuccess('서비스 상태 확인 완료')
    return {
      success: true,
      phase: 'status',
      duration,
      output: `${onlineProcesses.length}개 프로세스 실행 중, ${errorProcesses.length}개 에러`
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
 * 헬스체크 실행 (안전장치 강화)
 */
export async function runHealthCheck(projectRoot: string): Promise<DeployResult> {
  const startTime = Date.now()
  logStep('HEALTH', '헬스체크 실행 중...')

  try {
    // HTTP 헬스체크 (백엔드)
    const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:5000'
    const backendHealthUrl = `${backendUrl}/health`
    
    let backendHealthOk = false
    let backendError: string | undefined

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        logInfo(`백엔드 헬스체크 시도 ${attempt}/5: ${backendHealthUrl}`)
        
        const http = require('http')
        const url = require('url')
        const parsedUrl = url.parse(backendHealthUrl)
        
        await new Promise<void>((resolve, reject) => {
          const req = http.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path,
            method: 'GET',
            timeout: 10000
          }, (res: any) => {
            if (res.statusCode === 200) {
              backendHealthOk = true
              resolve()
            } else {
              reject(new Error(`HTTP ${res.statusCode}`))
            }
          })
          
          req.on('error', reject)
          req.on('timeout', () => {
            req.destroy()
            reject(new Error('Timeout'))
          })
          
          req.end()
        })
        
        if (backendHealthOk) {
          logSuccess('백엔드 헬스체크 성공')
          break
        }
      } catch (error) {
        backendError = (error as Error).message
        
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
      }
    }

    // HTTP 헬스체크 (프론트엔드/Nginx)
    const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost'
    const frontendHealthUrl = `${frontendUrl}/health`
    
    let frontendHealthOk = false
    let frontendError: string | undefined

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        logInfo(`프론트엔드 헬스체크 시도 ${attempt}/5: ${frontendHealthUrl}`)
        
        const http = require('http')
        const url = require('url')
        const parsedUrl = url.parse(frontendHealthUrl)
        
        await new Promise<void>((resolve, reject) => {
          const req = http.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path,
            method: 'GET',
            timeout: 10000
          }, (res: any) => {
            if (res.statusCode === 200 || res.statusCode === 304) {
              frontendHealthOk = true
              resolve()
            } else {
              reject(new Error(`HTTP ${res.statusCode}`))
            }
          })
          
          req.on('error', reject)
          req.on('timeout', () => {
            req.destroy()
            reject(new Error('Timeout'))
          })
          
          req.end()
        })
        
        if (frontendHealthOk) {
          logSuccess('프론트엔드 헬스체크 성공')
          break
        }
      } catch (error) {
        frontendError = (error as Error).message
        
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
      }
    }

    const duration = Date.now() - startTime
    
    if (!backendHealthOk && !frontendHealthOk) {
      return {
        success: false,
        phase: 'health',
        duration,
        error: `헬스체크 실패: 백엔드(${backendError}), 프론트엔드(${frontendError})`
      }
    } else if (!backendHealthOk) {
      logWarning(`백엔드 헬스체크 실패: ${backendError}`)
    } else if (!frontendHealthOk) {
      logWarning(`프론트엔드 헬스체크 실패: ${frontendError}`)
    }

    logSuccess('헬스체크 완료')
    return {
      success: true,
      phase: 'health',
      duration,
      output: `백엔드: ${backendHealthOk ? 'OK' : 'FAIL'}, 프론트엔드: ${frontendHealthOk ? 'OK' : 'FAIL'}`
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
    const pm2Result = await startPM2Services(projectRoot, config)
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
    const healthResult = await runHealthCheck(projectRoot)
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
