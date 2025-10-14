// ============================================================================
// 백엔드 전용 타입 가드 및 안전장치
// ============================================================================

import { 
  isString, 
  isNumber, 
  isBoolean, 
  isObject, 
  isArray,
  isDate,
  isDateString 
} from '../../shared/types/guards'

// ============================================================================
// 환경 변수 타입 가드
// ============================================================================

export function isValidEnvironment(value: unknown): value is 'development' | 'production' | 'test' {
  return isString(value) && ['development', 'production', 'test'].includes(value)
}

export function isValidPort(value: unknown): value is number {
  return isNumber(value) && value > 0 && value <= 65535 && Number.isInteger(value)
}

export function isValidDatabaseConfig(value: unknown): value is {
  host: string
  port: number
  username: string
  password: string
  database: string
} {
  if (!isObject(value)) return false
  
  const config = value as Record<string, unknown>
  
  return (
    isString(config.host) &&
    isValidPort(config.port) &&
    isString(config.username) &&
    isString(config.password) &&
    isString(config.database)
  )
}

export function isValidJWTConfig(value: unknown): value is {
  secret: string
  expiresIn: string
  accessSecret: string
  refreshSecret: string
} {
  if (!isObject(value)) return false
  
  const config = value as Record<string, unknown>
  
  return (
    isString(config.secret) &&
    isString(config.expiresIn) &&
    isString(config.accessSecret) &&
    isString(config.refreshSecret)
  )
}

// ============================================================================
// 서버 상태 타입 가드
// ============================================================================

export function isValidServerStatus(value: unknown): value is {
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping'
  timestamp: string
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
} {
  if (!isObject(value)) return false
  
  const status = value as Record<string, unknown>
  
  return (
    isString(status.status) && 
    ['healthy', 'unhealthy', 'starting', 'stopping'].includes(status.status) &&
    isString(status.timestamp) &&
    isNumber(status.uptime) &&
    isObject(status.memory) &&
    isNumber((status.memory as Record<string, unknown>).rss) &&
    isNumber((status.memory as Record<string, unknown>).heapTotal) &&
    isNumber((status.memory as Record<string, unknown>).heapUsed) &&
    isNumber((status.memory as Record<string, unknown>).external) &&
    isNumber((status.memory as Record<string, unknown>).arrayBuffers)
  )
}

export function isValidDatabaseStatus(value: unknown): value is {
  connected: boolean
  host: string
  port: number
  database: string
  lastChecked: string
} {
  if (!isObject(value)) return false
  
  const status = value as Record<string, unknown>
  
  return (
    isBoolean(status.connected) &&
    isString(status.host) &&
    isValidPort(status.port) &&
    isString(status.database) &&
    isString(status.lastChecked)
  )
}

// ============================================================================
// API 응답 타입 가드
// ============================================================================

export function isValidApiResponse(value: unknown): value is {
  success: boolean
  message: string
  data?: unknown
  error?: string
  timestamp: string
} {
  if (!isObject(value)) return false
  
  const response = value as Record<string, unknown>
  
  return (
    isBoolean(response.success) &&
    isString(response.message) &&
    isString(response.timestamp) &&
    (response.data === undefined || true) && // data는 optional
    (response.error === undefined || isString(response.error)) // error는 optional
  )
}

export function isValidHealthResponse(value: unknown): value is {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  database?: string
  databaseHealth?: {
    status: string
    connected: boolean
    [key: string]: unknown
  }
  environment: string
  port: number
  memory?: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
} {
  if (!isObject(value)) return false
  
  const response = value as Record<string, unknown>
  
  return (
    isString(response.status) &&
    ['healthy', 'unhealthy'].includes(response.status) &&
    isString(response.timestamp) &&
    isNumber(response.uptime) &&
    isString(response.environment) &&
    isValidPort(response.port) &&
    (response.database === undefined || isString(response.database)) &&
    (response.databaseHealth === undefined || isObject(response.databaseHealth)) &&
    (response.memory === undefined || (
      isObject(response.memory) &&
      isNumber((response.memory as Record<string, unknown>).rss) &&
      isNumber((response.memory as Record<string, unknown>).heapTotal) &&
      isNumber((response.memory as Record<string, unknown>).heapUsed) &&
      isNumber((response.memory as Record<string, unknown>).external) &&
      isNumber((response.memory as Record<string, unknown>).arrayBuffers)
    ))
  )
}

// ============================================================================
// 안전한 환경 변수 접근 함수들
// ============================================================================

export function safeGetEnvString(key: string, defaultValue: string = ''): string {
  const value = process.env[key]
  return isString(value) ? value : defaultValue
}

export function safeGetEnvNumber(key: string, defaultValue: number = 0): number {
  const value = process.env[key]
  if (isString(value)) {
    const parsed = parseInt(value, 10)
    return isValidPort(parsed) ? parsed : defaultValue
  }
  return defaultValue
}

export function safeGetEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (isString(value)) {
    const lower = value.toLowerCase()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  return defaultValue
}

