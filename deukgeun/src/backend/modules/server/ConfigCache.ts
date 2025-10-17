// ============================================================================
// 설정 캐시 관리 모듈
// ============================================================================

import { ServerConfig } from "./ServerConfig"
import { ValidationResult } from "./ServerValidator"

/**
 * 설정 캐시 인터페이스
 */
interface ConfigCache {
  serverConfig: ServerConfig | null
  validationResult: ValidationResult | null
  lastUpdated: number
  ttl: number // Time To Live (ms)
}

/**
 * 전역 설정 캐시 인스턴스
 */
let configCache: ConfigCache = {
  serverConfig: null,
  validationResult: null,
  lastUpdated: 0,
  ttl: 30000 // 30초 캐시
}

/**
 * 캐시가 유효한지 확인합니다.
 */
function isCacheValid(): boolean {
  const now = Date.now()
  return configCache.lastUpdated > 0 && (now - configCache.lastUpdated) < configCache.ttl
}

/**
 * 서버 설정을 캐시에서 가져오거나 새로 생성합니다.
 */
export function getCachedServerConfig(createFn: () => ServerConfig): ServerConfig {
  if (isCacheValid() && configCache.serverConfig) {
    console.log("📦 Using cached server config")
    return configCache.serverConfig
  }

  console.log("🔄 Creating new server config")
  const config = createFn()
  
  configCache.serverConfig = config
  configCache.lastUpdated = Date.now()
  
  return config
}

/**
 * 검증 결과를 캐시에서 가져오거나 새로 생성합니다.
 */
export function getCachedValidationResult(
  createFn: () => Promise<ValidationResult>
): Promise<ValidationResult> {
  if (isCacheValid() && configCache.validationResult) {
    console.log("📦 Using cached validation result")
    return Promise.resolve(configCache.validationResult)
  }

  console.log("🔄 Creating new validation result")
  return createFn().then(result => {
    configCache.validationResult = result
    configCache.lastUpdated = Date.now()
    return result
  })
}

/**
 * 캐시를 무효화합니다.
 */
export function invalidateCache(): void {
  console.log("🗑️ Invalidating config cache")
  configCache = {
    serverConfig: null,
    validationResult: null,
    lastUpdated: 0,
    ttl: configCache.ttl
  }
}

/**
 * 캐시 상태를 반환합니다.
 */
export function getCacheStatus(): {
  hasServerConfig: boolean
  hasValidationResult: boolean
  isValid: boolean
  lastUpdated: number
  ttl: number
} {
  return {
    hasServerConfig: configCache.serverConfig !== null,
    hasValidationResult: configCache.validationResult !== null,
    isValid: isCacheValid(),
    lastUpdated: configCache.lastUpdated,
    ttl: configCache.ttl
  }
}

/**
 * 캐시 TTL을 설정합니다.
 */
export function setCacheTTL(ttl: number): void {
  configCache.ttl = ttl
  console.log(`⏰ Cache TTL set to ${ttl}ms`)
}
