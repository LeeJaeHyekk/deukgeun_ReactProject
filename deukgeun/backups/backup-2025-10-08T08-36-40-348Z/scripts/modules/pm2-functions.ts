/**
 * 함수형 PM2 관리 모듈
 * PM2 프로세스 관리를 위한 공통 기능
 */

import { execSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'

interface PM2Config {
  projectRoot: string
  configFile: string
  env: string
  timeout: number
}

interface PM2Process {
  name: string
  status: string
  cpu: number
  memory: number
  uptime: number
  restarts: number
  pid: number
}

interface PM2Status {
  processes: PM2Process[]
  totalProcesses: number
  onlineProcesses: number
  stoppedProcesses: number
  erroredProcesses: number
}

/**
 * PM2 설치 확인
 */
export function checkPM2Installation(): boolean {
  try {
    execSync('pm2 --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * PM2 설치 안내
 */
export function showPM2InstallationGuide(): void {
  logError('PM2가 설치되지 않았습니다.')
  logInfo('다음 명령어로 PM2를 설치하세요:')
  logInfo('npm install -g pm2')
  logInfo('또는')
  logInfo('yarn global add pm2')
}

/**
 * PM2 프로세스 목록 가져오기
 */
export function getPM2Processes(): PM2Process[] {
  try {
    const output = execSync('pm2 jlist', { encoding: 'utf8' })
    const processes = JSON.parse(output)
    
    return processes.map((proc: any) => ({
      name: proc.name,
      status: proc.pm2_env?.status || 'unknown',
      cpu: proc.monit?.cpu || 0,
      memory: proc.monit?.memory || 0,
      uptime: proc.pm2_env?.pm_uptime || 0,
      restarts: proc.pm2_env?.restart_time || 0,
      pid: proc.pid || 0
    }))
  } catch (error) {
    logWarning(`PM2 프로세스 정보 수집 실패: ${(error as Error).message}`)
    return []
  }
}

/**
 * PM2 상태 요약
 */
export function getPM2Status(): PM2Status {
  const processes = getPM2Processes()
  
  return {
    processes,
    totalProcesses: processes.length,
    onlineProcesses: processes.filter(p => p.status === 'online').length,
    stoppedProcesses: processes.filter(p => p.status === 'stopped').length,
    erroredProcesses: processes.filter(p => p.status === 'errored').length
  }
}

/**
 * PM2 프로세스 시작
 */
export function startPM2Processes(config: PM2Config): boolean {
  try {
    logStep('PM2', 'PM2 프로세스 시작 중...')
    
    if (!checkPM2Installation()) {
      showPM2InstallationGuide()
      return false
    }

    const configPath = path.join(config.projectRoot, config.configFile)
    
    if (!fs.existsSync(configPath)) {
      logError(`PM2 설정 파일이 없습니다: ${configPath}`)
      return false
    }

    execSync(`pm2 start ${configPath} --env ${config.env}`, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    logSuccess('PM2 프로세스 시작 완료')
    return true

  } catch (error) {
    logError(`PM2 프로세스 시작 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * PM2 프로세스 중지
 */
export function stopPM2Processes(): boolean {
  try {
    logStep('PM2', 'PM2 프로세스 중지 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return false
    }

    execSync('pm2 stop all', { stdio: 'inherit' })
    logSuccess('PM2 프로세스 중지 완료')
    return true

  } catch (error) {
    logError(`PM2 프로세스 중지 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * PM2 프로세스 재시작
 */
export function restartPM2Processes(): boolean {
  try {
    logStep('PM2', 'PM2 프로세스 재시작 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return false
    }

    execSync('pm2 restart all', { stdio: 'inherit' })
    logSuccess('PM2 프로세스 재시작 완료')
    return true

  } catch (error) {
    logError(`PM2 프로세스 재시작 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * PM2 프로세스 삭제
 */
export function deletePM2Processes(): boolean {
  try {
    logStep('PM2', 'PM2 프로세스 삭제 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return false
    }

    execSync('pm2 delete all', { stdio: 'inherit' })
    logSuccess('PM2 프로세스 삭제 완료')
    return true

  } catch (error) {
    logError(`PM2 프로세스 삭제 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * PM2 상태 출력
 */
export function showPM2Status(): void {
  try {
    logStep('PM2', 'PM2 상태 확인 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return
    }

    execSync('pm2 status', { stdio: 'inherit' })

  } catch (error) {
    logError(`PM2 상태 확인 실패: ${(error as Error).message}`)
  }
}

/**
 * PM2 로그 출력
 */
export function showPM2Logs(lines: number = 50): void {
  try {
    logStep('PM2', 'PM2 로그 확인 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return
    }

    execSync(`pm2 logs --lines ${lines}`, { stdio: 'inherit' })

  } catch (error) {
    logError(`PM2 로그 확인 실패: ${(error as Error).message}`)
  }
}

/**
 * PM2 모니터링 시작
 */
export function startPM2Monitoring(): void {
  try {
    logStep('PM2', 'PM2 모니터링 시작 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return
    }

    execSync('pm2 monit', { stdio: 'inherit' })

  } catch (error) {
    logError(`PM2 모니터링 시작 실패: ${(error as Error).message}`)
  }
}

/**
 * PM2 로그 정리
 */
export function flushPM2Logs(): boolean {
  try {
    logStep('PM2', 'PM2 로그 정리 중...')
    
    if (!checkPM2Installation()) {
      logWarning('PM2가 설치되지 않았습니다.')
      return false
    }

    execSync('pm2 flush', { stdio: 'inherit' })
    logSuccess('PM2 로그 정리 완료')
    return true

  } catch (error) {
    logError(`PM2 로그 정리 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * PM2 프로세스 정보 출력
 */
export function printPM2ProcessInfo(): void {
  const status = getPM2Status()
  
  logInfo('\n📊 PM2 프로세스 정보:')
  logInfo(`- 총 프로세스: ${status.totalProcesses}개`)
  logInfo(`- 온라인: ${status.onlineProcesses}개`)
  logInfo(`- 중지됨: ${status.stoppedProcesses}개`)
  logInfo(`- 오류: ${status.erroredProcesses}개`)

  if (status.processes.length > 0) {
    logInfo('\n프로세스 상세 정보:')
    status.processes.forEach(proc => {
      const statusIcon = proc.status === 'online' ? '✅' : '❌'
      const memoryMB = Math.round(proc.memory / 1024 / 1024)
      const uptimeHours = Math.floor(proc.uptime / 3600000)
      
      logInfo(`- ${statusIcon} ${proc.name}:`)
      logInfo(`  └─ 상태: ${proc.status}`)
      logInfo(`  └─ CPU: ${proc.cpu}%`)
      logInfo(`  └─ 메모리: ${memoryMB}MB`)
      logInfo(`  └─ 가동시간: ${uptimeHours}시간`)
      logInfo(`  └─ 재시작: ${proc.restarts}회`)
    })
  }
}

/**
 * PM2 설정 파일 생성
 */
export function createPM2Config(projectRoot: string, configFile: string = 'ecosystem.config.cjs'): boolean {
  try {
    const configPath = path.join(projectRoot, configFile)
    
    if (fs.existsSync(configPath)) {
      logInfo(`PM2 설정 파일이 이미 존재합니다: ${configPath}`)
      return true
    }

    const configContent = `module.exports = {
  apps: [
    {
      name: 'backend',
      script: './dist/backend/index.js',
      cwd: '${projectRoot}',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_file: './logs/backend-combined.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'frontend',
      script: 'serve',
      cwd: '${projectRoot}',
      args: '-s dist/frontend -l 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_file: './logs/frontend-combined.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '512M'
    }
  ]
}`

    fs.writeFileSync(configPath, configContent)
    logSuccess(`PM2 설정 파일이 생성되었습니다: ${configPath}`)
    return true

  } catch (error) {
    logError(`PM2 설정 파일 생성 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * PM2 프로세스 관리 메뉴
 */
export function showPM2Menu(): void {
  logInfo('\n🔧 PM2 관리 메뉴:')
  logInfo('1. 프로세스 시작')
  logInfo('2. 프로세스 중지')
  logInfo('3. 프로세스 재시작')
  logInfo('4. 프로세스 삭제')
  logInfo('5. 상태 확인')
  logInfo('6. 로그 확인')
  logInfo('7. 모니터링 시작')
  logInfo('8. 로그 정리')
  logInfo('9. 설정 파일 생성')
  logInfo('0. 종료')
}
