#!/usr/bin/env node

/**
 * 서버 시작 및 테스트 자동화 스크립트
 * 
 * 이 스크립트는 다음 작업을 수행합니다:
 * 1. 백엔드 서버 시작
 * 2. 서버가 준비될 때까지 대기
 * 3. API 테스트 실행
 * 4. 테스트 결과 출력
 */

import { spawn, exec } from 'child_process'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 설정
const SERVER_PORT = 3000
const BASE_URL = `http://localhost:${SERVER_PORT}`
const MAX_WAIT_TIME = 30000 // 30초
const CHECK_INTERVAL = 2000 // 2초

// 색상 출력
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

// 서버 상태 확인
async function checkServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    return false
  }
}

// 서버가 준비될 때까지 대기
async function waitForServer() {
  logInfo('서버가 시작될 때까지 대기 중...')
  
  const startTime = Date.now()
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    if (await checkServerHealth()) {
      logSuccess('서버가 준비되었습니다!')
      return true
    }
    
    logInfo('서버 대기 중... (2초 후 재시도)')
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL))
  }
  
  logError('서버 시작 시간 초과')
  return false
}

// 간단한 API 테스트
async function runBasicTests() {
  logInfo('기본 API 테스트 시작...')
  
  const tests = [
    {
      name: '서버 상태 확인',
      url: '/api/health',
      method: 'GET'
    },
    {
      name: '통합 크롤링 상태 조회',
      url: '/api/enhanced-gym/integrated-crawling/status',
      method: 'GET'
    },
    {
      name: '스케줄러 상태 조회',
      url: '/api/enhanced-gym/public-api-scheduler/status',
      method: 'GET'
    }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    try {
      logInfo(`테스트: ${test.name}`)
      
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 10000
      })
      
      if (response.status === 200) {
        logSuccess(`${test.name} 성공`)
        passedTests++
      } else {
        logWarning(`${test.name} 실패 (상태: ${response.status})`)
      }
    } catch (error) {
      logError(`${test.name} 실패: ${error.message}`)
    }
  }
  
  log(`\n📊 테스트 결과: ${passedTests}/${totalTests} 성공`, colors.cyan)
  return passedTests === totalTests
}

// 서버 시작
function startServer() {
  return new Promise((resolve, reject) => {
    logInfo('백엔드 서버 시작 중...')
    
    const serverPath = path.join(__dirname, '..', 'dist', 'backend', 'backend', 'index.cjs')
    const serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..')
    })
    
    let serverReady = false
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log(output)
      
      if (output.includes('서버가 시작되었습니다') || output.includes('Server started')) {
        serverReady = true
        resolve(serverProcess)
      }
    })
    
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString()
      console.error(error)
      
      if (error.includes('EADDRINUSE')) {
        logWarning('포트가 이미 사용 중입니다. 기존 서버를 사용합니다.')
        resolve(null)
      }
    })
    
    serverProcess.on('error', (error) => {
      logError(`서버 시작 실패: ${error.message}`)
      reject(error)
    })
    
    serverProcess.on('exit', (code) => {
      if (!serverReady) {
        logError(`서버가 예상치 못하게 종료되었습니다. (코드: ${code})`)
        reject(new Error(`Server exited with code ${code}`))
      }
    })
    
    // 5초 후에도 서버가 시작되지 않으면 resolve
    setTimeout(() => {
      if (!serverReady) {
        logWarning('서버 시작 확인 시간 초과. 계속 진행합니다.')
        resolve(serverProcess)
      }
    }, 5000)
  })
}

// 메인 실행 함수
async function main() {
  log('🚀 서버 시작 및 테스트 자동화 스크립트', colors.bright)
  log('─'.repeat(60), colors.blue)
  
  let serverProcess = null
  
  try {
    // 1. 서버 시작
    serverProcess = await startServer()
    
    // 2. 서버 준비 대기
    const serverReady = await waitForServer()
    
    if (!serverReady) {
      logError('서버가 준비되지 않았습니다. 테스트를 중단합니다.')
      return
    }
    
    // 3. 기본 테스트 실행
    const testsPassed = await runBasicTests()
    
    if (testsPassed) {
      logSuccess('🎉 모든 기본 테스트가 성공했습니다!')
      logInfo('이제 상세한 테스트를 실행할 수 있습니다:')
      logInfo('  npm run test:crawling-api')
      logInfo('  또는')
      logInfo('  ./scripts/test-crawling-api.sh')
    } else {
      logWarning('일부 테스트가 실패했습니다. 서버 로그를 확인하세요.')
    }
    
  } catch (error) {
    logError(`스크립트 실행 중 오류 발생: ${error.message}`)
  } finally {
    // 서버 프로세스 정리
    if (serverProcess) {
      logInfo('서버 프로세스 정리 중...')
      serverProcess.kill('SIGTERM')
      
      setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL')
        }
      }, 5000)
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`예상치 못한 오류: ${error.message}`)
    process.exit(1)
  })
}

export { startServer, waitForServer, runBasicTests }
