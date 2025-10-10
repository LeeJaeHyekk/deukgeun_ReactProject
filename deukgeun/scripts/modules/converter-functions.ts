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
 * 변환 규칙 초기화 (개선된 버전)
 */
function initializeConversionRules(): ConversionRule[] {
  return [
    // import.meta 변환 (우선순위 높음) - 더 구체적인 패턴부터 처리
    {
      pattern: /import\.meta\.env\.VITE_([A-Z_]+)/g,
      replacement: 'process.env.VITE_$1',
      priority: 1
    },
    {
      pattern: /import\.meta\.env\.MODE/g,
      replacement: 'process.env.NODE_ENV',
      priority: 2
    },
    {
      pattern: /import\.meta\.env\.DEV/g,
      replacement: 'process.env.NODE_ENV === "development"',
      priority: 3
    },
    {
      pattern: /import\.meta\.env\.PROD/g,
      replacement: 'process.env.NODE_ENV === "production"',
      priority: 4
    },
    {
      pattern: /import\.meta\.env\.([A-Z_]+)/g,
      replacement: 'process.env.$1',
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
    
    // import 변환 (더 포괄적이고 정확한 패턴)
    // 1. 명명된 import 변환 (가장 구체적)
    {
      pattern: /import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
      replacement: (match: string, imports: string, modulePath: string) => {
        // 'as' 키워드 처리
        const convertedImports = imports.replace(/(\w+)\s+as\s+(\w+)/g, '$1: $2')
        return `const { ${convertedImports} } = require('${modulePath}')`
      },
      priority: 10
    },
    
    // 2. 기본 import 변환 (default import)
    {
      pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const $1 = require(\'$2\')',
      priority: 11
    },
    
    // 3. 네임스페이스 import 변환
    {
      pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const $1 = require(\'$2\')',
      priority: 12
    },
    
    // 4. side-effect import 변환
    {
      pattern: /import\s+['"]([^'"]+)['"]/g,
      replacement: 'require(\'$1\')',
      priority: 13
    },
    
    // 5. 동적 import 변환
    {
      pattern: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      replacement: 'require(\'$1\')',
      priority: 14
    },
    
    // export 변환 (더 정확한 패턴)
    // 1. export * from 변환
    {
      pattern: /export\s*\*\s*from\s+['"]([^'"]+)['"]/g,
      replacement: 'Object.assign(module.exports, require(\'$1\'))',
      priority: 20
    },
    
    // 2. 명명된 export 변환 (as 키워드 처리)
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
    
    // 3. 기본 export 변환
    {
      pattern: /export\s+default\s+([^;]+)/g,
      replacement: 'module.exports = $1',
      priority: 22
    },
    
    // 4. export const/let/var 변환
    {
      pattern: /export\s+(const|let|var)\s+(\w+)/g,
      replacement: '$1 $2\nmodule.exports.$2 = $2',
      priority: 23
    },
    
    // 5. export function 변환
    {
      pattern: /export\s+function\s+(\w+)/g,
      replacement: 'function $1',
      priority: 24
    },
    
    // 6. export async function 변환
    {
      pattern: /export\s+async\s+function\s+(\w+)/g,
      replacement: 'async function $1',
      priority: 25
    },
    
    // 7. export class 변환
    {
      pattern: /export\s+class\s+(\w+)/g,
      replacement: 'class $1',
      priority: 26
    },
    
    // 8. export interface/type 변환 (TypeScript)
    {
      pattern: /export\s+(interface|type)\s+(\w+)/g,
      replacement: '$1 $2',
      priority: 27
    },
    
    // 9. 빈 export 문 제거
    {
      pattern: /export\s*\{\s*\}\s*;?/g,
      replacement: '',
      priority: 28
    },
    
    // React 컴포넌트 특수 패턴 처리
    // 10. React import 변환 (특수 처리)
    {
      pattern: /import\s+React\s+from\s+['"]react['"]/g,
      replacement: 'const React = require(\'react\')',
      priority: 30
    },
    
    // 11. React Hook import 변환
    {
      pattern: /import\s*\{\s*([^}]*useState[^}]*)\s*\}\s+from\s+['"]react['"]/g,
      replacement: 'const { $1 } = require(\'react\')',
      priority: 31
    },
    
    // 12. React Router import 변환
    {
      pattern: /import\s*\{\s*([^}]*)\s*\}\s+from\s+['"]react-router-dom['"]/g,
      replacement: 'const { $1 } = require(\'react-router-dom\')',
      priority: 32
    },
    
    // 13. CSS/SCSS import 변환 (side-effect)
    {
      pattern: /import\s+['"]([^'"]*\.(css|scss|sass|less))['"]/g,
      replacement: 'require(\'$1\')',
      priority: 33
    },
    
    // 14. 이미지/에셋 import 변환
    {
      pattern: /import\s+(\w+)\s+from\s+['"]([^'"]*\.(png|jpg|jpeg|gif|svg|webp|ico))['"]/g,
      replacement: 'const $1 = require(\'$2\')',
      priority: 34
    },
    
    // 15. 동적 import() 변환 (더 정확한 패턴)
    {
      pattern: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      replacement: 'require(\'$1\')',
      priority: 35
    },
    
    // 16. 조건부 import 변환
    {
      pattern: /if\s*\([^)]*\)\s*\{\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      replacement: 'if (true) { require(\'$1\')',
      priority: 36
    },
    
    // 17. TypeScript 타입 import 변환 (type-only import)
    {
      pattern: /import\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g,
      replacement: '// type import: { $1 } from \'$2\'',
      priority: 37
    },
    
    // 18. 네임스페이스 import with type
    {
      pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;\s*import\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const $1 = require(\'$2\')\n// type import: { $3 } from \'$4\'',
      priority: 38
    },
    
    // 19. 복합 import 변환 (여러 import를 하나로)
    {
      pattern: /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;\s*import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
      replacement: 'const $1 = require(\'$2\')\nconst { $3 } = require(\'$4\')',
      priority: 39
    },
    
    // 20. export default with named exports
    {
      pattern: /export\s+default\s+(\w+)\s*;\s*export\s*\{\s*([^}]+)\s*\}/g,
      replacement: 'module.exports = $1\nmodule.exports.$2 = $2',
      priority: 40
    }
  ].sort((a, b) => a.priority - b.priority)
}

/**
 * 파일이 변환이 필요한지 확인 (개선된 버전)
 */
export function needsConversion(content: string): boolean {
  // 빈 파일이나 주석만 있는 파일은 변환 불필요
  const trimmedContent = content.trim()
  if (trimmedContent === '' || /^\/\*[\s\S]*\*\/$/.test(trimmedContent) || /^\/\/.*$/.test(trimmedContent)) {
    return false
  }
  
  // ES Module 문법이 있는지 확인 (더 정확한 패턴)
  const esModulePatterns = [
    /import\s+.*from\s+['"]/,           // import ... from
    /import\s*\{\s*[^}]*\s*\}\s+from\s+['"]/, // import { ... } from
    /import\s+\*\s+as\s+\w+\s+from\s+['"]/,   // import * as ... from
    /import\s+['"][^'"]*['"]/,         // import "module"
    /import\s*\(\s*['"][^'"]*['"]\s*\)/, // import("module")
    /export\s+default/,                // export default
    /export\s*\{\s*[^}]*\s*\}/,        // export { ... }
    /export\s+\*/,                     // export *
    /export\s+(const|let|var|function|class|interface|type)/, // export declarations
    /import\.meta/                     // import.meta
  ]
  
  const hasESModuleSyntax = esModulePatterns.some(pattern => pattern.test(content))
  
  // 이미 CommonJS 문법이 있는지 확인
  const hasCommonJSSyntax = /require\s*\(|module\.exports/.test(content)
  
  // require만 있고 import가 없으면 이미 CommonJS이므로 변환 불필요
  const hasOnlyRequire = /require\s*\(/.test(content) && !hasESModuleSyntax
  
  // 혼합된 모듈 시스템 (require와 export가 모두 있는 경우)은 변환 불필요
  const hasMixedModuleSystem = content.includes('require(') && (
    content.includes('export') || 
    content.includes('export interface') || 
    content.includes('export async') || 
    content.includes('export function') ||
    content.includes('export const') ||
    content.includes('export class')
  )
  
  // TypeScript 타입 정의만 있는 경우 (interface, type만 export)
  const hasOnlyTypeExports = /export\s+(interface|type)\s+\w+/.test(content) && 
    !/export\s+(const|let|var|function|class|default)/.test(content) &&
    !/import\s+.*from\s+['"]/.test(content)
  
    // 디버깅을 위한 로그 (verbose 모드에서만)
    if (hasESModuleSyntax && hasCommonJSSyntax) {
      logInfo('혼합된 모듈 시스템 감지:')
      logInfo(`  - ES Module 문법: ${hasESModuleSyntax}`)
      logInfo(`  - CommonJS 문법: ${hasCommonJSSyntax}`)
      logInfo(`  - require만 있음: ${hasOnlyRequire}`)
      logInfo(`  - 혼합 모듈 시스템: ${hasMixedModuleSystem}`)
      logInfo(`  - 타입 정의만 있음: ${hasOnlyTypeExports}`)
    }
  
  // 변환이 필요한 조건:
  // 1. ES Module 문법이 있어야 함
  // 2. CommonJS 문법이 없어야 함 (또는 require만 있는 경우)
  // 3. 혼합된 모듈 시스템이 아니어야 함
  // 4. TypeScript 타입 정의만 있는 경우가 아니어야 함
  const needsConversion = hasESModuleSyntax && 
    !hasCommonJSSyntax && 
    !hasOnlyRequire && 
    !hasMixedModuleSystem && 
    !hasOnlyTypeExports
  
  if (needsConversion) {
    logInfo(`변환 필요: ES Module 문법 발견`)
  } else {
    logInfo(`변환 불필요: ${hasOnlyRequire ? 'CommonJS만 있음' : 
                           hasMixedModuleSystem ? '혼합 모듈 시스템' : 
                           hasOnlyTypeExports ? '타입 정의만 있음' : 
                           'ES Module 문법 없음'}`)
  }
  
  return needsConversion
}

/**
 * 변환 결과 검증 (개선된 버전)
 */
function validateConversion(content: string): boolean {
  try {
    const trimmedContent = content.trim()
    
    // 빈 파일은 검증 통과
    if (trimmedContent === '') {
      return true
    }
    
    // ES Module 문법이 남아있는지 확인 (더 정확한 패턴)
    const esModulePatterns = [
      /import\s+.*from\s+['"]/,           // import ... from
      /import\s*\{\s*[^}]*\s*\}\s+from\s+['"]/, // import { ... } from
      /import\s+\*\s+as\s+\w+\s+from\s+['"]/,   // import * as ... from
      /import\s+['"][^'"]*['"]/,         // import "module"
      /import\s*\(\s*['"][^'"]*['"]\s*\)/, // import("module")
      /export\s+default/,                // export default
      /export\s*\{\s*[^}]*\s*\}/,        // export { ... }
      /export\s+\*/,                     // export *
      /export\s+(const|let|var|function|class|interface|type)/, // export declarations
      /import\.meta/                     // import.meta
    ]
    
    const remainingESModulePatterns = esModulePatterns.filter(pattern => pattern.test(content))
    
    if (remainingESModulePatterns.length > 0) {
      logWarning(`⚠️  변환 후에도 ES Module 문법이 남아있습니다: ${remainingESModulePatterns.length}개 패턴`)
      // 남은 패턴들을 로그로 출력
      remainingESModulePatterns.forEach((pattern, index) => {
        const matches = content.match(pattern)
        if (matches) {
          logWarning(`  ${index + 1}. ${matches[0]}`)
        }
      })
      return false
    }
    
    // CommonJS 문법이 포함되어 있는지 확인
    const hasCommonJSSyntax = content.includes('require(') || content.includes('module.exports')
    
    if (!hasCommonJSSyntax) {
      logWarning('⚠️  변환 후 CommonJS 문법이 없습니다')
      return false
    }
    
    // 추가 검증: 문법적 오류가 있는지 확인
    const syntaxErrors = validateSyntax(content)
    if (syntaxErrors.length > 0) {
      logWarning(`⚠️  문법적 오류 발견: ${syntaxErrors.length}개`)
      syntaxErrors.forEach((error, index) => {
        logWarning(`  ${index + 1}. ${error}`)
      })
      return false
    }
    
    logSuccess('✅ 변환 결과 검증 통과')
    return true
  } catch (error) {
    logError(`변환 검증 중 오류: ${(error as Error).message}`)
    return false
  }
}

/**
 * 문법적 오류 검증
 */
function validateSyntax(content: string): string[] {
  const errors: string[] = []
  
  try {
    // 1. 괄호 균형 확인
    const openParens = (content.match(/\(/g) || []).length
    const closeParens = (content.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push(`괄호 불균형: 열린 괄호 ${openParens}개, 닫힌 괄호 ${closeParens}개`)
    }
    
    // 2. 중괄호 균형 확인
    const openBraces = (content.match(/\{/g) || []).length
    const closeBraces = (content.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push(`중괄호 불균형: 열린 중괄호 ${openBraces}개, 닫힌 중괄호 ${closeBraces}개`)
    }
    
    // 3. 대괄호 균형 확인
    const openBrackets = (content.match(/\[/g) || []).length
    const closeBrackets = (content.match(/\]/g) || []).length
    if (openBrackets !== closeBrackets) {
      errors.push(`대괄호 불균형: 열린 대괄호 ${openBrackets}개, 닫힌 대괄호 ${closeBrackets}개`)
    }
    
    // 4. 따옴표 균형 확인
    const singleQuotes = (content.match(/'/g) || []).length
    const doubleQuotes = (content.match(/"/g) || []).length
    if (singleQuotes % 2 !== 0) {
      errors.push(`작은따옴표 불균형: ${singleQuotes}개`)
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push(`큰따옴표 불균형: ${doubleQuotes}개`)
    }
    
    // 5. 세미콜론 누락 확인 (선택적)
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && 
          !line.endsWith(';') && 
          !line.endsWith('{') && 
          !line.endsWith('}') && 
          !line.startsWith('//') && 
          !line.startsWith('*') &&
          !line.startsWith('/*') &&
          !line.includes('if ') &&
          !line.includes('for ') &&
          !line.includes('while ') &&
          !line.includes('function ') &&
          !line.includes('class ') &&
          !line.includes('export ') &&
          !line.includes('import ')) {
        // 세미콜론이 없어도 되는 경우들을 제외
        continue
      }
    }
    
  } catch (error) {
    errors.push(`문법 검증 중 오류: ${(error as Error).message}`)
  }
  
  return errors
}

/**
 * 변환 규칙 적용 (개선된 버전)
 */
function applyConversions(content: string, options: ConversionOptions): string {
  const rules = initializeConversionRules()
  let convertedContent = content
  let hasChanges = false

  // 변환 전 상태 로깅
  const originalImportCount = (content.match(/import\s+/g) || []).length
  const originalExportCount = (content.match(/export\s+/g) || []).length
  const originalImportMetaCount = (content.match(/import\.meta/g) || []).length
  
  logInfo(`변환 전: import ${originalImportCount}개, export ${originalExportCount}개, import.meta ${originalImportMetaCount}개`)

  // 우선순위 순으로 변환 규칙 적용
  for (const rule of rules) {
    const beforeReplace = convertedContent
    const matches = convertedContent.match(rule.pattern)
    
    if (matches && matches.length > 0) {
      logInfo(`규칙 적용: ${rule.pattern} (${matches.length}개 매치)`)
      
      if (typeof rule.replacement === 'function') {
        convertedContent = convertedContent.replace(rule.pattern, rule.replacement)
      } else {
        convertedContent = convertedContent.replace(rule.pattern, rule.replacement)
      }
      
      if (beforeReplace !== convertedContent) {
        hasChanges = true
        logInfo(`변환됨: ${matches.length}개 패턴`)
      }
    }
  }

  // 변환 후 상태 로깅
  const finalImportCount = (convertedContent.match(/import\s+/g) || []).length
  const finalExportCount = (convertedContent.match(/export\s+/g) || []).length
  const finalImportMetaCount = (convertedContent.match(/import\.meta/g) || []).length
  const finalRequireCount = (convertedContent.match(/require\s*\(/g) || []).length
  const finalModuleExportsCount = (convertedContent.match(/module\.exports/g) || []).length
  
  logInfo(`변환 후: import ${finalImportCount}개, export ${finalExportCount}개, import.meta ${finalImportMetaCount}개`)
  logInfo(`CommonJS: require ${finalRequireCount}개, module.exports ${finalModuleExportsCount}개`)

  // 브라우저 API polyfill 추가
  if (options.polyfill && needsPolyfill(convertedContent)) {
    const beforePolyfill = convertedContent
    convertedContent = addPolyfill(convertedContent)
    if (beforePolyfill !== convertedContent) {
      hasChanges = true
      logInfo('브라우저 API polyfill 추가됨')
    }
  }

  // 변환 결과 요약
  if (hasChanges) {
    logSuccess(`변환 완료: ${originalImportCount + originalExportCount + originalImportMetaCount}개 ES Module 문법 → ${finalRequireCount + finalModuleExportsCount}개 CommonJS 문법`)
  } else {
    logInfo('변환된 내용이 없습니다')
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
