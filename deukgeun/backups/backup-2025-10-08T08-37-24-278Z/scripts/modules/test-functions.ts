/**
 * 함수형 테스트 관리 모듈
 * 테스트 실행 및 관리를 위한 공통 기능
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'

interface TestConfig {
  projectRoot: string
  testDir: string
  coverageDir: string
  reportDir: string
  timeout: number
  verbose: boolean
}

interface TestOptions {
  unit: {
    pattern: string
    description: string
    reporter: string
  }
  integration: {
    pattern: string
    description: string
    reporter: string
  }
  e2e: {
    pattern: string
    description: string
    reporter: string
  }
  all: {
    pattern: string
    description: string
    reporter: string
  }
}

interface TestResult {
  success: boolean
  duration?: number
  error?: string
  output?: string
}

interface TestSummary {
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  coverage?: number
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  data: any
  duration: number
}

/**
 * 테스트 옵션 초기화
 */
export function initializeTestOptions(): TestOptions {
  return {
    unit: {
      pattern: 'src/frontend/**/*.test.{ts,tsx}',
      description: 'Unit Tests',
      reporter: 'verbose',
    },
    integration: {
      pattern: 'src/frontend/**/*.integration.test.{ts,tsx}',
      description: 'Integration Tests',
      reporter: 'verbose',
    },
    e2e: {
      pattern: 'src/frontend/**/*.e2e.test.{ts,tsx}',
      description: 'E2E Tests',
      reporter: 'verbose',
    },
    all: {
      pattern: 'src/frontend/**/*.test.{ts,tsx}',
      description: 'All Tests',
      reporter: 'verbose',
    },
  }
}

/**
 * 테스트 파일 스캔
 */
export function scanTestFiles(projectRoot: string, pattern: string): string[] {
  try {
    const testDir = path.join(projectRoot, 'src', 'frontend')
    if (!fs.existsSync(testDir)) {
      return []
    }

    const files: string[] = []
    const scanDirectory = (dir: string): void => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath)
        } else if (stat.isFile() && item.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
          files.push(fullPath)
        }
      }
    }

    scanDirectory(testDir)
    return files
  } catch (error) {
    logError(`테스트 파일 스캔 실패: ${(error as Error).message}`)
    return []
  }
}

/**
 * 단위 테스트 실행
 */
