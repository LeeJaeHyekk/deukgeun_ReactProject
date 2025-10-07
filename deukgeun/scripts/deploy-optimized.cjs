const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const config = {
  projectRoot: process.cwd(),
  buildTimeout: 300000, // 5분
  maxRetries: 3,
  healthCheckTimeout: 30000, // 30초
  pm2ConfigPath: './ecosystem.config.cjs'
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
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// 시스템 정보 수집
function getSystemInfo() {
  try {
    const os = require('os')
    return {
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      uptime: os.uptime()
    }
  } catch (error) {
    logWarning('시스템 정보 수집 실패')
    return null
  }
}

// 의존성 확인
function checkDependencies() {
  logStep('CHECK', '의존성 확인 중...')
  
  const requiredCommands = ['node', 'npm', 'pm2']
  const missing = []
  
  for (const cmd of requiredCommands) {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' })
    } catch {
      missing.push(cmd)
    }
  }
  
  if (missing.length > 0) {
    logError(`누락된 의존성: ${missing.join(', ')}`)
    process.exit(1)
  }
  
  logSuccess('모든 의존성이 확인되었습니다.')
}

// 환경 변수 설정
function setupEnvironment() {
  logStep('ENV', '환경 변수 설정 중...')
  
  try {
    // 환경 변수 설정 스크립트 실행
    execSync('npm run setup:env:deploy', { stdio: 'inherit' })
    logSuccess('환경 변수 설정 완료')
  } catch (error) {
    logWarning('환경 변수 설정 실패, 기본값 사용')
  }
}

// 프로젝트 빌드
function buildProject() {
  logStep('BUILD', '프로젝트 빌드 중...')
  
  try {
    // 의존성 설치
    log('의존성 설치 중...', 'blue')
    execSync('npm install', { stdio: 'inherit', timeout: config.buildTimeout })
    
    // 백엔드 빌드
    log('백엔드 빌드 중...', 'blue')
    execSync('npm run build:backend:production', { stdio: 'inherit', timeout: config.buildTimeout })
    
    // 프론트엔드 빌드
    log('프론트엔드 빌드 중...', 'blue')
    execSync('npm run build:production', { stdio: 'inherit', timeout: config.buildTimeout })
    
    logSuccess('프로젝트 빌드 완료')
  } catch (error) {
    logError(`빌드 실패: ${error.message}`)
    process.exit(1)
  }
}

// PM2 설정 확인
function validatePM2Config() {
  logStep('PM2', 'PM2 설정 확인 중...')
  
  if (!fs.existsSync(config.pm2ConfigPath)) {
    logError(`PM2 설정 파일을 찾을 수 없습니다: ${config.pm2ConfigPath}`)
    process.exit(1)
  }
  
  try {
    const pm2Config = require(path.resolve(config.pm2ConfigPath))
    if (!pm2Config.apps || pm2Config.apps.length === 0) {
      logError('PM2 설정에 앱이 정의되지 않았습니다.')
      process.exit(1)
    }
    
    logSuccess('PM2 설정 확인 완료')
    return pm2Config
  } catch (error) {
    logError(`PM2 설정 파일 오류: ${error.message}`)
    process.exit(1)
  }
}

// 기존 서비스 정리
function cleanupServices() {
  logStep('CLEANUP', '기존 서비스 정리 중...')
  
  try {
    // PM2 프로세스 중지
    execSync('pm2 delete all', { stdio: 'ignore' })
    logSuccess('기존 서비스 정리 완료')
  } catch (error) {
    logWarning('기존 서비스 정리 중 오류 (무시됨)')
  }
}

// 서비스 시작
function startServices() {
  logStep('START', '서비스 시작 중...')
  
  try {
    // PM2로 서비스 시작
    execSync(`pm2 start ${config.pm2ConfigPath} --env production`, { 
      stdio: 'inherit',
      timeout: 60000 // 1분
    })
    
    // PM2 상태 확인
    execSync('pm2 status', { stdio: 'inherit' })
    
    logSuccess('서비스 시작 완료')
  } catch (error) {
    logError(`서비스 시작 실패: ${error.message}`)
    process.exit(1)
  }
}

