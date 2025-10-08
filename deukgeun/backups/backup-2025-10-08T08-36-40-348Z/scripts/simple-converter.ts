#!/usr/bin/env node

/**
 * 간단한 JS to CJS 변환 스크립트
 * ES Modules를 CommonJS로 변환하는 유틸리티
 */

import * as fs from 'fs'
import * as path from 'path'

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
 * 파일 변환 함수
 */
function convertFile(filePath: string): boolean {
  try {
    log(`변환 시작: ${filePath}`, 'cyan')
    
    // 원본 파일 읽기
    const originalContent = fs.readFileSync(filePath, 'utf8')
    log(`원본 내용 길이: ${originalContent.length}`, 'cyan')
    
    // 변환 전 import.meta.env 개수 확인
    const importMetaCount = (originalContent.match(/import\.meta\.env/g) || []).length
    log(`변환 전 import.meta.env 개수: ${importMetaCount}`, 'cyan')
    
    let convertedContent = originalContent
    
    // 1단계: import.meta.env 변환
    convertedContent = convertedContent.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.VITE_$1')
    convertedContent = convertedContent.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1')
    convertedContent = convertedContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV')
    convertedContent = convertedContent.replace(/import\.meta\.env\.DEV/g, 'process.env.NODE_ENV === "development"')
    convertedContent = convertedContent.replace(/import\.meta\.env\.PROD/g, 'process.env.NODE_ENV === "production"')
    convertedContent = convertedContent.replace(/import\.meta\.env/g, 'process.env')
    
    // 2단계: import/export 변환
    convertedContent = convertedContent.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\').default')
    convertedContent = convertedContent.replace(/import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require(\'$2\')')
    convertedContent = convertedContent.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\')')
    
    // 3단계: export 변환
    convertedContent = convertedContent.replace(/export\s+default\s+([^;]+)/g, 'module.exports.default = $1')
    convertedContent = convertedContent.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match: string, exports: string) => {
      return exports.split(',').map(exp => {
        exp = exp.trim()
        return `module.exports.${exp} = ${exp}`
      }).join('\n')
    })
    
    // 변환 후 process.env 개수 확인
    const processEnvCount = (convertedContent.match(/process\.env/g) || []).length
    log(`변환 후 process.env 개수: ${processEnvCount}`, 'cyan')
    
    // 변환 여부 확인
    const isChanged = originalContent !== convertedContent
    log(`변환 여부: ${isChanged ? '변환됨' : '변환되지 않음'}`, isChanged ? 'green' : 'yellow')
    
    if (isChanged) {
      // 백업 생성
      const backupPath = filePath + '.backup-' + Date.now()
      fs.copyFileSync(filePath, backupPath)
      log(`백업 생성됨: ${backupPath}`, 'cyan')
      
      // 변환된 내용을 원본 파일에 쓰기
      fs.writeFileSync(filePath, convertedContent)
      log(`✅ 원본 파일 적용됨: ${filePath}`, 'green')
      
      // 적용 확인
      const appliedContent = fs.readFileSync(filePath, 'utf8')
      const isApplied = appliedContent === convertedContent
      log(`적용 성공 여부: ${isApplied ? '성공' : '실패'}`, isApplied ? 'green' : 'red')
      
      // 성공 시 백업 파일 삭제
      if (isApplied && fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
        log(`백업 파일 삭제됨: ${backupPath}`, 'cyan')
      }
    }
    
    return isChanged
  } catch (error: any) {
    logError(`파일 변환 실패: ${filePath} - ${error.message}`)
    return false
  }
}

/**
 * 프로젝트 스캔 및 변환
 */
function scanAndConvert(): void {
  const projectRoot = process.cwd()
  const srcDir = path.join(projectRoot, 'src')
  
  if (!fs.existsSync(srcDir)) {
    logError(`src 디렉토리를 찾을 수 없습니다: ${srcDir}`)
    return
  }
  
  log('🚀 JS to CJS 변환을 시작합니다...', 'bright')
  
  // 변환 대상 파일들
  const targetFiles = [
    'src/shared/config/index.ts',
    'src/shared/lib/env.ts',
    'src/shared/api/client.ts',
    'src/shared/lib/recaptcha.ts'
  ]
  
  let successCount = 0
  let failCount = 0
  
  for (const relativePath of targetFiles) {
    const fullPath = path.join(projectRoot, relativePath)
    
    if (fs.existsSync(fullPath)) {
      const success = convertFile(fullPath)
      if (success) {
        successCount++
      } else {
        failCount++
      }
    } else {
      logWarning(`파일을 찾을 수 없습니다: ${fullPath}`)
      failCount++
    }
  }
  
  logSuccess(`변환 완료: 성공 ${successCount}개, 실패 ${failCount}개`)
}

// 스크립트 실행
if (require.main === module) {
  scanAndConvert()
}

export { convertFile, scanAndConvert }
