/**
 * 타입 안전성 및 검증 강화 모듈
 * 런타임 타입 검증, 스키마 검증, 입력 검증 등의 기능 제공
 */

import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logInfo } from './logger-functions'

// 검증 결과 인터페이스
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 스키마 정의 인터페이스
export interface Schema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  enum?: any[]
  properties?: Record<string, Schema>
  items?: Schema
}

// 타입 가드 함수들
export const typeGuards = {
  isString: (value: any): value is string => typeof value === 'string',
  isNumber: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: any): value is boolean => typeof value === 'boolean',
  isObject: (value: any): value is object => typeof value === 'object' && value !== null && !Array.isArray(value),
  isArray: (value: any): value is any[] => Array.isArray(value),
  isFunction: (value: any): value is Function => typeof value === 'function',
  isNull: (value: any): value is null => value === null,
  isUndefined: (value: any): value is undefined => value === undefined
}

// 런타임 타입 검증
export class TypeValidator {
  /**
   * 값이 스키마에 맞는지 검증
   */
  validate(value: any, schema: Schema): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 필수 필드 검증
    if (schema.required && (value === null || value === undefined)) {
      errors.push('필수 필드가 누락되었습니다')
      return { valid: false, errors, warnings }
    }

    // 타입 검증
    if (!this.validateType(value, schema.type)) {
      errors.push(`예상 타입: ${schema.type}, 실제 타입: ${typeof value}`)
      return { valid: false, errors, warnings }
    }

    // 문자열 검증
    if (schema.type === 'string' && typeof value === 'string') {
      this.validateString(value, schema, errors, warnings)
    }

    // 숫자 검증
    if (schema.type === 'number' && typeof value === 'number') {
      this.validateNumber(value, schema, errors, warnings)
    }

    // 객체 검증
    if (schema.type === 'object' && typeof value === 'object' && value !== null) {
      this.validateObject(value, schema, errors, warnings)
    }

    // 배열 검증
    if (schema.type === 'array' && Array.isArray(value)) {
      this.validateArray(value, schema, errors, warnings)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeGuards.isString(value)
      case 'number':
        return typeGuards.isNumber(value)
      case 'boolean':
        return typeGuards.isBoolean(value)
      case 'object':
        return typeGuards.isObject(value)
      case 'array':
        return typeGuards.isArray(value)
      default:
        return false
    }
  }

  private validateString(value: string, schema: Schema, errors: string[], warnings: string[]): void {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`문자열 길이가 너무 짧습니다 (최소: ${schema.minLength})`)
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(`문자열 길이가 너무 깁니다 (최대: ${schema.maxLength})`)
    }

    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push(`문자열이 패턴과 일치하지 않습니다: ${schema.pattern}`)
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`허용되지 않는 값입니다. 허용 값: ${schema.enum.join(', ')}`)
    }
  }

  private validateNumber(value: number, schema: Schema, errors: string[], warnings: string[]): void {
    if (schema.min !== undefined && value < schema.min) {
      errors.push(`값이 너무 작습니다 (최소: ${schema.min})`)
    }

    if (schema.max !== undefined && value > schema.max) {
      errors.push(`값이 너무 큽니다 (최대: ${schema.max})`)
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`허용되지 않는 값입니다. 허용 값: ${schema.enum.join(', ')}`)
    }
  }

  private validateObject(value: object, schema: Schema, errors: string[], warnings: string[]): void {
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propValue = (value as any)[key]
        const propResult = this.validate(propValue, propSchema)
        
        if (!propResult.valid) {
          errors.push(`속성 '${key}': ${propResult.errors.join(', ')}`)
        }
        
        warnings.push(...propResult.warnings.map(w => `속성 '${key}': ${w}`))
      }
    }
  }

  private validateArray(value: any[], schema: Schema, errors: string[], warnings: string[]): void {
    if (schema.items) {
      value.forEach((item, index) => {
        const itemResult = this.validate(item, schema.items!)
        if (!itemResult.valid) {
          errors.push(`배열 항목 ${index}: ${itemResult.errors.join(', ')}`)
        }
        warnings.push(...itemResult.warnings.map(w => `배열 항목 ${index}: ${w}`))
      })
    }
  }
}