// 헬스체크
function healthCheck() {
  logStep('HEALTH', '헬스체크 수행 중...')
  
  const healthEndpoints = [
    { name: 'Backend API', url: 'http://localhost:5000/health' },
    { name: 'Frontend', url: 'http://localhost:3000' }
  ]
  
  for (const endpoint of healthEndpoints) {
    try {
      const response = execSync(`curl -f ${endpoint.url}`, { 
        stdio: 'ignore',
        timeout: config.healthCheckTimeout 
      })
      logSuccess(`${endpoint.name} 헬스체크 통과`)
    } catch (error) {
      logWarning(`${endpoint.name} 헬스체크 실패 (서비스 시작 중일 수 있음)`)
    }
  }
}

// 로그 설정
function setupLogging() {
  logStep('LOG', '로깅 설정 중...')
  
  try {
    // PM2 로그 설정
    execSync('pm2 install pm2-logrotate', { stdio: 'ignore' })
    execSync('pm2 set pm2-logrotate:max_size 10M', { stdio: 'ignore' })
    execSync('pm2 set pm2-logrotate:retain 7', { stdio: 'ignore' })
    
    logSuccess('로깅 설정 완료')
  } catch (error) {
    logWarning('로깅 설정 실패 (선택사항)')
  }
}

// 모니터링 설정
function setupMonitoring() {
  logStep('MONITOR', '모니터링 설정 중...')
  
  try {
    // PM2 모니터링 설정
    execSync('pm2 install pm2-server-monit', { stdio: 'ignore' })
    logSuccess('모니터링 설정 완료')
  } catch (error) {
    logWarning('모니터링 설정 실패 (선택사항)')
  }
}

// 배포 정보 출력
function printDeploymentInfo() {
  log('\n🎉 배포가 성공적으로 완료되었습니다!', 'green')
  log('\n📊 배포 정보:', 'cyan')
  
  const systemInfo = getSystemInfo()
  if (systemInfo) {
    log(`- 플랫폼: ${systemInfo.platform} ${systemInfo.arch}`)
    log(`- CPU 코어: ${systemInfo.cpus}개`)
    log(`- 메모리: ${Math.round(systemInfo.totalMemory / 1024 / 1024 / 1024)}GB`)
  }
  
  log('\n🔗 서비스 URL:', 'cyan')
  log('- 프론트엔드: http://localhost:3000')
  log('- 백엔드 API: http://localhost:5000')
  log('- 헬스체크: http://localhost:5000/health')
  
  log('\n🛠️  관리 명령어:', 'cyan')
  log('- 상태 확인: pm2 status')
  log('- 로그 확인: pm2 logs')
  log('- 재시작: pm2 restart all')
  log('- 중지: pm2 stop all')
  log('- 삭제: pm2 delete all')
  
  log('\n📝 다음 단계:', 'yellow')
  log('1. 방화벽 설정 확인')
  log('2. 도메인 설정 (필요시)')
  log('3. SSL 인증서 설정 (필요시)')
  log('4. 모니터링 대시보드 확인')
}

// 메인 배포 함수
async function deploy() {
  try {
    log('🚀 Deukgeun 최적화 배포를 시작합니다...', 'bright')
    
    // 시스템 정보 출력
    const systemInfo = getSystemInfo()
    if (systemInfo) {
      log(`\n💻 시스템 정보:`, 'cyan')
      log(`- 플랫폼: ${systemInfo.platform} ${systemInfo.arch}`)
      log(`- CPU: ${systemInfo.cpus}코어`)
      log(`- 메모리: ${Math.round(systemInfo.totalMemory / 1024 / 1024 / 1024)}GB`)
    }
    
    // 배포 단계 실행
    checkDependencies()
    setupEnvironment()
    buildProject()
    validatePM2Config()
    cleanupServices()
    startServices()
    healthCheck()
    setupLogging()
    setupMonitoring()
    
    // 배포 완료 정보 출력
    printDeploymentInfo()
    
  } catch (error) {
    logError(`배포 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  deploy()
}

module.exports = { deploy }
