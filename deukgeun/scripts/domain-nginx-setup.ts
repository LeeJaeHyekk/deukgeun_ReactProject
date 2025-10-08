#!/usr/bin/env node

/**
 * 도메인별 Nginx 설정 스크립트
 * devtrail.net 도메인에 맞는 nginx 설정 생성 및 관리
 */

import { 
  defaultLogger,
  FileUtils, 
  ErrorHandler 
} from './modules/index'

import * as NginxFunctions from './modules/nginx-functions'
import * as path from 'path'
import * as fs from 'fs'

// 도메인 설정
interface DomainConfig {
  domain: string
  wwwDomain: string
  ip: string
  frontendPort: number
  backendPort: number
  isProduction: boolean
}

const domainConfig: DomainConfig = {
  domain: 'devtrail.net',
  wwwDomain: 'www.devtrail.net',
  ip: '43.203.30.167',
  frontendPort: 3000,
  backendPort: 5000,
  isProduction: false
}

interface DomainSetupResults {
  config: ConfigResult | null
  validation: ValidationResult | null
  service: ServiceResult | null
  errors: ErrorInfo[]
}

interface ConfigResult {
  success: boolean
  configPath: string
  domain: string
  error?: string
}

interface ValidationResult {
  success: boolean
  nginxTest: boolean
  domainTest: boolean
  error?: string
}

interface ServiceResult {
  success: boolean
  status: string
  error?: string
}

interface ErrorInfo {
  timestamp: string
  error: string
  phase?: string
}

/**
 * 도메인별 Nginx 설정 클래스
 */
