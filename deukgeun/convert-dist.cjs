#!/usr/bin/env node

/**
 * dist 폴더 변환 스크립트
 * JS/TS 파일을 CJS로 변환하고, CJS 파일의 ESM 문법을 CommonJS로 변환
 */

const fs = require('fs')
const path = require('path')

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

/**
 * ESM 문법이 있는지 확인
 */
function hasEsmSyntax(content) {
  const hasImport = /import\s+.*from\s*['"]/.test(content) || content.includes('import ')
  const hasExport = /export\s+.*from\s*['"]/.test(content) || content.includes('export ')
  const hasImportMeta = content.includes('import.meta')
  const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content)
  const hasExportDefault = /export\s+default/.test(content)
  const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content)
  
  return hasImport || hasExport || hasImportMeta || hasEmptyExport || hasExportDefault || hasExportDeclaration
}

/**
 * ESM을 CommonJS로 변환
 */
function convertEsmToCommonJS(content, filePath) {
  let convertedContent = content
  
  // 1. import.meta.env 변환
  if (convertedContent.includes('import.meta.env')) {
    convertedContent = convertedContent.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.VITE_$1')
    convertedContent = convertedContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV')
    convertedContent = convertedContent.replace(/import\.meta\.env\.DEV/g, 'process.env.NODE_ENV === "development"')
    convertedContent = convertedContent.replace(/import\.meta\.env\.PROD/g, 'process.env.NODE_ENV === "production"')
    convertedContent = convertedContent.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1')
    convertedContent = convertedContent.replace(/import\.meta\.env/g, 'process.env')
  }
  
  // 2. import 변환
  convertedContent = convertedContent.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\').default')
  convertedContent = convertedContent.replace(/import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require(\'$2\')')
  convertedContent = convertedContent.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\')')
  convertedContent = convertedContent.replace(/import\s+['"]([^'"]+)['"]/g, "require('$1')")
  
  // 3. export 변환
  convertedContent = convertedContent.replace(/export\s+default\s+([^;]+)/g, 'module.exports.default = $1')
  convertedContent = convertedContent.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match, exports) => {
    return exports.split(',').map(exp => {
      exp = exp.trim()
      if (exp.includes(' as ')) {
        const [original, alias] = exp.split(' as ').map(s => s.trim())
        return `module.exports.${alias} = ${original}`
      }
      return `module.exports.${exp} = ${exp}`
    }).join('\n')
  })
  
  // 4. export const/let/var/function/class 변환
  convertedContent = convertedContent.replace(/export\s+(const|let|var|function|class)\s+(\w+)/g, (match, declaration, name) => {
    return `${declaration} ${name}\nmodule.exports.${name} = ${name}`
  })
  
  // 5. export function 변환
  convertedContent = convertedContent.replace(/export\s+function\s+(\w+)/g, 'function $1')
  convertedContent = convertedContent.replace(/export\s+async\s+function\s+(\w+)/g, 'async function $1')
  
  // 6. 빈 export 문 제거
  convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;?/g, '')
  
  // 7. import() 동적 import 변환
  convertedContent = convertedContent.replace(/import\(['"]([^'"]+)['"]\)/g, "require('$1')")
  
  // 8. import.meta.url 변환
  if (convertedContent.includes('import.meta.url')) {
    convertedContent = convertedContent.replace(/import\.meta\.url/g, '__filename')
  }
  
  return convertedContent
}

/**
 * 디렉토리 스캔
 */
function scanDirectory(dir, files, extensions) {
  if (!fs.existsSync(dir)) {
    return
  }
  
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.conversion-backup'].includes(item)) {
        scanDirectory(itemPath, files, extensions)
      }
    } else {
      const ext = path.extname(item)
      if (extensions.includes(ext)) {
        files.push(itemPath)
      }
    }
  }
}

/**
 * 메인 함수
 */
