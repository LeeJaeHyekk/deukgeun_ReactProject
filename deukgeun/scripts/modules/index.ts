/**
 * 모듈 인덱스
 * 모든 공통 모듈들을 통합하여 내보내기
 */

// 기존 클래스 기반 모듈들
import { Logger, defaultLogger } from './logger'
import { FileUtils } from './file-utils'
import { CodeConverter } from './converter'
import { BuildManager } from './build-manager'
import { ErrorHandler, ErrorTypes, ErrorSeverity } from './error-handler'
import { SafetyGuard } from './safety-guard'

// 새로운 함수형 모듈들
import * as LoggerFunctions from './logger-functions'
import * as FileFunctions from './file-functions'
import * as ConverterFunctions from './converter-functions'
import * as BuildFunctions from './build-functions'
import * as DeployFunctions from './deploy-functions'
import * as HealthFunctions from './health-functions'
import * as PM2Functions from './pm2-functions'
import * as TestFunctions from './test-functions'
import * as EnvFunctions from './env-functions'
import * as DataFunctions from './data-functions'
import * as SafetyFunctions from './safety-functions'

// 최적화된 새로운 모듈들
import * as ErrorRecoveryFunctions from './error-recovery-functions'
import * as PerformanceFunctions from './performance-functions'
import * as ValidationFunctions from './validation-functions'

export {
  // 기존 클래스 기반 모듈들
  Logger,
  defaultLogger,
  FileUtils,
  CodeConverter,
  BuildManager,
  ErrorHandler,
  ErrorTypes,
  ErrorSeverity,
  SafetyGuard,
  
  // 새로운 함수형 모듈들
  LoggerFunctions,
  FileFunctions,
  ConverterFunctions,
  BuildFunctions,
  DeployFunctions,
  HealthFunctions,
  PM2Functions,
  TestFunctions,
  EnvFunctions,
  DataFunctions,
  SafetyFunctions,
  
  // 최적화된 새로운 모듈들
  ErrorRecoveryFunctions,
  PerformanceFunctions,
  ValidationFunctions
}

// 편의 함수들
export function createLogger(options: any) {
  return new Logger(options)
}

export function createFileUtils(projectRoot: string) {
  return new FileUtils(projectRoot)
}

export function createConverter(options: any) {
  return new CodeConverter(options)
}

export function createBuildManager(projectRoot: string, options: any) {
  return new BuildManager(projectRoot, options)
}

export function createErrorHandler(projectRoot: string, options: any) {
  return new ErrorHandler(projectRoot, options)
}

export function createSafetyGuard(projectRoot: string, options: any) {
  return new SafetyGuard(projectRoot, options)
}
