#!/usr/bin/env node

/**
 * 통합 빌드 스크립트
 * 모듈 분석 → 변환 → 구조화된 빌드 → 검증
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// 모듈 import (TypeScript 버전으로 변경 필요)
// const { ModuleAnalyzer, analyzeModules } = require('./module-analyzer.cjs')
// const { SmartModuleConverter, convertModules } = require('./smart-module-converter.cjs')

interface Config {
  projectRoot: string
  buildTimeout: number
  maxRetries: number
}

interface BuildResults {
  analysis?: {
    moduleTypes: [string, any][]
    conflicts: any[]
    recommendations: any[]
  }
  solution?: any
  conversion?: {
    success: boolean
    converted: number
    failed: number
  }
}

const config: Config = {
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
} as const

type ColorKey = keyof typeof colors

function log(message: string, color: ColorKey = 'reset'): void {
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
 * 통합 빌드 프로세스
 */
class IntegratedBuildProcess {
  private projectRoot: string
  private buildSteps: string[]
  private results: BuildResults

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.buildSteps = []
    this.results = {}
  }

  /**
   * 전체 빌드 프로세스 실행
   */
  async executeBuild(): Promise<{ success: boolean; results?: BuildResults; error?: string }> {
    const startTime = Date.now()
    
    try {
      log('🚀 통합 빌드 프로세스를 시작합니다...', 'bright')
      
      // 1. 모듈 분석
      await this.analyzeModules()
      
      // 2. 모듈 변환
      await this.convertModules()
      
      // 3. 구조화된 빌드
      await this.buildStructured()
      
      // 4. 빌드 검증
      await this.validateBuild()
      
      // 5. 결과 보고
      this.printBuildReport(startTime)
      
      return { success: true, results: this.results }
      
    } catch (error) {
      logError(`통합 빌드 실패: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 모듈 분석 단계
   */
  private async analyzeModules(): Promise<void> {
    logStep('ANALYZE', '모듈 타입 분석 중...')
    
    try {
      // TODO: TypeScript 버전의 모듈 분석기로 교체 필요
      // const { analyzer, solution } = await analyzeModules()
      
      // 임시로 빈 결과 설정
      this.results.analysis = {
        moduleTypes: [],
        conflicts: [],
        recommendations: []
      }
      
      this.results.solution = {}
      
      logSuccess('모듈 분석 완료')
      
    } catch (error) {
      logWarning(`모듈 분석 실패: ${(error as Error).message}`)
      // 분석 실패해도 빌드 계속 진행
    }
  }

  /**
   * 모듈 변환 단계
   */
  private async convertModules(): Promise<void> {
    logStep('CONVERT', '모듈 변환 중...')
    
    try {
      // TODO: TypeScript 버전의 모듈 변환기로 교체 필요
      // const result = await convertModules()
      
      // 임시로 성공 결과 설정
      this.results.conversion = {
        success: true,
        converted: 0,
        failed: 0
      }
      
      logSuccess('모듈 변환 완료')
      
    } catch (error) {
      logWarning(`모듈 변환 실패: ${(error as Error).message}`)
      // 변환 실패해도 빌드 계속 진행
    }
  }

  /**
   * 구조화된 빌드 단계
   */
  private async buildStructured(): Promise<void> {
    logStep('BUILD', '구조화된 빌드 실행 중...')
    
    try {
      // 기존 dist 폴더 정리
      this.cleanupDist()
      
      // JS to CJS 변환 실행
      await this.executeJSConversion()
      
      // 백엔드 빌드
      await this.buildBackend()
      
      // 프론트엔드 빌드
      await this.buildFrontend()
      
      // dist 폴더 구조 정리
      await this.organizeDistStructure()
      
      logSuccess('구조화된 빌드 완료')
      
    } catch (error) {
      logError(`구조화된 빌드 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * JS to CJS 변환 실행
   */
  private async executeJSConversion(): Promise<boolean> {
    logStep('CONVERT', 'JS to CJS 변환 실행 중...')
    
    try {
      execSync('npm run convert:js-to-cjs', { 
        stdio: 'inherit', 
        timeout: config.buildTimeout,
        cwd: this.projectRoot
      })
      
      logSuccess('JS to CJS 변환 완료')
      return true
    } catch (error) {
      logWarning(`JS to CJS 변환 실패: ${(error as Error).message}`)
      log('기본 빌드로 진행합니다...', 'yellow')
      return false
    }
  }

  /**
   * 기존 dist 폴더 정리
   */
  private cleanupDist(): void {
    const distPath = path.join(this.projectRoot, 'dist')
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true })
      log('기존 dist 폴더 정리 완료', 'cyan')
    }
  }

  /**
   * 백엔드 빌드
   */
  private async buildBackend(): Promise<void> {
    log('백엔드 빌드 중...', 'blue')
    
    try {
      execSync('npm run build:backend:production', { 
        stdio: 'inherit', 
        timeout: config.buildTimeout,
        cwd: this.projectRoot
      })
      
      logSuccess('백엔드 빌드 완료')
      
    } catch (error) {
      logError(`백엔드 빌드 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 프론트엔드 빌드
   */
  private async buildFrontend(): Promise<void> {
    log('프론트엔드 빌드 중...', 'blue')
    
    try {
      execSync('npm run build:production', { 
        stdio: 'inherit', 
        timeout: config.buildTimeout,
        cwd: this.projectRoot
      })
      
      logSuccess('프론트엔드 빌드 완료')
      
    } catch (error) {
      logError(`프론트엔드 빌드 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * dist 폴더 구조 정리
   */
  private async organizeDistStructure(): Promise<void> {
    log('dist 폴더 구조 정리 중...', 'blue')
    
    try {
      const distPath = path.join(this.projectRoot, 'dist')
      if (!fs.existsSync(distPath)) {
        logError('dist 폴더가 존재하지 않습니다.')
        return
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
      const srcDataPath = path.join(this.projectRoot, 'src', 'data')
      const distDataPath = path.join(distPath, 'data')
      
      if (fs.existsSync(srcDataPath)) {
        if (fs.existsSync(distDataPath)) {
          fs.rmSync(distDataPath, { recursive: true, force: true })
        }
        fs.cpSync(srcDataPath, distDataPath, { recursive: true })
        log('data 폴더 복사 완료', 'cyan')
      }
      
      logSuccess('dist 폴더 구조 정리 완료')
      
    } catch (error) {
      logError(`dist 폴더 구조 정리 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 빌드 검증
   */
  private async validateBuild(): Promise<void> {
    logStep('VALIDATE', '빌드 결과 검증 중...')
    
    const buildPaths = [
      'dist/backend',
      'dist/frontend',
      'dist/shared',
      'dist/data'
    ]
    
    const missingPaths: string[] = []
    
    for (const buildPath of buildPaths) {
      const fullPath = path.join(this.projectRoot, buildPath)
      if (!fs.existsSync(fullPath)) {
        missingPaths.push(buildPath)
      }
    }
    
    if (missingPaths.length > 0) {
      logError(`빌드 결과를 찾을 수 없습니다: ${missingPaths.join(', ')}`)
      throw new Error(`빌드 검증 실패: ${missingPaths.join(', ')}`)
    }
    
    logSuccess('빌드 결과 검증 완료')
  }

  /**
   * 빌드 결과 보고
   */
  private printBuildReport(startTime: number): void {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    log('\n🎉 통합 빌드가 완료되었습니다!', 'green')
    log(`⏱️  소요시간: ${duration}초`, 'cyan')
    
    log('\n📊 빌드 결과:', 'cyan')
    log('- 백엔드: dist/backend/', 'blue')
    log('- 프론트엔드: dist/frontend/', 'blue')
    log('- 공유 모듈: dist/shared/', 'blue')
    log('- 데이터: dist/data/', 'blue')
    
    if (this.results.conversion) {
      log('\n🔄 변환 결과:', 'cyan')
      log(`- 성공: ${this.results.conversion.converted}개 파일`, 'green')
      if (this.results.conversion.failed > 0) {
        log(`- 실패: ${this.results.conversion.failed}개 파일`, 'yellow')
      }
    }
    
    log('\n🔗 서비스 시작:', 'cyan')
    log('- 백엔드: node dist/backend/index.js', 'blue')
    log('- 프론트엔드: node scripts/serve-frontend-simple.cjs', 'blue')
    
    log('\n📝 다음 단계:', 'yellow')
    log('1. PM2로 서비스 시작: npm run pm2:start', 'cyan')
    log('2. 서비스 상태 확인: npm run pm2:status', 'cyan')
    log('3. 로그 확인: npm run pm2:logs', 'cyan')
  }
}

// 메인 빌드 함수
async function integratedBuild(): Promise<void> {
  try {
    const projectRoot = process.cwd()
    const buildProcess = new IntegratedBuildProcess(projectRoot)
    
    const result = await buildProcess.executeBuild()
    
    if (result.success) {
      logSuccess('통합 빌드가 성공적으로 완료되었습니다!')
      process.exit(0)
    } else {
      logError(`통합 빌드 실패: ${result.error}`)
      process.exit(1)
    }
    
  } catch (error) {
    logError(`통합 빌드 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  integratedBuild()
}

export { IntegratedBuildProcess, integratedBuild }
