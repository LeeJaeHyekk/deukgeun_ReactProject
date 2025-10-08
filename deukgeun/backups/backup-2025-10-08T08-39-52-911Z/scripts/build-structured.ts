#!/usr/bin/env node

/**
 * 구조화된 빌드 스크립트
 * dist/frontend, dist/backend, dist/data, dist/shared 구조로 빌드
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface BuildConfig {
  projectRoot: string
  buildTimeout: number
  maxRetries: number
}

const config: BuildConfig = {
  projectRoot: process.cwd(),
  buildTimeout: 300000, // 5분
  maxRetries: 3
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

// 기존 dist 폴더 정리
function cleanupDist(): void {
  logStep('CLEANUP', '기존 dist 폴더 정리 중...')
  
  const distPath = path.join(config.projectRoot, 'dist')
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true })
    logSuccess('기존 dist 폴더 정리 완료')
  }
}

// 백엔드 빌드
function buildBackend(): boolean {
  logStep('BACKEND', '백엔드 빌드 중...')
  
  try {
    execSync('npm run build:backend:production', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout,
      cwd: config.projectRoot
    })
    
    logSuccess('백엔드 빌드 완료')
    return true
  } catch (error: any) {
    logError(`백엔드 빌드 실패: ${error.message}`)
    return false
  }
}

// 프론트엔드 빌드
function buildFrontend(): boolean {
  logStep('FRONTEND', '프론트엔드 빌드 중...')
  
  try {
    execSync('npm run build:production', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout,
      cwd: config.projectRoot
    })
    
    logSuccess('프론트엔드 빌드 완료')
    return true
  } catch (error: any) {
    logError(`프론트엔드 빌드 실패: ${error.message}`)
    return false
  }
}

// dist 폴더 구조 정리
function organizeDistStructure(): boolean {
  logStep('ORGANIZE', 'dist 폴더 구조 정리 중...')
  
  try {
    const distPath = path.join(config.projectRoot, 'dist')
    if (!fs.existsSync(distPath)) {
      logError('dist 폴더가 존재하지 않습니다.')
      return false
    }
    
    // 1. frontend 폴더 생성 및 파일 이동
    const frontendPath = path.join(distPath, 'frontend')
    if (!fs.existsSync(frontendPath)) {
      fs.mkdirSync(frontendPath, { recursive: true })
    }
    
    // 프론트엔드 파일들을 frontend 폴더로 이동
    const items = fs.readdirSync(distPath)
    for (const item of items) {
      const itemPath = path.join(distPath, item)
      const stat = fs.statSync(itemPath)
      
      // HTML, CSS, JS 파일과 assets 폴더들을 frontend로 이동
      if (stat.isFile() && (item.endsWith('.html') || item.endsWith('.css') || item.endsWith('.js'))) {
        const newPath = path.join(frontendPath, item)
        fs.renameSync(itemPath, newPath)
        log(`프론트엔드 파일 이동: ${item}`, 'cyan')
      } else if (stat.isDirectory() && (item === 'assets' || item === 'js' || item === 'fonts' || item === 'img' || item === 'video')) {
        const newPath = path.join(frontendPath, item)
        if (fs.existsSync(newPath)) {
          fs.rmSync(newPath, { recursive: true, force: true })
        }
        fs.renameSync(itemPath, newPath)
        log(`프론트엔드 폴더 이동: ${item}`, 'cyan')
      }
    }
    
    // 2. shared 폴더 처리
    const backendSharedPath = path.join(distPath, 'backend', 'shared')
    const distSharedPath = path.join(distPath, 'shared')
    
    if (fs.existsSync(backendSharedPath)) {
      if (fs.existsSync(distSharedPath)) {
        fs.rmSync(distSharedPath, { recursive: true, force: true })
      }
      fs.renameSync(backendSharedPath, distSharedPath)
      log('shared 폴더를 dist 루트로 이동', 'cyan')
    }
    
    // 3. data 폴더 생성 (src/data 복사)
    const srcDataPath = path.join(config.projectRoot, 'src', 'data')
    const distDataPath = path.join(distPath, 'data')
    
    if (fs.existsSync(srcDataPath)) {
      if (fs.existsSync(distDataPath)) {
        fs.rmSync(distDataPath, { recursive: true, force: true })
      }
      fs.cpSync(srcDataPath, distDataPath, { recursive: true })
      log('data 폴더 복사 완료', 'cyan')
    }
    
    logSuccess('dist 폴더 구조 정리 완료')
    return true
  } catch (error: any) {
    logError(`dist 폴더 구조 정리 실패: ${error.message}`)
    return false
  }
}

// 빌드 결과 검증
function validateBuild(): boolean {
  logStep('VALIDATE', '빌드 결과 검증 중...')
  
  const buildPaths = [
    'dist/backend',
    'dist/frontend',
    'dist/shared',
    'dist/data'
  ]
  
  for (const buildPath of buildPaths) {
    const fullPath = path.join(config.projectRoot, buildPath)
    if (!fs.existsSync(fullPath)) {
      logError(`빌드 결과를 찾을 수 없습니다: ${buildPath}`)
      return false
    }
  }
  
  logSuccess('빌드 결과 검증 완료')
  return true
}

// 빌드 정보 출력
function printBuildInfo(): void {
  log('\n📊 빌드 결과:', 'cyan')
  log('- 백엔드: dist/backend/')
  log('- 프론트엔드: dist/frontend/')
  log('- 공유 모듈: dist/shared/')
  log('- 데이터: dist/data/')
  
  log('\n🔗 서비스 시작:', 'cyan')
  log('- 백엔드: node dist/backend/index.js')
  log('- 프론트엔드: node scripts/serve-frontend-simple.ts')
}

// 안전 변환 실행 (개선된 버전)
function executeJSConversion(): boolean {
  logStep('CONVERT', 'JS to CJS 변환 실행 중...')
  
  try {
    // 변환 전 상태 확인
    const preConversionCheck = checkPreConversionState()
    if (!preConversionCheck.valid) {
      logError(`변환 전 상태 검증 실패: ${preConversionCheck.errors.join(', ')}`)
      return false
    }
    
    // 안전 백업 생성
    const backupPath = createSafetyBackup()
    if (!backupPath) {
      logError('안전 백업 생성 실패')
      return false
    }
    
    // 변환 실행
    execSync('npm run convert:js-to-cjs', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout,
      cwd: config.projectRoot
    })
    
    // 변환 후 검증
    const postConversionCheck = checkPostConversionState()
    if (!postConversionCheck.valid) {
      logWarning(`변환 후 검증 실패: ${postConversionCheck.errors.join(', ')}`)
      log('롤백을 시도합니다...', 'yellow')
      rollbackFromBackup(backupPath)
      return false
    }
    
    logSuccess('JS to CJS 변환 완료')
    return true
  } catch (error: any) {
    logError(`JS to CJS 변환 실패: ${error.message}`)
    log('기본 빌드로 진행합니다...', 'yellow')
    return false
  }
}

// 변환 전 상태 확인
function checkPreConversionState(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 필수 파일 존재 확인
  const requiredFiles = [
    'src/shared/config/index.ts',
    'src/shared/lib/env.ts',
    'src/shared/api/client.ts',
    'src/shared/lib/recaptcha.ts'
  ]
  
  for (const file of requiredFiles) {
    const fullPath = path.join(config.projectRoot, file)
    if (!fs.existsSync(fullPath)) {
      errors.push(`필수 파일 없음: ${file}`)
    }
  }
  
  // 디스크 공간 확인
  try {
    const stats = fs.statSync(config.projectRoot)
    if (stats.size === 0) {
      errors.push('디스크 공간 부족')
    }
  } catch (error: any) {
    errors.push(`디스크 접근 오류: ${error.message}`)
  }
  
  return { valid: errors.length === 0, errors }
}

// 변환 후 상태 확인
function checkPostConversionState(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  const targetFiles = [
    'src/shared/config/index.ts',
    'src/shared/lib/env.ts',
    'src/shared/api/client.ts',
    'src/shared/lib/recaptcha.ts'
  ]
  
  for (const file of targetFiles) {
    const fullPath = path.join(config.projectRoot, file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      
      // import.meta.env가 남아있는지 확인
      if (content.includes('import.meta.env')) {
        errors.push(`${file}: import.meta.env가 변환되지 않음`)
      }
      
      // 파일 크기 확인
      if (content.length < 100) {
        errors.push(`${file}: 파일 크기가 너무 작음`)
      }
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// 안전 백업 생성
function createSafetyBackup(): string | null {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(config.projectRoot, '.build-safety', 'backups')
    const backupPath = path.join(backupDir, `backup-${timestamp}`)
    
    // 백업 디렉토리 생성
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    fs.mkdirSync(backupPath, { recursive: true })
    
    // 백업할 파일들
    const backupTargets = [
      'src/shared',
      'src/backend/src',
      'src/frontend/src'
    ]
    
    for (const target of backupTargets) {
      const sourcePath = path.join(config.projectRoot, target)
      const destPath = path.join(backupPath, target)
      
      if (fs.existsSync(sourcePath)) {
        copyDirectory(sourcePath, destPath)
      }
    }
    
    log(`안전 백업 생성됨: ${backupPath}`, 'cyan')
    return backupPath
    
  } catch (error: any) {
    logError(`안전 백업 생성 실패: ${error.message}`)
    return null
  }
}

// 디렉토리 복사
function copyDirectory(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }
  
  const items = fs.readdirSync(source)
  
  for (const item of items) {
    const sourcePath = path.join(source, item)
    const destPath = path.join(destination, item)
    const stat = fs.statSync(sourcePath)
    
    if (stat.isDirectory()) {
      copyDirectory(sourcePath, destPath)
    } else {
      fs.copyFileSync(sourcePath, destPath)
    }
  }
}

// 백업에서 롤백
function rollbackFromBackup(backupPath: string | null): boolean {
  try {
    if (!backupPath || !fs.existsSync(backupPath)) {
      logError('백업 경로를 찾을 수 없습니다.')
      return false
    }
    
    const backupTargets = [
      'src/shared',
      'src/backend/src',
      'src/frontend/src'
    ]
    
    for (const target of backupTargets) {
      const sourcePath = path.join(backupPath, target)
      const destPath = path.join(config.projectRoot, target)
      
      if (fs.existsSync(sourcePath)) {
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true })
        }
        copyDirectory(sourcePath, destPath)
      }
    }
    
    logSuccess('롤백 완료')
    return true
    
  } catch (error: any) {
    logError(`롤백 실패: ${error.message}`)
    return false
  }
}

// 메인 빌드 함수
async function buildStructured(): Promise<void> {
  const startTime = Date.now()
  
  try {
    log('🚀 구조화된 빌드를 시작합니다...', 'bright')
    
    // 1. 기존 dist 폴더 정리
    cleanupDist()
    
    // 2. JS to CJS 변환 실행
    executeJSConversion()
    
    // 3. 백엔드 빌드
    if (!buildBackend()) {
      process.exit(1)
    }
    
    // 4. 프론트엔드 빌드
    if (!buildFrontend()) {
      process.exit(1)
    }
    
    // 5. dist 폴더 구조 정리
    if (!organizeDistStructure()) {
      process.exit(1)
    }
    
    // 6. 빌드 결과 검증
    if (!validateBuild()) {
      process.exit(1)
    }
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    logSuccess(`구조화된 빌드가 완료되었습니다! (소요시간: ${duration}초)`)
    printBuildInfo()
    
  } catch (error: any) {
    logError(`빌드 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  buildStructured()
}

export { buildStructured }
