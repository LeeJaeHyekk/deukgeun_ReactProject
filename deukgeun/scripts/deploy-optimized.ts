#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

interface Config {
  projectRoot: string
  buildTimeout: number
  maxRetries: number
  healthCheckTimeout: number
  pm2ConfigPath: string
}

interface SystemInfo {
  platform: string
  arch: string
  totalMemory: number
  freeMemory: number
  cpus: number
  uptime: number
}

interface HealthEndpoint {
  name: string
  url: string
}

const config: Config = {
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
} as const

type ColorKey = keyof typeof colors

function log(message: string, color: ColorKey = 'reset'): void {
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

// 시스템 정보 수집
function getSystemInfo(): SystemInfo | null {
  try {
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
function checkDependencies(): void {
  logStep('CHECK', '의존성 확인 중...')
  
  const requiredCommands = ['node', 'npm', 'pm2']
  const missing: string[] = []
  
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
function setupEnvironment(): void {
  logStep('ENV', '환경 변수 설정 중...')
  
  try {
    // 환경 변수 설정 스크립트 실행
    execSync('npm run setup:env:deploy', { stdio: 'inherit' })
    logSuccess('환경 변수 설정 완료')
  } catch (error) {
    logWarning('환경 변수 설정 실패, 기본값 사용')
  }
}

// JS to CJS 변환 실행 (개선된 버전)
function executeJSConversion(): boolean {
  logStep('CONVERT', 'JS to CJS 변환 실행 중...')
  
  try {
    // 변환 전 상태 확인
    log('변환 전 파일 상태 확인 중...', 'blue')
    
    // 변환 스크립트 실행
    execSync('npm run convert:js-to-cjs', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout,
      cwd: config.projectRoot
    })
    
    logSuccess('JS to CJS 변환 완료')
    return true
  } catch (error) {
    logWarning(`JS to CJS 변환 실패: ${(error as Error).message}`)
    log('기본 빌드로 진행합니다...', 'yellow')
    return false
  }
}

// 변환 후 빌드 실행
function buildWithConversion(): boolean {
  logStep('BUILD_WITH_CONVERSION', '변환된 코드로 빌드 중...')
  
  try {
    // 백엔드 빌드 (변환된 코드 사용)
    log('백엔드 빌드 중...', 'blue')
    execSync('npm run build:backend:production', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout 
    })
    
    // 프론트엔드 빌드
    log('프론트엔드 빌드 중...', 'blue')
    execSync('npm run build:production', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout 
    })
    
    logSuccess('변환된 코드로 빌드 완료')
    return true
  } catch (error) {
    logError(`변환된 코드 빌드 실패: ${(error as Error).message}`)
    return false
  }
}

// 프로젝트 빌드 (개선된 버전)
function buildProject(): void {
  logStep('BUILD', '프로젝트 빌드 중...')
  
  try {
    // 의존성 설치
    log('의존성 설치 중...', 'blue')
    execSync('npm install', { stdio: 'inherit', timeout: config.buildTimeout })
    
    // JS to CJS 변환 시도
    const conversionSuccess = executeJSConversion()
    
    if (conversionSuccess) {
      // 변환된 코드로 빌드
      const buildSuccess = buildWithConversion()
      if (!buildSuccess) {
        logWarning('변환된 코드 빌드 실패, 기본 빌드로 롤백...')
        buildDefault()
      }
    } else {
      // 기본 빌드
      buildDefault()
    }
    
    logSuccess('프로젝트 빌드 완료')
  } catch (error) {
    logError(`빌드 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 기본 빌드 실행
function buildDefault(): void {
  logStep('BUILD_DEFAULT', '기본 빌드 진행 중...')
  
  try {
    // 백엔드 빌드
    log('백엔드 빌드 중...', 'blue')
    execSync('npm run build:backend:production', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout 
    })
    
    // 프론트엔드 빌드
    log('프론트엔드 빌드 중...', 'blue')
    execSync('npm run build:production', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout 
    })
    
    logSuccess('기본 빌드 완료')
  } catch (error) {
    logError(`기본 빌드 실패: ${(error as Error).message}`)
    throw error
  }
}

// PM2 설정 확인
function validatePM2Config(): any {
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
    logError(`PM2 설정 파일 오류: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 기존 서비스 정리
function cleanupServices(): void {
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
function startServices(): void {
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
    logError(`서비스 시작 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 헬스체크
function healthCheck(): void {
  logStep('HEALTH', '헬스체크 수행 중...')
  
  const healthEndpoints: HealthEndpoint[] = [
    { name: 'Backend API', url: 'http://localhost:5000/health' },
    { name: 'Frontend', url: 'http://localhost:3000' }
  ]
  
  for (const endpoint of healthEndpoints) {
    try {
      execSync(`curl -f ${endpoint.url}`, { 
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
function setupLogging(): void {
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
function setupMonitoring(): void {
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
function printDeploymentInfo(): void {
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
async function deploy(): Promise<void> {
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
    logError(`배포 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  deploy()
}

export { deploy }
