#!/usr/bin/env node

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// 테스트 실행 옵션
const testOptions = {
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
} as const

type TestType = keyof typeof testOptions

interface LogEntry {
  timestamp: string
  level: string
  message: string
  data: any
  duration: number
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
  testSuites: any[]
}

// 로깅 시스템
class TestLogger {
  private logs: LogEntry[] = []
  private startTime: number = Date.now()

  log(level: string, message: string, data: any = null): void {
    const timestamp = new Date().toISOString()
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      data,
      duration: Date.now() - this.startTime,
    }

    this.logs.push(logEntry)

    // 콘솔에 출력
    const color = this.getColor(level)
    console.log(
      `${color}[${level.toUpperCase()}]${this.resetColor} ${timestamp} - ${message}`
    )

    if (data) {
      console.log(JSON.stringify(data, null, 2))
    }
  }

  private getColor(level: string): string {
    const colors: Record<string, string> = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      debug: '\x1b[35m', // Magenta
    }
    return colors[level] || '\x1b[0m'
  }

  private get resetColor(): string {
    return '\x1b[0m'
  }

  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  success(message: string, data?: any): void {
    this.log('success', message, data)
  }

  warning(message: string, data?: any): void {
    this.log('warning', message, data)
  }

  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  // 로그를 파일로 저장
  saveLogs(filename: string = 'test-results.json'): void {
    const logDir = path.join(process.cwd(), 'test-logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const logFile = path.join(logDir, filename)
    fs.writeFileSync(logFile, JSON.stringify(this.logs, null, 2))
    this.info(`로그가 저장되었습니다: ${logFile}`)
  }

  // 테스트 결과 요약 생성
  generateSummary(): TestSummary {
    const summary: TestSummary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: Date.now() - this.startTime,
      testSuites: [],
    }

    // 로그에서 테스트 결과 추출
    this.logs.forEach(log => {
      if (log.message.includes('Test Suite:')) {
        summary.testSuites.push(log.data)
      }
      if (log.message.includes('PASS')) {
        summary.passed++
        summary.totalTests++
      }
      if (log.message.includes('FAIL')) {
        summary.failed++
        summary.totalTests++
      }
      if (log.message.includes('SKIP')) {
        summary.skipped++
        summary.totalTests++
      }
    })

    return summary
  }
}

// 테스트 실행기
class TestRunner {
  private logger: TestLogger
  private results: Record<string, TestResult | null> = {
    unit: null,
    integration: null,
    e2e: null,
  }

  constructor() {
    this.logger = new TestLogger()
  }

  async runTest(type: TestType): Promise<boolean> {
    const option = testOptions[type]
    if (!option) {
      this.logger.error(`알 수 없는 테스트 타입: ${type}`)
      return false
    }

    this.logger.info(`테스트 시작: ${option.description}`)

    try {
      const command = `npx vitest run --reporter=${option.reporter} --pattern="${option.pattern}"`
      this.logger.debug(`실행 명령어: ${command}`)

      const startTime = Date.now()
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
      })
      const duration = Date.now() - startTime

      this.logger.success(`${option.description} 완료 (${duration}ms)`)
      this.logger.debug('테스트 출력:', output)

      this.results[type] = {
        success: true,
        duration,
        output,
      }

