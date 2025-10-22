#!/usr/bin/env node

/**
 * 변환 테스트 스크립트
 * dist 폴더의 파일들을 확인하고 변환이 필요한지 테스트
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
  // import 문법 확인
  const hasImport = /import\s+.*from\s*['"]/.test(content) || content.includes('import ')
  const hasExport = /export\s+.*from\s*['"]/.test(content) || content.includes('export ')
  const hasImportMeta = content.includes('import.meta')
  
  // 빈 export 문도 ESM 문법으로 간주
  const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content)
  const hasExportDefault = /export\s+default/.test(content)
  const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content)
  
  return hasImport || hasExport || hasImportMeta || hasEmptyExport || hasExportDefault || hasExportDeclaration
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
    log('🚀 dist 폴더 파일 분석을 시작합니다...', 'bright')
    
    const distPath = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distPath)) {
      logError('dist 폴더가 존재하지 않습니다.')
      return
    }
    
    // 1. JS/TS 파일 찾기
    logStep('SCAN', 'JS/TS 파일 스캔 중...')
    const jsFiles = []
    scanDirectory(distPath, jsFiles, ['.js', '.ts', '.tsx'])
    log(`발견된 JS/TS 파일: ${jsFiles.length}개`, 'blue')
    
    // 2. CJS 파일 찾기
    logStep('SCAN', 'CJS 파일 스캔 중...')
    const cjsFiles = []
    scanDirectory(distPath, cjsFiles, ['.cjs'])
    log(`발견된 CJS 파일: ${cjsFiles.length}개`, 'blue')
    
    // 3. JS/TS 파일 분석
    let jsFilesWithEsm = 0
    for (const jsFile of jsFiles) {
      try {
        const content = fs.readFileSync(jsFile, 'utf8')
        if (hasEsmSyntax(content)) {
          log(`ESM 문법 발견: ${path.relative(process.cwd(), jsFile)}`, 'yellow')
          jsFilesWithEsm++
        }
      } catch (error) {
        logWarning(`파일 읽기 실패: ${jsFile} - ${error.message}`)
      }
    }
    
    // 4. CJS 파일 분석
    let cjsFilesWithEsm = 0
    for (const cjsFile of cjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        if (hasEsmSyntax(content)) {
          log(`CJS 파일에서 ESM 문법 발견: ${path.relative(process.cwd(), cjsFile)}`, 'yellow')
          cjsFilesWithEsm++
        }
      } catch (error) {
        logWarning(`파일 읽기 실패: ${cjsFile} - ${error.message}`)
      }
    }
    
    // 5. 결과 출력
    log('\n📊 분석 결과:', 'bright')
    log(`  • JS/TS 파일: ${jsFiles.length}개`, 'blue')
    log(`  • CJS 파일: ${cjsFiles.length}개`, 'blue')
    log(`  • JS/TS 파일 중 ESM 문법 사용: ${jsFilesWithEsm}개`, jsFilesWithEsm > 0 ? 'yellow' : 'green')
    log(`  • CJS 파일 중 ESM 문법 사용: ${cjsFilesWithEsm}개`, cjsFilesWithEsm > 0 ? 'yellow' : 'green')
    
    if (jsFilesWithEsm > 0 || cjsFilesWithEsm > 0) {
      logWarning('변환이 필요한 파일들이 있습니다.')
      log('변환을 실행하려면 다음 명령을 사용하세요:', 'cyan')
      log('  npx ts-node scripts/enhanced-js-to-cjs-converter.ts --verbose', 'cyan')
    } else {
      logSuccess('모든 파일이 올바르게 변환되었습니다!')
    }
    
  } catch (error) {
    logError(`분석 실패: ${error.message}`)
  }
}

// 스크립트 실행
main().catch(err => {
  logError(`실행 실패: ${err.message}`)
  process.exit(1)
})
