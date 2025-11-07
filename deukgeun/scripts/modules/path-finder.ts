/**
 * 파일 경로 찾기 모듈
 * 실제 파일 위치를 찾아서 올바른 상대 경로를 반환
 */

import * as fs from 'fs'
import * as path from 'path'
import { FileSearchResult } from './converter-types'
import { normalizeRelativePath, removeExtension } from './converter-utils'

export interface PathResolutionContext {
  fromFile: string
  fromDir: string
  backendBackendDir: string
  distPath: string
}

export class PathFinder {
  /**
   * 실제 파일을 찾는 메인 함수
   */
  static findActualFile(
    moduleName: string,
    context: PathResolutionContext
  ): FileSearchResult {
    const baseName = removeExtension(moduleName)
    const pathParts = baseName.split('/')
    const isNestedPath = pathParts.length > 1

    // 시도할 경로 목록 생성
    const possiblePaths = this.generatePossiblePaths(
      baseName,
      pathParts,
      isNestedPath,
      context
    )

    // 파일 찾기
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        const relativePath = path.relative(context.fromDir, possiblePath)
        const normalizedPath = normalizeRelativePath(relativePath)
        return {
          found: true,
          relativePath: normalizedPath,
          absolutePath: possiblePath
        }
      }
    }

    return { found: false, relativePath: '' }
  }

  /**
   * 가능한 경로 목록 생성
   */
  private static generatePossiblePaths(
    baseName: string,
    pathParts: string[],
    isNestedPath: boolean,
    context: PathResolutionContext
  ): string[] {
    const possiblePaths: string[] = []
    const { fromDir, backendBackendDir } = context

    // 1. 현재 디렉토리 기준
    possiblePaths.push(
      path.join(fromDir, `${baseName}.cjs`),
      path.join(fromDir, baseName, 'index.cjs')
    )

    // 2. 상위 디렉토리 기준 (1~3단계)
    for (let level = 1; level <= 3; level++) {
      const parentDir = path.join(fromDir, ...Array(level).fill('..'))
      possiblePaths.push(
        path.join(parentDir, `${baseName}.cjs`),
        path.join(parentDir, baseName, 'index.cjs')
      )
    }

    // 3. backend/backend 기준 (절대 경로)
    possiblePaths.push(
      path.join(backendBackendDir, `${baseName}.cjs`),
      path.join(backendBackendDir, baseName, 'index.cjs')
    )

    // 4. 중첩 경로 처리
    if (isNestedPath) {
      possiblePaths.push(...this.generateNestedPaths(baseName, pathParts, context))
    }

    return possiblePaths
  }

  /**
   * 중첩 경로에 대한 가능한 경로 생성
   */
  private static generateNestedPaths(
    baseName: string,
    pathParts: string[],
    context: PathResolutionContext
  ): string[] {
    const possiblePaths: string[] = []
    const { fromDir, backendBackendDir } = context
    const [firstPart, ...restParts] = pathParts
    const remainingPath = restParts.join('/')

    // backend/backend 기준으로 직접 찾기
    possiblePaths.push(
      path.join(backendBackendDir, `${baseName}.cjs`),
      path.join(backendBackendDir, baseName, 'index.cjs'),
      path.join(backendBackendDir, firstPart, `${remainingPath}.cjs`),
      path.join(backendBackendDir, firstPart, remainingPath, 'index.cjs')
    )

    // 상위 디렉토리에서 찾기 (1~3단계)
    for (let level = 1; level <= 3; level++) {
      const parentDir = path.join(fromDir, ...Array(level).fill('..'))
      possiblePaths.push(
        path.join(parentDir, `${baseName}.cjs`),
        path.join(parentDir, baseName, 'index.cjs'),
        path.join(parentDir, firstPart, `${remainingPath}.cjs`),
        path.join(parentDir, firstPart, remainingPath, 'index.cjs')
      )
    }

    // 3단계 이상 경로 처리 (예: modules/crawling/core/DataProcessor)
    if (pathParts.length >= 3) {
      const [part1, part2, ...restParts2] = pathParts
      const remainingPath2 = restParts2.join('/')

      // backend/backend 기준으로 찾기
      possiblePaths.push(
        path.join(backendBackendDir, part1, part2, `${remainingPath2}.cjs`),
        path.join(backendBackendDir, part1, part2, remainingPath2, 'index.cjs')
      )

      // 상위 디렉토리에서 찾기
      for (let level = 1; level <= 3; level++) {
        const parentDir = path.join(fromDir, ...Array(level).fill('..'))
        possiblePaths.push(
          path.join(parentDir, part1, part2, `${remainingPath2}.cjs`),
          path.join(parentDir, part1, part2, remainingPath2, 'index.cjs')
        )
      }
    }

    return possiblePaths
  }

  /**
   * 같은 디렉토리 내 파일인지 확인
   */
  static isSameDirectory(file1: string, file2: string): boolean {
    return path.dirname(file1) === path.dirname(file2)
  }

  /**
   * 상대 경로가 올바른지 검증
   */
  static validateRelativePath(relativePath: string, fromDir: string, toFile: string): boolean {
    try {
      const resolvedPath = path.resolve(fromDir, relativePath)
      return fs.existsSync(resolvedPath) && resolvedPath === toFile
    } catch {
      return false
    }
  }
}

