#!/usr/bin/env node

/**
 * PM2 관리 스크립트
 * Windows에서 CMD 창이 반복 열리는 문제를 해결하기 위한 스크립트
 */

import { execSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

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

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'cyan')
}

// PM2 설치 확인
function checkPM2Installation(): boolean {
  try {
    execSync('pm2 --version', { stdio: 'ignore' })
    return true
  } catch (error) {
    return false
  }
}

// 프로세스 시작
function startProcesses(): void {
  logInfo('프로세스 시작 중...')
  try {
    execSync('pm2 start ecosystem.config.cjs', { stdio: 'inherit' })
    logSuccess('모든 프로세스가 성공적으로 시작되었습니다.')
  } catch (error) {
    logError(`프로세스 시작에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 프로세스 중지
function stopProcesses(): void {
  logWarning('프로세스 중지 중...')
  try {
    execSync('pm2 stop ecosystem.config.cjs', { stdio: 'inherit' })
    logSuccess('모든 프로세스가 중지되었습니다.')
  } catch (error) {
    logError(`프로세스 중지에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 프로세스 재시작
function restartProcesses(): void {
  logWarning('프로세스 재시작 중...')
  try {
    execSync('pm2 restart ecosystem.config.cjs', { stdio: 'inherit' })
    logSuccess('모든 프로세스가 재시작되었습니다.')
  } catch (error) {
    logError(`프로세스 재시작에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 프로세스 상태 확인
function showStatus(): void {
  logInfo('프로세스 상태 확인 중...')
  try {
    execSync('pm2 status', { stdio: 'inherit' })
  } catch (error) {
    logError(`상태 확인에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 로그 확인
function showLogs(): void {
  logInfo('로그 확인 중... (최근 50줄)')
  try {
    execSync('pm2 logs --lines 50', { stdio: 'inherit' })
  } catch (error) {
    logError(`로그 확인에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 프로세스 삭제
function deleteProcesses(): void {
  logError('경고: 모든 프로세스가 삭제됩니다.')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('계속하시겠습니까? (y/N): ', (answer: string) => {
    if (answer.toLowerCase() === 'y') {
      try {
        execSync('pm2 delete ecosystem.config.cjs', { stdio: 'inherit' })
        logSuccess('모든 프로세스가 삭제되었습니다.')
      } catch (error) {
        logError(`프로세스 삭제에 실패했습니다: ${(error as Error).message}`)
        process.exit(1)
      }
    } else {
      logWarning('작업이 취소되었습니다.')
    }
    rl.close()
  })
}

// 로그 정리
function cleanLogs(): void {
  logInfo('로그 파일 정리 중...')
  const logsDir = path.join(process.cwd(), 'logs')
  
  if (!fs.existsSync(logsDir)) {
    logWarning('로그 디렉토리가 존재하지 않습니다.')
    return
  }
  
  try {
    const files = fs.readdirSync(logsDir)
    const logFiles = files.filter(file => file.endsWith('.log'))
    
    let cleanedCount = 0
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    logFiles.forEach(file => {
      const filePath = path.join(logsDir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.mtime < sevenDaysAgo) {
        fs.unlinkSync(filePath)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      logSuccess(`${cleanedCount}개의 오래된 로그 파일이 정리되었습니다.`)
    } else {
      logInfo('정리할 로그 파일이 없습니다.')
    }
  } catch (error) {
    logError(`로그 정리에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 실시간 모니터링
function startMonitor(): void {
  logInfo('실시간 모니터링 시작 중...')
  try {
    execSync('pm2 monit', { stdio: 'inherit' })
  } catch (error) {
    logError(`모니터링 시작에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 주간 크롤링 실행
function runWeeklyCrawling(): void {
  logInfo('주간 크롤링 실행 중...')
  try {
    execSync('npx ts-node src/backend/scripts/weekly-crawling-cron.ts', { stdio: 'inherit' })
    logSuccess('주간 크롤링이 완료되었습니다.')
  } catch (error) {
    logError(`주간 크롤링 실행에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 크롤링 로그 확인
function showCrawlingLogs(): void {
  logInfo('크롤링 로그 확인 중... (최근 100줄)')
  try {
    execSync('pm2 logs weekly-crawling --lines 100', { stdio: 'inherit' })
  } catch (error) {
    logError(`크롤링 로그 확인에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 크롤링 상태 확인
function showCrawlingStatus(): void {
  logInfo('크롤링 상태 확인 중...')
  try {
    execSync('pm2 show weekly-crawling', { stdio: 'inherit' })
  } catch (error) {
    logError(`크롤링 상태 확인에 실패했습니다: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 도움말 표시
function showHelp(): void {
  log('사용법: node pm2-manager.js [명령어]', 'blue')
  console.log('')
  log('사용 가능한 명령어:', 'blue')
  console.log('  start   - 모든 프로세스 시작')
  console.log('  stop    - 모든 프로세스 중지')
  console.log('  restart - 모든 프로세스 재시작')
  console.log('  status  - 프로세스 상태 확인')
  console.log('  logs    - 로그 확인')
  console.log('  delete  - 모든 프로세스 삭제')
  console.log('  clean   - 로그 파일 정리')
  console.log('  monitor - 실시간 모니터링')
  console.log('')
  log('크롤링 관련 명령어:', 'cyan')
  console.log('  crawl      - 주간 크롤링 수동 실행')
  console.log('  crawl-logs - 크롤링 로그 확인')
  console.log('  crawl-status - 크롤링 상태 확인')
  console.log('')
  log('예시:', 'yellow')
  console.log('  node pm2-manager.js start')
  console.log('  node pm2-manager.js status')
  console.log('  node pm2-manager.js crawl')
}

// 메인 함수
function main(): void {
  // 헤더 출력
  log('========================================', 'blue')
  log('        Deukgeun PM2 Manager          ', 'blue')
  log('========================================', 'blue')
  console.log('')
  
  // PM2 설치 확인
  if (!checkPM2Installation()) {
    logError('PM2가 설치되어 있지 않습니다.')
    logInfo('다음 명령어를 실행해주세요: npm install -g pm2')
    process.exit(1)
  }
  
  const command = process.argv[2] || 'help'
  
  switch (command) {
    case 'start':
      startProcesses()
      break
    case 'stop':
      stopProcesses()
      break
    case 'restart':
      restartProcesses()
      break
    case 'status':
      showStatus()
      break
    case 'logs':
      showLogs()
      break
    case 'delete':
      deleteProcesses()
      break
    case 'clean':
      cleanLogs()
      break
    case 'monitor':
      startMonitor()
      break
    case 'crawl':
      runWeeklyCrawling()
      break
    case 'crawl-logs':
      showCrawlingLogs()
      break
    case 'crawl-status':
      showCrawlingStatus()
      break
    case 'help':
    default:
      showHelp()
      break
  }
  
  console.log('')
  log('작업이 완료되었습니다.', 'blue')
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  startProcesses,
  stopProcesses,
  restartProcesses,
  showStatus,
  showLogs,
  deleteProcesses,
  cleanLogs,
  startMonitor,
  runWeeklyCrawling,
  showCrawlingLogs,
  showCrawlingStatus
}
