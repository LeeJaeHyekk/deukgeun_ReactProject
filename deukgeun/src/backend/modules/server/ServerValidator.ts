// ============================================================================
// 서버 검증 모듈
// ============================================================================

import { validateAllConfigs } from "@/utils/typeGuards"
import { ServerConfig } from "./ServerConfig"
import { getCachedValidationResult } from "./ConfigCache"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  configs: ReturnType<typeof validateAllConfigs>['configs']
}

/**
 * 환경 변수 검증을 수행합니다.
 * 개발 환경과 프로덕션 환경에 따라 다른 검증 정책을 적용합니다.
 * 캐싱을 통해 성능을 최적화합니다.
 */
export async function validateEnvironmentVariables(config: ServerConfig): Promise<ValidationResult> {
  return getCachedValidationResult(async () => {
    console.log("=".repeat(60))
    console.log("🔧 TYPE-SAFE ENVIRONMENT VALIDATION START")
    console.log("=".repeat(60))
    
    try {
      const validation = validateAllConfigs()
      
      if (!validation.isValid) {
        console.log("❌ Environment validation failed:")
        validation.allErrors.forEach(error => {
          console.log(`   - ${error}`)
        })
        
        if (config.environment === 'production') {
          console.log("=".repeat(60))
          console.log("❌ PRODUCTION ENVIRONMENT VALIDATION FAILED")
          console.log("=".repeat(60))
          process.exit(1)
        } else {
          console.log("⚠️ Development mode: Continuing with warnings...")
          console.log("💡 Please check your .env file or environment variables")
        }
      } else {
        console.log("✅ All environment configurations are valid")
      }
      
      console.log("📊 Configuration Summary:")
      console.log(`   - Database: ${validation.configs.database.config?.host}:${validation.configs.database.config?.port}`)
      console.log(`   - JWT Secret: ${validation.configs.jwt.config?.secret ? 'Set' : 'Not set'}`)
      
      console.log("=".repeat(60))
      console.log("✅ TYPE-SAFE ENVIRONMENT VALIDATION COMPLETE")
      console.log("=".repeat(60))
      
      return {
        isValid: validation.isValid,
        errors: validation.allErrors,
        configs: validation.configs
      }
    } catch (error) {
      console.log("=".repeat(60))
      console.log("❌ ENVIRONMENT VALIDATION ERROR")
      console.log("=".repeat(60))
      console.error("❌ Error during validation:", error instanceof Error ? error.message : String(error))
      
      if (config.environment === 'production') {
        console.log("❌ Production environment requires valid configuration")
        process.exit(1)
      } else {
        console.log("⚠️ Development mode: Continuing with default values...")
      }
      
      console.log("=".repeat(60))
      
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        configs: {
          server: { isValid: false, config: null, errors: [] },
          database: { isValid: false, config: null, errors: [] },
          jwt: { isValid: false, config: null, errors: [] }
        }
      }
    }
  })
}

/**
 * 검증 결과를 기반으로 서버 시작 여부를 결정합니다.
 */
export function shouldStartServer(validationResult: ValidationResult, config: ServerConfig): boolean {
  if (validationResult.isValid) {
    return true
  }
  
  if (config.environment === 'development') {
    console.log("⚠️ Development mode: Starting server despite validation warnings")
    return true
  }
  
  console.log("❌ Production mode: Cannot start server with validation errors")
  return false
}