export function safeGetEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key]
  if (isString(value)) {
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0)
  }
  return defaultValue
}

// ============================================================================
// 안전한 데이터베이스 연결 검증
// ============================================================================

export function validateDatabaseConnectionConfig(): {
  isValid: boolean
  config: {
    host: string
    port: number
    username: string
    password: string
    database: string
  } | null
  errors: string[]
} {
  const errors: string[] = []
  
  const host = safeGetEnvString('DB_HOST', 'localhost')
  const port = safeGetEnvNumber('DB_PORT', 3306)
  const username = safeGetEnvString('DB_USERNAME', 'root')
  const password = safeGetEnvString('DB_PASSWORD', '')
  const database = safeGetEnvString('DB_DATABASE', 'deukgeun_db')
  
  if (!isString(host) || host.length === 0) {
    errors.push('DB_HOST is required and must be a valid string')
  }
  
  if (!isValidPort(port)) {
    errors.push('DB_PORT must be a valid port number (1-65535)')
  }
  
  if (!isString(username) || username.length === 0) {
    errors.push('DB_USERNAME is required and must be a valid string')
  }
  
  if (!isString(password)) {
    errors.push('DB_PASSWORD must be a valid string')
  }
  
  if (!isString(database) || database.length === 0) {
    errors.push('DB_DATABASE is required and must be a valid string')
  }
  
  const config = {
    host,
    port,
    username,
    password,
    database
  }
  
  return {
    isValid: errors.length === 0,
    config: errors.length === 0 ? config : null,
    errors
  }
}

// ============================================================================
// 안전한 JWT 설정 검증
// ============================================================================

export function validateJWTConfig(): {
  isValid: boolean
  config: {
    secret: string
    expiresIn: string
    accessSecret: string
    refreshSecret: string
  } | null
  errors: string[]
} {
  const errors: string[] = []
  
  const secret = safeGetEnvString('JWT_SECRET', '')
  const expiresIn = safeGetEnvString('JWT_EXPIRES_IN', '7d')
  const accessSecret = safeGetEnvString('JWT_ACCESS_SECRET', '')
  const refreshSecret = safeGetEnvString('JWT_REFRESH_SECRET', '')
  
  if (!isString(secret) || secret.length === 0) {
    errors.push('JWT_SECRET is required and must be a valid string')
  }
  
  if (!isString(expiresIn) || expiresIn.length === 0) {
    errors.push('JWT_EXPIRES_IN is required and must be a valid string')
  }
  
  if (!isString(accessSecret) || accessSecret.length === 0) {
    errors.push('JWT_ACCESS_SECRET is required and must be a valid string')
  }
  
  if (!isString(refreshSecret) || refreshSecret.length === 0) {
    errors.push('JWT_REFRESH_SECRET is required and must be a valid string')
  }
  
  const config = {
    secret,
    expiresIn,
    accessSecret,
    refreshSecret
  }
  
  return {
    isValid: errors.length === 0,
    config: errors.length === 0 ? config : null,
    errors
  }
}

// ============================================================================
// 안전한 서버 설정 검증
// ============================================================================

export function validateServerConfig(): {
  isValid: boolean
  config: {
    port: number
    environment: string
    corsOrigins: string[]
  } | null
  errors: string[]
} {
  const errors: string[] = []
  
  const port = safeGetEnvNumber('PORT', 5000)
  const environment = safeGetEnvString('NODE_ENV', 'development')
  const corsOrigins = safeGetEnvArray('CORS_ORIGIN', [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:5001'
  ])
  
  if (!isValidPort(port)) {
    errors.push('PORT must be a valid port number (1-65535)')
  }
  
  if (!isValidEnvironment(environment)) {
    errors.push('NODE_ENV must be one of: development, production, test')
  }
  
  if (!isArray(corsOrigins) || corsOrigins.length === 0) {
    errors.push('CORS_ORIGIN must be a valid comma-separated list of URLs')
  }
  
  const config = {
    port,
    environment,
    corsOrigins
  }
  
  return {
    isValid: errors.length === 0,
    config: errors.length === 0 ? config : null,
    errors
  }
}

// ============================================================================
// 통합 설정 검증
// ============================================================================

export function validateAllConfigs(): {
  isValid: boolean
  configs: {
    server: ReturnType<typeof validateServerConfig>
    database: ReturnType<typeof validateDatabaseConnectionConfig>
    jwt: ReturnType<typeof validateJWTConfig>
  }
  allErrors: string[]
} {
  const serverConfig = validateServerConfig()
  const databaseConfig = validateDatabaseConnectionConfig()
  const jwtConfig = validateJWTConfig()
  
  const allErrors = [
    ...serverConfig.errors,
    ...databaseConfig.errors,
    ...jwtConfig.errors
  ]
  
  return {
    isValid: allErrors.length === 0,
    configs: {
      server: serverConfig,
      database: databaseConfig,
      jwt: jwtConfig
    },
    allErrors
  }
}