export function runUnitTests(config: TestConfig): TestResult {
  try {
    logStep('UNIT', '단위 테스트 실행 중...')
    
    const startTime = Date.now()
    const testFiles = scanTestFiles(config.projectRoot, '**/*.test.{ts,tsx}')
    
    if (testFiles.length === 0) {
      logWarning('실행할 단위 테스트가 없습니다.')
      return {
        success: true,
        duration: 0,
        output: 'No unit tests found'
      }
    }

    const command = `npx vitest run ${testFiles.join(' ')} --reporter=verbose --coverage`
    
    execSync(command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess(`단위 테스트 완료 (${duration}ms)`)

    return {
      success: true,
      duration,
      output: 'Unit tests completed successfully'
    }

  } catch (error) {
    const duration = Date.now() - Date.now()
    return {
      success: false,
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 통합 테스트 실행
 */
export function runIntegrationTests(config: TestConfig): TestResult {
  try {
    logStep('INTEGRATION', '통합 테스트 실행 중...')
    
    const startTime = Date.now()
    const testFiles = scanTestFiles(config.projectRoot, '**/*.integration.test.{ts,tsx}')
    
    if (testFiles.length === 0) {
      logWarning('실행할 통합 테스트가 없습니다.')
      return {
        success: true,
        duration: 0,
        output: 'No integration tests found'
      }
    }

    const command = `npx vitest run ${testFiles.join(' ')} --reporter=verbose`
    
    execSync(command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess(`통합 테스트 완료 (${duration}ms)`)

    return {
      success: true,
      duration,
      output: 'Integration tests completed successfully'
    }

  } catch (error) {
    const duration = Date.now() - Date.now()
    return {
      success: false,
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * E2E 테스트 실행
 */
export function runE2ETests(config: TestConfig): TestResult {
  try {
    logStep('E2E', 'E2E 테스트 실행 중...')
    
    const startTime = Date.now()
    const testFiles = scanTestFiles(config.projectRoot, '**/*.e2e.test.{ts,tsx}')
    
    if (testFiles.length === 0) {
      logWarning('실행할 E2E 테스트가 없습니다.')
      return {
        success: true,
        duration: 0,
        output: 'No E2E tests found'
      }
    }

    const command = `npx vitest run ${testFiles.join(' ')} --reporter=verbose`
    
    execSync(command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess(`E2E 테스트 완료 (${duration}ms)`)

    return {
      success: true,
      duration,
      output: 'E2E tests completed successfully'
    }

  } catch (error) {
    const duration = Date.now() - Date.now()
    return {
      success: false,
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 모든 테스트 실행
 */
export function runAllTests(config: TestConfig): TestResult {
  try {
    logStep('ALL', '모든 테스트 실행 중...')
    
    const startTime = Date.now()
    const testFiles = scanTestFiles(config.projectRoot, '**/*.test.{ts,tsx}')
    
    if (testFiles.length === 0) {
      logWarning('실행할 테스트가 없습니다.')
      return {
        success: true,
        duration: 0,
        output: 'No tests found'
      }
    }

    const command = `npx vitest run --reporter=verbose --coverage`
    
    execSync(command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess(`모든 테스트 완료 (${duration}ms)`)

    return {
      success: true,
      duration,
      output: 'All tests completed successfully'
    }

  } catch (error) {
    const duration = Date.now() - Date.now()
    return {
      success: false,
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 테스트 감시 모드 실행
 */
export function runTestWatch(config: TestConfig): TestResult {
  try {
    logStep('WATCH', '테스트 감시 모드 시작 중...')
    
    const startTime = Date.now()
    const command = `npx vitest --reporter=verbose --coverage`
    
    execSync(command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess(`테스트 감시 모드 완료 (${duration}ms)`)

    return {
      success: true,
      duration,
      output: 'Test watch mode completed successfully'
    }

  } catch (error) {
    const duration = Date.now() - Date.now()
    return {
      success: false,
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 테스트 커버리지 생성
 */
export function generateTestCoverage(config: TestConfig): TestResult {
  try {
    logStep('COVERAGE', '테스트 커버리지 생성 중...')
    
    const startTime = Date.now()
    const command = `npx vitest run --coverage --reporter=verbose`
    
    execSync(command, {
      stdio: 'inherit',
      timeout: config.timeout,
      cwd: config.projectRoot
    })

    const duration = Date.now() - startTime
    logSuccess(`테스트 커버리지 생성 완료 (${duration}ms)`)

    return {
      success: true,
      duration,
      output: 'Test coverage generated successfully'
    }

  } catch (error) {
    const duration = Date.now() - Date.now()
    return {
      success: false,
      duration,
      error: (error as Error).message
    }
  }
}

/**
 * 테스트 설정 파일 생성
 */
export function createTestConfig(projectRoot: string): boolean {
  try {
    const configPath = path.join(projectRoot, 'vitest.config.ts')
    
    if (fs.existsSync(configPath)) {
      logInfo(`테스트 설정 파일이 이미 존재합니다: ${configPath}`)
      return true
    }

    const configContent = `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  }
})`

    fs.writeFileSync(configPath, configContent)
    logSuccess(`테스트 설정 파일이 생성되었습니다: ${configPath}`)
    return true

  } catch (error) {
    logError(`테스트 설정 파일 생성 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 테스트 설정 파일 생성
 */
export function createTestSetup(projectRoot: string): boolean {
  try {
    const setupDir = path.join(projectRoot, 'src', 'test-utils')
    const setupPath = path.join(setupDir, 'setup.ts')
    
    if (!fs.existsSync(setupDir)) {
      fs.mkdirSync(setupDir, { recursive: true })
    }
    
    if (fs.existsSync(setupPath)) {
      logInfo(`테스트 설정 파일이 이미 존재합니다: ${setupPath}`)
      return true
    }

    const setupContent = `import '@testing-library/jest-dom'

// Mock 환경 변수
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}`

    fs.writeFileSync(setupPath, setupContent)
    logSuccess(`테스트 설정 파일이 생성되었습니다: ${setupPath}`)
    return true

  } catch (error) {
    logError(`테스트 설정 파일 생성 실패: ${(error as Error).message}`)
    return false
  }
}

/**
 * 테스트 결과 요약 출력
 */
export function printTestSummary(results: TestResult[]): void {
  logInfo('\n📊 테스트 결과 요약:')
  
  const totalTests = results.length
  const passedTests = results.filter(r => r.success).length
  const failedTests = results.filter(r => !r.success).length
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0)

  logInfo(`- 총 테스트: ${totalTests}개`)
  logInfo(`- 성공: ${passedTests}개`)
  logInfo(`- 실패: ${failedTests}개`)
  logInfo(`- 총 소요시간: ${totalDuration}ms`)

  if (failedTests > 0) {
    logWarning('\n실패한 테스트:')
    results.filter(r => !r.success).forEach((result, index) => {
      logError(`${index + 1}. ${result.error}`)
    })
  }
}

/**
 * 테스트 로그 생성
 */
export function createTestLog(projectRoot: string, results: TestResult[]): void {
  try {
    const logDir = path.join(projectRoot, 'test-logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const logPath = path.join(logDir, `test-${timestamp}.log`)
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Test execution completed',
      data: results,
      duration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    }

    fs.writeFileSync(logPath, JSON.stringify(logEntry, null, 2))
    logInfo(`테스트 로그가 저장되었습니다: ${logPath}`)
  } catch (error) {
    logWarning(`테스트 로그 생성 실패: ${(error as Error).message}`)
  }
}
