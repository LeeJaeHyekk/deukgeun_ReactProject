const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const config = {
  projectRoot: process.cwd(),
  logDir: './logs',
  healthCheckInterval: 30000, // 30초
  maxLogFiles: 10,
  alertThresholds: {
    cpu: 80,      // CPU 사용률 80%
    memory: 85,    // 메모리 사용률 85%
    disk: 90       // 디스크 사용률 90%
  }
}

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

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString()
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

// 로그 디렉토리 생성
function createLogDirectory() {
  if (!fs.existsSync(config.logDir)) {
    fs.mkdirSync(config.logDir, { recursive: true })
    logInfo(`로그 디렉토리 생성: ${config.logDir}`)
  }
}

// 시스템 리소스 모니터링
function getSystemResources() {
  try {
    const os = require('os')
    
    // CPU 사용률 계산
    const cpus = os.cpus()
    let totalIdle = 0
    let totalTick = 0
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type]
      }
      totalIdle += cpu.times.idle
    })
    
    const cpuUsage = 100 - Math.round(100 * totalIdle / totalTick)
    
    // 메모리 사용률 계산
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsage = Math.round((usedMemory / totalMemory) * 100)
    
    // 디스크 사용률 계산 (Linux/Mac)
    let diskUsage = 0
    try {
      if (process.platform !== 'win32') {
        const df = execSync('df -h /', { encoding: 'utf8' })
        const lines = df.split('\n')[1].split(/\s+/)
        diskUsage = parseInt(lines[4].replace('%', ''))
      }
    } catch (error) {
      logWarning('디스크 사용률 확인 실패')
    }
    
    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      totalMemory: Math.round(totalMemory / 1024 / 1024 / 1024), // GB
      freeMemory: Math.round(freeMemory / 1024 / 1024 / 1024),   // GB
      uptime: Math.round(os.uptime() / 3600) // 시간
    }
  } catch (error) {
    logError(`시스템 리소스 정보 수집 실패: ${error.message}`)
    return null
  }
}

// PM2 프로세스 상태 확인
function getPM2Status() {
  try {
    const status = execSync('pm2 status --json', { encoding: 'utf8' })
    const pm2Data = JSON.parse(status)
    
    const processes = pm2Data.map(proc => ({
      name: proc.name,
      status: proc.pm2_env.status,
      cpu: proc.monit.cpu,
      memory: Math.round(proc.monit.memory / 1024 / 1024), // MB
      uptime: proc.pm2_env.uptime,
      restarts: proc.pm2_env.restart_time
    }))
    
    return processes
  } catch (error) {
    logError(`PM2 상태 확인 실패: ${error.message}`)
    return []
  }
}

// 애플리케이션 헬스체크
function checkApplicationHealth() {
  const endpoints = [
    { name: 'Backend API', url: 'http://localhost:5000/health' },
    { name: 'Frontend', url: 'http://localhost:3000' }
  ]
  
  const results = []
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now()
      execSync(`curl -f ${endpoint.url}`, { 
        stdio: 'ignore',
        timeout: 5000 
      })
      const responseTime = Date.now() - startTime
      
      results.push({
        name: endpoint.name,
        status: 'healthy',
        responseTime: responseTime
      })
    } catch (error) {
      results.push({
        name: endpoint.name,
        status: 'unhealthy',
        error: error.message
      })
    }
  }
  
  return results
}

// 알림 생성
function generateAlert(type, value, threshold) {
  const alert = {
    timestamp: new Date().toISOString(),
    type: type,
    value: value,
    threshold: threshold,
    severity: value > threshold ? 'critical' : 'warning'
  }
  
  return alert
}

// 로그 파일에 기록
function writeToLogFile(data) {
  try {
    const timestamp = new Date().toISOString().split('T')[0]
    const logFile = path.join(config.logDir, `health-${timestamp}.log`)
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      system: data.system,
      pm2: data.pm2,
      applications: data.applications,
      alerts: data.alerts
    }
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n')
  } catch (error) {
    logError(`로그 파일 기록 실패: ${error.message}`)
  }
}

// 오래된 로그 파일 정리
function cleanupOldLogs() {
  try {
    if (!fs.existsSync(config.logDir)) {
      return
    }
    
    const logFiles = fs.readdirSync(config.logDir)
      .filter(file => file.startsWith('health-') && file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(config.logDir, file),
        mtime: fs.statSync(path.join(config.logDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime)
    
    // 오래된 로그 파일 삭제
    if (logFiles.length > config.maxLogFiles) {
      const toDelete = logFiles.slice(config.maxLogFiles)
      for (const file of toDelete) {
        fs.unlinkSync(file.path)
        logInfo(`오래된 로그 파일 삭제: ${file.name}`)
      }
    }
  } catch (error) {
    logWarning(`로그 파일 정리 실패: ${error.message}`)
  }
}

// 모니터링 리포트 생성
function generateReport(data) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      systemHealth: 'healthy',
      pm2Processes: data.pm2.length,
      runningProcesses: data.pm2.filter(p => p.status === 'online').length,
      applicationHealth: data.applications.filter(a => a.status === 'healthy').length
    },
    details: data
  }
  
  // 전체 상태 판단
  const hasAlerts = data.alerts.length > 0
  const hasUnhealthyApps = data.applications.some(a => a.status === 'unhealthy')
  const hasOfflineProcesses = data.pm2.some(p => p.status !== 'online')
  
  if (hasAlerts || hasUnhealthyApps || hasOfflineProcesses) {
    report.summary.systemHealth = 'unhealthy'
  }
  
  return report
}

