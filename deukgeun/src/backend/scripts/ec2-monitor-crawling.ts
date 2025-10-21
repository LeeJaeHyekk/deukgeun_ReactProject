/**
 * EC2 환경용 크롤링 모니터링 스크립트
 * 주간 크롤링의 상태를 모니터링하고 문제 발생 시 알림
 */

import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

interface CrawlingStatus {
  isRunning: boolean
  lastRun: Date | null
  nextRun: Date | null
  successCount: number
  errorCount: number
  totalProcessed: number
  lastError: string | null
  healthScore: number
}

interface SystemHealth {
  memoryUsage: number
  diskUsage: number
  cpuUsage: number
  uptime: number
  processCount: number
}

class CrawlingMonitor {
  private readonly logFile: string
  private readonly gymsRawFile: string
  private readonly maxLogSize: number = 10 * 1024 * 1024 // 10MB

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'weekly-crawling.log')
    this.gymsRawFile = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json')
  }

  async checkCrawlingStatus(): Promise<CrawlingStatus> {
    const status: CrawlingStatus = {
      isRunning: false,
      lastRun: null,
      nextRun: null,
      successCount: 0,
      errorCount: 0,
      totalProcessed: 0,
      lastError: null,
      healthScore: 0
    }

    try {
      // PM2 프로세스 상태 확인
      const { execSync } = require('child_process')
      const pm2Status = execSync('pm2 jlist', { encoding: 'utf-8' })
      const processes = JSON.parse(pm2Status)
      
      const crawlingProcess = processes.find((p: any) => p.name === 'weekly-crawling')
      if (crawlingProcess) {
        status.isRunning = crawlingProcess.pm2_env.status === 'online'
      }

      // 로그 파일 분석
      if (fs.existsSync(this.logFile)) {
        const logContent = await this.readLastLines(this.logFile, 100)
        const analysis = this.analyzeLogContent(logContent)
        
        status.successCount = analysis.successCount
        status.errorCount = analysis.errorCount
        status.totalProcessed = analysis.totalProcessed
        status.lastError = analysis.lastError
        status.lastRun = analysis.lastRun
        status.healthScore = this.calculateHealthScore(analysis)
      }

      // 다음 실행 시간 계산 (매주 일요일 새벽 2시)
      status.nextRun = this.calculateNextRun()

    } catch (error) {
      console.error('상태 확인 실패:', error)
    }

    return status
  }

  async checkSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      memoryUsage: 0,
      diskUsage: 0,
      cpuUsage: 0,
      uptime: 0,
      processCount: 0
    }

    try {
      // 메모리 사용량
      const memInfo = await this.readFileContent('/proc/meminfo')
      const memTotal = this.extractNumber(memInfo, 'MemTotal:')
      const memAvailable = this.extractNumber(memInfo, 'MemAvailable:')
      health.memoryUsage = ((memTotal - memAvailable) / memTotal) * 100

      // 디스크 사용량
      const { execSync } = require('child_process')
      const dfOutput = execSync('df -h /', { encoding: 'utf-8' })
      const diskMatch = dfOutput.match(/(\d+)%/)
      if (diskMatch) {
        health.diskUsage = parseInt(diskMatch[1])
      }

      // CPU 사용량 (간단한 추정)
      const loadAvg = require('os').loadavg()[0]
      health.cpuUsage = Math.min(loadAvg * 100, 100)

      // 시스템 업타임
      health.uptime = require('os').uptime()

      // 프로세스 수
      const psOutput = execSync('ps aux | wc -l', { encoding: 'utf-8' })
      health.processCount = parseInt(psOutput.trim()) - 1

    } catch (error) {
      console.error('시스템 상태 확인 실패:', error)
    }

    return health
  }

  async checkGymsRawFile(): Promise<{
    exists: boolean
    size: number
    lastModified: Date | null
    recordCount: number
    isValid: boolean
  }> {
    const result = {
      exists: false,
      size: 0,
      lastModified: null as Date | null,
      recordCount: 0,
      isValid: false
    }

    try {
      if (fs.existsSync(this.gymsRawFile)) {
        result.exists = true
        
        const stats = await stat(this.gymsRawFile)
        result.size = stats.size
        result.lastModified = stats.mtime

        const content = await readFile(this.gymsRawFile, 'utf-8')
        const data = JSON.parse(content)
        
        if (Array.isArray(data)) {
          result.recordCount = data.length
          result.isValid = true
        }
      }
    } catch (error) {
      console.error('gyms_raw.json 확인 실패:', error)
    }

    return result
  }

  async generateReport(): Promise<string> {
    const status = await this.checkCrawlingStatus()
    const health = await this.checkSystemHealth()
    const fileInfo = await this.checkGymsRawFile()

    const report = `
========================================
📊 EC2 크롤링 모니터링 리포트
========================================
📅 생성 시간: ${new Date().toISOString()}

🔄 크롤링 상태:
  - 실행 중: ${status.isRunning ? '✅ 예' : '❌ 아니오'}
  - 마지막 실행: ${status.lastRun ? status.lastRun.toISOString() : '알 수 없음'}
  - 다음 실행: ${status.nextRun ? status.nextRun.toISOString() : '알 수 없음'}
  - 성공 횟수: ${status.successCount}
  - 오류 횟수: ${status.errorCount}
  - 총 처리: ${status.totalProcessed}개
  - 건강 점수: ${status.healthScore}/100
  ${status.lastError ? `- 마지막 오류: ${status.lastError}` : ''}

💻 시스템 상태:
  - 메모리 사용률: ${health.memoryUsage.toFixed(1)}%
  - 디스크 사용률: ${health.diskUsage}%
  - CPU 사용률: ${health.cpuUsage.toFixed(1)}%
  - 시스템 업타임: ${Math.floor(health.uptime / 3600)}시간
  - 실행 중인 프로세스: ${health.processCount}개

📁 gyms_raw.json 상태:
  - 파일 존재: ${fileInfo.exists ? '✅ 예' : '❌ 아니오'}
  - 파일 크기: ${(fileInfo.size / 1024).toFixed(1)}KB
  - 마지막 수정: ${fileInfo.lastModified ? fileInfo.lastModified.toISOString() : '알 수 없음'}
  - 레코드 수: ${fileInfo.recordCount}개
  - 유효성: ${fileInfo.isValid ? '✅ 유효' : '❌ 무효'}

========================================
`

    return report
  }

  async saveReport(): Promise<void> {
    const report = await this.generateReport()
    const reportFile = path.join(process.cwd(), 'logs', 'crawling-monitor-report.txt')
    
    try {
      await fs.promises.writeFile(reportFile, report, 'utf-8')
      console.log(`📄 모니터링 리포트 저장: ${reportFile}`)
    } catch (error) {
      console.error('리포트 저장 실패:', error)
    }
  }

  private async readLastLines(filePath: string, lines: number): Promise<string> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const allLines = content.split('\n')
      return allLines.slice(-lines).join('\n')
    } catch (error) {
      return ''
    }
  }

  private analyzeLogContent(content: string): {
    successCount: number
    errorCount: number
    totalProcessed: number
    lastError: string | null
    lastRun: Date | null
  } {
    const lines = content.split('\n')
    let successCount = 0
    let errorCount = 0
    let totalProcessed = 0
    let lastError: string | null = null
    let lastRun: Date | null = null

    for (const line of lines) {
      if (line.includes('✅') && line.includes('완료')) {
        successCount++
      }
      if (line.includes('❌') || line.includes('ERROR')) {
        errorCount++
        if (line.includes('오류:') || line.includes('실패:')) {
          lastError = line.trim()
        }
      }
      if (line.includes('총 처리된 헬스장:')) {
        const match = line.match(/(\d+)개/)
        if (match) {
          totalProcessed = parseInt(match[1])
        }
      }
      if (line.includes('실행 시간:')) {
        const match = line.match(/실행 시간: (.+)/)
        if (match) {
          lastRun = new Date(match[1])
        }
      }
    }

    return { successCount, errorCount, totalProcessed, lastError, lastRun }
  }

  private calculateHealthScore(analysis: any): number {
    let score = 100

    // 오류가 많으면 점수 감소
    if (analysis.errorCount > 0) {
      score -= analysis.errorCount * 10
    }

    // 성공률이 낮으면 점수 감소
    const total = analysis.successCount + analysis.errorCount
    if (total > 0) {
      const successRate = analysis.successCount / total
      if (successRate < 0.8) {
        score -= (0.8 - successRate) * 50
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  private calculateNextRun(): Date {
    const now = new Date()
    const nextSunday = new Date(now)
    
    // 다음 일요일 찾기
    const daysUntilSunday = (7 - now.getDay()) % 7
    if (daysUntilSunday === 0) {
      // 오늘이 일요일이면 다음 주 일요일
      nextSunday.setDate(now.getDate() + 7)
    } else {
      nextSunday.setDate(now.getDate() + daysUntilSunday)
    }
    
    // 새벽 2시로 설정
    nextSunday.setHours(2, 0, 0, 0)
    
    return nextSunday
  }

  private async readFileContent(filePath: string): Promise<string> {
    try {
      return await readFile(filePath, 'utf-8')
    } catch (error) {
      return ''
    }
  }

  private extractNumber(content: string, pattern: string): number {
    const match = content.match(new RegExp(pattern + '\\s+(\\d+)'))
    return match ? parseInt(match[1]) : 0
  }
}

// 메인 실행 함수
async function main(): Promise<void> {
  console.log('🔍 EC2 크롤링 모니터링 시작...')
  
  const monitor = new CrawlingMonitor()
  
  try {
    // 리포트 생성 및 출력
    const report = await monitor.generateReport()
    console.log(report)
    
    // 리포트 저장
    await monitor.saveReport()
    
    console.log('✅ 모니터링 완료')
    
  } catch (error) {
    console.error('❌ 모니터링 실패:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 모니터링 스크립트 실행 실패:', error)
    process.exit(1)
  })
}

export { CrawlingMonitor }
