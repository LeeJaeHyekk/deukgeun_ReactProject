#!/usr/bin/env node

/**
 * Nginx 관리 스크립트
 * 모듈화된 nginx 설정 및 관리 기능
 */

import { 
  defaultLogger,
  FileUtils, 
  ErrorHandler 
} from './modules/index'

import * as NginxFunctions from './modules/nginx-functions'
import * as path from 'path'
import * as fs from 'fs'

// 설정
interface NginxManagerConfig {
  projectRoot: string
  nginxConfigPath: string
  backupDir: string
  autoBackup: boolean
  maxRetries: number
  autoRecovery: boolean
}

const config: NginxManagerConfig = {
  projectRoot: process.cwd(),
  nginxConfigPath: './nginx.conf',
  backupDir: './nginx-backups',
  autoBackup: true,
  maxRetries: 3,
  autoRecovery: true
}

interface NginxManagerResults {
  config: ConfigResult | null
  service: ServiceResult | null
  monitoring: MonitoringResult | null
  errors: ErrorInfo[]
}

interface ConfigResult {
  success: boolean
  optimized: boolean
  validated: boolean
  error?: string
}

interface ServiceResult {
  status: 'running' | 'stopped' | 'error'
  restarted: boolean
  error?: string
}

interface MonitoringResult {
  performance: PerformanceInfo | null
  logs: LogInfo | null
  processes: ProcessInfo | null
}

interface PerformanceInfo {
  connections: number
  memory: number
  cpu: number
}

interface LogInfo {
  accessLog: string
  errorLog: string
}

interface ProcessInfo {
  count: number
  details: string
}

interface ErrorInfo {
  timestamp: string
  error: string
  phase?: string
}

interface ValidationResult {
  type: string
  file?: string
  command?: string
  message?: string
  critical: boolean
}

/**
 * Nginx 관리 프로세스 클래스
 */
