/**
 * 로그 유틸리티 - 디버깅을 위한 상세 로깅
 */

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  category: string
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  log(level: LogEntry['level'], category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    }

    this.logs.push(entry)
    
    // 최대 로그 수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // 콘솔에도 출력
    const logMessage = `[${entry.timestamp}] [${level.toUpperCase()}] [${category}] ${message}`
    if (data) {
      console.log(logMessage, data)
    } else {
      console.log(logMessage)
    }
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data)
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data)
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data)
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category)
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  downloadLogs() {
    const logs = this.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deukgeun-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// 전역 로거 인스턴스
export const logger = new Logger()

// 개발 환경에서만 전역 객체에 추가
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const globalWindow = window as any
  globalWindow.deukgeunLogger = logger
  globalWindow.downloadLogs = () => {
    logger.downloadLogs()
  }
}
