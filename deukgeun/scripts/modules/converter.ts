/**
 * 코드 변환 모듈
 * ES 모듈을 CommonJS로 변환하는 공통 로직
 */

import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo } from './logger'

interface ConversionRule {
  pattern: RegExp
  replacement: string | ((match: string, ...args: string[]) => string)
  description: string
}

interface ConversionRules {
  importMeta: ConversionRule[]
  imports: ConversionRule[]
  exports: ConversionRule[]
}

interface ConverterOptions {
  backup?: boolean
  validate?: boolean
  polyfill?: boolean
}

interface ConversionResult {
  success: boolean
  converted?: boolean
  content?: string
  originalContent?: string
  error?: string
  details?: string[]
  changes?: {
    importMeta: number
    imports: number
    exports: number
  }
}

interface ConversionStats {
  total: number
  success: number
  failed: number
  converted: number
  skipped: number
  changes: {
    importMeta: number
    imports: number
    exports: number
  }
}

/**
 * 코드 변환기 클래스
 */
export class CodeConverter {
  private options: ConverterOptions
  private conversionRules: ConversionRules

  constructor(options: ConverterOptions = {}) {
    this.options = {
      backup: true,
      validate: true,
      polyfill: true,
      ...options
    }
    
    this.conversionRules = this.initializeConversionRules()
  }

  /**
   * 변환 규칙 초기화
   */
  private initializeConversionRules(): ConversionRules {
    return {
      // import.meta 변환 (우선순위 높음)
      importMeta: [
        {
          pattern: /import\.meta\.env\.VITE_([A-Z_]+)/g,
          replacement: 'process.env.VITE_$1',
          description: 'VITE_ 환경 변수'
        },
        {
          pattern: /import\.meta\.env\.([A-Z_]+)/g,
          replacement: 'process.env.$1',
          description: '일반 환경 변수'
        },
        {
          pattern: /import\.meta\.env\.MODE/g,
          replacement: 'process.env.NODE_ENV',
          description: 'MODE 환경 변수'
        },
        {
          pattern: /import\.meta\.env\.DEV/g,
          replacement: 'process.env.NODE_ENV === "development"',
          description: 'DEV 환경 변수'
        },
        {
          pattern: /import\.meta\.env\.PROD/g,
          replacement: 'process.env.NODE_ENV === "production"',
          description: 'PROD 환경 변수'
        },
        {
          pattern: /import\.meta\.env/g,
          replacement: 'process.env',
          description: 'import.meta.env'
        }
      ],
      
      // ES import 변환
      imports: [
        {
          pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
          replacement: 'const $1 = require(\'$2\').default',
          description: '기본 import'
        },
        {
          pattern: /import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
          replacement: 'const { $1 } = require(\'$2\')',
          description: '명명된 import'
        },
        {
          pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
          replacement: 'const $1 = require(\'$2\')',
          description: '네임스페이스 import'
        }
      ],
      
      // ES export 변환
      exports: [
        {
          pattern: /export\s+default\s+([^;]+)/g,
          replacement: 'module.exports.default = $1',
          description: '기본 export'
        },
        {
          pattern: /export\s*\{\s*([^}]+)\s*\}/g,
          replacement: (match: string, exports: string) => {
            return exports.split(',').map(exp => {
              exp = exp.trim()
              if (exp.includes(' as ')) {
                const [original, alias] = exp.split(' as ').map(s => s.trim())
                return `module.exports.${alias} = ${original}`
              }
              return `module.exports.${exp} = ${exp}`
            }).join('\n')
          },
          description: '명명된 export'
        }
      ]
    }
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
  global.cancelAnimationFrame = global.cancelAnimationFrame || (id => clearTimeout(id))
  global.navigator = global.navigator || { userAgent: 'Node.js' }
  global.location = global.location || { href: 'file://', origin: 'file://' }
}

