// ============================================================================
// 타입 안전성 체크 자동화 도구
// ============================================================================

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface TypeSafetyReport {
  timestamp: string
  totalFiles: number
  typeErrors: number
  apiValidationCoverage: number
  hookTypeSafety: number
  componentTypeSafety: number
  issues: TypeSafetyIssue[]
  recommendations: string[]
}

interface TypeSafetyIssue {
  file: string
  line?: number
  severity: 'error' | 'warning' | 'info'
  message: string
  category: 'type' | 'api' | 'hook' | 'component'
}

class TypeSafetyChecker {
  private projectRoot: string
  private report: TypeSafetyReport

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.report = {
      timestamp: new Date().toISOString(),
      totalFiles: 0,
      typeErrors: 0,
      apiValidationCoverage: 0,
      hookTypeSafety: 0,
      componentTypeSafety: 0,
      issues: [],
      recommendations: []
    }
  }

  // 메인 체크 실행
  async runChecks(): Promise<TypeSafetyReport> {
    console.log('🔍 타입 안전성 체크 시작...')
    
    await this.checkTypeScriptErrors()
    await this.checkApiValidationCoverage()
    await this.checkHookTypeSafety()
    await this.checkComponentTypeSafety()
    await this.generateRecommendations()
    
    console.log('✅ 타입 안전성 체크 완료')
    return this.report
  }

  // TypeScript 컴파일 에러 체크
  private async checkTypeScriptErrors(): Promise<void> {
    console.log('📝 TypeScript 컴파일 에러 체크...')
    
    try {
      execSync('npx tsc --noEmit --pretty', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      })
      console.log('✅ TypeScript 컴파일 에러 없음')
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || ''
      const errorCount = (output.match(/error TS/g) || []).length
      this.report.typeErrors = errorCount
      
      // 에러 파싱
      const lines = output.split('\n')
      lines.forEach(line => {
        if (line.includes('error TS')) {
          const match = line.match(/(.+?)\((\d+),(\d+)\): error TS(\d+): (.+)/)
          if (match) {
            this.report.issues.push({
              file: match[1],
              line: parseInt(match[2]),
              severity: 'error',
              message: match[5],
              category: 'type'
            })
          }
        }
      })
      
      console.log(`❌ ${errorCount}개의 TypeScript 에러 발견`)
    }
  }

  // API 검증 커버리지 체크
  private async checkApiValidationCoverage(): Promise<void> {
    console.log('🔌 API 검증 커버리지 체크...')
    
    const apiFiles = this.findFiles('src', ['.ts', '.tsx'], ['api', 'service'])
    const validationFiles = this.findFiles('src', ['.ts'], ['validation', 'guard'])
    
    let totalApiEndpoints = 0
    let validatedEndpoints = 0
    
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      const endpoints = this.extractApiEndpoints(content)
      totalApiEndpoints += endpoints.length
      
      endpoints.forEach(endpoint => {
        if (this.hasValidation(endpoint, content)) {
          validatedEndpoints++
        } else {
          this.report.issues.push({
            file: file,
            severity: 'warning',
            message: `API 엔드포인트에 타입 검증이 없습니다: ${endpoint}`,
            category: 'api'
          })
        }
      })
    })
    
    this.report.apiValidationCoverage = totalApiEndpoints > 0 
      ? Math.round((validatedEndpoints / totalApiEndpoints) * 100)
      : 100
    
    console.log(`📊 API 검증 커버리지: ${this.report.apiValidationCoverage}%`)
  }

  // 훅 타입 안전성 체크
  private async checkHookTypeSafety(): Promise<void> {
    console.log('🪝 훅 타입 안전성 체크...')
    
    const hookFiles = this.findFiles('src', ['.ts', '.tsx'], ['hook'])
    let totalHooks = 0
    let typeSafeHooks = 0
    
    hookFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      const hooks = this.extractHooks(content)
      totalHooks += hooks.length
      
      hooks.forEach(hook => {
        if (this.hasHookTypeSafety(hook, content)) {
          typeSafeHooks++
        } else {
          this.report.issues.push({
            file: file,
            severity: 'warning',
            message: `훅에 반환 타입이 정의되지 않았습니다: ${hook}`,
            category: 'hook'
          })
        }
      })
    })
    
    this.report.hookTypeSafety = totalHooks > 0 
      ? Math.round((typeSafeHooks / totalHooks) * 100)
      : 100
    
    console.log(`📊 훅 타입 안전성: ${this.report.hookTypeSafety}%`)
  }

  // 컴포넌트 타입 안전성 체크
  private async checkComponentTypeSafety(): Promise<void> {
    console.log('🧩 컴포넌트 타입 안전성 체크...')
    
    const componentFiles = this.findFiles('src', ['.tsx'], ['component'])
    let totalComponents = 0
    let typeSafeComponents = 0
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      const components = this.extractComponents(content)
      totalComponents += components.length
      
      components.forEach(component => {
        if (this.hasComponentTypeSafety(component, content)) {
          typeSafeComponents++
        } else {
          this.report.issues.push({
            file: file,
            severity: 'info',
            message: `컴포넌트에 Props 인터페이스가 없습니다: ${component}`,
            category: 'component'
          })
        }
      })
    })
    
    this.report.componentTypeSafety = totalComponents > 0 
      ? Math.round((typeSafeComponents / totalComponents) * 100)
      : 100
    
    console.log(`📊 컴포넌트 타입 안전성: ${this.report.componentTypeSafety}%`)
  }

  // 권장사항 생성
  private async generateRecommendations(): Promise<void> {
    const recommendations: string[] = []
    
    if (this.report.typeErrors > 0) {
      recommendations.push('TypeScript 컴파일 에러를 수정하세요')
    }
    
    if (this.report.apiValidationCoverage < 80) {
      recommendations.push('API 엔드포인트에 타입 검증을 추가하세요')
    }
    
    if (this.report.hookTypeSafety < 90) {
      recommendations.push('훅에 반환 타입을 명시적으로 정의하세요')
    }
    
    if (this.report.componentTypeSafety < 85) {
      recommendations.push('컴포넌트 Props 인터페이스를 정의하세요')
    }
    
    this.report.recommendations = recommendations
  }

  // 파일 찾기 헬퍼
  private findFiles(dir: string, extensions: string[], keywords: string[]): string[] {
    const files: string[] = []
    
    const walkDir = (currentDir: string) => {
      const items = fs.readdirSync(currentDir)
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath)
        } else if (stat.isFile()) {
          const ext = path.extname(item)
          if (extensions.includes(ext)) {
            const relativePath = path.relative(this.projectRoot, fullPath)
            if (keywords.some(keyword => relativePath.includes(keyword))) {
              files.push(fullPath)
            }
          }
        }
      })
    }
    
    walkDir(path.join(this.projectRoot, dir))
    return files
  }

  // API 엔드포인트 추출
  private extractApiEndpoints(content: string): string[] {
    const endpoints: string[] = []
    const patterns = [
      /\.get\(['"`]([^'"`]+)['"`]/g,
      /\.post\(['"`]([^'"`]+)['"`]/g,
      /\.put\(['"`]([^'"`]+)['"`]/g,
      /\.delete\(['"`]([^'"`]+)['"`]/g
    ]
    
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        endpoints.push(match[1])
      }
    })
    
    return endpoints
  }

  // 검증 존재 여부 체크
  private hasValidation(endpoint: string, content: string): boolean {
    const validationPatterns = [
      /validateApiResponse/,
      /isValidUser/,
      /isValidMachine/,
      /isValidWorkoutPlan/,
      /isValidWorkoutGoal/,
      /parseApiResponse/
    ]
    
    return validationPatterns.some(pattern => pattern.test(content))
  }

  // 훅 추출
  private extractHooks(content: string): string[] {
    const hooks: string[] = []
    const pattern = /function\s+(use\w+)\s*\(/g
    let match
    
    while ((match = pattern.exec(content)) !== null) {
      hooks.push(match[1])
    }
    
    return hooks
  }

  // 훅 타입 안전성 체크
  private hasHookTypeSafety(hook: string, content: string): boolean {
    const returnTypePattern = new RegExp(`function\\s+${hook}\\s*\\([^)]*\\):\\s*\\w+`)
    return returnTypePattern.test(content)
  }

  // 컴포넌트 추출
  private extractComponents(content: string): string[] {
    const components: string[] = []
    const patterns = [
      /function\s+(\w+)\s*\(/g,
      /const\s+(\w+)\s*=\s*\(/g
    ]
    
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        if (match[1][0] === match[1][0].toUpperCase()) {
          components.push(match[1])
        }
      }
    })
    
    return components
  }

  // 컴포넌트 타입 안전성 체크
  private hasComponentTypeSafety(component: string, content: string): boolean {
    const propsPattern = new RegExp(`interface\\s+${component}Props`)
    return propsPattern.test(content)
  }

  // 리포트 저장
  saveReport(outputPath: string): void {
    const reportJson = JSON.stringify(this.report, null, 2)
    fs.writeFileSync(outputPath, reportJson)
    console.log(`📄 리포트 저장: ${outputPath}`)
  }

  // 콘솔에 요약 출력
  printSummary(): void {
    console.log('\n📊 타입 안전성 체크 요약')
    console.log('=' .repeat(50))
    console.log(`총 파일 수: ${this.report.totalFiles}`)
    console.log(`TypeScript 에러: ${this.report.typeErrors}`)
    console.log(`API 검증 커버리지: ${this.report.apiValidationCoverage}%`)
    console.log(`훅 타입 안전성: ${this.report.hookTypeSafety}%`)
    console.log(`컴포넌트 타입 안전성: ${this.report.componentTypeSafety}%`)
    console.log(`발견된 이슈: ${this.report.issues.length}개`)
    
    if (this.report.recommendations.length > 0) {
      console.log('\n💡 권장사항:')
      this.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }
  }
}

// CLI 실행
if (require.main === module) {
  const projectRoot = process.cwd()
  const checker = new TypeSafetyChecker(projectRoot)
  
  checker.runChecks()
    .then(report => {
      checker.printSummary()
      checker.saveReport('type-safety-report.json')
      
      // CI/CD에서 실패 조건 설정
      if (report.typeErrors > 0 || report.apiValidationCoverage < 70) {
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ 타입 안전성 체크 실패:', error)
      process.exit(1)
    })
}

export { TypeSafetyChecker, TypeSafetyReport, TypeSafetyIssue }
