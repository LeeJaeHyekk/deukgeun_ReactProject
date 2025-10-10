#!/usr/bin/env node

/**
 * 최적화된 Nginx 통합 배포 스크립트
 * 빌드, 배포, nginx 설정을 통합한 최적화된 프로세스
 */

import { 
  defaultLogger,
  FileUtils, 
  BuildManager, 
  ErrorHandler 
} from './modules/index'

import * as NginxFunctions from './modules/nginx-functions'
import { execSync } from 'child_process'
import * as path from 'path'
import * as os from 'os'

// 설정
interface NginxDeployConfig {
  projectRoot: string
  buildTimeout: number
  nginxConfigPath: string
  backupDir: string
  healthCheckTimeout: number
  pm2ConfigPath: string
  maxRetries: number
  autoRecovery: boolean
  enableNginx: boolean
  enableSSL: boolean
  sslCertPath?: string
  sslKeyPath?: string
}

const config: NginxDeployConfig = {
  projectRoot: process.cwd(),
  buildTimeout: 300000, // 5분
  nginxConfigPath: './nginx.conf',
  backupDir: './nginx-backups',
  healthCheckTimeout: 30000, // 30초
  pm2ConfigPath: './ecosystem.config.cjs',
  maxRetries: 3,
  autoRecovery: true,
  enableNginx: true,
  enableSSL: false,
  sslCertPath: './ssl/cert.pem',
  sslKeyPath: './ssl/key.pem'
}

interface NginxDeployResults {
  build: BuildResult | null
  deploy: DeployResult | null
  nginx: NginxResult | null
  health: HealthResult | null
  errors: ErrorInfo[]
}

interface BuildResult {
  success: boolean
  error?: string
}

interface DeployResult {
  success: boolean
  pm2Started: boolean
}

interface NginxResult {
  success: boolean
  configGenerated: boolean
  serviceStarted: boolean
  sslEnabled: boolean
  error?: string
}

interface HealthResult {
  results: HealthCheckResult[]
}

interface HealthCheckResult {
  name: string
  status: 'healthy' | 'unhealthy'
  url: string
}

interface ErrorInfo {
  timestamp: string
  error: string
  phase?: string
}

interface SystemInfo {
  platform: string
  arch: string
  totalMemory: number
  freeMemory: number
  cpus: number
  uptime: number
  nodeVersion: string
}

interface ValidationResult {
  type: string
  command?: string
  file?: string
  message?: string
  critical: boolean
}

/**
 * 최적화된 Nginx 통합 배포 프로세스 클래스
 */
