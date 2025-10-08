#!/usr/bin/env node

/**
 * 모듈 분석기
 * ES 모듈과 CommonJS 모듈을 구분하고 적절한 변환 전략을 결정
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

interface FileAnalysis {
  path: string
  hasESImports: boolean
  hasESExports: boolean
  hasCommonJSRequire: boolean
  hasCommonJSModule: boolean
  hasImportMeta: boolean
  hasDynamicImport: boolean
}

interface Conflict {
  type: string
  description: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface Recommendation {
  type: string
  description: string
  action: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface Solution {
  packageJsonUpdates: PackageJsonUpdate[]
  fileConversions: FileConversion[]
  buildStrategy: BuildStrategy | null
}

interface PackageJsonUpdate {
  file: string
  action: string
  description: string
}

interface FileConversion {
  file: string
  from: string
  to: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface BuildStrategy {
  name: string
  description: string
  steps: string[]
}

/**
 * 모듈 타입 분석 클래스
 */
class ModuleAnalyzer {
  private projectRoot: string
  private moduleTypes: Map<string, string> = new Map()
  private conflicts: Conflict[] = []
  private recommendations: Recommendation[] = []

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  /**
   * 프로젝트의 모듈 타입 분석
   */
  async analyzeProject(): Promise<void> {
    logStep('ANALYZE', '프로젝트 모듈 타입 분석 중...')
    
    // 1. package.json 분석
    await this.analyzePackageJson()
    
    // 2. 소스 파일 분석
    await this.analyzeSourceFiles()
    
    // 3. 충돌 검사
    this.detectConflicts()
    
    // 4. 권장사항 생성
    this.generateRecommendations()
    
    logSuccess('모듈 타입 분석 완료')
  }

  /**
   * package.json 분석
   */
  private async analyzePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json')
    
