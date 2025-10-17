// ============================================================================
// 지연 로딩 관리 모듈
// ============================================================================

import { AppDataSource } from "@/config/database"
import { logger } from "@/utils/logger"

/**
 * 지연 로딩된 모듈들의 상태를 추적합니다.
 */
interface LazyModuleState {
  loaded: boolean
  loading: boolean
  error?: string
  loadTime?: number
}

/**
 * 지연 로딩된 모듈들의 상태 맵
 */
const lazyModules: Map<string, LazyModuleState> = new Map()

/**
 * 지연 로딩된 모듈을 가져오거나 로드합니다.
 */
export async function lazyLoad<T>(
  moduleName: string,
  loader: () => Promise<T>,
  fallback?: T
): Promise<T> {
  const state = lazyModules.get(moduleName)
  
  // 이미 로드된 경우
  if (state?.loaded) {
    console.log(`📦 Using cached module: ${moduleName}`)
    return loader()
  }
  
  // 로딩 중인 경우
  if (state?.loading) {
    console.log(`⏳ Module already loading: ${moduleName}`)
    // 로딩이 완료될 때까지 대기
    while (lazyModules.get(moduleName)?.loading) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    return loader()
  }
  
  // 새로 로드
  console.log(`🔄 Lazy loading module: ${moduleName}`)
  const startTime = Date.now()
  
  lazyModules.set(moduleName, { loaded: false, loading: true })
  
  try {
    const result = await loader()
    const loadTime = Date.now() - startTime
    
    lazyModules.set(moduleName, { 
      loaded: true, 
      loading: false, 
      loadTime 
    })
    
    console.log(`✅ Module loaded: ${moduleName} (${loadTime}ms)`)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    lazyModules.set(moduleName, { 
      loaded: false, 
      loading: false, 
      error: errorMessage 
    })
    
    console.error(`❌ Module load failed: ${moduleName} - ${errorMessage}`)
    
    if (fallback) {
      console.log(`🔄 Using fallback for module: ${moduleName}`)
      return fallback
    }
    
    throw error
  }
}

/**
 * 데이터베이스 연결을 지연 로딩합니다.
 */
export async function lazyLoadDatabase(): Promise<typeof AppDataSource> {
  return lazyLoad(
    'database',
    async () => {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
      }
      return AppDataSource
    },
    AppDataSource // fallback
  )
}

/**
 * 로거를 지연 로딩합니다.
 */
export async function lazyLoadLogger(): Promise<typeof logger> {
  return lazyLoad(
    'logger',
    async () => {
      // 로거는 이미 초기화되어 있으므로 바로 반환
      return logger
    },
    logger // fallback
  )
}

/**
 * 지연 로딩된 모듈의 상태를 반환합니다.
 */
export function getLazyModuleStatus(moduleName?: string): 
  | LazyModuleState 
  | Map<string, LazyModuleState> {
  if (moduleName) {
    return lazyModules.get(moduleName) || { loaded: false, loading: false }
  }
  return new Map(lazyModules)
}

/**
 * 모든 지연 로딩된 모듈의 상태를 로그로 출력합니다.
 */
export function logLazyModuleStatus(): void {
  console.log("📊 Lazy Module Status:")
  for (const [name, state] of lazyModules) {
    const status = state.loaded ? '✅' : state.loading ? '⏳' : '❌'
    const time = state.loadTime ? ` (${state.loadTime}ms)` : ''
    const error = state.error ? ` - ${state.error}` : ''
    console.log(`   ${status} ${name}${time}${error}`)
  }
}

/**
 * 지연 로딩된 모듈을 강제로 다시 로드합니다.
 */
export function reloadLazyModule(moduleName: string): void {
  lazyModules.delete(moduleName)
  console.log(`🔄 Module marked for reload: ${moduleName}`)
}

/**
 * 모든 지연 로딩된 모듈을 강제로 다시 로드합니다.
 */
export function reloadAllLazyModules(): void {
  lazyModules.clear()
  console.log("🔄 All modules marked for reload")
}
