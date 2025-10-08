/**
 * 함수형 헬스 모니터링 모듈
 * 시스템 리소스 및 애플리케이션 상태를 모니터링하는 공통 기능
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'

interface HealthConfig {
  projectRoot: string
  logDir: string
  healthCheckInterval: number
  maxLogFiles: number
  alertThresholds: {
    cpu: number
    memory: number
    disk: number
  }
}

interface SystemResources {
  cpu: number
  memory: number
  disk: number
  totalMemory: number
  freeMemory: number
  uptime: number
}

interface PM2Process {
  name: string
  status: string
  cpu: number
  memory: number
  uptime: number
  restarts: number
}

interface ApplicationHealth {
  name: string
  status: 'healthy' | 'unhealthy'
  responseTime?: number
  error?: string
}

interface Alert {
  timestamp: string
  type: string
  value?: number
  threshold?: number
  message?: string
}

interface HealthReport {
  timestamp: string
  systemResources: SystemResources
  pm2Processes: PM2Process[]
  applicationHealth: ApplicationHealth[]
  alerts: Alert[]
}

/**
 * 시스템 리소스 정보 수집
 */
export function getSystemResources(): SystemResources {
  try {
    const cpus = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const uptime = os.uptime()

    // CPU 사용률 계산 (간단한 구현)
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq
      const idle = cpu.times.idle
      return acc + ((total - idle) / total) * 100
    }, 0) / cpus.length

    // 메모리 사용률 계산
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100

    // 디스크 사용률 계산 (간단한 구현)
    const diskUsage = 0 // 실제로는 더 복잡한 계산 필요

    return {
      cpu: Math.round(cpuUsage * 100) / 100,
      memory: Math.round(memoryUsage * 100) / 100,
      disk: diskUsage,
      totalMemory,
      freeMemory,
      uptime
    }
  } catch (error) {
    logError(`시스템 리소스 정보 수집 실패: ${(error as Error).message}`)
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      totalMemory: 0,
      freeMemory: 0,
      uptime: 0
    }
  }
}

/**
 * PM2 프로세스 정보 수집
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
      restarts: proc.pm2_env?.restart_time || 0
    }))
  } catch (error) {
    logWarning(`PM2 프로세스 정보 수집 실패: ${(error as Error).message}`)
    return []
  }
}

/**
 * 애플리케이션 헬스체크
 */
export function checkApplicationHealth(projectRoot: string): ApplicationHealth[] {
  const healthChecks: ApplicationHealth[] = []
  
  try {
    // 백엔드 헬스체크
    const backendHealth = checkBackendHealth(projectRoot)
    healthChecks.push(backendHealth)

    // 프론트엔드 헬스체크
    const frontendHealth = checkFrontendHealth(projectRoot)
    healthChecks.push(frontendHealth)

  } catch (error) {
    logError(`애플리케이션 헬스체크 실패: ${(error as Error).message}`)
  }

  return healthChecks
}

/**
 * 백엔드 헬스체크
 */
function checkBackendHealth(projectRoot: string): ApplicationHealth {
  try {
    const startTime = Date.now()
    
    // 간단한 파일 존재 확인
    const backendPath = path.join(projectRoot, 'dist', 'backend')
    const exists = fs.existsSync(backendPath)
    
    const responseTime = Date.now() - startTime
    
    return {
      name: 'backend',
      status: exists ? 'healthy' : 'unhealthy',
      responseTime,
      error: exists ? undefined : 'Backend files not found'
    }
  } catch (error) {
    return {
      name: 'backend',
      status: 'unhealthy',
      error: (error as Error).message
    }
  }
}

/**
 * 프론트엔드 헬스체크
 */
function checkFrontendHealth(projectRoot: string): ApplicationHealth {
  try {
    const startTime = Date.now()
    
    // 간단한 파일 존재 확인
    const frontendPath = path.join(projectRoot, 'dist', 'frontend')
    const exists = fs.existsSync(frontendPath)
    
    const responseTime = Date.now() - startTime
    
    return {
      name: 'frontend',
      status: exists ? 'healthy' : 'unhealthy',
      responseTime,
      error: exists ? undefined : 'Frontend files not found'
    }
  } catch (error) {
    return {
      name: 'frontend',
      status: 'unhealthy',
      error: (error as Error).message
    }
  }
}

/**
 * 알림 생성
 */
export function generateAlerts(systemResources: SystemResources, config: HealthConfig): Alert[] {
  const alerts: Alert[] = []
  const timestamp = new Date().toISOString()

  // CPU 알림
  if (systemResources.cpu > config.alertThresholds.cpu) {
    alerts.push({
      timestamp,
      type: 'cpu',
      value: systemResources.cpu,
      threshold: config.alertThresholds.cpu,
      message: `CPU 사용률이 ${systemResources.cpu}%로 임계값 ${config.alertThresholds.cpu}%를 초과했습니다.`
    })
  }

  // 메모리 알림
  if (systemResources.memory > config.alertThresholds.memory) {
    alerts.push({
      timestamp,
      type: 'memory',
      value: systemResources.memory,
      threshold: config.alertThresholds.memory,
      message: `메모리 사용률이 ${systemResources.memory}%로 임계값 ${config.alertThresholds.memory}%를 초과했습니다.`
    })
  }

  // 디스크 알림
  if (systemResources.disk > config.alertThresholds.disk) {
    alerts.push({
      timestamp,
      type: 'disk',
      value: systemResources.disk,
      threshold: config.alertThresholds.disk,
      message: `디스크 사용률이 ${systemResources.disk}%로 임계값 ${config.alertThresholds.disk}%를 초과했습니다.`
    })
  }

  return alerts
}

