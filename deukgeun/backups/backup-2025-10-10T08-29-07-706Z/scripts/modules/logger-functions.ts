/**
 * 함수형 로깅 모듈
 * 모든 빌드 스크립트에서 사용하는 공통 로깅 함수들
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

interface LoggerConfig {
  prefix?: string
  timestamp?: boolean
  level?: 'debug' | 'info' | 'warn' | 'error'
}

interface TableOptions {
  headers?: string[]
  maxWidth?: number
}

// 전역 로거 설정
let globalConfig: LoggerConfig = {
  prefix: '',
  timestamp: false,
  level: 'info'
}

/**
 * 로거 설정
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * 기본 로그 출력
 */
export function log(message: string, color: ColorKey = 'reset'): void {
  const timestamp = globalConfig.timestamp ? `[${new Date().toISOString()}] ` : ''
  const prefix = globalConfig.prefix ? `[${globalConfig.prefix}] ` : ''
  console.log(`${colors[color]}${timestamp}${prefix}${message}${colors.reset}`)
}

/**
 * 단계별 로그
 */
export function logStep(step: string, message: string): void {
  log(`[${step}] ${message}`, 'cyan')
}

/**
 * 성공 로그
 */
export function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

/**
 * 에러 로그
 */
export function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

/**
 * 경고 로그
 */
export function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

/**
 * 정보 로그
 */
export function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'blue')
}

/**
 * 디버그 로그
 */
export function logDebug(message: string): void {
  if (globalConfig.level === 'debug') {
    log(`🐛 ${message}`, 'gray')
  }
}

/**
 * 진행률 표시
 */
export function logProgress(current: number, total: number, message: string = ''): void {
  const percentage = Math.round((current / total) * 100)
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
  log(`[${bar}] ${percentage}% ${message}`, 'cyan')
}

/**
 * 구분선
 */
export function logSeparator(char: string = '=', length: number = 60, color: ColorKey = 'cyan'): void {
  log(char.repeat(length), color)
}

/**
 * 테이블 형태 로그
 */
export function logTable(data: any[], options: TableOptions = {}): void {
  const { headers = [], maxWidth = 80 } = options
  
  if (headers.length > 0) {
    const headerRow = headers.map(h => h.padEnd(maxWidth / headers.length)).join(' | ')
    log(headerRow, 'bright')
    logSeparator('-', headerRow.length)
  }
  
  data.forEach(row => {
    const rowStr = Array.isArray(row) 
      ? row.map(cell => String(cell).padEnd(maxWidth / row.length)).join(' | ')
      : String(row)
    log(rowStr, 'white')
  })
}

/**
 * 로그 레벨 설정
 */
export function setLogLevel(level: string): void {
  globalConfig.level = level as any
}

/**
 * 프리픽스 설정
 */
export function setLogPrefix(prefix: string): void {
  globalConfig.prefix = prefix
}

/**
 * 타임스탬프 설정
 */
export function setLogTimestamp(enable: boolean): void {
  globalConfig.timestamp = enable
}

export { colors }