// 스크립트 옵션 검증
export class ScriptOptionsValidator {
  private validator = new TypeValidator()

  /**
   * 스크립트 실행 옵션 검증
   */
  validateScriptOptions(options: any): ValidationResult {
    const schema: Schema = {
      type: 'object',
      required: true,
      properties: {
        script: {
          type: 'string',
          required: true,
          enum: ['convert', 'build', 'deploy', 'safety', 'all']
        },
        projectRoot: {
          type: 'string',
          required: true,
          minLength: 1
        },
        parallel: {
          type: 'boolean',
          required: true
        },
        maxWorkers: {
          type: 'number',
          required: true,
          min: 1,
          max: 16
        },
        timeout: {
          type: 'number',
          required: true,
          min: 1000,
          max: 3600000 // 1시간
        },
        verbose: {
          type: 'boolean',
          required: true
        },
        dryRun: {
          type: 'boolean',
          required: true
        }
      }
    }

    return this.validator.validate(options, schema)
  }

  /**
   * 빌드 옵션 검증
   */
  validateBuildOptions(options: any): ValidationResult {
    const schema: Schema = {
      type: 'object',
      required: true,
      properties: {
        timeout: {
          type: 'number',
          required: true,
          min: 1000,
          max: 1800000 // 30분
        },
        maxRetries: {
          type: 'number',
          required: true,
          min: 0,
          max: 10
        },
        parallel: {
          type: 'boolean',
          required: true
        },
        validate: {
          type: 'boolean',
          required: true
        },
        cleanup: {
          type: 'boolean',
          required: true
        },
        safety: {
          type: 'boolean',
          required: true
        },
        backup: {
          type: 'boolean',
          required: true
        }
      }
    }

    return this.validator.validate(options, schema)
  }

  /**
   * 배포 옵션 검증
   */
  validateDeployOptions(options: any): ValidationResult {
    const schema: Schema = {
      type: 'object',
      required: true,
      properties: {
        timeout: {
          type: 'number',
          required: true,
          min: 1000,
          max: 3600000 // 1시간
        },
        maxRetries: {
          type: 'number',
          required: true,
          min: 0,
          max: 10
        },
        parallel: {
          type: 'boolean',
          required: true
        },
        validate: {
          type: 'boolean',
          required: true
        },
        cleanup: {
          type: 'boolean',
          required: true
        },
        backup: {
          type: 'boolean',
          required: true
        },
        autoRecovery: {
          type: 'boolean',
          required: true
        }
      }
    }

    return this.validator.validate(options, schema)
  }
}