async function main() {
  try {
    log('🚀 dist 폴더 변환을 시작합니다...', 'bright')
    
    const distPath = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distPath)) {
      logError('dist 폴더가 존재하지 않습니다.')
      return
    }
    
    // 1. JS/TS 파일을 CJS로 변환
    logStep('CONVERT_JS_TS', 'JS/TS 파일을 CJS로 변환 중...')
    const jsFiles = []
    scanDirectory(distPath, jsFiles, ['.js', '.ts', '.tsx'])
    
    let convertedCount = 0
    for (const jsFile of jsFiles) {
      try {
        const content = fs.readFileSync(jsFile, 'utf8')
        
        // 빈 파일 처리
        if (content.trim() === '' || content.trim() === '"use strict";') {
          fs.unlinkSync(jsFile)
          log(`빈 파일 삭제됨: ${path.relative(process.cwd(), jsFile)}`, 'green')
          continue
        }
        
        // ESM 문법이 있으면 변환
        if (hasEsmSyntax(content)) {
          const convertedContent = convertEsmToCommonJS(content, jsFile)
          
          // .cjs 파일로 저장
          let cjsPath = jsFile
          if (jsFile.endsWith('.js')) {
            cjsPath = jsFile.replace('.js', '.cjs')
          } else if (jsFile.endsWith('.ts')) {
            cjsPath = jsFile.replace('.ts', '.cjs')
          } else if (jsFile.endsWith('.tsx')) {
            cjsPath = jsFile.replace('.tsx', '.cjs')
          }
          
          fs.writeFileSync(cjsPath, convertedContent)
          fs.unlinkSync(jsFile)
          log(`변환됨: ${path.relative(process.cwd(), jsFile)} → ${path.relative(process.cwd(), cjsPath)}`, 'green')
          convertedCount++
        } else {
          // ESM 문법이 없어도 확장자만 변경
          let cjsPath = jsFile
          if (jsFile.endsWith('.js')) {
            cjsPath = jsFile.replace('.js', '.cjs')
          } else if (jsFile.endsWith('.ts')) {
            cjsPath = jsFile.replace('.ts', '.cjs')
          } else if (jsFile.endsWith('.tsx')) {
            cjsPath = jsFile.replace('.tsx', '.cjs')
          }
          
          fs.writeFileSync(cjsPath, content)
          fs.unlinkSync(jsFile)
          log(`확장자 변경됨: ${path.relative(process.cwd(), jsFile)} → ${path.relative(process.cwd(), cjsPath)}`, 'green')
          convertedCount++
        }
      } catch (error) {
        logError(`파일 변환 실패: ${jsFile} - ${error.message}`)
      }
    }
    
    log(`JS/TS 파일 변환 완료: ${convertedCount}개`, 'green')
    
    // 2. CJS 파일에서 ESM 문법 변환
    logStep('CONVERT_CJS', 'CJS 파일에서 ESM 문법 변환 중...')
    const cjsFiles = []
    scanDirectory(distPath, cjsFiles, ['.cjs'])
    
    let cjsConvertedCount = 0
    for (const cjsFile of cjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        
        if (hasEsmSyntax(content)) {
          const convertedContent = convertEsmToCommonJS(content, cjsFile)
          fs.writeFileSync(cjsFile, convertedContent)
          log(`CJS 변환됨: ${path.relative(process.cwd(), cjsFile)}`, 'green')
          cjsConvertedCount++
        }
      } catch (error) {
        logError(`CJS 파일 변환 실패: ${cjsFile} - ${error.message}`)
      }
    }
    
    log(`CJS 파일 변환 완료: ${cjsConvertedCount}개`, 'green')
    
    // 3. require 경로 수정
    logStep('FIX_REQUIRES', 'require 경로를 .cjs 확장자로 수정...')
    const allCjsFiles = []
    scanDirectory(distPath, allCjsFiles, ['.cjs'])
    
    let requireFixedCount = 0
    for (const cjsFile of allCjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        let modifiedContent = content
        
        // require 경로 수정
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)\.js"\)/g, 'require("./$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)"\)/g, (match, moduleName) => {
          const cjsPath = path.join(path.dirname(cjsFile), `${moduleName}.cjs`)
          if (fs.existsSync(cjsPath)) {
            return `require("./${moduleName}.cjs")`
          }
          return match
        })
        
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)\.js"\)/g, 'require("../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)"\)/g, (match, moduleName) => {
          const cjsPath = path.join(path.dirname(cjsFile), '..', `${moduleName}.cjs`)
          if (fs.existsSync(cjsPath)) {
            return `require("../${moduleName}.cjs")`
          }
          return match
        })
        
        if (modifiedContent !== content) {
          fs.writeFileSync(cjsFile, modifiedContent)
          log(`require 경로 수정됨: ${path.relative(process.cwd(), cjsFile)}`, 'green')
          requireFixedCount++
        }
      } catch (error) {
        logError(`require 경로 수정 실패: ${cjsFile} - ${error.message}`)
      }
    }
    
    log(`require 경로 수정 완료: ${requireFixedCount}개`, 'green')
    
    // 4. 최종 결과
    log('\n📊 변환 결과:', 'bright')
    log(`  • JS/TS 파일 변환: ${convertedCount}개`, 'green')
    log(`  • CJS 파일 변환: ${cjsConvertedCount}개`, 'green')
    log(`  • require 경로 수정: ${requireFixedCount}개`, 'green')
    
    logSuccess('모든 변환이 완료되었습니다!')
    
  } catch (error) {
    logError(`변환 실패: ${error.message}`)
  }
}

// 스크립트 실행
main().catch(err => {
  logError(`실행 실패: ${err.message}`)
  process.exit(1)
})