    if (!fs.existsSync(packageJsonPath)) {
      logError('package.json을 찾을 수 없습니다.')
      return
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // type 필드 확인
      if (packageJson.type === 'module') {
        this.moduleTypes.set('root', 'ES_MODULE')
        log('루트 프로젝트: ES 모듈 설정됨', 'yellow')
      } else {
        this.moduleTypes.set('root', 'COMMONJS')
        log('루트 프로젝트: CommonJS 설정됨', 'blue')
      }
      
      // 백엔드 package.json 확인
      const backendPackageJsonPath = path.join(this.projectRoot, 'src', 'backend', 'package.json')
      if (fs.existsSync(backendPackageJsonPath)) {
        const backendPackageJson = JSON.parse(fs.readFileSync(backendPackageJsonPath, 'utf8'))
        
        if (backendPackageJson.type === 'module') {
          this.moduleTypes.set('backend', 'ES_MODULE')
          log('백엔드: ES 모듈 설정됨', 'yellow')
        } else {
          this.moduleTypes.set('backend', 'COMMONJS')
          log('백엔드: CommonJS 설정됨', 'blue')
        }
      }
      
    } catch (error: any) {
      logError(`package.json 분석 실패: ${error.message}`)
    }
  }

  /**
   * 소스 파일 분석
   */
  private async analyzeSourceFiles(): Promise<void> {
    const srcDir = path.join(this.projectRoot, 'src')
    
    if (!fs.existsSync(srcDir)) {
      logWarning('src 디렉토리를 찾을 수 없습니다.')
      return
    }
    
    await this.analyzeDirectory(srcDir)
  }

  /**
   * 디렉토리 재귀 분석
   */
  private async analyzeDirectory(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) return
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        await this.analyzeDirectory(fullPath)
      } else if (this.isJavaScriptFile(fullPath)) {
        await this.analyzeFile(fullPath)
      }
    }
  }

  /**
   * JavaScript 파일 여부 확인
   */
  private isJavaScriptFile(filePath: string): boolean {
    const ext = path.extname(filePath)
    return ['.js', '.ts', '.tsx', '.jsx'].includes(ext)
  }

  /**
   * 개별 파일 분석
   */
  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const relativePath = path.relative(this.projectRoot, filePath)
      
      const analysis: FileAnalysis = {
        path: relativePath,
        hasESImports: this.hasESImports(content),
        hasESExports: this.hasESExports(content),
        hasCommonJSRequire: this.hasCommonJSRequire(content),
        hasCommonJSModule: this.hasCommonJSModule(content),
        hasImportMeta: this.hasImportMeta(content),
        hasDynamicImport: this.hasDynamicImport(content)
      }
      
      // 모듈 타입 결정
      const moduleType = this.determineModuleType(analysis)
      this.moduleTypes.set(relativePath, moduleType)
      
      log(`파일 분석: ${relativePath} - ${moduleType}`, 'cyan')
      
    } catch (error: any) {
      logWarning(`파일 분석 실패: ${filePath} - ${error.message}`)
    }
  }

  /**
   * ES import 구문 확인
   */
  private hasESImports(content: string): boolean {
    return /import\s+.*\s+from\s+['"]/.test(content)
  }

  /**
   * ES export 구문 확인
   */
  private hasESExports(content: string): boolean {
    return /export\s+(default\s+)?/.test(content)
  }

  /**
   * CommonJS require 확인
   */
  private hasCommonJSRequire(content: string): boolean {
    return /require\s*\(/.test(content)
  }

  /**
   * CommonJS module.exports 확인
   */
  private hasCommonJSModule(content: string): boolean {
    return /module\.exports/.test(content)
  }

  /**
   * import.meta 확인
   */
  private hasImportMeta(content: string): boolean {
    return /import\.meta/.test(content)
  }

  /**
   * 동적 import 확인
   */
  private hasDynamicImport(content: string): boolean {
    return /import\s*\(/.test(content)
  }

  /**
   * 모듈 타입 결정
   */
  private determineModuleType(analysis: FileAnalysis): string {
    const { hasESImports, hasESExports, hasCommonJSRequire, hasCommonJSModule, hasImportMeta, hasDynamicImport } = analysis
    
    // ES 모듈 지표
    const esModuleIndicators = hasESImports || hasESExports || hasImportMeta || hasDynamicImport
    const commonJSIndicators = hasCommonJSRequire || hasCommonJSModule
    
    if (esModuleIndicators && !commonJSIndicators) {
      return 'ES_MODULE'
    } else if (commonJSIndicators && !esModuleIndicators) {
      return 'COMMONJS'
    } else if (esModuleIndicators && commonJSIndicators) {
      return 'MIXED'
    } else {
      return 'UNKNOWN'
    }
  }

  /**
   * 충돌 검사
   */
  private detectConflicts(): void {
    logStep('CONFLICT', '모듈 충돌 검사 중...')
    
    const rootType = this.moduleTypes.get('root')
    const backendType = this.moduleTypes.get('backend')
    
    // 루트와 백엔드 타입 충돌
    if (rootType === 'ES_MODULE' && backendType === 'COMMONJS') {
      this.conflicts.push({
        type: 'ROOT_BACKEND_MISMATCH',
        description: '루트 프로젝트는 ES 모듈이지만 백엔드는 CommonJS입니다.',
        severity: 'HIGH'
      })
    }
    
    // MIXED 타입 파일들
    for (const [filePath, moduleType] of this.moduleTypes) {
      if (moduleType === 'MIXED') {
        this.conflicts.push({
          type: 'MIXED_MODULE',
          description: `파일 ${filePath}에서 ES 모듈과 CommonJS가 혼재되어 있습니다.`,
          severity: 'MEDIUM'
        })
      }
    }
    
    if (this.conflicts.length > 0) {
      logWarning(`${this.conflicts.length}개의 충돌이 발견되었습니다.`)
      for (const conflict of this.conflicts) {
        log(`- ${conflict.description} (심각도: ${conflict.severity})`, 'yellow')
      }
    } else {
      logSuccess('모듈 충돌이 발견되지 않았습니다.')
    }
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(): void {
    logStep('RECOMMEND', '권장사항 생성 중...')
    
    const rootType = this.moduleTypes.get('root')
    const backendType = this.moduleTypes.get('backend')
    
    // 1. 루트 프로젝트 타입 변경 권장
    if (rootType === 'ES_MODULE') {
      this.recommendations.push({
        type: 'PACKAGE_JSON_UPDATE',
        description: '루트 package.json에서 "type": "module" 제거를 고려하세요.',
        action: 'package.json에서 "type" 필드 제거 또는 "type": "commonjs"로 변경',
        priority: 'HIGH'
      })
    }
    
    // 2. 백엔드 전용 package.json 생성 권장
    if (backendType === 'COMMONJS') {
      this.recommendations.push({
        type: 'BACKEND_PACKAGE_JSON',
        description: '백엔드 전용 package.json에서 "type": "commonjs" 명시',
        action: 'src/backend/package.json에 "type": "commonjs" 추가',
        priority: 'MEDIUM'
      })
    }
    
    // 3. 변환 전략 권장
    this.recommendations.push({
      type: 'CONVERSION_STRATEGY',
      description: 'ES 모듈을 CommonJS로 변환하는 전략 적용',
      action: 'JS to CJS 변환 스크립트 사용',
      priority: 'HIGH'
    })
    
    logSuccess(`${this.recommendations.length}개의 권장사항이 생성되었습니다.`)
    for (const rec of this.recommendations) {
      log(`- ${rec.description} (우선순위: ${rec.priority})`, 'cyan')
    }
  }

  /**
   * 분석 결과 출력
   */
  printAnalysis(): void {
    log('\n📊 모듈 분석 결과:', 'cyan')
    
    // 모듈 타입별 파일 수
    const typeCounts = new Map<string, number>()
    for (const [filePath, moduleType] of this.moduleTypes) {
      if (filePath !== 'root' && filePath !== 'backend') {
        typeCounts.set(moduleType, (typeCounts.get(moduleType) || 0) + 1)
      }
    }
    
    for (const [type, count] of typeCounts) {
      log(`- ${type}: ${count}개 파일`, 'blue')
    }
    
    // 충돌 정보
    if (this.conflicts.length > 0) {
      log('\n⚠️  발견된 충돌:', 'yellow')
      for (const conflict of this.conflicts) {
        log(`- ${conflict.description}`, 'yellow')
      }
    }
    
    // 권장사항
    if (this.recommendations.length > 0) {
      log('\n💡 권장사항:', 'green')
      for (const rec of this.recommendations) {
        log(`- ${rec.description}`, 'green')
        log(`  → ${rec.action}`, 'cyan')
      }
    }
  }

  /**
   * 해결 방안 생성
   */
  generateSolution(): Solution {
    logStep('SOLUTION', '해결 방안 생성 중...')
    
    const solution: Solution = {
      packageJsonUpdates: [],
      fileConversions: [],
      buildStrategy: null
    }
    
    // 1. package.json 업데이트
    if (this.moduleTypes.get('root') === 'ES_MODULE') {
      solution.packageJsonUpdates.push({
        file: 'package.json',
        action: 'REMOVE_TYPE_MODULE',
        description: '"type": "module" 제거'
      })
    }
    
    // 2. 파일 변환 목록
    for (const [filePath, moduleType] of this.moduleTypes) {
      if (moduleType === 'ES_MODULE' || moduleType === 'MIXED') {
        solution.fileConversions.push({
          file: filePath,
          from: moduleType,
          to: 'COMMONJS',
          priority: moduleType === 'MIXED' ? 'HIGH' : 'MEDIUM'
        })
      }
    }
    
    // 3. 빌드 전략
    solution.buildStrategy = {
      name: 'HYBRID_APPROACH',
      description: 'ES 모듈을 CommonJS로 변환 후 빌드',
      steps: [
        '1. ES 모듈 파일들을 CommonJS로 변환',
        '2. package.json에서 type: module 제거',
        '3. 백엔드 빌드 실행',
        '4. 프론트엔드 빌드 실행',
        '5. 구조화된 dist 폴더 생성'
      ]
    }
    
    return solution
  }
}

// 메인 분석 함수
async function analyzeModules(): Promise<{ analyzer: ModuleAnalyzer; solution: Solution }> {
  try {
    log('🔍 모듈 타입 분석을 시작합니다...', 'bright')
    
    const projectRoot = process.cwd()
    const analyzer = new ModuleAnalyzer(projectRoot)
    
    await analyzer.analyzeProject()
    analyzer.printAnalysis()
    
    const solution = analyzer.generateSolution()
    
    log('\n🛠️  해결 방안:', 'cyan')
    log(`- package.json 업데이트: ${solution.packageJsonUpdates.length}개`, 'blue')
    log(`- 파일 변환: ${solution.fileConversions.length}개`, 'blue')
    log(`- 빌드 전략: ${solution.buildStrategy?.name}`, 'blue')
    
    return { analyzer, solution }
    
  } catch (error: any) {
    logError(`모듈 분석 실패: ${error.message}`)
    throw error
  }
}

// 스크립트 실행
if (require.main === module) {
  analyzeModules()
}

export { ModuleAnalyzer, analyzeModules }