// 모니터링 실행
function runMonitoring() {
  logInfo('시스템 모니터링 시작...')
  
  // 시스템 리소스 확인
  const systemResources = getSystemResources()
  if (!systemResources) {
    logError('시스템 리소스 정보를 가져올 수 없습니다.')
    return
  }
  
  // PM2 상태 확인
  const pm2Status = getPM2Status()
  
  // 애플리케이션 헬스체크
  const appHealth = checkApplicationHealth()
  
  // 알림 생성
  const alerts = []
  
  if (systemResources.cpu > config.alertThresholds.cpu) {
    alerts.push(generateAlert('CPU', systemResources.cpu, config.alertThresholds.cpu))
  }
  
  if (systemResources.memory > config.alertThresholds.memory) {
    alerts.push(generateAlert('Memory', systemResources.memory, config.alertThresholds.memory))
  }
  
  if (systemResources.disk > config.alertThresholds.disk) {
    alerts.push(generateAlert('Disk', systemResources.disk, config.alertThresholds.disk))
  }
  
  // 오프라인 PM2 프로세스 확인
  const offlineProcesses = pm2Status.filter(p => p.status !== 'online')
  if (offlineProcesses.length > 0) {
    alerts.push({
      timestamp: new Date().toISOString(),
      type: 'PM2 Process',
      message: `${offlineProcesses.length}개의 PM2 프로세스가 오프라인 상태입니다.`,
      severity: 'critical'
    })
  }
  
  // 데이터 수집
  const monitoringData = {
    system: systemResources,
    pm2: pm2Status,
    applications: appHealth,
    alerts: alerts
  }
  
  // 로그 파일에 기록
  writeToLogFile(monitoringData)
  
  // 리포트 생성 및 출력
  const report = generateReport(monitoringData)
  
  // 상태 출력
  logInfo(`시스템 상태: ${report.summary.systemHealth}`)
  logInfo(`CPU: ${systemResources.cpu}%, 메모리: ${systemResources.memory}%, 디스크: ${systemResources.disk}%`)
  logInfo(`PM2 프로세스: ${report.summary.runningProcesses}/${report.summary.pm2Processes} 실행 중`)
  logInfo(`애플리케이션: ${report.summary.applicationHealth}/${appHealth.length} 정상`)
  
  // 알림 출력
  if (alerts.length > 0) {
    logWarning(`${alerts.length}개의 알림이 있습니다:`)
    alerts.forEach(alert => {
      const severity = alert.severity === 'critical' ? 'red' : 'yellow'
      log(`${alert.severity.toUpperCase()}: ${alert.type} - ${alert.message || `${alert.value}% (임계값: ${alert.threshold}%)`}`, severity)
    })
  } else {
    logSuccess('모든 시스템이 정상 상태입니다.')
  }
  
  // 오래된 로그 정리
  cleanupOldLogs()
}

// 지속적인 모니터링 시작
function startContinuousMonitoring() {
  logInfo('지속적인 모니터링을 시작합니다...')
  logInfo(`모니터링 간격: ${config.healthCheckInterval / 1000}초`)
  
  // 즉시 한 번 실행
  runMonitoring()
  
  // 주기적 실행
  setInterval(runMonitoring, config.healthCheckInterval)
}

// 단일 모니터링 실행
function runSingleCheck() {
  logInfo('단일 모니터링을 실행합니다...')
  runMonitoring()
}

// 모니터링 대시보드 생성
function generateDashboard() {
  logInfo('모니터링 대시보드 생성 중...')
  
  try {
    const dashboardPath = path.join(config.logDir, 'dashboard.html')
    
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deukgeun Health Monitor</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-healthy { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-critical { color: #dc3545; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .refresh-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Deukgeun Health Monitor</h1>
        <button class="refresh-btn" onclick="location.reload()">새로고침</button>
        
        <div class="card">
            <h2>📊 시스템 상태</h2>
            <div id="system-status">로딩 중...</div>
        </div>
        
        <div class="card">
            <h2>⚙️ PM2 프로세스</h2>
            <div id="pm2-status">로딩 중...</div>
        </div>
        
        <div class="card">
            <h2>🌐 애플리케이션 상태</h2>
            <div id="app-status">로딩 중...</div>
        </div>
        
        <div class="card">
            <h2>⚠️ 알림</h2>
            <div id="alerts">로딩 중...</div>
        </div>
    </div>
    
    <script>
        // 실제 구현에서는 API 엔드포인트에서 데이터를 가져와야 합니다
        document.getElementById('system-status').innerHTML = '시스템 모니터링 데이터를 가져오는 중...';
        document.getElementById('pm2-status').innerHTML = 'PM2 프로세스 정보를 가져오는 중...';
        document.getElementById('app-status').innerHTML = '애플리케이션 상태를 확인하는 중...';
        document.getElementById('alerts').innerHTML = '알림을 확인하는 중...';
    </script>
</body>
</html>`
    
    fs.writeFileSync(dashboardPath, html)
    logSuccess(`대시보드 생성 완료: ${dashboardPath}`)
  } catch (error) {
    logError(`대시보드 생성 실패: ${error.message}`)
  }
}

// 메인 함수
function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'monitor'
  
  // 로그 디렉토리 생성
  createLogDirectory()
  
  switch (command) {
    case 'monitor':
      startContinuousMonitoring()
      break
    case 'check':
      runSingleCheck()
      break
    case 'dashboard':
      generateDashboard()
      break
    default:
      logInfo('사용법:')
      logInfo('  node health-monitor.cjs monitor  - 지속적인 모니터링')
      logInfo('  node health-monitor.cjs check    - 단일 체크')
      logInfo('  node health-monitor.cjs dashboard - 대시보드 생성')
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = { 
  runMonitoring, 
  startContinuousMonitoring, 
  generateDashboard 
}
