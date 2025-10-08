#!/usr/bin/env node

/**
 * JS to CJS 변환 스크립트 (최적화 버전)
 * ES Modules를 CommonJS로 변환하는 유틸리티
 * 
 * 성능 최적화:
 * - 병렬 처리: 여러 파일 동시 변환
 * - 캐싱: 변환 결과 임시 저장
 * - 메모리 관리: 대용량 프로젝트 처리
 * - 에러 복구: 변환 실패 시 자동 롤백
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import * as crypto from 'crypto'

// 타입 정의
interface ConversionResult {
  filePath: string
  content: string
  success: boolean
}

interface ConversionResponse {
  successCount: number
  failCount: number
  results: Map<string, ConversionResult>
  errors: Map<string, Error>
}

interface RollbackItem {
  original: string
  backup: string
  temp: string
}

interface ConversionRule {
  pattern: RegExp
  replacement: string | ((match: string, ...args: string[]) => string)
}

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step: string, message: string): void {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

/**
 * 캐시 관리 클래스
 */
class CacheManager {
  private cacheDir: string

  constructor(projectRoot: string) {
    this.cacheDir = path.join(projectRoot, '.conversion-cache')
    this.ensureCacheDir()
  }

  /**
   * 캐시 디렉토리 경로 반환 (public 메서드)
   */
  getCacheDir(): string {
    return this.cacheDir
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true })
    }
  }

  private getCacheKey(filePath: string, content: string): string {
    const hash = crypto.createHash('md5')
    hash.update(filePath)
    hash.update(content)
    return hash.digest('hex')
  }

  private getCachePath(filePath: string): string {
    const relativePath = path.relative(process.cwd(), filePath)
    const safePath = relativePath.replace(/[^a-zA-Z0-9]/g, '_')
    return path.join(this.cacheDir, `${safePath}.cache`)
  }

  hasValidCache(filePath: string, content: string): boolean {
    const cachePath = this.getCachePath(filePath)
    if (!fs.existsSync(cachePath)) return false

    try {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
      const currentKey = this.getCacheKey(filePath, content)
      return cacheData.key === currentKey
    } catch {
      return false
    }
  }

  getCachedResult(filePath: string): string | null {
    const cachePath = this.getCachePath(filePath)
    try {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
      return cacheData.result
    } catch {
      return null
    }
  }

  setCache(filePath: string, content: string, result: string): void {
    const cachePath = this.getCachePath(filePath)
    const cacheData = {
      key: this.getCacheKey(filePath, content),
      result,
      timestamp: Date.now()
    }
    fs.writeFileSync(cachePath, JSON.stringify(cacheData))
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true })
    }
  }
}

/**
 * 병렬 처리 관리 클래스
 */
class ParallelProcessor {
  private maxWorkers: number
  private workers: Worker[]
  private taskQueue: Array<() => Promise<any>>
  private results: Map<string, any>
  private errors: Map<string, Error>

  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers
    this.workers = []
    this.taskQueue = []
    this.results = new Map()
    this.errors = new Map()
  }

  async processFiles<T>(
    files: string[], 
    processor: (file: string) => Promise<T>
  ): Promise<{ results: Map<string, T>, errors: Map<string, Error> }> {
    return new Promise((resolve, reject) => {
      const results = new Map<string, T>()
      const errors = new Map<string, Error>()
      let completed = 0
      let total = files.length

      if (total === 0) {
        resolve({ results, errors })
        return
      }

      const processNext = () => {
        if (completed === total) {
          resolve({ results, errors })
          return
        }

        const batch = files.slice(completed, Math.min(completed + this.maxWorkers, total))
        const promises = batch.map(async (file, index) => {
          try {
            const result = await processor(file)
            results.set(file, result)
          } catch (error) {
            errors.set(file, error as Error)
          }
          completed++
          if (completed < total) {
            processNext()
          }
        })

        Promise.all(promises).then(() => {
          if (completed === total) {
            resolve({ results, errors })
          }
        })
      }

      processNext()
    })
  }
}

  /**
   * 메모리 관리 클래스 (개선된 버전)
   */
class MemoryManager {
  private memoryThreshold: number
  private gcInterval: number
  private lastGC: number
  private gcCount: number

  constructor() {
    this.memoryThreshold = 100 * 1024 * 1024 // 100MB
    this.gcInterval = 5000 // 5초
    this.lastGC = Date.now()
    this.gcCount = 0
  }

  checkMemoryUsage(): void {
    const usage = process.memoryUsage()
    const heapUsed = usage.heapUsed

    if (heapUsed > this.memoryThreshold) {
      this.forceGC()
    }
  }

  forceGC(): void {
    if ((global as any).gc) {
      (global as any).gc()
      this.lastGC = Date.now()
      this.gcCount++
      log(`GC 실행됨 (${this.gcCount}번째)`, 'cyan')
    }
  }

  /**
   * GC 통계 반환
   */
  getGCStats(): { count: number, lastGC: number } {
    return {
      count: this.gcCount,
      lastGC: this.lastGC
    }
  }

  shouldGC(): boolean {
    return Date.now() - this.lastGC > this.gcInterval
  }
}

/**
 * 파일 분석 클래스 (최적화 버전)
 */
