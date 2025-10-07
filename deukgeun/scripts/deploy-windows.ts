import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface DeployConfig {
  projectRoot: string
  buildTimeout: number
  maxRetries: number
  healthCheckTimeout: number
  pm2ConfigPath: string
}

const config: DeployConfig = {
  projectRoot: process.cwd(),
  buildTimeout: 300000, // 5분
  maxRetries: 3,
  healthCheckTimeout: 30000, // 30초
  pm2ConfigPath: './ecosystem.config.cjs'
}

// Windows 환경 감지
const isWindows = process.platform === 'win32'

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

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step: string, message: string): void {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

// Windows 명령어 실행
function execWindows(command: string, options: any = {}): any {
  try {
    const result = execSync(command, {
      shell: true,
      stdio: 'inherit',
      ...options
    })
    return result
  } catch (error: any) {
    throw new Error(`명령어 실행 실패: ${command} - ${error.message}`)
  }
}

// PowerShell 명령어 실행
function execPowerShell(command: string, options: any = {}): any {
  try {
    const psCommand = `powershell -Command "${command}"`
    const result = execSync(psCommand, {
      shell: true,
      stdio: 'inherit',
      ...options
    })
    return result
  } catch (error: any) {
    throw new Error(`PowerShell 명령어 실행 실패: ${command} - ${error.message}`)
  }
}

// Windows 환경 확인
function checkWindowsEnvironment(): void {
  logStep('ENV', 'Windows 환경 확인 중...')
  
  if (!isWindows) {
    logWarning('이 스크립트는 Windows 환경에서 실행해야 합니다.')
    log('Linux/Mac 환경에서는 deploy-optimized.ts를 사용하세요.', 'yellow')
  }
  
  // Windows 버전 확인
  try {
    const version = execSync('ver', { encoding: 'utf8' })
    log(`Windows 버전: ${version.trim()}`, 'blue')
  } catch (error: any) {
    logWarning('Windows 버전 확인 실패')
  }
  
  logSuccess('Windows 환경 확인 완료')
}

// 의존성 확인 (Windows)
function checkDependenciesWindows(): void {
  logStep('CHECK', 'Windows 의존성 확인 중...')
  
  const requiredCommands = ['node', 'npm', 'pm2']
  const missing: string[] = []
  
  for (const cmd of requiredCommands) {
    try {
      execWindows(`where ${cmd}`, { stdio: 'ignore' })
    } catch {
      missing.push(cmd)
    }
  }
  
  if (missing.length > 0) {
    logError(`누락된 의존성: ${missing.join(', ')}`)
    log('다음 명령어로 설치하세요:', 'yellow')
    for (const cmd of missing) {
      if (cmd === 'pm2') {
        log('  npm install -g pm2', 'yellow')
      }
    }
    process.exit(1)
  }
  
  logSuccess('모든 의존성이 확인되었습니다.')
}

// 환경 변수 설정 (Windows)
function setupEnvironmentWindows(): void {
  logStep('ENV', 'Windows 환경 변수 설정 중...')
  
  try {
    // 환경 변수 설정 스크립트 실행
    execWindows('npm run setup:env:deploy')
    logSuccess('환경 변수 설정 완료')
  } catch (error: any) {
    logWarning('환경 변수 설정 실패, 기본값 사용')
  }
}

// 프로젝트 빌드 (Windows)
function buildProjectWindows(): void {
  logStep('BUILD', 'Windows에서 프로젝트 빌드 중...')
  
  try {
    // 의존성 설치
    log('의존성 설치 중...', 'blue')
    execWindows('npm install', { timeout: config.buildTimeout })
    
    // 백엔드 빌드
    log('백엔드 빌드 중...', 'blue')
    execWindows('npm run build:backend:production', { timeout: config.buildTimeout })
    
    // 프론트엔드 빌드
    log('프론트엔드 빌드 중...', 'blue')
    execWindows('npm run build:production', { timeout: config.buildTimeout })
    
    logSuccess('프로젝트 빌드 완료')
  } catch (error: any) {
    logError(`빌드 실패: ${error.message}`)
    process.exit(1)
  }
}

// PM2 설정 확인 (Windows)
function validatePM2ConfigWindows(): any {
  logStep('PM2', 'Windows PM2 설정 확인 중...')
  
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
  } catch (error: any) {
    logError(`PM2 설정 파일 오류: ${error.message}`)
    process.exit(1)
  }
}

// 기존 서비스 정리 (Windows)
function cleanupServicesWindows(): void {
  logStep('CLEANUP', 'Windows에서 기존 서비스 정리 중...')
  
  try {
    // PM2 프로세스 중지
    execWindows('pm2 delete all', { stdio: 'ignore' })
    logSuccess('기존 서비스 정리 완료')
  } catch (error: any) {
    logWarning('기존 서비스 정리 중 오류 (무시됨)')
  }
}

