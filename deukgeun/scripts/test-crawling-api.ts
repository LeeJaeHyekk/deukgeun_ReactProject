#!/usr/bin/env ts-node

/**
 * 통합 크롤링 API 테스트 스크립트
 * 
 * 이 스크립트는 다음 기능들을 테스트합니다:
 * 1. 서버 상태 확인
 * 2. 통합 크롤링 상태 조회
 * 3. 특정 헬스장 크롤링 테스트
 * 4. 데이터 검증 테스트
 * 5. 통합 크롤링 실행 테스트
 * 6. 스케줄러 제어 테스트
 */

import axios, { AxiosResponse } from 'axios'
import { config } from '../src/backend/config/env'

// 테스트 설정
const BASE_URL = `http://localhost:${config.port || 3000}`
const TEST_TIMEOUT = 30000 // 30초

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

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green)
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logTest(message: string) {
  log(`🧪 ${message}`, colors.cyan)
}

// HTTP 요청 헬퍼
async function makeRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  timeout: number = TEST_TIMEOUT
): Promise<AxiosResponse<T>> {
  const url = `${BASE_URL}${endpoint}`
  
  try {
    const response = await axios({
      method,
      url,
      data,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CrawlingTestScript/1.0'
      }
    })
    
    return response
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요. (${url})`)
    }
    throw error
  }
}

// 테스트 결과 인터페이스
interface TestResult {
  name: string
  success: boolean
  duration: number
  error?: string
  data?: any
}

class CrawlingApiTester {
  private results: TestResult[] = []
  private startTime: number = 0

  async runAllTests(): Promise<void> {
    log('🚀 통합 크롤링 API 테스트 시작', colors.bright)
    log(`📍 테스트 대상: ${BASE_URL}`, colors.blue)
    log('─'.repeat(60), colors.blue)

    try {
      // 1. 서버 상태 확인
      await this.testServerHealth()
      
      // 2. 통합 크롤링 상태 조회
      await this.testIntegratedCrawlingStatus()
      
      // 3. 특정 헬스장 크롤링 테스트
      await this.testCrawlBypass()
      
      // 4. 데이터 검증 테스트
      await this.testTypeGuardValidation()
      
      // 5. 통합 크롤링 실행 테스트 (선택적)
      await this.testIntegratedCrawlingExecution()
      
      // 6. 스케줄러 제어 테스트
      await this.testSchedulerControl()
      
    } catch (error: any) {
      logError(`테스트 실행 중 오류 발생: ${error.message}`)
    }

    // 테스트 결과 요약
    this.printTestSummary()
  }

  private async testServerHealth(): Promise<void> {
    const testName = '서버 상태 확인'
    this.startTest(testName)

    try {
      const response = await makeRequest('GET', '/api/health')
      
      if (response.status === 200) {
        this.endTest(testName, true, response.data)
        logSuccess(`서버가 정상적으로 실행 중입니다. (상태: ${response.status})`)
      } else {
        this.endTest(testName, false, undefined, `예상치 못한 상태 코드: ${response.status}`)
        logError(`서버 상태가 비정상입니다. (상태: ${response.status})`)
      }
    } catch (error: any) {
      this.endTest(testName, false, undefined, error.message)
      logError(`서버 상태 확인 실패: ${error.message}`)
    }
  }

  private async testIntegratedCrawlingStatus(): Promise<void> {
    const testName = '통합 크롤링 상태 조회'
    this.startTest(testName)

    try {
      const response = await makeRequest('GET', '/api/enhanced-gym/integrated-crawling/status')
      
      if (response.status === 200) {
        this.endTest(testName, true, response.data)
        logSuccess('통합 크롤링 상태 조회 성공')
        logInfo(`상태 데이터: ${JSON.stringify(response.data, null, 2)}`)
      } else {
        this.endTest(testName, false, undefined, `예상치 못한 상태 코드: ${response.status}`)
        logError(`통합 크롤링 상태 조회 실패 (상태: ${response.status})`)
      }
    } catch (error: any) {
      this.endTest(testName, false, undefined, error.message)
      logError(`통합 크롤링 상태 조회 실패: ${error.message}`)
    }
  }

  private async testCrawlBypass(): Promise<void> {
    const testName = '특정 헬스장 크롤링 테스트'
    this.startTest(testName)

    try {
      // 테스트용 헬스장 이름들
      const testGymNames = ['스포츠몬스터', '헬스장', '피트니스']
      
      for (const gymName of testGymNames) {
        logTest(`헬스장 크롤링 테스트: "${gymName}"`)
        
        const response = await makeRequest('GET', `/api/enhanced-gym/crawl-bypass/${encodeURIComponent(gymName)}`)
        
        if (response.status === 200) {
          logSuccess(`"${gymName}" 크롤링 성공`)
          logInfo(`크롤링 결과: ${JSON.stringify(response.data, null, 2)}`)
        } else {
          logWarning(`"${gymName}" 크롤링 실패 (상태: ${response.status})`)
        }
        
        // 요청 간 간격 (Rate limit 방지)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      this.endTest(testName, true)
    } catch (error: any) {
      this.endTest(testName, false, undefined, error.message)
      logError(`크롤링 테스트 실패: ${error.message}`)
    }
  }

  private async testTypeGuardValidation(): Promise<void> {
    const testName = '데이터 검증 테스트'
    this.startTest(testName)

    try {
      // 테스트용 데이터
      const testData = {
        publicApiData: {
          id: 'test-001',
          name: '테스트 헬스장',
          address: '서울시 강남구 테스트로 123',
          phone: '02-1234-5678',
          latitude: 37.5665,
          longitude: 126.9780,
          source: 'kakao_local_api'
        },
        crawlingData: {
          name: '테스트 헬스장',
          address: '서울시 강남구 테스트로 123',
          phone: '02-1234-5678',
          latitude: '37.5665',
          longitude: '126.9780',
          source: 'naver_place'
        }
      }

      const response = await makeRequest('POST', '/api/enhanced-gym/validate-type-guard', testData)
      
      if (response.status === 200) {
        this.endTest(testName, true, response.data)
        logSuccess('데이터 검증 테스트 성공')
        logInfo(`검증 결과: ${JSON.stringify(response.data, null, 2)}`)
      } else {
        this.endTest(testName, false, undefined, `예상치 못한 상태 코드: ${response.status}`)
        logError(`데이터 검증 테스트 실패 (상태: ${response.status})`)
      }
    } catch (error: any) {
      this.endTest(testName, false, undefined, error.message)
      logError(`데이터 검증 테스트 실패: ${error.message}`)
    }
  }

  private async testIntegratedCrawlingExecution(): Promise<void> {
    const testName = '통합 크롤링 실행 테스트'
    this.startTest(testName)

    try {
      logWarning('통합 크롤링 실행은 시간이 오래 걸릴 수 있습니다...')
      
      const response = await makeRequest('POST', '/api/enhanced-gym/integrated-crawling', {
        testMode: true,
        maxGyms: 5 // 테스트용으로 제한
      }, 60000) // 60초 타임아웃
      
      if (response.status === 200) {
        this.endTest(testName, true, response.data)
        logSuccess('통합 크롤링 실행 테스트 성공')
        logInfo(`실행 결과: ${JSON.stringify(response.data, null, 2)}`)
      } else {
        this.endTest(testName, false, undefined, `예상치 못한 상태 코드: ${response.status}`)
        logError(`통합 크롤링 실행 테스트 실패 (상태: ${response.status})`)
      }
    } catch (error: any) {
      this.endTest(testName, false, undefined, error.message)
      logError(`통합 크롤링 실행 테스트 실패: ${error.message}`)
    }
  }

  private async testSchedulerControl(): Promise<void> {
    const testName = '스케줄러 제어 테스트'
    this.startTest(testName)

    try {
      // 스케줄러 상태 조회
      const statusResponse = await makeRequest('GET', '/api/enhanced-gym/public-api-scheduler/status')
      
      if (statusResponse.status === 200) {
        logSuccess('스케줄러 상태 조회 성공')
        logInfo(`스케줄러 상태: ${JSON.stringify(statusResponse.data, null, 2)}`)
      }

      // 스케줄러 제어 (시작)
      const controlResponse = await makeRequest('POST', '/api/enhanced-gym/public-api-scheduler/control', {
        action: 'start'
      })
      
      if (controlResponse.status === 200) {
        this.endTest(testName, true, controlResponse.data)
        logSuccess('스케줄러 제어 테스트 성공')
        logInfo(`제어 결과: ${JSON.stringify(controlResponse.data, null, 2)}`)
      } else {
        this.endTest(testName, false, undefined, `예상치 못한 상태 코드: ${controlResponse.status}`)
        logError(`스케줄러 제어 테스트 실패 (상태: ${controlResponse.status})`)
      }
    } catch (error: any) {
      this.endTest(testName, false, undefined, error.message)
      logError(`스케줄러 제어 테스트 실패: ${error.message}`)
    }
  }

  private startTest(testName: string): void {
    this.startTime = Date.now()
    logTest(`테스트 시작: ${testName}`)
  }

  private endTest(testName: string, success: boolean, data?: any, error?: string): void {
    const duration = Date.now() - this.startTime
    this.results.push({
      name: testName,
      success,
      duration,
      error,
      data
    })
    
    if (success) {
      logSuccess(`테스트 완료: ${testName} (${duration}ms)`)
    } else {
      logError(`테스트 실패: ${testName} (${duration}ms) - ${error}`)
    }
  }

  private printTestSummary(): void {
    log('─'.repeat(60), colors.blue)
    log('📊 테스트 결과 요약', colors.bright)
    log('─'.repeat(60), colors.blue)

    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    log(`총 테스트: ${totalTests}개`, colors.cyan)
    logSuccess(`성공: ${passedTests}개`)
    if (failedTests > 0) {
      logError(`실패: ${failedTests}개`)
    }
    logInfo(`총 소요 시간: ${totalDuration}ms`)

    if (failedTests > 0) {
      log('\n❌ 실패한 테스트들:', colors.red)
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          log(`  - ${r.name}: ${r.error}`, colors.red)
        })
    }

    log('\n🎯 테스트 완료!', colors.bright)
  }
}

// 메인 실행 함수
async function main() {
  const tester = new CrawlingApiTester()
  
  try {
    await tester.runAllTests()
  } catch (error: any) {
    logError(`테스트 실행 중 치명적 오류: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  main().catch(error => {
    logError(`예상치 못한 오류: ${error.message}`)
    process.exit(1)
  })
}

export { CrawlingApiTester }
