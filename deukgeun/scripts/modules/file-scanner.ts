/**
 * 파일 스캔 모듈
 */

import * as fs from 'fs'
import * as path from 'path'
import { logStep, log } from './converter-utils'

export interface FileScannerOptions {
  distPath: string
  excludeDirs?: string[]
  extensions?: string[]
}

export class FileScanner {
  private options: FileScannerOptions
  private cache: {
    jsFiles: string[]
    cjsFiles: string[]
    lastScan: number
  } = {
    jsFiles: [],
    cjsFiles: [],
    lastScan: 0
  }

  constructor(options: FileScannerOptions) {
    this.options = {
      excludeDirs: ['node_modules', '.git', '.conversion-backup', 'frontend'],
      extensions: ['.js', '.ts', '.tsx'],
      ...options
    }
  }

  /**
   * JS/TS 파일 찾기 (캐시 사용)
   */
  findJsFiles(): string[] {
    const now = Date.now()
    if (this.cache.jsFiles.length > 0 && (now - this.cache.lastScan) < 5000) {
      return this.cache.jsFiles
    }

    logStep('SCAN', 'JS/TS 파일 스캔 중...')

    const jsFiles: string[] = []
    this.scanDirectory(this.options.distPath, jsFiles, this.options.extensions || ['.js', '.ts', '.tsx'])

    this.cache.jsFiles = jsFiles
    this.cache.lastScan = now

    log(`발견된 JS/TS 파일: ${jsFiles.length}개`, 'blue')
    return jsFiles
  }

  /**
   * CJS 파일 찾기 (캐시 사용)
   */
  findCjsFiles(): string[] {
    const now = Date.now()
    if (this.cache.cjsFiles.length > 0 && (now - this.cache.lastScan) < 5000) {
      return this.cache.cjsFiles
    }

    const cjsFiles: string[] = []
    this.scanDirectory(this.options.distPath, cjsFiles, ['.cjs'])

    this.cache.cjsFiles = cjsFiles
    this.cache.lastScan = now

    return cjsFiles
  }

  /**
   * 디렉토리 스캔
   */
  private scanDirectory(dir: string, fileList: string[], extensions: string[]): void {
    if (!fs.existsSync(dir)) {
      return
    }

    try {
      const items = fs.readdirSync(dir)

      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)

        if (stat.isDirectory()) {
          if (!this.options.excludeDirs?.includes(item)) {
            this.scanDirectory(itemPath, fileList, extensions)
          }
        } else if (extensions.some(ext => item.endsWith(ext)) && !item.endsWith('.min.js')) {
          fileList.push(itemPath)
        }
      }
    } catch (error) {
      // 파일 읽기 실패는 무시
    }
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache = {
      jsFiles: [],
      cjsFiles: [],
      lastScan: 0
    }
  }
}

