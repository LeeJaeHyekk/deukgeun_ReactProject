// ============================================================================
// 서버 모듈 인덱스 (성능 최적화)
// ============================================================================

// 핵심 모듈
export { createServerConfig, logServerConfig, type ServerConfig } from "./ServerConfig"
export { validateEnvironmentVariables, shouldStartServer, type ValidationResult } from "./ServerValidator"
export { connectDatabase, isDatabaseConnected, logDatabaseStatus, type DatabaseConnectionResult } from "./DatabaseManager"
export { startExpressServer, setupGracefulShutdown, type ServerStartResult } from "./ServerStarter"
export { initializeAndStartServer, handleServerStartupError, type ServerManagerResult } from "./ServerManager"

// 성능 최적화 모듈
export { 
  getCachedServerConfig, 
  getCachedValidationResult, 
  invalidateCache, 
  getCacheStatus, 
  setCacheTTL 
} from "./ConfigCache"

export { 
  lazyLoad, 
  lazyLoadDatabase, 
  lazyLoadLogger, 
  getLazyModuleStatus, 
  logLazyModuleStatus, 
  reloadLazyModule, 
  reloadAllLazyModules 
} from "./LazyLoader"

export { 
  startPerformanceTimer, 
  endPerformanceTimer, 
  measurePerformance, 
  measureAsyncPerformance, 
  getAllPerformanceMetrics, 
  getPerformanceMetricsByName, 
  logPerformanceMetrics, 
  clearPerformanceMetrics, 
  getMemoryUsage, 
  logMemoryUsage,
  type PerformanceMetrics 
} from "./PerformanceMonitor"