      return true
    } catch (error) {
      this.logger.error(`${option.description} 실패:`, (error as Error).message)
      this.results[type] = {
        success: false,
        error: (error as Error).message,
        output: (error as any).stdout || (error as any).stderr,
      }
      return false
    }
  }

  async runAllTests(): Promise<boolean> {
    this.logger.info('전체 테스트 실행 시작')

    const testTypes: TestType[] = ['unit', 'integration', 'e2e']
    const results: { type: TestType; success: boolean }[] = []

    for (const type of testTypes) {
      const success = await this.runTest(type)
      results.push({ type, success })
    }

    const allPassed = results.every(r => r.success)

    if (allPassed) {
      this.logger.success('모든 테스트가 성공적으로 완료되었습니다!')
    } else {
      this.logger.error('일부 테스트가 실패했습니다.')
    }

    return allPassed
  }

  async runCoverage(): Promise<boolean> {
    this.logger.info('코드 커버리지 테스트 실행')

    try {
      const command = 'npx vitest run --coverage'
      const output = execSync(command, { encoding: 'utf8' })

      this.logger.success('코드 커버리지 테스트 완료')
      this.logger.debug('커버리지 결과:', output)

      return true
    } catch (error) {
      this.logger.error('코드 커버리지 테스트 실패:', (error as Error).message)
      return false
    }
  }

  generateReport(): TestSummary {
    const summary = this.logger.generateSummary()

    this.logger.info('테스트 결과 요약:', summary)

    // HTML 리포트 생성
    this.generateHTMLReport(summary)

    // JSON 리포트 저장
    this.logger.saveLogs('test-results.json')

    return summary
  }

  private generateHTMLReport(summary: TestSummary): void {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>테스트 결과 리포트</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; }
        .card.success { border-color: #28a745; background: #d4edda; }
        .card.error { border-color: #dc3545; background: #f8d7da; }
        .card.warning { border-color: #ffc107; background: #fff3cd; }
        .number { font-size: 2em; font-weight: bold; }
        .label { color: #666; margin-top: 10px; }
        .details { margin-top: 20px; }
        .test-suite { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 10px 0; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 테스트 결과 리포트</h1>
        <p class="timestamp">생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
    </div>
    
    <div class="summary">
        <div class="card ${summary.failed > 0 ? 'error' : 'success'}">
            <div class="number">${summary.totalTests}</div>
            <div class="label">총 테스트</div>
        </div>
        <div class="card success">
            <div class="number">${summary.passed}</div>
            <div class="label">성공</div>
        </div>
        <div class="card error">
            <div class="number">${summary.failed}</div>
            <div class="label">실패</div>
        </div>
        <div class="card warning">
            <div class="number">${summary.skipped}</div>
            <div class="label">건너뜀</div>
        </div>
    </div>
    
    <div class="details">
        <h2>테스트 세부 정보</h2>
        <p><strong>실행 시간:</strong> ${summary.duration}ms</p>
        <p><strong>성공률:</strong> ${((summary.passed / summary.totalTests) * 100).toFixed(1)}%</p>
        
        ${summary.testSuites
          .map(
            (suite: any) => `
            <div class="test-suite">
                <h3>${suite.name}</h3>
                <p><strong>상태:</strong> ${suite.status}</p>
                <p><strong>실행 시간:</strong> ${suite.duration}ms</p>
                ${
                  suite.tests
                    ? `
                    <ul>
                        ${suite.tests.map((test: any) => `<li>${test.name}: ${test.status}</li>`).join('')}
                    </ul>
                `
                    : ''
                }
            </div>
        `
          )
          .join('')}
    </div>
</body>
</html>
    `

    const reportDir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportFile = path.join(reportDir, 'test-report.html')
    fs.writeFileSync(reportFile, html)

    this.logger.info(`HTML 리포트가 생성되었습니다: ${reportFile}`)
  }
}

// CLI 인터페이스
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0] || 'all'

  const runner = new TestRunner()

  try {
    switch (command) {
      case 'unit':
        await runner.runTest('unit')
        break
      case 'integration':
        await runner.runTest('integration')
        break
      case 'e2e':
        await runner.runTest('e2e')
        break
      case 'coverage':
        await runner.runCoverage()
        break
      case 'all':
        await runner.runAllTests()
        break
      default:
        console.log(
          '사용법: node test-runner.js [unit|integration|e2e|coverage|all]'
        )
        process.exit(1)
    }

    runner.generateReport()
  } catch (error) {
    console.error('테스트 실행 중 오류 발생:', (error as Error).message)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { TestRunner, TestLogger }