class DomainNginxSetup {
  private projectRoot: string
  private logger: typeof defaultLogger
  private fileUtils: FileUtils
  private errorHandler: ErrorHandler
  private startTime: number | null = null
  private results: DomainSetupResults = {
    config: null,
    validation: null,
    service: null,
    errors: []
  }

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    this.logger = defaultLogger
    this.fileUtils = new FileUtils(projectRoot)
    this.errorHandler = new ErrorHandler(projectRoot, { autoRecovery: true })
  }

  /**
   * 도메인별 nginx 설정 실행
   */
  async execute(): Promise<{ success: boolean; results?: DomainSetupResults; error?: string; errorInfo?: ErrorInfo }> {
    this.startTime = Date.now()
    
    try {
      this.logger.separator('=', 60, 'bright')
      this.logger.log('🌐 도메인별 Nginx 설정을 시작합니다...', 'bright')
      this.logger.log(`도메인: ${domainConfig.domain}`, 'cyan')
      this.logger.log(`IP: ${domainConfig.ip}`, 'cyan')
      this.logger.separator('=', 60, 'bright')
      
      // 1. 도메인 정보 출력
      await this.printDomainInfo()
      
      // 2. nginx 설정 생성
      await this.generateNginxConfig()
      
      // 3. 설정 검증
      await this.validateConfig()
      
      // 4. 서비스 상태 확인
      await this.checkServiceStatus()
      
      // 5. 결과 보고
      this.printResults()
      
      this.logger.separator('=', 60, 'green')
      this.logger.log('🎉 도메인별 Nginx 설정이 완료되었습니다!', 'green')
      this.logger.separator('=', 60, 'green')
      
      return { success: true, results: this.results }
      
    } catch (error: any) {
      this.logger.separator('=', 60, 'red')
      this.logger.error(`도메인별 Nginx 설정 실패: ${error.message}`)
      this.logger.separator('=', 60, 'red')
      
      // 에러 처리
      const errorResult = this.errorHandler.handleError(error, {
        phase: 'domain_nginx_setup',
        projectRoot: this.projectRoot
      })
      
      this.results.errors.push({ ...errorResult.errorInfo, error: error.message })
      
      return { success: false, error: error.message, errorInfo: { ...errorResult.errorInfo, error: error.message } }
    }
  }

  /**
   * 도메인 정보 출력
   */
  private async printDomainInfo(): Promise<void> {
    this.logger.step('DOMAIN_INFO', '도메인 정보 확인 중...')
    
    this.logger.log('\n📋 도메인 설정 정보:', 'cyan')
    this.logger.log(`- 메인 도메인: ${domainConfig.domain}`, 'blue')
    this.logger.log(`- WWW 도메인: ${domainConfig.wwwDomain}`, 'blue')
    this.logger.log(`- IP 주소: ${domainConfig.ip}`, 'blue')
    this.logger.log(`- 프론트엔드 포트: ${domainConfig.frontendPort}`, 'blue')
    this.logger.log(`- 백엔드 포트: ${domainConfig.backendPort}`, 'blue')
    this.logger.log(`- 환경: ${domainConfig.isProduction ? '프로덕션' : '개발'}`, 'blue')
    
    this.logger.log('\n🔗 예상 서비스 URL:', 'cyan')
    this.logger.log(`- http://${domainConfig.domain}`, 'green')
    this.logger.log(`- http://${domainConfig.wwwDomain}`, 'green')
    this.logger.log(`- http://${domainConfig.ip}`, 'green')
    this.logger.log(`- http://${domainConfig.domain}/api`, 'green')
    this.logger.log(`- http://${domainConfig.domain}/health`, 'green')
    
    this.logger.success('도메인 정보 확인 완료')
  }

  /**
   * nginx 설정 생성
   */
  private async generateNginxConfig(): Promise<void> {
    this.logger.step('CONFIG', 'Nginx 설정 생성 중...')
    
    try {
      // 도메인별 설정 생성
      const nginxConfig = NginxFunctions.generateDomainConfig(
        domainConfig.domain, 
        domainConfig.isProduction
      )
      
      // 설정 파일 저장
      const configPath = path.join(this.projectRoot, 'nginx.conf')
      const success = NginxFunctions.saveNginxConfig(configPath, nginxConfig)
      
      this.results.config = {
        success: success,
        configPath: configPath,
        domain: domainConfig.domain
      }
      
      if (success) {
        this.logger.success('Nginx 설정 생성 완료')
        this.logger.log(`설정 파일: ${configPath}`, 'blue')
      } else {
        throw new Error('Nginx 설정 생성 실패')
      }
      
    } catch (error: any) {
      this.logger.error(`Nginx 설정 생성 실패: ${error.message}`)
      this.results.config = {
        success: false,
        configPath: '',
        domain: domainConfig.domain,
        error: error.message
      }
      throw error
    }
  }

  /**
   * 설정 검증
   */
  private async validateConfig(): Promise<void> {
    this.logger.step('VALIDATE', '설정 검증 중...')
    
    try {
      const configPath = path.join(this.projectRoot, 'nginx.conf')
      
      // nginx 설정 검증
      const nginxTest = NginxFunctions.validateNginxConfig(configPath)
      
      // 도메인 설정 검증
      const domainTest = this.validateDomainConfig()
      
      this.results.validation = {
        success: nginxTest && domainTest,
        nginxTest: nginxTest,
        domainTest: domainTest
      }
      
      if (nginxTest && domainTest) {
        this.logger.success('설정 검증 완료')
      } else {
        throw new Error('설정 검증 실패')
      }
      
    } catch (error: any) {
      this.logger.error(`설정 검증 실패: ${error.message}`)
      this.results.validation = {
        success: false,
        nginxTest: false,
        domainTest: false,
        error: error.message
      }
      throw error
    }
  }

  /**
   * 도메인 설정 검증
   */
  private validateDomainConfig(): boolean {
    try {
      // 도메인 형식 검증
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
      
      if (!domainRegex.test(domainConfig.domain)) {
        this.logger.error(`잘못된 도메인 형식: ${domainConfig.domain}`)
        return false
      }
      
      // IP 형식 검증
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(domainConfig.ip)) {
        this.logger.error(`잘못된 IP 형식: ${domainConfig.ip}`)
        return false
      }
      
      // 포트 범위 검증
      if (domainConfig.frontendPort < 1 || domainConfig.frontendPort > 65535) {
        this.logger.error(`잘못된 프론트엔드 포트: ${domainConfig.frontendPort}`)
        return false
      }
      
      if (domainConfig.backendPort < 1 || domainConfig.backendPort > 65535) {
        this.logger.error(`잘못된 백엔드 포트: ${domainConfig.backendPort}`)
        return false
      }
      
      return true
    } catch (error: any) {
      this.logger.error(`도메인 설정 검증 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 서비스 상태 확인
   */
  private async checkServiceStatus(): Promise<void> {
    this.logger.step('SERVICE', '서비스 상태 확인 중...')
    
    try {
      const status = NginxFunctions.checkNginxStatus()
      
      this.results.service = {
        success: status,
        status: status ? 'running' : 'stopped'
      }
      
      if (status) {
        this.logger.success('Nginx 서비스가 실행 중입니다')
      } else {
        this.logger.warning('Nginx 서비스가 중지되어 있습니다')
      }
      
    } catch (error: any) {
      this.logger.error(`서비스 상태 확인 실패: ${error.message}`)
      this.results.service = {
        success: false,
        status: 'error',
        error: error.message
      }
    }
  }

  /**
   * 결과 출력
   */
  private printResults(): void {
    const endTime = Date.now()
    const duration = ((endTime - (this.startTime || 0)) / 1000).toFixed(2)
    
    this.logger.log('\n📊 도메인별 Nginx 설정 결과:', 'cyan')
    this.logger.log(`- 소요시간: ${duration}초`, 'blue')
    
    if (this.results.config) {
      this.logger.log(`- 설정 생성: ${this.results.config.success ? '성공' : '실패'}`, 'blue')
      this.logger.log(`- 설정 파일: ${this.results.config.configPath}`, 'blue')
      this.logger.log(`- 도메인: ${this.results.config.domain}`, 'blue')
    }
    
    if (this.results.validation) {
      this.logger.log(`- 설정 검증: ${this.results.validation.success ? '통과' : '실패'}`, 'blue')
      this.logger.log(`- Nginx 테스트: ${this.results.validation.nginxTest ? '통과' : '실패'}`, 'blue')
      this.logger.log(`- 도메인 테스트: ${this.results.validation.domainTest ? '통과' : '실패'}`, 'blue')
    }
    
    if (this.results.service) {
      this.logger.log(`- 서비스 상태: ${this.results.service.status}`, 'blue')
    }
    
    if (this.results.errors.length > 0) {
      this.logger.log(`- 에러: ${this.results.errors.length}개`, 'red')
    }
    
    this.logger.log('\n🔗 서비스 URL:', 'cyan')
    this.logger.log(`- 메인 도메인: http://${domainConfig.domain}`, 'green')
    this.logger.log(`- WWW 도메인: http://${domainConfig.wwwDomain}`, 'green')
    this.logger.log(`- IP 직접 접속: http://${domainConfig.ip}`, 'green')
    this.logger.log(`- API 엔드포인트: http://${domainConfig.domain}/api`, 'green')
    this.logger.log(`- 헬스체크: http://${domainConfig.domain}/health`, 'green')
    
    this.logger.log('\n🛠️  관리 명령어:', 'cyan')
    this.logger.log('- Nginx 시작: npm run nginx:start', 'blue')
    this.logger.log('- Nginx 중지: npm run nginx:stop', 'blue')
    this.logger.log('- Nginx 재시작: npm run nginx:restart', 'blue')
    this.logger.log('- Nginx 상태: npm run nginx:status', 'blue')
    this.logger.log('- Nginx 로그: npm run nginx:logs', 'blue')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const projectRoot = process.cwd()
    const domainSetup = new DomainNginxSetup(projectRoot)
    
    const result = await domainSetup.execute()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    defaultLogger.error(`도메인별 Nginx 설정 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  DomainNginxSetup,
  main
}
