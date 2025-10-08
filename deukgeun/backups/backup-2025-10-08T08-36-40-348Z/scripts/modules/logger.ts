/**
 * 통합 로깅 모듈
 * 모든 빌드 스크립트에서 사용하는 공통 로깅 시스템
 */

// 색상 정의
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
} as const

type ColorKey = keyof typeof colors

interface LoggerOptions {
  prefix?: string
  timestamp?: boolean
  level?: 'debug' | 'info' | 'warn' | 'error'
}

interface TableOptions {
  headers?: string[]
  maxWidth?: number
}

/**
 * 로거 클래스
 */
export class Logger {
  private prefix: string
  private timestamp: boolean
  private level: string
  private colors: typeof colors

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || ''
    this.timestamp = options.timestamp || false
    this.level = options.level || 'info'
    this.colors = { ...colors }
  }

  /**
   * 기본 로그 출력
   */
  log(message: string, color: ColorKey = 'reset'): void {
    const timestamp = this.timestamp ? `[${new Date().toISOString()}] ` : ''
    const prefix = this.prefix ? `[${this.prefix}] ` : ''
    console.log(`${this.colors[color]}${timestamp}${prefix}${message}${this.colors.reset}`)
  }

  /**
   * 단계별 로그
   */
  step(step: string, message: string): void {
    this.log(`[${step}] ${message}`, 'cyan')
  }

  /**
   * 성공 로그
   */
  success(message: string): void {
    this.log(`✅ ${message}`, 'green')
  }

  /**
   * 에러 로그
   */
  error(message: string): void {
    this.log(`❌ ${message}`, 'red')
  }

  /**
   * 경고 로그
   */
  warning(message: string): void {
    this.log(`⚠️  ${message}`, 'yellow')
  }

  /**
   * 정보 로그
   */
  info(message: string): void {
    this.log(`ℹ️  ${message}`, 'blue')
  }

  /**
   * 디버그 로그
   */
  debug(message: string): void {
    if (this.level === 'debug') {
      this.log(`🐛 ${message}`, 'gray')
    }
  }

  /**
   * 진행률 표시
   */
  progress(current: number, total: number, message: string = ''): void {
    const percentage = Math.round((current / total) * 100)
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
    this.log(`[${bar}] ${percentage}% ${message}`, 'cyan')
  }

  /**
   * 구분선
   */
  separator(char: string = '=', length: number = 60, color: ColorKey = 'cyan'): void {
    this.log(char.repeat(length), color)
  }

  /**
   * 테이블 형태 로그
   */
  table(data: any[], options: TableOptions = {}): void {
    const { headers = [], maxWidth = 80 } = options
    
    if (headers.length > 0) {
      const headerRow = headers.map(h => h.padEnd(maxWidth / headers.length)).join(' | ')
      this.log(headerRow, 'bright')
      this.separator('-', headerRow.length)
    }
    
    data.forEach(row => {
      const rowStr = Array.isArray(row) 
        ? row.map(cell => String(cell).padEnd(maxWidth / row.length)).join(' | ')
        : String(row)
      this.log(rowStr, 'white')
    })
  }

  /**
   * 로그 레벨 설정
   */
  setLevel(level: string): void {
    this.level = level
  }

  /**
   * 프리픽스 설정
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix
  }

  /**
   * 타임스탬프 설정
   */
  setTimestamp(enable: boolean): void {
    this.timestamp = enable
  }
}

// 기본 로거 인스턴스
export const defaultLogger = new Logger()

// 편의 함수들
export function log(message: string, color: ColorKey = 'reset'): void {
  defaultLogger.log(message, color)
}

export function logStep(step: string, message: string): void {
  defaultLogger.step(step, message)
}

export function logSuccess(message: string): void {
  defaultLogger.success(message)
}

export function logError(message: string): void {
  defaultLogger.error(message)
}

export function logWarning(message: string): void {
  defaultLogger.warning(message)
}

export function logInfo(message: string): void {
  defaultLogger.info(message)
}

export function logDebug(message: string): void {
  defaultLogger.debug(message)
}

export { colors }