/**
 * 헬스 리포트 생성
 */
export function generateHealthReport(config: HealthConfig): HealthReport {
  const timestamp = new Date().toISOString()
  
  const systemResources = getSystemResources()
  const pm2Processes = getPM2Processes()
  const applicationHealth = checkApplicationHealth(config.projectRoot)
  const alerts = generateAlerts(systemResources, config)

  return {
    timestamp,
    systemResources,
    pm2Processes,
    applicationHealth,
    alerts
  }
}

/**
 * 헬스 리포트 로깅
 */
export function logHealthReport(report: HealthReport): void {
  logStep('HEALTH', '헬스 리포트 생성 중...')
  
  logInfo(`\n📊 시스템 리소스:`)
  logInfo(`- CPU: ${report.systemResources.cpu}%`)
  logInfo(`- 메모리: ${report.systemResources.memory}%`)
  logInfo(`- 디스크: ${report.systemResources.disk}%`)
  logInfo(`- 가동시간: ${Math.floor(report.systemResources.uptime / 3600)}시간`)

  if (report.pm2Processes.length > 0) {
    logInfo(`\n🔄 PM2 프로세스:`)
    report.pm2Processes.forEach(proc => {
      const status = proc.status === 'online' ? '✅' : '❌'
      logInfo(`- ${status} ${proc.name}: ${proc.status} (CPU: ${proc.cpu}%, Memory: ${Math.round(proc.memory / 1024 / 1024)}MB)`)
    })
  }

  if (report.applicationHealth.length > 0) {
    logInfo(`\n🏥 애플리케이션 상태:`)
    report.applicationHealth.forEach(app => {
      const status = app.status === 'healthy' ? '✅' : '❌'
      logInfo(`- ${status} ${app.name}: ${app.status}${app.responseTime ? ` (${app.responseTime}ms)` : ''}`)
      if (app.error) {
        logWarning(`  └─ 오류: ${app.error}`)
      }
    })
  }

  if (report.alerts.length > 0) {
    logWarning(`\n⚠️  알림 (${report.alerts.length}개):`)
    report.alerts.forEach(alert => {
      logWarning(`- ${alert.type.toUpperCase()}: ${alert.message}`)
    })
  } else {
    logSuccess('\n✅ 모든 시스템이 정상 상태입니다.')
  }
}

/**
 * 헬스 리포트를 파일에 저장
 */
export function saveHealthReport(report: HealthReport, config: HealthConfig): void {
  try {
    const logDir = path.join(config.projectRoot, config.logDir)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const filename = `health-${new Date().toISOString().split('T')[0]}.log`
    const filepath = path.join(logDir, filename)
    
    const logEntry = JSON.stringify(report) + '\n'
    fs.appendFileSync(filepath, logEntry)
    
    logInfo(`헬스 리포트가 저장되었습니다: ${filepath}`)
  } catch (error) {
    logError(`헬스 리포트 저장 실패: ${(error as Error).message}`)
  }
}

/**
 * 오래된 로그 파일 정리
 */
export function cleanupOldLogs(config: HealthConfig): void {
  try {
    const logDir = path.join(config.projectRoot, config.logDir)
    if (!fs.existsSync(logDir)) {
      return
    }

    const files = fs.readdirSync(logDir)
    const logFiles = files.filter(file => file.startsWith('health-') && file.endsWith('.log'))
    
    if (logFiles.length > config.maxLogFiles) {
      const sortedFiles = logFiles.sort()
      const filesToDelete = sortedFiles.slice(0, logFiles.length - config.maxLogFiles)
      
      filesToDelete.forEach(file => {
        const filepath = path.join(logDir, file)
        fs.unlinkSync(filepath)
        logInfo(`오래된 로그 파일 삭제: ${file}`)
      })
    }
  } catch (error) {
    logWarning(`로그 파일 정리 실패: ${(error as Error).message}`)
  }
}

/**
 * 헬스 모니터링 실행
 */
export function runHealthMonitoring(config: HealthConfig): void {
  try {
    logStep('MONITOR', '헬스 모니터링을 시작합니다...')
    
    const report = generateHealthReport(config)
    logHealthReport(report)
    saveHealthReport(report, config)
    cleanupOldLogs(config)
    
    logSuccess('헬스 모니터링이 완료되었습니다.')
  } catch (error) {
    logError(`헬스 모니터링 실패: ${(error as Error).message}`)
  }
}

/**
 * 헬스체크 실행
 */
export function runHealthCheck(config: HealthConfig): boolean {
  try {
    logStep('CHECK', '헬스체크를 실행합니다...')
    
    const report = generateHealthReport(config)
    const hasAlerts = report.alerts.length > 0
    const hasUnhealthyApps = report.applicationHealth.some(app => app.status === 'unhealthy')
    
    if (hasAlerts || hasUnhealthyApps) {
      logError('헬스체크 실패: 문제가 발견되었습니다.')
      logHealthReport(report)
      return false
    } else {
      logSuccess('헬스체크 성공: 모든 시스템이 정상입니다.')
      return true
    }
  } catch (error) {
    logError(`헬스체크 실패: ${(error as Error).message}`)
    return false
  }
}
