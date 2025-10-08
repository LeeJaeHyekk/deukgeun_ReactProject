/**
 * 함수형 코드 변환 모듈
 * ES Modules를 CommonJS로 변환하는 공통 기능
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { logError, logWarning, logSuccess, logInfo } from './logger-functions'
import { fileExists, readFile, writeFile, createBackup, copyFile, scanDirectory } from './file-functions'

interface ConversionOptions {
  backup: boolean
  validate: boolean
  polyfill: boolean
  parallel: boolean
  maxWorkers?: number
}

interface ConversionResult {
  success: boolean
  converted: boolean
  filePath: string
  content?: string
  error?: string
}

interface ConversionReport {
  total: number
  success: ConversionResult[]
  failed: ConversionResult[]
}

interface ConversionRule {
  pattern: RegExp
  replacement: string | ((match: string, ...args: string[]) => string)
  priority: number
}

/**
 * 변환 규칙 초기화
 */
function initializeConversionRules(): ConversionRule[] {
  return [
    // import.meta 변환 (우선순위 높음)
    {
      pattern: /import\.meta\.env\.VITE_([A-Z_]+)/g,
      replacement: 'process.env.VITE_$1',
      priority: 1
    },
    {
      pattern: /import\.meta\.env\.([A-Z_]+)/g,
      replacement: 'process.env.$1',
      priority: 2
    },
    {
      pattern: /import\.meta\.env\.MODE/g,
      replacement: 'process.env.NODE_ENV',
      priority: 3
    },
    {
      pattern: /import\.meta\.env\.DEV/g,
      replacement: 'process.env.NODE_ENV === "development"',
      priority: 4
    },
    {
      pattern: /import\.meta\.env\.PROD/g,
      replacement: 'process.env.NODE_ENV === "production"',
      priority: 5
    },
    {
      pattern: /import\.meta\.env/g,
      replacement: 'process.env',
      priority: 6
    },
    {
      pattern: /import\.meta\.url/g,
      replacement: '__filename',
      priority: 7
    },
    
    // import 변환 (더 포괄적인 패턴)
    {
      pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const $1 = require(\'$2\').default',
      priority: 10
    },
    {
      pattern: /import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const { $1 } = require(\'$2\')',
      priority: 11
    },
    {
      pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const $1 = require(\'$2\')',
      priority: 12
    },
    {
      pattern: /import\s+['"]([^'"]+)['"]/g,
      replacement: 'require(\'$1\')',
      priority: 13
    },
    
    // export 변환
    {
      pattern: /export\s+default\s+([^;]+)/g,
      replacement: 'module.exports.default = $1',
      priority: 20
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
      priority: 21
    },
    {
      pattern: /export\s+const\s+(\w+)/g,
      replacement: 'const $1',
      priority: 22
    },
    {
      pattern: /export\s+function\s+(\w+)/g,
      replacement: 'function $1',
      priority: 23
    },
    {
      pattern: /export\s+class\s+(\w+)/g,
      replacement: 'class $1',
      priority: 24
    }
  ].sort((a, b) => a.priority - b.priority)
}

/**
 * 파일이 변환이 필요한지 확인
 */
export function needsConversion(content: string): boolean {
  // ES Module 문법이 있는지 확인
  const hasESModuleSyntax = /import\s+.*from\s+['"]|export\s+(default|{|\*)|import\.meta/.test(content)
  
  // 이미 CommonJS 문법이 있는지 확인
  const hasCommonJSSyntax = /require\s*\(|module\.exports/.test(content)
  
  // require만 있고 import가 없으면 이미 CommonJS이므로 변환 불필요
  const hasOnlyRequire = /require\s*\(/.test(content) && !/import\s+.*from\s+['"]/.test(content)
  
        // 혼합된 모듈 시스템 (require와 export가 모두 있는 경우)은 변환 불필요
        const hasMixedModuleSystem = content.includes('require(') && (content.includes('export') || content.includes('export interface') || content.includes('export async') || content.includes('export function'))
  
  // 디버깅을 위한 로그
  if (hasESModuleSyntax && hasCommonJSSyntax) {
    console.log('혼합된 모듈 시스템 감지:', {
      hasESModuleSyntax,
      hasCommonJSSyntax,
      hasOnlyRequire,
      hasMixedModuleSystem,
      hasRequire: /require\s*\(/.test(content),
      hasExport: /export\s+(default|{|\*|interface|type|const|function|class)/.test(content)
    })
  }
  
  // ES Module 문법이 있고 CommonJS 문법이 없으면 변환 필요
  // 단, require만 있는 경우나 혼합된 모듈 시스템은 제외
  return hasESModuleSyntax && !hasCommonJSSyntax && !hasOnlyRequire && !hasMixedModuleSystem
}

/**
 * 변환 결과 검증
 */
function validateConversion(content: string): boolean {
  try {
    // ES Module 문법이 남아있는지 확인
    const esModulePatterns = [
      /import\s+.*from\s+['"]/,
      /export\s+default/,
      /export\s*\{/,
      /import\.meta/
    ]
    
    const hasESModuleSyntax = esModulePatterns.some(pattern => pattern.test(content))
    
    if (hasESModuleSyntax) {
      logWarning('⚠️  변환 후에도 ES Module 문법이 남아있습니다')
      return false
    }
    
    // CommonJS 문법이 포함되어 있는지 확인
    const hasCommonJSSyntax = content.includes('require(') || content.includes('module.exports')
    
    if (!hasCommonJSSyntax && content.trim().length > 0) {
      logWarning('⚠️  변환 후 CommonJS 문법이 없습니다')
      return false
    }
    
    return true
  } catch (error) {
    logError(`변환 검증 중 오류: ${(error as Error).message}`)
    return false
  }
}

/**
 * 변환 규칙 적용
 */
function applyConversions(content: string, options: ConversionOptions): string {
  const rules = initializeConversionRules()
  let convertedContent = content

  // 우선순위 순으로 변환 규칙 적용
  for (const rule of rules) {
    if (typeof rule.replacement === 'function') {
      convertedContent = convertedContent.replace(rule.pattern, rule.replacement)
    } else {
      convertedContent = convertedContent.replace(rule.pattern, rule.replacement)
    }
  }

  // 브라우저 API polyfill 추가
  if (options.polyfill && needsPolyfill(convertedContent)) {
    convertedContent = addPolyfill(convertedContent)
  }

  return convertedContent
}

/**
 * polyfill이 필요한지 확인
 */
function needsPolyfill(content: string): boolean {
  const browserAPIs = ['window', 'document', 'localStorage', 'sessionStorage', 'navigator']
  return browserAPIs.some(api => content.includes(api))
}

/**
 * polyfill 추가
 */
function addPolyfill(content: string): string {
  const polyfill = `// Browser API polyfills for Node.js environment
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
  return polyfill + content
}

/**
 * 백업 생성
 */
function createFileBackup(filePath: string): void {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `${filePath}.backup-${timestamp}`
    copyFile(filePath, backupPath)
  } catch (error) {
    logWarning(`백업 생성 실패: ${filePath} - ${(error as Error).message}`)
  }
}

/**
 * 단일 파일 변환
 */
export function convertFile(filePath: string, options: ConversionOptions): ConversionResult {
  try {
    if (!fileExists(filePath)) {
      return {
        success: false,
        converted: false,
        filePath,
        error: '파일이 존재하지 않습니다'
      }
    }

    const content = readFile(filePath)
    if (!content) {
      return {
        success: false,
        converted: false,
        filePath,
        error: '파일을 읽을 수 없습니다'
      }
    }

    // 변환이 필요한지 확인
    if (!needsConversion(content)) {
      return {
        success: true,
        converted: false,
        filePath
      }
    }

    logInfo(`🔄 변환 시작: ${filePath}`)

    // 백업 생성
    if (options.backup) {
      createFileBackup(filePath)
    }

    // 변환 실행
    const convertedContent = applyConversions(content, options)
    
    // 변환된 내용이 원본과 다른지 확인
    const wasConverted = content !== convertedContent
    
    if (wasConverted) {
      // 변환 결과 검증
      if (options.validate && !validateConversion(convertedContent)) {
        return {
          success: false,
          converted: false,
          filePath,
          error: '변환 결과 검증 실패'
        }
      }
      
      // 실제 파일에 쓰기 (dryRun이 아닌 경우에만)
      if (writeFile(filePath, convertedContent)) {
        logSuccess(`✅ 변환 완료: ${filePath}`)
        return {
          success: true,
          converted: true,
          filePath,
          content: convertedContent
        }
      } else {
        return {
          success: false,
          converted: false,
          filePath,
          error: '변환된 내용을 파일에 쓸 수 없습니다'
        }
      }
    } else {
      logInfo(`⏭️  변환 불필요: ${filePath}`)
      return {
        success: true,
        converted: false,
        filePath
      }
    }

  } catch (error) {
    logError(`❌ 변환 실패: ${filePath} - ${(error as Error).message}`)
    return {
      success: false,
      converted: false,
      filePath,
      error: (error as Error).message
    }
  }
}

/**
 * 여러 파일 변환
 */
export function convertFiles(filePaths: string[], options: ConversionOptions): ConversionReport {
  const results: ConversionResult[] = []
  
  logInfo(`변환 시작: ${filePaths.length}개 파일`)

  if (options.parallel && filePaths.length > 1) {
    // 병렬 처리
    const batchSize = options.maxWorkers || 4
    const batches = createBatches(filePaths, batchSize)
    
    for (const batch of batches) {
      const batchResults = batch.map(filePath => convertFile(filePath, options))
      results.push(...batchResults)
    }
  } else {
    // 순차 처리
    for (const filePath of filePaths) {
      const result = convertFile(filePath, options)
      results.push(result)
    }
  }

  const success = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const converted = results.filter(r => r.converted)

  logSuccess(`변환 완료: 성공 ${success.length}개, 실패 ${failed.length}개, 실제 변환 ${converted.length}개`)

  return {
    total: results.length,
    success,
    failed
  }
}

/**
 * 배치 생성
 */
function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return batches
}

/**
 * 변환 결과 보고서 출력
 */
export function printConversionReport(report: ConversionReport): void {
  logInfo('\n📊 변환 결과 보고서:')
  logInfo(`- 총 파일: ${report.total}개`)
  logInfo(`- 성공: ${report.success.length}개`)
  logInfo(`- 실패: ${report.failed.length}개`)
  
  const convertedCount = report.success.filter(r => r.converted).length
  const skippedCount = report.success.filter(r => !r.converted).length
  
  logInfo(`- 실제 변환: ${convertedCount}개`)
  logInfo(`- 변환 불필요: ${skippedCount}개`)
  
  if (report.failed.length > 0) {
    logWarning('\n❌ 실패한 파일들:')
    report.failed.forEach(result => {
      logError(`- ${result.filePath}: ${result.error}`)
    })
  }
  
  if (convertedCount > 0) {
    logSuccess('\n✅ 변환된 파일들:')
    report.success.filter(r => r.converted).forEach(result => {
      logSuccess(`- ${result.filePath}`)
    })
  }
}

/**
 * 변환 대상 스캔
 */
export function scanConversionTargets(projectRoot: string): string[] {
  const srcDir = path.join(projectRoot, 'src')
  const targets: string[] = []
  
  logInfo(`🔍 스캔 시작: ${srcDir}`)
  
  // 공유 파일들 스캔
  const sharedFiles = scanDirectory(srcDir, {
    recursive: true,
    includeFiles: true,
    includeDirs: false,
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  })
  
  logInfo(`📁 전체 스캔된 파일 수: ${sharedFiles.length}`)
  
  for (const file of sharedFiles) {
    // shared/ 디렉토리뿐만 아니라 모든 파일 검사
    if (file.relativePath.startsWith('shared/') || 
        file.relativePath.includes('/shared/') ||
        file.path.includes('shared')) {
      
      const content = readFile(file.path)
      if (content && needsConversion(content)) {
        targets.push(file.path)
        logInfo(`✅ 변환 대상 발견: ${file.relativePath}`)
      } else if (content) {
        logInfo(`⏭️  변환 불필요: ${file.relativePath}`)
      }
    }
  }
  
  // shared 디렉토리가 없거나 비어있는 경우, 전체 src 디렉토리에서 변환 가능한 파일 찾기
  if (targets.length === 0) {
    logInfo(`🔍 shared 디렉토리에서 변환 대상이 없습니다. 전체 src 디렉토리를 검사합니다...`)
    
    for (const file of sharedFiles) {
      const content = readFile(file.path)
      if (content && needsConversion(content)) {
        targets.push(file.path)
        logInfo(`✅ 변환 대상 발견: ${file.relativePath}`)
      }
    }
  }
  
  logInfo(`📊 최종 변환 대상: ${targets.length}개 파일`)
  return targets
}