// 파일 시스템 검증
export class FileSystemValidator {
  /**
   * 프로젝트 루트 디렉토리 검증
   */
  validateProjectRoot(projectRoot: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 경로 존재 확인
      if (!fs.existsSync(projectRoot)) {
        errors.push(`프로젝트 루트 디렉토리가 존재하지 않습니다: ${projectRoot}`)
        return { valid: false, errors, warnings }
      }

      // 디렉토리인지 확인
      const stat = fs.statSync(projectRoot)
      if (!stat.isDirectory()) {
        errors.push(`프로젝트 루트가 디렉토리가 아닙니다: ${projectRoot}`)
        return { valid: false, errors, warnings }
      }

      // 필수 파일들 확인
      const requiredFiles = ['package.json', 'tsconfig.json']
      for (const file of requiredFiles) {
        const filePath = path.join(projectRoot, file)
        if (!fs.existsSync(filePath)) {
          errors.push(`필수 파일이 없습니다: ${file}`)
        }
      }

      // 필수 디렉토리들 확인
      const requiredDirs = ['src', 'src/backend', 'src/frontend']
      for (const dir of requiredDirs) {
        const dirPath = path.join(projectRoot, dir)
        if (!fs.existsSync(dirPath)) {
          errors.push(`필수 디렉토리가 없습니다: ${dir}`)
        }
      }

      // 권한 확인
      try {
        fs.accessSync(projectRoot, fs.constants.R_OK | fs.constants.W_OK)
      } catch (error) {
        errors.push(`프로젝트 루트에 대한 읽기/쓰기 권한이 없습니다: ${projectRoot}`)
      }

    } catch (error) {
      errors.push(`프로젝트 루트 검증 중 오류 발생: ${(error as Error).message}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 빌드 결과 검증
   */
  validateBuildOutput(projectRoot: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const distPath = path.join(projectRoot, 'dist')
    if (!fs.existsSync(distPath)) {
      errors.push('빌드 결과 디렉토리가 없습니다: dist')
      return { valid: false, errors, warnings }
    }

    // 필수 빌드 결과 확인
    const requiredPaths = [
      'dist/backend',
      'dist/frontend',
      'dist/shared'
    ]

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(projectRoot, requiredPath)
      if (!fs.existsSync(fullPath)) {
        errors.push(`필수 빌드 결과가 없습니다: ${requiredPath}`)
      }
    }

    // 빌드 결과 파일 확인
    const backendFiles = ['package.json', 'index.js']
    const frontendFiles = ['index.html', 'assets']

    for (const file of backendFiles) {
      const filePath = path.join(projectRoot, 'dist/backend', file)
      if (!fs.existsSync(filePath)) {
        warnings.push(`백엔드 빌드 결과 파일이 없습니다: ${file}`)
      }
    }

    for (const file of frontendFiles) {
      const filePath = path.join(projectRoot, 'dist/frontend', file)
      if (!fs.existsSync(filePath)) {
        warnings.push(`프론트엔드 빌드 결과 파일이 없습니다: ${file}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// 환경 변수 검증
export class EnvironmentValidator {
  /**
   * 환경 변수 검증
   */
  validateEnvironmentVariables(requiredVars: string[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    for (const varName of requiredVars) {
      const value = process.env[varName]
      
      if (!value) {
        errors.push(`필수 환경 변수가 설정되지 않았습니다: ${varName}`)
      } else if (value.trim() === '') {
        warnings.push(`환경 변수가 비어있습니다: ${varName}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Node.js 버전 검증
   */
  validateNodeVersion(minVersion: string = '16.0.0'): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const currentVersion = process.version
    const currentMajor = parseInt(currentVersion.slice(1).split('.')[0])
    const minMajor = parseInt(minVersion.split('.')[0])

    if (currentMajor < minMajor) {
      errors.push(`Node.js 버전이 너무 낮습니다. 최소: ${minVersion}, 현재: ${currentVersion}`)
    } else if (currentMajor > minMajor + 2) {
      warnings.push(`Node.js 버전이 권장보다 높습니다. 권장: ${minVersion}, 현재: ${currentVersion}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// 통합 검증 함수
export const validationUtils = {
  /**
   * 모든 검증 실행
   */
  async validateAll(projectRoot: string, options: any): Promise<{
    valid: boolean
    results: Record<string, ValidationResult>
    summary: string
  }> {
    const validator = new ScriptOptionsValidator()
    const fileValidator = new FileSystemValidator()
    const envValidator = new EnvironmentValidator()

    const results: Record<string, ValidationResult> = {}

    // 스크립트 옵션 검증
    results.scriptOptions = validator.validateScriptOptions(options)

    // 프로젝트 루트 검증
    results.projectRoot = fileValidator.validateProjectRoot(projectRoot)

    // 환경 변수 검증
    results.environment = envValidator.validateEnvironmentVariables([
      'NODE_ENV',
      'NPM_CONFIG_LOGLEVEL'
    ])

    // Node.js 버전 검증
    results.nodeVersion = envValidator.validateNodeVersion()

    const allValid = Object.values(results).every(result => result.valid)
    const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0)
    const totalWarnings = Object.values(results).reduce((sum, result) => sum + result.warnings.length, 0)

    const summary = `검증 완료: ${allValid ? '성공' : '실패'} (오류: ${totalErrors}개, 경고: ${totalWarnings}개)`

    return {
      valid: allValid,
      results,
      summary
    }
  },

  /**
   * 검증 결과 출력
   */
  printValidationResults(results: Record<string, ValidationResult>): void {
    logInfo('\n📋 검증 결과:')
    logInfo('='.repeat(50))

    for (const [category, result] of Object.entries(results)) {
      const status = result.valid ? '✅' : '❌'
      logInfo(`\n${status} ${category}:`)
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => logError(`  - ${error}`))
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => logWarning(`  - ${warning}`))
      }
      
      if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
        logInfo('  - 검증 통과')
      }
    }
  }
}
