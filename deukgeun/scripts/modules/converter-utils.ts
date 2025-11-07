/**
 * 변환 스크립트 유틸리티 함수
 */

import * as fs from 'fs'
import * as path from 'path'
import { FileSearchResult, PathResolutionContext } from './converter-types'

// 색상 출력을 위한 유틸리티
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

export function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

export function logStep(step: string, message: string): void {
  log(`[${step}] ${message}`, 'cyan')
}

export function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

export function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

export function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

export function logSeparator(char: string, length: number, color: keyof typeof colors = 'reset'): void {
  log(char.repeat(length), color)
}

/**
 * 파일 존재 여부 확인 (여러 확장자 시도)
 */
export function findFileWithExtensions(
  basePath: string,
  extensions: string[] = ['.cjs', '.js', '.ts']
): string | null {
  for (const ext of extensions) {
    const fullPath = basePath + ext
    if (fs.existsSync(fullPath)) {
      return fullPath
    }
  }
  return null
}

/**
 * 상대 경로 정규화
 */
export function normalizeRelativePath(relativePath: string): string {
  let normalized = relativePath.replace(/\\/g, '/')
  if (!normalized.startsWith('.')) {
    normalized = './' + normalized
  }
  return normalized
}

/**
 * 경로에서 확장자 제거
 */
export function removeExtension(filePath: string): string {
  return filePath.replace(/\.(js|cjs|ts|tsx)$/, '')
}

/**
 * 경로가 node_modules나 절대 경로인지 확인
 */
export function isExternalPath(modulePath: string): boolean {
  return modulePath.startsWith('/') || modulePath.includes('node_modules')
}

/**
 * 파일 크기 확인 (10MB 제한)
 */
export function isFileTooLarge(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath)
    return stats.size > 10 * 1024 * 1024
  } catch {
    return false
  }
}

/**
 * 빈 파일인지 확인
 */
export function isEmptyFile(content: string): boolean {
  const trimmed = content.trim()
  return trimmed === '' || trimmed === '"use strict";'
}

