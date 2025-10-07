/**
 * 모듈 인덱스
 * 모든 공통 모듈들을 통합하여 내보내기
 */

import { Logger, defaultLogger } from './logger'
import { FileUtils } from './file-utils'
import { CodeConverter } from './converter'
import { BuildManager } from './build-manager'
import { ErrorHandler, ErrorTypes, ErrorSeverity } from './error-handler'

export {
  // 로거
  Logger,
  defaultLogger,
  
  // 파일 유틸리티
  FileUtils,
  
  // 코드 변환기
  CodeConverter,
  
  // 빌드 관리자
  BuildManager,
  
  // 에러 처리기
  ErrorHandler,
  ErrorTypes,
  ErrorSeverity
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