class FileAnalyzer {
  private projectRoot: string
  private backendFiles: Set<string>
  private frontendFiles: Set<string>
  private sharedFiles: Set<string>
  private conversionTargets: Set<string>
  private memoryManager: MemoryManager

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.backendFiles = new Set()
    this.frontendFiles = new Set()
    this.sharedFiles = new Set()
    this.conversionTargets = new Set()
    this.memoryManager = new MemoryManager()
  }

  /**
   * 프로젝트 파일 스캔 (최적화 버전)
   */
  async scanProject(): Promise<void> {
    logStep('SCAN', '프로젝트 파일 스캔 중...')
    
    const srcDir = path.join(this.projectRoot, 'src')
    log(`스캔 대상 디렉토리: ${srcDir}`, 'blue')
    
    if (!fs.existsSync(srcDir)) {
      logError(`src 디렉토리를 찾을 수 없습니다: ${srcDir}`)
      return
    }
    
    await this.scanDirectoryAsync(srcDir)
    
    // 메모리 사용량 체크
    this.memoryManager.checkMemoryUsage()
    
    logSuccess(`스캔 완료: 백엔드 ${this.backendFiles.size}개, 프론트엔드 ${this.frontendFiles.size}개, 공유 ${this.sharedFiles.size}개`)
  }

  /**
   * 비동기 디렉토리 스캔
   */
  private async scanDirectoryAsync(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      logWarning(`디렉토리가 존재하지 않습니다: ${dir}`)
      return
    }

    const items = fs.readdirSync(dir)
    log(`스캔 중: ${dir} (${items.length}개 항목)`, 'blue')
    
    // 병렬로 파일 처리
    const filePromises = items.map(async (item) => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        await this.scanDirectoryAsync(fullPath)
      } else if (this.isTypeScriptFile(fullPath)) {
        log(`TypeScript 파일 발견: ${fullPath}`, 'green')
        this.classifyFile(fullPath)
      }
    })

    await Promise.all(filePromises)
  }

  /**
   * 디렉토리 재귀 스캔
   */
  private scanDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      logWarning(`디렉토리가 존재하지 않습니다: ${dir}`)
      return
    }

    const items = fs.readdirSync(dir)
    log(`스캔 중: ${dir} (${items.length}개 항목)`, 'blue')
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath)
      } else if (this.isTypeScriptFile(fullPath)) {
        log(`TypeScript 파일 발견: ${fullPath}`, 'green')
        this.classifyFile(fullPath)
      }
    }
  }

  /**
   * TypeScript 파일 여부 확인
   */
  private isTypeScriptFile(filePath: string): boolean {
    const ext = path.extname(filePath)
    return ['.ts', '.tsx'].includes(ext)
  }

  /**
   * 파일 분류 (수정된 버전)
   */
  private classifyFile(filePath: string): void {
    const relativePath = path.relative(this.projectRoot, filePath)
    log(`파일 분류 중: ${relativePath}`, 'blue')
    
    // Windows 경로 구분자를 Unix 스타일로 변환
    const normalizedPath = relativePath.replace(/\\/g, '/')
    
    if (normalizedPath.startsWith('src/backend/')) {
      this.backendFiles.add(filePath)
      log(`백엔드 파일: ${normalizedPath}`, 'green')
    } else if (normalizedPath.startsWith('src/frontend/')) {
      this.frontendFiles.add(filePath)
      log(`프론트엔드 파일: ${normalizedPath}`, 'green')
      // 프론트엔드 파일도 변환 대상으로 분석
      this.analyzeFileForConversion(filePath)
    } else if (normalizedPath.startsWith('src/shared/')) {
      this.sharedFiles.add(filePath)
      log(`공유 파일: ${normalizedPath}`, 'green')
      this.analyzeSharedFile(filePath)
    } else {
      log(`알 수 없는 경로: ${normalizedPath}`, 'yellow')
    }
  }

  /**
   * 파일 변환 대상 분석 (새로 추가)
   */
  private analyzeFileForConversion(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // import.meta 사용 여부 확인
      const hasImportMeta = content.includes('import.meta')
      
      log(`변환 분석: ${path.relative(this.projectRoot, filePath)}`, 'blue')
      log(`- import.meta: ${hasImportMeta}`, 'cyan')
      
      if (hasImportMeta) {
        // import.meta가 있으면 변환 대상으로 추가
        this.conversionTargets.add(filePath)
        log(`변환 대상 추가: ${path.relative(this.projectRoot, filePath)}`, 'green')
      }
    } catch (error) {
      logWarning(`파일 분석 실패: ${filePath} - ${(error as Error).message}`)
    }
  }

  /**
   * 공유 파일 분석 (개선된 버전)
   */
  private analyzeSharedFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // import.meta 사용 여부 확인 (우선순위)
      const hasImportMeta = content.includes('import.meta')
      
      // 브라우저 API 사용 여부 확인
      const browserAPIs = ['window', 'document', 'localStorage', 'sessionStorage', 'navigator']
      const hasBrowserAPI = browserAPIs.some(api => content.includes(api))
      
      // React/JSX 사용 여부 확인
      const hasJSX = content.includes('jsx') || content.includes('React')
      
      log(`파일 분석: ${path.relative(this.projectRoot, filePath)}`, 'blue')
      log(`- import.meta: ${hasImportMeta}`, 'cyan')
      log(`- 브라우저 API: ${hasBrowserAPI}`, 'cyan')
      log(`- JSX: ${hasJSX}`, 'cyan')
      
      if (hasImportMeta) {
        // import.meta가 있으면 변환 대상으로 추가
        this.conversionTargets.add(filePath)
        log(`변환 대상 추가: ${path.relative(this.projectRoot, filePath)}`, 'green')
      }
      
      if (hasBrowserAPI || hasJSX) {
        // 프론트엔드 전용으로 분류
        this.frontendFiles.add(filePath)
        this.sharedFiles.delete(filePath)
        log(`프론트엔드 파일로 분류: ${path.relative(this.projectRoot, filePath)}`, 'yellow')
      }
    } catch (error) {
      logWarning(`파일 분석 실패: ${filePath} - ${(error as Error).message}`)
    }
  }

  /**
   * 변환 대상 파일 목록 반환
   */
  getConversionTargets(): string[] {
    return Array.from(this.conversionTargets)
  }
}

