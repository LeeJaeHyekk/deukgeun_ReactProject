#!/usr/bin/env node

/**
 * 변환 통합 빌드 스크립트
 * JS to CJS 변환을 포함한 빌드 프로세스
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

// JS to CJS 변환 실행
function executeConversion(): boolean {
  logStep('CONVERT', 'JS to CJS 변환 실행 중...')
  
  try {
    execSync('npm run convert:js-to-cjs', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout,
      cwd: config.projectRoot
    })
    
    logSuccess('JS to CJS 변환 완료')
    return true
  } catch (error: any) {
    logError(`JS to CJS 변환 실패: ${error.message}`)
    return false
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

// 의존성 설치
function installDependencies(): boolean {
  logStep('INSTALL', '의존성 설치 중...')
  
  try {
    execSync('npm install', { 
      stdio: 'inherit', 
      timeout: config.buildTimeout,
      cwd: config.projectRoot
    })
    
    logSuccess('의존성 설치 완료')
    return true
  } catch (error: any) {
    logError(`의존성 설치 실패: ${error.message}`)
    return false
  }
}

// 빌드 결과 검증
function validateBuild(): boolean {
  logStep('VALIDATE', '빌드 결과 검증 중...')
  
  const buildPaths = [
    'dist/backend',
    'dist'
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

// 메인 빌드 함수
async function buildWithConversion(): Promise<void> {
  const startTime = Date.now()
  
  try {
    log('🚀 변환 통합 빌드를 시작합니다...', 'bright')
    
    // 1. 의존성 설치
    if (!installDependencies()) {
      process.exit(1)
    }
    
    // 2. JS to CJS 변환
    const conversionSuccess = executeConversion()
    
    if (!conversionSuccess) {
      logWarning('변환 실패, 기본 빌드로 진행합니다...')
    }
    
    // 3. 백엔드 빌드
    if (!buildBackend()) {
      process.exit(1)
    }
    
    // 4. 프론트엔드 빌드
    if (!buildFrontend()) {
      process.exit(1)
    }
    
    // 5. 빌드 결과 검증
    if (!validateBuild()) {
      process.exit(1)
    }
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    logSuccess(`변환 통합 빌드가 완료되었습니다! (소요시간: ${duration}초)`)
    
    // 빌드 정보 출력
    log('\n📊 빌드 정보:', 'cyan')
    log(`- 변환 상태: ${conversionSuccess ? '성공' : '실패 (기본 빌드)'}`)
    log(`- 백엔드: dist/backend/`)
    log(`- 프론트엔드: dist/`)
    log(`- 소요시간: ${duration}초`)
    
  } catch (error: any) {
    logError(`빌드 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  buildWithConversion()
}

export { buildWithConversion }
