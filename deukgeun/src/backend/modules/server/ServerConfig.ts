// ============================================================================
// 서버 설정 관리 모듈 (성능 최적화)
// ============================================================================

import { 
  safeGetEnvString,
  safeGetEnvNumber,
  safeGetEnvArray
} from "@backend/utils/typeGuards"
import { getCachedServerConfig } from "@backend/modules/server/ConfigCache"

export interface ServerConfig {
  port: number
  environment: string
  corsOrigin: string[]
}

/**
 * 기본 CORS Origins 설정 (캐시된 상수)
 */
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173", 
  "http://localhost:5000",
  "http://localhost:5001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5001",
] as const

/**
 * 서버 설정을 생성하고 반환합니다.
 * 환경 변수에서 값을 읽어와서 타입 안전한 설정 객체를 만듭니다.
 * 캐싱을 통해 성능을 최적화합니다.
 */
export function createServerConfig(): ServerConfig {
  return getCachedServerConfig(() => {
    console.log("🔧 Creating server config...")
    
    const port = safeGetEnvNumber('PORT', 5000)
    const nodeEnv = safeGetEnvString('NODE_ENV', 'development')
    const corsOrigin = safeGetEnvArray('CORS_ORIGIN', [...DEFAULT_CORS_ORIGINS])

    const config: ServerConfig = {
      port,
      environment: nodeEnv,
      corsOrigin
    }
    
    console.log("✅ Server config created successfully")
    console.log(`   - Port: ${port}`)
    console.log(`   - Environment: ${nodeEnv}`)
    console.log(`   - CORS Origins: ${corsOrigin.length} configured`)
    
    return config
  })
}

/**
 * 서버 설정 정보를 로그로 출력합니다.
 */
export function logServerConfig(config: ServerConfig): void {
  console.log("📊 Server Configuration:")
  console.log(`   - Port: ${config.port}`)
  console.log(`   - Environment: ${config.environment}`)
  console.log(`   - CORS Origins: ${config.corsOrigin.join(', ')}`)
}