class NginxManager {
  private projectRoot: string
  private logger: typeof defaultLogger
  private fileUtils: FileUtils
  private errorHandler: ErrorHandler
  private startTime: number | null = null
  private results: NginxManagerResults = {
    config: null,
    service: null,
    monitoring: null,
    errors: []
  }

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.logger = defaultLogger
    this.fileUtils = new FileUtils(projectRoot)
    this.errorHandler = new ErrorHandler(projectRoot, { autoRecovery: config.autoRecovery })
  }

  /**
   * 전체 nginx 관리 프로세스 실행
   */
  async execute(): Promise<{ success: boolean; results?: NginxManagerResults; error?: string; errorInfo?: ErrorInfo }> {
    this.startTime = Date.now()
    
    try {
      this.logger.separator('=', 60, 'bright')
      this.logger.log('🚀 Nginx 관리 프로세스를 시작합니다...', 'bright')
      this.logger.separator('=', 60, 'bright')
      
      // 1. 사전 검증
      await this.preValidation()
      
      // 2. 설정 관리
      await this.manageConfig()
      
      // 3. 서비스 관리
      await this.manageService()
      
      // 4. 모니터링
      await this.executeMonitoring()
      
      // 5. 후처리
      await this.postProcessing()
      
      // 6. 결과 보고
      this.printResults()
      
      this.logger.separator('=', 60, 'green')
      this.logger.log('🎉 Nginx 관리가 성공적으로 완료되었습니다!', 'green')
      this.logger.separator('=', 60, 'green')
      
      return { success: true, results: this.results }
      
    } catch (error: any) {
      this.logger.separator('=', 60, 'red')
      this.logger.error(`Nginx 관리 실패: ${error.message}`)
      this.logger.separator('=', 60, 'red')
      
      // 에러 처리
      const errorResult = this.errorHandler.handleError(error, {
        phase: 'nginx_management',
        projectRoot: this.projectRoot
      })
      
      this.results.errors.push({ ...errorResult.errorInfo, error: error.message })
      
      return { success: false, error: error.message, errorInfo: { ...errorResult.errorInfo, error: error.message } }
    }
  }

  /**
   * 사전 검증
   */
  private async preValidation(): Promise<void> {
    this.logger.step('PRE_VALIDATE', '사전 검증 중...')
    
    const validations: ValidationResult[] = []
    
    // 1. nginx 설치 확인
    try {
      const { execSync } = require('child_process')
      execSync('nginx -v', { stdio: 'ignore' })
    } catch {
      validations.push({ type: 'missing_nginx', command: 'nginx', critical: true })
    }
    
    // 2. 설정 파일 확인
    if (!this.fileUtils.exists(config.nginxConfigPath)) {
      validations.push({ type: 'missing_config', file: config.nginxConfigPath, critical: false })
    }
    
    // 3. 백업 디렉토리 생성
    if (!this.fileUtils.exists(config.backupDir)) {
      try {
        const fs = require('fs')
        fs.mkdirSync(config.backupDir, { recursive: true })
      } catch (error: any) {
        validations.push({ type: 'backup_dir', message: error.message, critical: false })
      }
    }
    
    // 4. 권한 확인
    try {
      const { execSync } = require('child_process')
      execSync('nginx -t', { stdio: 'ignore' })
    } catch (error: any) {
      validations.push({ type: 'permission', message: 'nginx 설정 권한 부족', critical: true })
    }
    
    // 검증 결과 처리
    const criticalErrors = validations.filter(v => v.critical)
    const warnings = validations.filter(v => !v.critical)
    
    if (criticalErrors.length > 0) {
      this.logger.error('사전 검증 실패:')
      criticalErrors.forEach(error => {
        this.logger.error(`- ${error.type}: ${error.message || error.command || error.file}`)
      })
      throw new Error('사전 검증 실패')
    }
    
    if (warnings.length > 0) {
      this.logger.warning('사전 검증 경고:')
      warnings.forEach(warning => {
        this.logger.warning(`- ${warning.type}: ${warning.message}`)
      })
    }
    
    this.logger.success('사전 검증 완료')
  }

  /**
   * 설정 관리
   */
  private async manageConfig(): Promise<void> {
    this.logger.step('CONFIG', 'Nginx 설정 관리 중...')
    
    try {
      // 1. 기존 설정 백업
      if (config.autoBackup && this.fileUtils.exists(config.nginxConfigPath)) {
        const backupPath = path.join(config.backupDir, `nginx.conf.backup.${Date.now()}`)
        if (NginxFunctions.backupNginxConfig(config.nginxConfigPath, backupPath)) {
          this.logger.success('기존 설정 백업 완료')
        }
      }
      
      // 2. 설정 파일 생성/업데이트
      const nginxConfig = NginxFunctions.generateNginxConfig()
      this.fileUtils.writeFile(config.nginxConfigPath, nginxConfig)
      
      // 3. 설정 검증 및 최적화
      const configValidated = NginxFunctions.validateAndOptimizeNginxConfig(config.nginxConfigPath)
      
      this.results.config = {
        success: configValidated,
        optimized: true,
        validated: configValidated
      }
      
      if (configValidated) {
        this.logger.success('Nginx 설정 관리 완료')
      } else {
        throw new Error('Nginx 설정 검증 실패')
      }
      
    } catch (error: any) {
      this.logger.error(`설정 관리 실패: ${error.message}`)
      this.results.config = {
        success: false,
        optimized: false,
        validated: false,
        error: error.message
      }
      throw error
    }
  }

  /**
   * 서비스 관리
   */
  private async manageService(): Promise<void> {
    this.logger.step('SERVICE', 'Nginx 서비스 관리 중...')
    
    try {
      // 1. 현재 상태 확인
      const isRunning = NginxFunctions.checkNginxStatus()
      
      // 2. 서비스 재시작
      let restarted = false
      if (isRunning) {
        restarted = NginxFunctions.restartNginx()
      } else {
        restarted = NginxFunctions.startNginx()
      }
      
      // 3. 상태 재확인
      const finalStatus = NginxFunctions.checkNginxStatus()
      
      this.results.service = {
        status: finalStatus ? 'running' : 'stopped',
        restarted: restarted
      }
      
      if (finalStatus) {
        this.logger.success('Nginx 서비스 관리 완료')
      } else {
        throw new Error('Nginx 서비스 시작 실패')
      }
      
    } catch (error: any) {
      this.logger.error(`서비스 관리 실패: ${error.message}`)
      this.results.service = {
        status: 'error',
        restarted: false,
        error: error.message
      }
      throw error
    }
  }

  /**
   * 모니터링 실행
   */
  private async executeMonitoring(): Promise<void> {
    this.logger.step('MONITOR', 'Nginx 모니터링 중...')
    
    try {
      // 1. 성능 모니터링
      NginxFunctions.monitorNginxPerformance()
      
      // 2. 로그 확인
      NginxFunctions.checkNginxLogs()
      
      // 3. 프로세스 확인
      NginxFunctions.checkNginxProcesses()
      
      this.results.monitoring = {
        performance: null, // 성능 정보는 콘솔에 출력됨
        logs: null, // 로그 정보는 콘솔에 출력됨
        processes: null // 프로세스 정보는 콘솔에 출력됨
      }
      
      this.logger.success('Nginx 모니터링 완료')
      
    } catch (error: any) {
      this.logger.warning(`모니터링 실패: ${error.message}`)
    }
  }

  /**
   * 후처리
   */
  private async postProcessing(): Promise<void> {
    this.logger.step('POST_PROCESS', '후처리 중...')
    
    try {
      // 1. 최종 상태 확인
      const finalStatus = NginxFunctions.checkNginxStatus()
      
      if (finalStatus) {
        this.logger.success('Nginx 서비스가 정상적으로 실행 중입니다')
      } else {
        this.logger.warning('Nginx 서비스 상태를 확인해주세요')
      }
      
      // 2. 관리 명령어 안내
      this.printManagementCommands()
      
      this.logger.success('후처리 완료')
      
    } catch (error: any) {
      this.logger.warning(`후처리 실패: ${error.message}`)
    }
  }

  /**
   * 관리 명령어 출력
   */
  private printManagementCommands(): void {
    this.logger.log('\n🛠️  Nginx 관리 명령어:', 'cyan')
    this.logger.log('- 상태 확인: nginx -t', 'blue')
    this.logger.log('- 서비스 시작: nginx', 'blue')
    this.logger.log('- 서비스 중지: nginx -s stop', 'blue')
    this.logger.log('- 서비스 재시작: nginx -s reload', 'blue')
    this.logger.log('- 로그 확인: tail -f /var/log/nginx/access.log', 'blue')
    this.logger.log('- 에러 로그: tail -f /var/log/nginx/error.log', 'blue')
    this.logger.log('- 프로세스 확인: ps aux | grep nginx', 'blue')
  }

  /**
   * 결과 출력
   */
  private printResults(): void {
    const endTime = Date.now()
    const duration = ((endTime - (this.startTime || 0)) / 1000).toFixed(2)
    
    this.logger.log('\n📊 Nginx 관리 결과:', 'cyan')
    this.logger.log(`- 소요시간: ${duration}초`, 'blue')
    
    if (this.results.config) {
      this.logger.log(`- 설정: ${this.results.config.success ? '성공' : '실패'}`, 'blue')
      this.logger.log(`- 최적화: ${this.results.config.optimized ? '완료' : '실패'}`, 'blue')
      this.logger.log(`- 검증: ${this.results.config.validated ? '통과' : '실패'}`, 'blue')
    }
    
    if (this.results.service) {
      this.logger.log(`- 서비스: ${this.results.service.status}`, 'blue')
      this.logger.log(`- 재시작: ${this.results.service.restarted ? '완료' : '실패'}`, 'blue')
    }
    
    if (this.results.errors.length > 0) {
      this.logger.log(`- 에러: ${this.results.errors.length}개`, 'red')
    }
    
    this.logger.log('\n🔗 서비스 URL:', 'cyan')
    this.logger.log('- 프론트엔드: http://devtrail.net', 'blue')
    this.logger.log('- 프론트엔드 (WWW): http://www.devtrail.net', 'blue')
    this.logger.log('- 백엔드 API: http://devtrail.net/api', 'blue')
    this.logger.log('- 헬스체크: http://devtrail.net/health', 'blue')
    this.logger.log('- IP 직접 접속: http://3.36.230.117', 'blue')
  }
}