/**
 * 코드 변환 클래스 (최적화 버전)
 */
class CodeConverter {
  private cacheManager: CacheManager
  private conversionRules: ConversionRule[]

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager
    this.conversionRules = [
      // import.meta 변환 (개선된 버전) - 순서 중요!
      {
        pattern: /import\.meta\.env\.VITE_([A-Z_]+)/g,
        replacement: 'process.env.VITE_$1'
      },
      {
        pattern: /import\.meta\.env\.([A-Z_]+)/g,
        replacement: 'process.env.$1'
      },
      {
        pattern: /import\.meta\.env\.MODE/g,
        replacement: 'process.env.NODE_ENV'
      },
      {
        pattern: /import\.meta\.env\.DEV/g,
        replacement: 'process.env.NODE_ENV === "development"'
      },
      {
        pattern: /import\.meta\.env/g,
        replacement: 'process.env'
      },
      
      // 기본 import 변환
      {
        pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
        replacement: 'const $1 = require(\'$2\').default'
      },
      
      // 명명된 import 변환
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g,
        replacement: 'const { $1 } = require(\'$2\')'
      },
      
      // 네임스페이스 import 변환
      {
        pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
        replacement: 'const $1 = require(\'$2\')'
      },
      
      // 기본 export 변환
      {
        pattern: /export\s+default\s+/g,
        replacement: 'module.exports = '
      },
      