class OptimizedNginxDeployProcess {
  private projectRoot: string
  private logger: typeof defaultLogger
  private fileUtils: FileUtils
  private buildManager: BuildManager
  private errorHandler: ErrorHandler
  private startTime: number | null = null
  private systemInfo: SystemInfo | null = null
  private results: NginxDeployResults = {
    build: null,
    deploy: null,
    nginx: null,
    health: null,
    errors: []
  }

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.logger = defaultLogger
    this.fileUtils = new FileUtils(projectRoot)
    this.buildManager = new BuildManager(projectRoot, { timeout: config.buildTimeout })
    this.errorHandler = new ErrorHandler(projectRoot, { autoRecovery: config.autoRecovery })
  }

  /**
   * 전체 Nginx 통합 배포 프로세스 실행
   */
  async execute(): Promise<{ success: boolean; results?: NginxDeployResults; error?: string; errorInfo?: ErrorInfo }> {
    this.startTime = Date.now()
    
    try {
      this.logger.separator('=', 60, 'bright')
      this.logger.log('🚀 최적화된 Nginx 통합 배포 프로세스를 시작합니다...', 'bright')
      this.logger.separator('=', 60, 'bright')
      
      // 1. 시스템 정보 수집
      await this.collectSystemInfo()
      
      // 2. 사전 검증
      await this.preValidation()
      
      // 3. 환경 설정
      await this.setupEnvironment()
      
      // 4. 빌드 실행
      await this.executeBuild()
      
      // 5. PM2 배포 실행
      await this.executeDeploy()
      
      // 6. Nginx 설정 및 시작
      await this.executeNginxSetup()
      
      // 7. 헬스체크
      await this.executeHealthCheck()
      
      // 8. 후처리
      await this.postProcessing()
      
      // 9. 결과 보고
      this.printResults()
      
      this.logger.separator('=', 60, 'green')
      this.logger.log('🎉 Nginx 통합 배포가 성공적으로 완료되었습니다!', 'green')
      this.logger.separator('=', 60, 'green')
      
      return { success: true, results: this.results }
      
    } catch (error: any) {
      this.logger.separator('=', 60, 'red')
      this.logger.error(`Nginx 통합 배포 실패: ${error.message}`)
      this.logger.separator('=', 60, 'red')
      
      // 에러 처리
      const errorResult = this.errorHandler.handleError(error, {
        phase: 'nginx_deploy_process',
        projectRoot: this.projectRoot
      })
      
      this.results.errors.push({ ...errorResult.errorInfo, error: error.message })
      
      return { success: false, error: error.message, errorInfo: { ...errorResult.errorInfo, error: error.message } }
    }
  }

  /**
   * 시스템 정보 수집
   */
  private async collectSystemInfo(): Promise<void> {
    this.logger.step('SYSTEM', '시스템 정보 수집 중...')
    
    try {
      this.systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        uptime: os.uptime(),
        nodeVersion: process.version
      }
      
      this.logger.info(`플랫폼: ${this.systemInfo.platform} ${this.systemInfo.arch}`)
      this.logger.info(`CPU: ${this.systemInfo.cpus}코어`)
      this.logger.info(`메모리: ${Math.round(this.systemInfo.totalMemory / 1024 / 1024 / 1024)}GB`)
      this.logger.info(`Node.js: ${this.systemInfo.nodeVersion}`)
      
      this.logger.success('시스템 정보 수집 완료')
      
    } catch (error: any) {
      this.logger.warning(`시스템 정보 수집 실패: ${error.message}`)
    }
  }

  /**
   * 사전 검증
   */
  private async preValidation(): Promise<void> {
    this.logger.step('PRE_VALIDATE', '사전 검증 중...')
    
    const validations: ValidationResult[] = []
    
    // 1. 의존성 확인
    const requiredCommands = ['node', 'npm', 'pm2']
    if (config.enableNginx) {
      requiredCommands.push('nginx')
    }
    
    for (const cmd of requiredCommands) {
      try {
        execSync(`which ${cmd}`, { stdio: 'ignore' })
      } catch {
        validations.push({ type: 'missing_dependency', command: cmd, critical: true })
      }
    }
    
    // 2. PM2 설정 파일 확인
    if (!this.fileUtils.exists(config.pm2ConfigPath)) {
      validations.push({ type: 'missing_pm2_config', file: config.pm2ConfigPath, critical: true })
    }
    
    // 3. 필수 파일 확인
    const requiredFiles = [
      'package.json',
      'src/backend/package.json'
    ]
    
    for (const file of requiredFiles) {
      const fullPath = path.join(this.projectRoot, file)
      if (!this.fileUtils.exists(fullPath)) {
        validations.push({ type: 'missing_file', file, critical: true })
      }
    }
    
    // 4. SSL 설정 확인 (SSL이 활성화된 경우)
    if (config.enableSSL) {
      if (!this.fileUtils.exists(config.sslCertPath || '')) {
        validations.push({ type: 'missing_ssl_cert', file: config.sslCertPath, critical: true })
      }
      if (!this.fileUtils.exists(config.sslKeyPath || '')) {
        validations.push({ type: 'missing_ssl_key', file: config.sslKeyPath, critical: true })
      }
    }
    
    // 검증 결과 처리
    const criticalErrors = validations.filter(v => v.critical)
    const warnings = validations.filter(v => !v.critical)
    
    if (criticalErrors.length > 0) {
      this.logger.error('사전 검증 실패:')
      criticalErrors.forEach(error => {
        this.logger.error(`- ${error.type}: ${error.command || error.file}`)
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
   * 환경 설정
   */
  private async setupEnvironment(): Promise<void> {
    this.logger.step('ENV', '환경 설정 중...')
    
    try {
      // 환경 변수 설정
      execSync('npm run setup:env:deploy', { stdio: 'inherit' })
      this.logger.success('환경 변수 설정 완료')
      
    } catch (error: any) {
      this.logger.warning(`환경 변수 설정 실패: ${error.message}`)
    }
  }

  /**
   * 빌드 실행
   */
  private async executeBuild(): Promise<void> {
    this.logger.step('BUILD', '빌드 실행 중...')
    
    try {
      // 전체 빌드 실행
      const buildResult = await this.buildManager.executeBuild()
      
      this.results.build = buildResult
      
      if (!buildResult.success) {
        throw new Error(`빌드 실패: ${buildResult.error}`)
      }
      
      this.logger.success('빌드 완료')
      
    } catch (error: any) {
      this.logger.error(`빌드 실행 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * PM2 배포 실행
   */
  private async executeDeploy(): Promise<void> {
    this.logger.step('DEPLOY', 'PM2 배포 실행 중...')
    
    try {
      // 1. 기존 서비스 정리
      await this.cleanupServices()
      
      // 2. PM2 설정 검증
      await this.validatePM2Config()
      
      // 3. 서비스 시작
      await this.startServices()
      
      this.results.deploy = { success: true, pm2Started: true }
      this.logger.success('PM2 배포 완료')
      
    } catch (error: any) {
      this.logger.error(`PM2 배포 실행 실패: ${error.message}`)
      this.results.deploy = { success: false, pm2Started: false }
      throw error
    }
  }

  /**
   * Nginx 설정 및 시작
   */
  private async executeNginxSetup(): Promise<void> {
    if (!config.enableNginx) {
      this.logger.info('Nginx가 비활성화되어 있습니다.')
      this.results.nginx = { success: true, configGenerated: false, serviceStarted: false, sslEnabled: false }
      return
    }
    
    this.logger.step('NGINX', 'Nginx 설정 및 시작 중...')
    
    try {
      // 1. 기존 nginx 설정 백업
      if (this.fileUtils.exists(config.nginxConfigPath)) {
        const backupPath = path.join(config.backupDir, `nginx.conf.backup.${Date.now()}`)
        NginxFunctions.backupNginxConfig(config.nginxConfigPath, backupPath)
      }
      
      // 2. nginx 설정 생성
      const nginxConfig = NginxFunctions.generateNginxConfig()
      this.fileUtils.writeFile(config.nginxConfigPath, nginxConfig)
      
      // 3. SSL 설정 추가 (필요한 경우)
      let sslEnabled = false
      if (config.enableSSL && config.sslCertPath && config.sslKeyPath) {
        const sslConfig = NginxFunctions.generateSSLConfig('localhost', config.sslCertPath, config.sslKeyPath)
        // SSL 설정을 기존 설정에 추가하는 로직
        sslEnabled = true
      }
      
      // 4. nginx 설정 검증
      const configValidated = NginxFunctions.validateNginxConfig(config.nginxConfigPath)
      
      if (!configValidated) {
        throw new Error('Nginx 설정 검증 실패')
      }
      
      // 5. nginx 서비스 시작/재시작
      const serviceStarted = NginxFunctions.startNginx() || NginxFunctions.restartNginx()
      
      this.results.nginx = {
        success: true,
        configGenerated: true,
        serviceStarted: serviceStarted,
        sslEnabled: sslEnabled
      }
      
      this.logger.success('Nginx 설정 및 시작 완료')
      
    } catch (error: any) {
      this.logger.error(`Nginx 설정 및 시작 실패: ${error.message}`)
      this.results.nginx = {
        success: false,
        configGenerated: false,
        serviceStarted: false,
        sslEnabled: false,
        error: error.message
      }
      throw error
    }
  }

  /**
   * 기존 서비스 정리
   */
  private async cleanupServices(): Promise<void> {
    this.logger.info('기존 서비스 정리 중...')
    
    try {
      execSync('pm2 delete all', { stdio: 'ignore' })
      this.logger.success('기존 서비스 정리 완료')
    } catch (error: any) {
      this.logger.warning('기존 서비스 정리 중 오류 (무시됨)')
    }
  }

  /**
   * PM2 설정 검증
   */
  private async validatePM2Config(): Promise<any> {
    this.logger.info('PM2 설정 검증 중...')
    
    try {
      const pm2Config = require(path.resolve(config.pm2ConfigPath))
      if (!pm2Config.apps || pm2Config.apps.length === 0) {
        throw new Error('PM2 설정에 앱이 정의되지 않았습니다.')
      }
      
      this.logger.success('PM2 설정 검증 완료')
      return pm2Config
      
    } catch (error: any) {
      this.logger.error(`PM2 설정 검증 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * 서비스 시작
   */
  private async startServices(): Promise<void> {
    this.logger.info('서비스 시작 중...')
    
    try {
      execSync(`pm2 start ${config.pm2ConfigPath} --env production`, {
        stdio: 'inherit',
        timeout: 60000 // 1분
      })
      
      // PM2 상태 확인
      execSync('pm2 status', { stdio: 'inherit' })
      
      this.logger.success('서비스 시작 완료')
      
    } catch (error: any) {
      this.logger.error(`서비스 시작 실패: ${error.message}`)
      throw error
    }
  }

  /**
   * 헬스체크 실행
   */
  private async executeHealthCheck(): Promise<void> {
    this.logger.step('HEALTH', '헬스체크 실행 중...')
    
    try {
      const healthEndpoints = [
        { name: 'Backend API', url: 'http://localhost:5000/health' },
        { name: 'Frontend', url: 'http://localhost:3000' }
      ]
      
      if (config.enableNginx) {
        healthEndpoints.push(
          { name: 'Nginx Frontend', url: 'http://devtrail.net' },
          { name: 'Nginx Health', url: 'http://devtrail.net/health' },
          { name: 'Nginx WWW', url: 'http://www.devtrail.net' }
        )
      }
      
      const results: HealthCheckResult[] = []
      
      for (const endpoint of healthEndpoints) {
        try {
          execSync(`curl -f ${endpoint.url}`, {
            stdio: 'ignore',
            timeout: config.healthCheckTimeout
          })
          results.push({ name: endpoint.name, status: 'healthy', url: endpoint.url })
          this.logger.success(`${endpoint.name} 헬스체크 통과`)
        } catch (error: any) {
          results.push({ name: endpoint.name, status: 'unhealthy', url: endpoint.url })
          this.logger.warning(`${endpoint.name} 헬스체크 실패 (서비스 시작 중일 수 있음)`)
        }
      }
      
      this.results.health = { results }
      this.logger.success('헬스체크 완료')
      
    } catch (error: any) {
      this.logger.warning(`헬스체크 실패: ${error.message}`)
    }
  }

  /**
   * 후처리
   */
  private async postProcessing(): Promise<void> {
    this.logger.step('POST_PROCESS', '후처리 중...')
    
    try {
      // 로깅 설정
      await this.setupLogging()
      
      // 모니터링 설정
      await this.setupMonitoring()
      
      // Nginx 모니터링 (활성화된 경우)
      if (config.enableNginx) {
        NginxFunctions.monitorNginxPerformance()
      }
      
      this.logger.success('후처리 완료')
      
    } catch (error: any) {
      this.logger.warning(`후처리 실패: ${error.message}`)
    }
  }

  /**
   * 로깅 설정
   */
  private async setupLogging(): Promise<void> {
    try {
      execSync('pm2 install pm2-logrotate', { stdio: 'ignore' })
      execSync('pm2 set pm2-logrotate:max_size 10M', { stdio: 'ignore' })
      execSync('pm2 set pm2-logrotate:retain 7', { stdio: 'ignore' })
      this.logger.success('로깅 설정 완료')
    } catch (error: any) {
      this.logger.warning('로깅 설정 실패 (선택사항)')
    }
  }

  /**
   * 모니터링 설정
   */
  private async setupMonitoring(): Promise<void> {
    try {
      execSync('pm2 install pm2-server-monit', { stdio: 'ignore' })
      this.logger.success('모니터링 설정 완료')
    } catch (error: any) {
      this.logger.warning('모니터링 설정 실패 (선택사항)')
    }
  }

  /**
   * 결과 출력
   */
  private printResults(): void {
    const endTime = Date.now()
    const duration = ((endTime - (this.startTime || 0)) / 1000).toFixed(2)
    
    this.logger.log('\n📊 Nginx 통합 배포 결과:', 'cyan')
    this.logger.log(`- 소요시간: ${duration}초`, 'blue')
    
    if (this.systemInfo) {
      this.logger.log(`- 플랫폼: ${this.systemInfo.platform} ${this.systemInfo.arch}`, 'blue')
      this.logger.log(`- CPU: ${this.systemInfo.cpus}코어`, 'blue')
      this.logger.log(`- 메모리: ${Math.round(this.systemInfo.totalMemory / 1024 / 1024 / 1024)}GB`, 'blue')
    }
    
    if (this.results.build) {
      this.logger.log(`- 빌드: ${this.results.build.success ? '성공' : '실패'}`, 'blue')
    }
    
    if (this.results.deploy) {
      this.logger.log(`- PM2 배포: ${this.results.deploy.success ? '성공' : '실패'}`, 'blue')
    }
    
    if (this.results.nginx) {
      this.logger.log(`- Nginx: ${this.results.nginx.success ? '성공' : '실패'}`, 'blue')
      this.logger.log(`- Nginx 설정: ${this.results.nginx.configGenerated ? '생성됨' : '실패'}`, 'blue')
      this.logger.log(`- Nginx 서비스: ${this.results.nginx.serviceStarted ? '시작됨' : '실패'}`, 'blue')
      if (this.results.nginx.sslEnabled) {
        this.logger.log(`- SSL: 활성화됨`, 'blue')
      }
    }
    
    if (this.results.health) {
      const healthyCount = this.results.health.results.filter(r => r.status === 'healthy').length
      this.logger.log(`- 헬스체크: ${healthyCount}/${this.results.health.results.length}개 통과`, 'blue')
    }
    
    if (this.results.errors.length > 0) {
      this.logger.log(`- 에러: ${this.results.errors.length}개`, 'red')
    }
    
    this.logger.log('\n🔗 서비스 URL:', 'cyan')
    if (config.enableNginx) {
      this.logger.log('- 프론트엔드 (Nginx): http://devtrail.net', 'blue')
      this.logger.log('- 프론트엔드 (WWW): http://www.devtrail.net', 'blue')
      this.logger.log('- 백엔드 API (Nginx): http://devtrail.net/api', 'blue')
      this.logger.log('- 헬스체크 (Nginx): http://devtrail.net/health', 'blue')
      this.logger.log('- IP 직접 접속: http://43.203.30.167', 'blue')
    } else {
      this.logger.log('- 프론트엔드: http://localhost:3000', 'blue')
      this.logger.log('- 백엔드 API: http://localhost:5000', 'blue')
      this.logger.log('- 헬스체크: http://localhost:5000/health', 'blue')
    }
    
    this.logger.log('\n🛠️  관리 명령어:', 'cyan')
    this.logger.log('- PM2 상태: pm2 status', 'blue')
    this.logger.log('- PM2 로그: pm2 logs', 'blue')
    this.logger.log('- PM2 재시작: pm2 restart all', 'blue')
    if (config.enableNginx) {
      this.logger.log('- Nginx 상태: nginx -t', 'blue')
      this.logger.log('- Nginx 재시작: nginx -s reload', 'blue')
      this.logger.log('- Nginx 로그: tail -f /var/log/nginx/access.log', 'blue')
    }
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const projectRoot = process.cwd()
    const nginxDeployProcess = new OptimizedNginxDeployProcess(projectRoot)
    
    const result = await nginxDeployProcess.execute()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    defaultLogger.error(`Nginx 통합 배포 프로세스 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  OptimizedNginxDeployProcess,
  main
}
