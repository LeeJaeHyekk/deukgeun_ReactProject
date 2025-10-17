/**
 * ESM/CJS 호환 경로 유틸리티
 * 개발 시에는 ESM, 빌드 후에는 CJS에서 모두 동작
 */

import path from 'path'

// ESM/CJS 호환 __dirname 대체
export function getDirname(): string {
  // CJS 환경에서 __dirname 사용
  if (typeof __dirname !== 'undefined') {
    return __dirname
  }
  
  // 폴백: 현재 작업 디렉토리
  return process.cwd()
}

// ESM/CJS 호환 __filename 대체
export function getFilename(): string {
  // CJS 환경에서 __filename 사용
  if (typeof __filename !== 'undefined') {
    return __filename
  }
  
  // 폴백: 현재 작업 디렉토리
  return process.cwd()
}

// 경로 해결 유틸리티
export function resolvePath(...paths: string[]): string {
  return path.resolve(...paths)
}

// 상대 경로 해결 유틸리티
export function joinPath(...paths: string[]): string {
  return path.join(...paths)
}