      // 명명된 export 변환
      {
        pattern: /export\s*{\s*([^}]+)\s*}/g,
        replacement: (match: string, exports: string) => {
          const exportList = exports.split(',').map(exp => exp.trim())
          return exportList.map(exp => {
            if (exp.includes(' as ')) {
              const [original, alias] = exp.split(' as ').map(s => s.trim())
              return `module.exports.${alias} = ${original}`
            }
            return `module.exports.${exp} = ${exp}`
          }).join('\n')
        }
      },
      
      // 브라우저 API polyfill 추가
      {
        pattern: /^/,
        replacement: `// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

`
      },
      
      // import.meta.env.VITE_* 패턴 변환
      {
        pattern: /import\.meta\.env\.VITE_([A-Z_]+)/g,
        replacement: 'process.env.VITE_$1'
      },
      
      // 추가 import.meta 패턴들
      {
        pattern: /import\.meta\.env\.([A-Z_]+)/g,
        replacement: 'process.env.$1'
      },
      {
        pattern: /import\.meta\.env/g,
        replacement: 'process.env'
      },
      {
        pattern: /import\.meta\.MODE/g,
        replacement: 'process.env.NODE_ENV'
      },
      {
        pattern: /import\.meta\.DEV/g,
        replacement: 'process.env.NODE_ENV === "development"'
      }
    ]
  }

  /**
   * 파일 변환 (개선된 버전 - 중복 방지 및 효율성 향상)
   */
  convertFile(filePath: string): string | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      log(`변환 시작: ${path.relative(process.cwd(), filePath)}`, 'cyan')
      log(`원본 내용 길이: ${content.length}`, 'cyan')
      
      // 이미 변환된 파일인지 확인 (중복 변환 방지)
      if (this.isAlreadyConverted(content)) {
        log(`이미 변환된 파일: ${path.relative(process.cwd(), filePath)}`, 'yellow')
        return content
      }
      
      // 캐시 확인 (개선된 버전)
      if (this.cacheManager.hasValidCache(filePath, content)) {
        log(`캐시에서 로드: ${filePath}`, 'cyan')
        return this.cacheManager.getCachedResult(filePath)
      }
      
      let convertedContent = content
      let hasChanges = false
      
      // 1단계: import.meta.env 변환 (순서 중요 - 구체적인 패턴부터)
      const originalImportMetaCount = (convertedContent.match(/import\.meta\.env/g) || []).length
      if (originalImportMetaCount > 0) {
        log(`변환 전 import.meta.env 개수: ${originalImportMetaCount}`, 'cyan')
        
        // VITE_ 변수들 먼저 처리 (가장 구체적)
        convertedContent = convertedContent.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.VITE_$1')
        
        // 특수 변수들 처리
        convertedContent = convertedContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV')
        convertedContent = convertedContent.replace(/import\.meta\.env\.DEV/g, 'process.env.NODE_ENV === "development"')
        convertedContent = convertedContent.replace(/import\.meta\.env\.PROD/g, 'process.env.NODE_ENV === "production"')
        
        // 일반 환경 변수들 처리
        convertedContent = convertedContent.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1')
        
        // 나머지 import.meta.env 처리
        convertedContent = convertedContent.replace(/import\.meta\.env/g, 'process.env')
        
        const newProcessEnvCount = (convertedContent.match(/process\.env/g) || []).length
        log(`변환 후 process.env 개수: ${newProcessEnvCount}`, 'cyan')
        
        if (convertedContent !== content) {
          hasChanges = true
        }
      }

      // 2단계: import/export 변환 (필요한 경우에만)
      if (this.needsImportExportConversion(convertedContent)) {
        // 기본 import 변환
        convertedContent = convertedContent.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\').default')
        
        // 명명된 import 변환
        convertedContent = convertedContent.replace(/import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require(\'$2\')')
        
        // 네임스페이스 import 변환
        convertedContent = convertedContent.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\')')
        
        // 기본 export 변환
        convertedContent = convertedContent.replace(/export\s+default\s+([^;]+)/g, 'module.exports.default = $1')
        
        // 명명된 export 변환
        convertedContent = convertedContent.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match: string, exports: string) => {
          return exports.split(',').map(exp => {
            exp = exp.trim()
            return `module.exports.${exp} = ${exp}`
          }).join('\n')
        })
        
        hasChanges = true
      }

      // 3단계: 브라우저 API polyfill 추가 (필요한 경우에만)
      if (this.needsBrowserPolyfill(convertedContent)) {
        const polyfill = this.generateBrowserPolyfill()
        convertedContent = polyfill + convertedContent
        hasChanges = true
      }
      
      // 변환이 실제로 일어났는지 확인
      if (!hasChanges) {
        log(`변환이 필요하지 않음: ${path.relative(process.cwd(), filePath)}`, 'yellow')
        return content
      }
      
      // 캐시에 저장
      this.cacheManager.setCache(filePath, content, convertedContent)
      
      log(`변환 완료: ${path.relative(process.cwd(), filePath)}`, 'green')
      log(`변환된 내용 길이: ${convertedContent.length}`, 'green')
      log(`변환 여부: ${content !== convertedContent ? '변환됨' : '변환되지 않음'}`, 'yellow')
      
      return convertedContent
    } catch (error) {
      logError(`파일 변환 실패: ${filePath} - ${(error as Error).message}`)
      return null
    }
  }

  /**
   * 이미 변환된 파일인지 확인
   */
  private isAlreadyConverted(content: string): boolean {
    // 이미 process.env를 사용하고 있고 import.meta.env가 없으면 변환됨
    const hasProcessEnv = content.includes('process.env')
    const hasImportMeta = content.includes('import.meta.env')
    
    return hasProcessEnv && !hasImportMeta
  }

  /**
   * import/export 변환이 필요한지 확인
   */
  private needsImportExportConversion(content: string): boolean {
    return content.includes('import ') || content.includes('export ')
  }

  /**
   * 브라우저 polyfill이 필요한지 확인
   */
  private needsBrowserPolyfill(content: string): boolean {
    const browserAPIs = ['window', 'document', 'localStorage', 'sessionStorage', 'navigator']
    return browserAPIs.some(api => content.includes(api))
  }

  /**
   * 브라우저 API polyfill 생성
   */
  private generateBrowserPolyfill(): string {
    return `// Browser API polyfills for Node.js environment
if (typeof window === 'undefined') {
  global.window = global.window || {}
  global.document = global.document || {}
  global.localStorage = global.localStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.sessionStorage = global.sessionStorage || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
  global.File = global.File || class File {}
  global.StorageEvent = global.StorageEvent || class StorageEvent {}
  global.requestAnimationFrame = global.requestAnimationFrame || (cb => setTimeout(cb, 16))
}

`
  }

  /**
   * 병렬 파일 변환 (개선된 버전 - 중복 제거 및 메모리 최적화)
   */
  async convertFilesParallel(filePaths: string[]): Promise<{ results: Map<string, ConversionResult>, errors: Map<string, Error> }> {
    // 중복 파일 제거
    const uniqueFilePaths = Array.from(new Set(filePaths))
    log(`중복 제거: ${filePaths.length} → ${uniqueFilePaths.length}개 파일`, 'cyan')
    
    const processor = new ParallelProcessor(2) // 워커 수 제한으로 메모리 사용량 조절
    
    return await processor.processFiles(uniqueFilePaths, async (filePath: string): Promise<ConversionResult> => {
      try {
        // 메모리 사용량 체크
        if (process.memoryUsage().heapUsed > 200 * 1024 * 1024) { // 200MB
          logWarning('메모리 사용량이 높습니다. 잠시 대기...')
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const result = this.convertFile(filePath)
        if (result) {
          return { filePath, content: result, success: true }
        } else {
          throw new Error(`변환 실패: ${filePath}`)
        }
      } catch (error) {
        throw error
      }
    })
  }
}

/**
 * 빌드 통합 클래스 (최적화 버전)
 */