// 서비스 시작 (Windows)
function startServicesWindows(): void {
  logStep('START', 'Windows에서 서비스 시작 중...')
  
  try {
    // PM2로 서비스 시작
    execWindows(`pm2 start ${config.pm2ConfigPath} --env production`, { 
      timeout: 60000 // 1분
    })
    
    // PM2 상태 확인
    execWindows('pm2 status')
    
    logSuccess('서비스 시작 완료')
  } catch (error: any) {
    logError(`서비스 시작 실패: ${error.message}`)
    process.exit(1)
  }
}

// 헬스체크 (Windows)
function healthCheckWindows(): void {
  logStep('HEALTH', 'Windows에서 헬스체크 수행 중...')
  
  const healthEndpoints = [
    { name: 'Backend API', url: 'http://localhost:5000/health' },
    { name: 'Frontend', url: 'http://localhost:3000' }
  ]
  
  for (const endpoint of healthEndpoints) {
    try {
      // Windows에서 curl 대신 PowerShell 사용
      execPowerShell(`Invoke-WebRequest -Uri "${endpoint.url}" -UseBasicParsing`)
      logSuccess(`${endpoint.name} 헬스체크 통과`)
    } catch (error: any) {
      logWarning(`${endpoint.name} 헬스체크 실패 (서비스 시작 중일 수 있음)`)
    }
  }
}

// Windows 방화벽 설정
function setupWindowsFirewall(): void {
  logStep('FIREWALL', 'Windows 방화벽 설정 중...')
  
  try {
    // 포트 5000 (백엔드) 열기
    execPowerShell('New-NetFirewallRule -DisplayName "Deukgeun Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow')
    
    // 포트 3000 (프론트엔드) 열기
    execPowerShell('New-NetFirewallRule -DisplayName "Deukgeun Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow')
    
    logSuccess('Windows 방화벽 설정 완료')
  } catch (error: any) {
    logWarning('방화벽 설정 실패 (관리자 권한 필요)')
    log('수동으로 포트 3000, 5000을 열어주세요.', 'yellow')
  }
}

// Windows 서비스 등록
function registerWindowsService(): void {
  logStep('SERVICE', 'Windows 서비스 등록 중...')
  
  try {
    // PM2를 Windows 서비스로 등록
    execWindows('pm2 startup', { stdio: 'inherit' })
    execWindows('pm2 save')
    
    logSuccess('Windows 서비스 등록 완료')
  } catch (error: any) {
    logWarning('Windows 서비스 등록 실패')
    log('관리자 권한으로 실행하거나 수동으로 설정하세요.', 'yellow')
  }
}

// Windows 성능 최적화
function optimizeWindowsPerformance(): void {
  logStep('OPTIMIZE', 'Windows 성능 최적화 중...')
  
  try {
    // Node.js 메모리 제한 설정
    execPowerShell('$env:NODE_OPTIONS="--max-old-space-size=4096"')
    
    // PM2 클러스터 모드 설정
    execWindows('pm2 set pm2:max_memory_restart 1G')
    
    logSuccess('Windows 성능 최적화 완료')
  } catch (error: any) {
    logWarning('성능 최적화 실패')
  }
}

// 배포 정보 출력 (Windows)
function printWindowsDeploymentInfo(): void {
  log('\n🎉 Windows 배포가 성공적으로 완료되었습니다!', 'green')
  log('\n📊 배포 정보:', 'cyan')
  
  try {
    const systemInfo = execSync('systeminfo', { encoding: 'utf8' })
    const lines = systemInfo.split('\n')
    const osName = lines.find(line => line.includes('OS Name'))
    const totalMemory = lines.find(line => line.includes('Total Physical Memory'))
    
    if (osName) log(`- OS: ${osName.split(':')[1].trim()}`)
    if (totalMemory) log(`- 메모리: ${totalMemory.split(':')[1].trim()}`)
  } catch (error: any) {
    logWarning('시스템 정보 수집 실패')
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
  
  log('\n📝 Windows 특별 설정:', 'yellow')
  log('1. Windows 방화벽에서 포트 3000, 5000 허용')
  log('2. Windows Defender 예외 설정')
  log('3. 자동 시작 설정 (PM2 startup)')
  log('4. 성능 모니터링 설정')
}

// Windows 배포 메인 함수
async function deployWindows(): Promise<void> {
  try {
    log('🪟 Deukgeun Windows 배포를 시작합니다...', 'bright')
    
    // Windows 환경 확인
    checkWindowsEnvironment()
    
    // 배포 단계 실행
    checkDependenciesWindows()
    setupEnvironmentWindows()
    buildProjectWindows()
    validatePM2ConfigWindows()
    cleanupServicesWindows()
    startServicesWindows()
    healthCheckWindows()
    setupWindowsFirewall()
    registerWindowsService()
    optimizeWindowsPerformance()
    
    // 배포 완료 정보 출력
    printWindowsDeploymentInfo()
    
  } catch (error: any) {
    logError(`Windows 배포 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  deployWindows()
}

export { deployWindows }