`
  }

  /**
   * 파일 변환
   */
  convertFile(filePath: string, options: ConverterOptions = {}): ConversionResult {
    const mergedOptions = { ...this.options, ...options }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const originalContent = content
      
      logInfo(`변환 시작: ${path.relative(process.cwd(), filePath)}`)
      
      // 변환 필요성 확인
      if (!this.needsConversion(content)) {
        logInfo(`변환 불필요: ${path.relative(process.cwd(), filePath)}`)
        return { success: true, converted: false, content }
      }
      
      let convertedContent = content
      let hasChanges = false
      
      // 1. import.meta 변환 (우선순위)
      for (const rule of this.conversionRules.importMeta) {
        const before = convertedContent
        convertedContent = convertedContent.replace(rule.pattern, rule.replacement as string)
        if (before !== convertedContent) {
          hasChanges = true
          logInfo(`import.meta 변환: ${rule.description}`)
        }
      }
      
      // 2. import 변환
      for (const rule of this.conversionRules.imports) {
        const before = convertedContent
        convertedContent = convertedContent.replace(rule.pattern, rule.replacement as string)
        if (before !== convertedContent) {
          hasChanges = true
          logInfo(`import 변환: ${rule.description}`)
        }
      }
      
      // 3. export 변환
      for (const rule of this.conversionRules.exports) {
        const before = convertedContent
        if (typeof rule.replacement === 'function') {
          convertedContent = convertedContent.replace(rule.pattern, rule.replacement as any)
        } else {
          convertedContent = convertedContent.replace(rule.pattern, rule.replacement)
        }
        if (before !== convertedContent) {
          hasChanges = true
          logInfo(`export 변환: ${rule.description}`)
        }
      }
      
      // 4. 브라우저 API polyfill 추가
      if (mergedOptions.polyfill && this.needsBrowserPolyfill(convertedContent)) {
        const polyfill = this.generateBrowserPolyfill()
        convertedContent = polyfill + convertedContent
        hasChanges = true
        logInfo('브라우저 API polyfill 추가')
      }
      
      // 5. 변환 검증
      if (mergedOptions.validate && hasChanges) {
        const validation = this.validateConversion(convertedContent)
        if (!validation.valid) {
          logWarning(`변환 검증 실패: ${validation.errors.join(', ')}`)
          return { success: false, error: 'validation_failed', details: validation.errors }
        }
      }
      
      logSuccess(`변환 완료: ${path.relative(process.cwd(), filePath)} (변경: ${hasChanges})`)
      
      return { 
        success: true, 
        converted: hasChanges, 
        content: convertedContent,
        originalContent,
        changes: {
          importMeta: this.countMatches(originalContent, /import\.meta/g),
          imports: this.countMatches(originalContent, /import\s/g),
          exports: this.countMatches(originalContent, /export\s/g)
        }
      }
      
    } catch (error) {
      logError(`파일 변환 실패: ${filePath} - ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 변환 필요성 확인
   */
  private needsConversion(content: string): boolean {
    const esModuleIndicators = [
      /import\s+.*\s+from\s+['"]/,
      /export\s+(default\s+)?/,
      /import\.meta/,
      /import\s*\(/
    ]
    
    return esModuleIndicators.some(pattern => pattern.test(content))
  }

  /**
   * 브라우저 API polyfill 필요성 확인
   */
  private needsBrowserPolyfill(content: string): boolean {
    const browserAPIs = ['window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'location']
    return browserAPIs.some(api => content.includes(api))
  }

  /**
   * 변환 검증
   */
  private validateConversion(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // import.meta가 남아있는지 확인
    if (content.includes('import.meta')) {
      errors.push('import.meta가 변환되지 않음')
    }
    
    // ES import가 남아있는지 확인
    if (/import\s+.*\s+from\s+['"]/.test(content)) {
      errors.push('ES import가 남아있음')
    }
    
    // ES export가 남아있는지 확인
    if (/export\s+(default\s+)?/.test(content)) {
      errors.push('ES export가 남아있음')
    }
    
    // 파일 크기 확인
    if (content.length < 50) {
      errors.push('파일 크기가 너무 작음')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 패턴 매치 개수 계산
   */
  private countMatches(content: string, pattern: RegExp): number {
    const matches = content.match(pattern)
    return matches ? matches.length : 0
  }

  /**
   * 여러 파일 변환
   */
  convertFiles(filePaths: string[], options: ConverterOptions = {}): {
    success: Array<{ file: string; converted: boolean; changes?: any }>
    failed: Array<{ file: string; error: string; details?: string[] }>
    total: number
  } {
    const results = {
      success: [] as Array<{ file: string; converted: boolean; changes?: any }>,
      failed: [] as Array<{ file: string; error: string; details?: string[] }>,
      total: filePaths.length
    }
    
    for (const filePath of filePaths) {
      const result = this.convertFile(filePath, options)
      
      if (result.success) {
        results.success.push({
          file: filePath,
          converted: result.converted || false,
          changes: result.changes
        })
      } else {
        results.failed.push({
          file: filePath,
          error: result.error || 'unknown_error',
          details: result.details
        })
      }
    }
    
    return results
  }

  /**
   * 변환 통계 생성
   */
  generateStats(results: ReturnType<CodeConverter['convertFiles']>): ConversionStats {
    const stats: ConversionStats = {
      total: results.total,
      success: results.success.length,
      failed: results.failed.length,
      converted: results.success.filter(r => r.converted).length,
      skipped: results.success.filter(r => !r.converted).length,
      changes: {
        importMeta: 0,
        imports: 0,
        exports: 0
      }
    }
    
    // 변경사항 통계
    results.success.forEach(result => {
      if (result.changes) {
        stats.changes.importMeta += result.changes.importMeta || 0
        stats.changes.imports += result.changes.imports || 0
        stats.changes.exports += result.changes.exports || 0
      }
    })
    
    return stats
  }

  /**
   * 변환 결과 보고
   */
  printReport(results: ReturnType<CodeConverter['convertFiles']>): void {
    const stats = this.generateStats(results)
    
    logInfo(`\n📊 변환 결과:`)
    logInfo(`- 총 파일: ${stats.total}개`)
    logInfo(`- 성공: ${stats.success}개`)
    logInfo(`- 실패: ${stats.failed}개`)
    logInfo(`- 변환됨: ${stats.converted}개`)
    logInfo(`- 건너뜀: ${stats.skipped}개`)
    
    if (stats.changes.importMeta > 0 || stats.changes.imports > 0 || stats.changes.exports > 0) {
      logInfo(`\n🔄 변환 내용:`)
      if (stats.changes.importMeta > 0) logInfo(`- import.meta: ${stats.changes.importMeta}개`)
      if (stats.changes.imports > 0) logInfo(`- import: ${stats.changes.imports}개`)
      if (stats.changes.exports > 0) logInfo(`- export: ${stats.changes.exports}개`)
    }
    
    if (results.failed.length > 0) {
      logWarning(`\n❌ 실패한 파일들:`)
      results.failed.forEach(failure => {
        logError(`- ${path.relative(process.cwd(), failure.file)}: ${failure.error}`)
      })
    }
  }
}