/**
 * Nginx 설정 생성 함수
 */
async function createNginxConfig(): Promise<boolean> {
  try {
    const projectRoot = process.cwd()
    const nginxManager = new NginxManager(projectRoot)
    
    // 설정만 생성
    const configPath = path.join(projectRoot, 'nginx.conf')
    const nginxConfig = NginxFunctions.generateNginxConfig()
    
    fs.writeFileSync(configPath, nginxConfig, 'utf8')
    defaultLogger.success(`Nginx 설정 파일이 생성되었습니다: ${configPath}`)
    
    return true
  } catch (error: any) {
    defaultLogger.error(`Nginx 설정 생성 실패: ${error.message}`)
    return false
  }
}

/**
 * Nginx 서비스 관리 함수
 */
async function controlNginxService(action: 'start' | 'stop' | 'restart' | 'status'): Promise<boolean> {
  try {
    switch (action) {
      case 'start':
        return NginxFunctions.startNginx()
      case 'stop':
        return NginxFunctions.stopNginx()
      case 'restart':
        return NginxFunctions.restartNginx()
      case 'status':
        return NginxFunctions.checkNginxStatus()
      default:
        defaultLogger.error(`지원하지 않는 액션: ${action}`)
        return false
    }
  } catch (error: any) {
    defaultLogger.error(`Nginx 서비스 관리 실패: ${error.message}`)
    return false
  }
}

/**
 * Nginx 모니터링 함수
 */
async function watchNginx(): Promise<void> {
  try {
    defaultLogger.log('📊 Nginx 모니터링 시작...', 'cyan')
    
    NginxFunctions.monitorNginxPerformance()
    NginxFunctions.checkNginxLogs()
    NginxFunctions.checkNginxProcesses()
    
    defaultLogger.success('Nginx 모니터링 완료')
  } catch (error: any) {
    defaultLogger.error(`Nginx 모니터링 실패: ${error.message}`)
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const projectRoot = process.cwd()
    const nginxManager = new NginxManager(projectRoot)
    
    const result = await nginxManager.execute()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    defaultLogger.error(`Nginx 관리 프로세스 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  NginxManager,
  createNginxConfig,
  controlNginxService,
  watchNginx,
  main
}