class BuildIntegrator {
  private projectRoot: string
  private tempDir: string
  private backupDir: string
  private cacheManager: CacheManager
  private memoryManager: MemoryManager
  private rollbackStack: RollbackItem[]

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.tempDir = path.join(projectRoot, '.temp-conversion')
    this.backupDir = path.join(projectRoot, '.backup-original')
    this.cacheManager = new CacheManager(projectRoot)
    this.memoryManager = new MemoryManager()
    this.rollbackStack = []
  }

  /**
   * 변환 프로세스 실행 (수정된 버전)
   */
  async executeConversion(conversionTargets: string[]): Promise<ConversionResponse> {
    logStep('CONVERT', '코드 변환 시작...')
    
    try {
      // 임시 디렉토리 생성
      this.createTempDirectories()
      
      // 백업 생성
      await this.createBackup(conversionTargets)
      
      // 병렬 파일 변환
      const converter = new CodeConverter(this.cacheManager)
      const { results, errors } = await converter.convertFilesParallel(conversionTargets)
      
      let successCount = 0
      let failCount = 0
      
      // 변환된 파일을 즉시 원본에 적용 (수정된 버전)
      for (const [filePath, result] of Array.from(results.entries())) {
        try {
          const tempPath = this.getTempPath(filePath)
          this.ensureDirectoryExists(path.dirname(tempPath))
          
          // 변환된 내용을 임시 파일에 저장
          fs.writeFileSync(tempPath, result.content)
          log(`임시 파일 저장됨: ${path.relative(this.projectRoot, tempPath)}`, 'cyan')
          
          // 롤백 스택에 추가
          this.rollbackStack.push({
            original: filePath,
            backup: this.getBackupPath(filePath),
            temp: tempPath
          })
          
          // 즉시 원본 파일에 적용 (강제 적용)
          try {
            const originalContent = fs.readFileSync(filePath, 'utf8')
            log(`원본 내용 길이: ${originalContent.length}`, 'cyan')
            log(`변환된 내용 길이: ${result.content.length}`, 'cyan')
            log(`변환 여부: ${originalContent !== result.content ? '변환됨' : '변환되지 않음'}`, 'yellow')
            
            // 항상 변환된 내용을 원본에 적용 (강제 적용)
            const backupPath = filePath + '.backup-' + Date.now()
            fs.copyFileSync(filePath, backupPath)
            log(`백업 생성됨: ${backupPath}`, 'cyan')
            
            // 변환된 내용을 원본에 직접 적용
            fs.writeFileSync(filePath, result.content)
            log(`✅ 원본 파일 적용됨: ${path.relative(this.projectRoot, filePath)}`, 'green')
            
            // 적용 확인
            const appliedContent = fs.readFileSync(filePath, 'utf8')
            log(`적용 후 내용 길이: ${appliedContent.length}`, 'cyan')
            log(`적용 성공 여부: ${appliedContent === result.content ? '성공' : '실패'}`, appliedContent === result.content ? 'green' : 'red')
            
            // 적용 성공 시 백업 파일 삭제
            if (appliedContent === result.content && fs.existsSync(backupPath)) {
              fs.unlinkSync(backupPath)
              log(`백업 파일 삭제됨: ${backupPath}`, 'cyan')
            } else if (fs.existsSync(backupPath)) {
              log(`적용 실패로 백업 파일 유지: ${backupPath}`, 'yellow')
            }
          } catch (immediateError) {
            logError(`즉시 적용 실패: ${filePath} - ${(immediateError as Error).message}`)
            logError(`에러 스택: ${(immediateError as Error).stack}`)
            failCount++
            continue
          }
          
          successCount++
        } catch (error) {
          logError(`파일 저장 실패: ${filePath} - ${(error as Error).message}`)
          failCount++
        }
      }
      
      // 에러 처리
      for (const [filePath, error] of Array.from(errors.entries())) {
        logError(`변환 실패: ${filePath} - ${error.message}`)
        failCount++
      }
      
      // 메모리 정리
      this.memoryManager.checkMemoryUsage()
      
      logSuccess(`변환 완료: 성공 ${successCount}개, 실패 ${failCount}개`)
      
      return { successCount, failCount, results, errors }
    } catch (error) {
      logError(`변환 프로세스 실패: ${(error as Error).message}`)
      await this.emergencyRollback()
      throw error
    }
  }

  /**
   * 임시 디렉토리 생성
   */
  private createTempDirectories(): void {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true })
    }
    if (fs.existsSync(this.backupDir)) {
      fs.rmSync(this.backupDir, { recursive: true })
    }
    
    fs.mkdirSync(this.tempDir, { recursive: true })
    fs.mkdirSync(this.backupDir, { recursive: true })
  }

  /**
   * 백업 생성
   */
  private async createBackup(conversionTargets: string[]): Promise<void> {
    logStep('BACKUP', '원본 파일 백업 중...')
    
    for (const filePath of conversionTargets) {
      const backupPath = this.getBackupPath(filePath)
      this.ensureDirectoryExists(path.dirname(backupPath))
      fs.copyFileSync(filePath, backupPath)
    }
    
    logSuccess('백업 완료')
  }

  /**
   * 변환된 파일을 원본으로 복사 (수정된 버전)
   */
  async applyConversions(): Promise<void> {
    logStep('APPLY', '변환된 파일을 원본으로 적용...')
    
    try {
      log(`롤백 스택 크기: ${this.rollbackStack.length}`, 'blue')
      
      if (this.rollbackStack.length === 0) {
        logWarning('적용할 변환된 파일이 없습니다.')
        return
      }
      
      for (const rollbackItem of this.rollbackStack) {
        const { original, temp } = rollbackItem
        
        log(`처리 중: ${path.relative(this.projectRoot, original)}`, 'cyan')
        log(`임시 파일 존재: ${fs.existsSync(temp)}`, 'cyan')
        log(`임시 파일 경로: ${temp}`, 'cyan')
        
        if (fs.existsSync(temp)) {
          // 원본 파일 백업 (안전장치)
          const backupPath = original + '.backup'
          if (fs.existsSync(original)) {
            fs.copyFileSync(original, backupPath)
          }
          
          // 임시 파일을 원본으로 복사
          fs.copyFileSync(temp, original)
          log(`✅ 적용됨: ${path.relative(this.projectRoot, original)}`, 'green')
          
          // 백업 파일 삭제 (성공 시)
          if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath)
          }
        } else {
          log(`❌ 임시 파일 없음: ${path.relative(this.projectRoot, temp)}`, 'red')
        }
      }
      
      logSuccess('변환 적용 완료')
    } catch (error) {
      logError(`변환 적용 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 빌드 실행
   */
  async executeBuild(): Promise<boolean> {
    logStep('BUILD', '변환된 코드로 빌드 실행...')
    
    try {
      // 백엔드 빌드 실행
      execSync('npm run build:backend:production', { 
        stdio: 'inherit',
        cwd: this.projectRoot,
        timeout: 300000 // 5분
      })
      
      // 프론트엔드 빌드 실행
      execSync('npm run build:production', { 
        stdio: 'inherit',
        cwd: this.projectRoot,
        timeout: 300000 // 5분
      })
      
      // 빌드 후 파일 확장자를 .cjs로 변경
      await this.renameToCjs()
      
      // dist 폴더 구조 정리
      await this.organizeDistStructure()
      
      logSuccess('빌드 완료')
      return true
    } catch (error) {
      logError(`빌드 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 빌드된 파일들을 .cjs 확장자로 변경하고 require 경로 수정
   */
  private async renameToCjs(): Promise<void> {
    logStep('RENAME', '파일 확장자를 .cjs로 변경하고 require 경로 수정...')
    
    try {
      const distPath = path.join(this.projectRoot, 'dist')
      if (!fs.existsSync(distPath)) {
        logWarning('dist 폴더가 존재하지 않습니다.')
        return
      }
      
      // dist 폴더의 모든 .js 파일을 .cjs로 변경
      const renameFiles = (dir: string) => {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const itemPath = path.join(dir, item)
          const stat = fs.statSync(itemPath)
          
          if (stat.isDirectory()) {
            renameFiles(itemPath)
          } else if (item.endsWith('.js')) {
            const newPath = itemPath.replace('.js', '.cjs')
            fs.renameSync(itemPath, newPath)
            log(`✅ 변경됨: ${path.relative(this.projectRoot, itemPath)} → ${path.relative(this.projectRoot, newPath)}`, 'green')
          }
        }
      }
      
      renameFiles(distPath)
      logSuccess('파일 확장자 변경 완료')
      
      // require 경로 수정
      await this.fixRequirePaths()
      
    } catch (error) {
      logError(`파일 확장자 변경 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 모든 .cjs 파일의 require 경로를 .cjs 확장자로 수정
   */
  private async fixRequirePaths(): Promise<void> {
    logStep('FIX_REQUIRES', 'require 경로를 .cjs 확장자로 수정...')
    
    try {
      const distPath = path.join(this.projectRoot, 'dist')
      if (!fs.existsSync(distPath)) {
        logWarning('dist 폴더가 존재하지 않습니다.')
        return
      }
      
      const fixRequiresInFile = (filePath: string): void => {
        const content = fs.readFileSync(filePath, 'utf8')
        let modifiedContent = content
        
        // require("./module") -> require("./module.cjs")
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)\.js"\)/g, 'require("./$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)"\)/g, 'require("./$1.cjs")')
        
        // require("../module") -> require("../module.cjs")
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)\.js"\)/g, 'require("../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)"\)/g, 'require("../$1.cjs")')
        
        // require("../../module") -> require("../../module.cjs")
        modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/([^"]+)\.js"\)/g, 'require("../../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/([^"]+)"\)/g, 'require("../../$1.cjs")')
        
        // require("../../../module") -> require("../../../module.cjs")
        modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/\.\.\/([^"]+)\.js"\)/g, 'require("../../../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/\.\.\/([^"]+)"\)/g, 'require("../../../$1.cjs")')
        
        if (modifiedContent !== content) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8')
          log(`✅ require 경로 수정됨: ${path.relative(this.projectRoot, filePath)}`, 'green')
        }
      }
      
      const processFiles = (dir: string): void => {
        const items = fs.readdirSync(dir)
        
        for (const item of items) {
          const itemPath = path.join(dir, item)
          const stat = fs.statSync(itemPath)
          
          if (stat.isDirectory()) {
            processFiles(itemPath)
          } else if (item.endsWith('.cjs')) {
            fixRequiresInFile(itemPath)
          }
        }
      }
      
      processFiles(distPath)
      logSuccess('require 경로 수정 완료')
    } catch (error) {
      logError(`require 경로 수정 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * dist 폴더 구조 정리
   */
  private async organizeDistStructure(): Promise<void> {
    logStep('ORGANIZE', 'dist 폴더 구조 정리...')
    
    try {
      const distPath = path.join(this.projectRoot, 'dist')
      if (!fs.existsSync(distPath)) {
        logWarning('dist 폴더가 존재하지 않습니다.')
        return
      }
      
      // shared 폴더를 dist 루트로 이동
      const backendSharedPath = path.join(distPath, 'backend', 'shared')
      const distSharedPath = path.join(distPath, 'shared')
      
      if (fs.existsSync(backendSharedPath)) {
        if (fs.existsSync(distSharedPath)) {
          fs.rmSync(distSharedPath, { recursive: true, force: true })
        }
        fs.renameSync(backendSharedPath, distSharedPath)
        log('✅ shared 폴더를 dist 루트로 이동', 'green')
      }
      
      // data 폴더 생성 (src/data 복사)
      const srcDataPath = path.join(this.projectRoot, 'src', 'data')
      const distDataPath = path.join(distPath, 'data')
      
      if (fs.existsSync(srcDataPath)) {
        if (fs.existsSync(distDataPath)) {
          fs.rmSync(distDataPath, { recursive: true, force: true })
        }
        fs.cpSync(srcDataPath, distDataPath, { recursive: true })
        log('✅ data 폴더 복사 완료', 'green')
      }
      
      // 프론트엔드 파일들을 frontend 폴더로 정리
      const frontendPath = path.join(distPath, 'frontend')
      if (!fs.existsSync(frontendPath)) {
        fs.mkdirSync(frontendPath, { recursive: true })
      }
      
      // assets, js, css 파일들을 frontend 폴더로 이동
      const items = fs.readdirSync(distPath)
      for (const item of items) {
        const itemPath = path.join(distPath, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isFile() && (item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.js'))) {
          const newPath = path.join(frontendPath, item)
          fs.renameSync(itemPath, newPath)
          log(`✅ 프론트엔드 파일 이동: ${item}`, 'green')
        } else if (stat.isDirectory() && (item === 'assets' || item === 'js' || item === 'fonts' || item === 'img' || item === 'video')) {
          const newPath = path.join(frontendPath, item)
          if (fs.existsSync(newPath)) {
            fs.rmSync(newPath, { recursive: true, force: true })
          }
          fs.renameSync(itemPath, newPath)
          log(`✅ 프론트엔드 폴더 이동: ${item}`, 'green')
        }
      }
      
      logSuccess('dist 폴더 구조 정리 완료')
    } catch (error) {
      logError(`dist 폴더 구조 정리 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 롤백 실행 (최적화 버전)
   */
  async rollback(): Promise<void> {
    logStep('ROLLBACK', '원본 코드로 롤백 중...')
    
    try {
      // 롤백 스택을 역순으로 처리
      for (let i = this.rollbackStack.length - 1; i >= 0; i--) {
        const item = this.rollbackStack[i]
        try {
          if (fs.existsSync(item.backup)) {
            fs.copyFileSync(item.backup, item.original)
            log(`롤백 완료: ${item.original}`, 'green')
          }
        } catch (error) {
          logError(`롤백 실패: ${item.original} - ${(error as Error).message}`)
        }
      }
      
      this.rollbackStack = []
      logSuccess('롤백 완료')
    } catch (error) {
      logError(`롤백 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 긴급 롤백 (에러 발생 시)
   */
  async emergencyRollback(): Promise<void> {
    logStep('EMERGENCY_ROLLBACK', '긴급 롤백 실행...')
    
    try {
      await this.rollback()
      logSuccess('긴급 롤백 완료')
    } catch (error) {
      logError(`긴급 롤백 실패: ${(error as Error).message}`)
      // 최후의 수단: 백업 파일들을 직접 복원
      await this.forceRestoreFromBackups()
    }
  }

  /**
   * 백업 파일에서 강제 복원
   */
  private async forceRestoreFromBackups(): Promise<void> {
    logStep('FORCE_RESTORE', '백업 파일에서 강제 복원...')
    
    try {
      const backupFiles = this.getBackupFiles()
      
      for (const backupFile of backupFiles) {
        const originalFile = this.getOriginalPath(backupFile)
        
        if (fs.existsSync(backupFile) && fs.existsSync(originalFile)) {
          fs.copyFileSync(backupFile, originalFile)
          log(`복원됨: ${path.relative(this.projectRoot, originalFile)}`, 'green')
        }
      }
      
      logSuccess('강제 복원 완료')
    } catch (error) {
      logError(`강제 복원 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 롤백 스택 크기 반환 (public 메서드)
   */
  getRollbackStackSize(): number {
    return this.rollbackStack.length
  }

  /**
   * 정리 작업 (최적화 버전)
   */
  cleanup(): void {
    logStep('CLEANUP', '임시 파일 정리 중...')
    
    try {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true })
      }
      if (fs.existsSync(this.backupDir)) {
        fs.rmSync(this.backupDir, { recursive: true })
      }
      
      // 캐시 정리 (선택적)
      if (this.shouldCleanCache()) {
        this.cacheManager.clearCache()
        log('캐시 정리 완료', 'cyan')
      }
      
      // 메모리 정리
      this.memoryManager.forceGC()
      
      logSuccess('정리 완료')
    } catch (error) {
      logWarning(`정리 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 캐시 정리 여부 확인
   */
  private shouldCleanCache(): boolean {
    // 24시간 이상 된 캐시는 정리
    const cacheDir = this.cacheManager.getCacheDir()
    if (!fs.existsSync(cacheDir)) return false
    
    try {
      const stats = fs.statSync(cacheDir)
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000
      return (now - stats.mtime.getTime()) > dayInMs
    } catch {
      return false
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private getTempPath(filePath: string): string {
    const relativePath = path.relative(this.projectRoot, filePath)
    return path.join(this.tempDir, relativePath)
  }

  private getBackupPath(filePath: string): string {
    const relativePath = path.relative(this.projectRoot, filePath)
    return path.join(this.backupDir, relativePath)
  }

  private getBackupFiles(): string[] {
    const files: string[] = []
    this.scanDirectory(this.backupDir, files)
    return files
  }

  private getOriginalPath(backupPath: string): string {
    const relativePath = path.relative(this.backupDir, backupPath)
    return path.join(this.projectRoot, relativePath)
  }

  private scanDirectory(dir: string, files: string[]): void {
    if (!fs.existsSync(dir)) return

    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, files)
      } else {
        files.push(fullPath)
      }
    }
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

/**
 * 메인 변환 프로세스 (최적화 버전)
 */
async function main(): Promise<void> {
  const startTime = Date.now()
  
  try {
    log('🚀 JS to CJS 변환을 시작합니다... (최적화 버전)', 'bright')
    
    const projectRoot = process.cwd()
    
    // 1. 파일 분석 (비동기)
    const analyzer = new FileAnalyzer(projectRoot)
    await analyzer.scanProject()
    
    const conversionTargets = analyzer.getConversionTargets()
    
    if (conversionTargets.length === 0) {
      logSuccess('변환이 필요한 파일이 없습니다.')
      return
    }
    
    log(`변환 대상: ${conversionTargets.length}개 파일`, 'blue')
    
    // 2. 코드 변환 (병렬 처리)
    const integrator = new BuildIntegrator(projectRoot)
    log('변환 실행 시작...', 'cyan')
    
    try {
      log('🔍 executeConversion 호출 시작...', 'cyan')
      
      // 변환 전 메모리 상태 확인
      const initialMemory = process.memoryUsage()
      log(`초기 메모리 사용량: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`, 'blue')
      
      const { successCount, failCount, results, errors } = await integrator.executeConversion(conversionTargets)
      log(`변환 결과: 성공 ${successCount}개, 실패 ${failCount}개`, 'cyan')
      log(`롤백 스택 크기: ${integrator.getRollbackStackSize()}`, 'blue')
      
      // 변환 후 메모리 상태 확인
      const finalMemory = process.memoryUsage()
      log(`최종 메모리 사용량: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`, 'blue')
      log(`메모리 증가량: ${Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024)}MB`, 'blue')
      
      if (failCount > 0) {
        logWarning(`${failCount}개 파일 변환 실패`)
        
        // 에러가 많으면 롤백 (임계값 조정)
        const failureRate = failCount / conversionTargets.length
        if (failureRate > 0.3) { // 30% 이상 실패 시 롤백
          logError(`변환 실패율이 높습니다 (${Math.round(failureRate * 100)}%). 롤백을 실행합니다.`)
          await integrator.rollback()
          process.exit(1)
        }
      }
      
      // 3. 변환된 파일 적용 확인 (이미 executeConversion에서 적용됨)
      logStep('APPLY', '변환된 파일 적용 상태 확인...')
      log(`롤백 스택 크기: ${integrator.getRollbackStackSize()}`, 'blue')
      
      // 변환 결과가 있는지 확인
      if (results && results.size > 0) {
        log(`변환된 파일 수: ${results.size}`, 'blue')
        logSuccess('변환된 파일이 이미 원본에 적용되었습니다!')
      } else {
        logWarning('변환된 파일이 없습니다.')
      }
      
    } catch (error) {
      logError(`변환 실행 중 에러: ${(error as Error).message}`)
      logError(`에러 스택: ${(error as Error).stack}`)
      throw error
    }
    
    // 4. 빌드 실행
    const buildSuccess = await integrator.executeBuild()
    
    if (!buildSuccess) {
      logError('빌드 실패, 롤백을 실행합니다.')
      await integrator.rollback()
      process.exit(1)
    }
    
    // 4. 정리
    integrator.cleanup()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    logSuccess(`JS to CJS 변환이 완료되었습니다! (소요시간: ${duration}초)`)
    logSuccess('🎉 모든 작업이 성공적으로 완료되었습니다!')
    log('='.repeat(60), 'green')
    log('스크립트가 정상적으로 종료됩니다.', 'green')
    log('='.repeat(60), 'green')
    
    // 명시적 종료
    process.exit(0)
    
  } catch (error) {
    logError(`변환 프로세스 실패: ${(error as Error).message}`)
    logError(`에러 스택: ${(error as Error).stack}`)
    
    // 긴급 롤백 시도
    try {
      const integrator = new BuildIntegrator(process.cwd())
      await integrator.emergencyRollback()
    } catch (rollbackError) {
      logError(`긴급 롤백도 실패: ${(rollbackError as Error).message}`)
      logError(`롤백 에러 스택: ${(rollbackError as Error).stack}`)
    }
    
    log('='.repeat(60), 'red')
    log('스크립트가 오류로 인해 종료됩니다.', 'red')
    log('='.repeat(60), 'red')
    
    process.exit(1)
  }
}

// === ESM/CJS 모두에서 "직접 실행"을 감지하는 안전한 진입점 ===
async function runIfMain() {
  // ESM: import.meta.url -> 파일 경로
  try {
    const __filename = fileURLToPath(import.meta.url)
    // process.argv[1]은 node 실행시 첫 번째 인자로 넘어온 스크립트 경로
    if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
      await main()
      return
    }
  } catch (e) {
    // import.meta가 없는 CJS 환경에서 무시
  }

  // CJS 환경에서의 기존 검사 (require가 정의되어 있으면 사용)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // require가 없는 ESM 환경에서는 ReferenceError가 발생하므로 try/catch로 감싼다
    // @ts-ignore
    if (typeof require !== 'undefined' && require.main === module) {
      await main()
      return
    }
  } catch { /* ignore */ }
}

// 즉시 실행
runIfMain().catch(err => {
  logError(`실행 실패(진입점): ${(err as Error).message}`)
  process.exit(1)
})

export {
  FileAnalyzer,
  CodeConverter,
  BuildIntegrator,
  CacheManager,
  ParallelProcessor,
  MemoryManager,
  main
}
