#!/usr/bin/env node

/**
 * 도메인 설정 테스트 스크립트
 * devtrail.net 도메인 설정이 올바르게 동작하는지 검증
 */

import { defaultLogger } from './modules/index'
import * as NginxFunctions from './modules/nginx-functions'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  name: string
  success: boolean
  message: string
  details?: string
}

/**
 * 도메인 설정 테스트 클래스
 */
class DomainConfigTest {
  private logger: typeof defaultLogger
  private results: TestResult[] = []

  constructor() {
    this.logger = defaultLogger
  }

  /**
   * 전체 테스트 실행
   */
  async execute(): Promise<{ success: boolean; results: TestResult[] }> {
    this.logger.separator('=', 60, 'bright')
    this.logger.log('🧪 도메인 설정 테스트를 시작합니다...', 'bright')
    this.logger.separator('=', 60, 'bright')

    try {
      // 1. 설정 파일 존재 확인
      await this.testConfigFileExists()
      
      // 2. 도메인 설정 확인
      await this.testDomainConfig()
      
      // 3. nginx 설정 검증
      await this.testNginxConfig()
      
      // 4. 포트 설정 확인
      await this.testPortConfig()
      
      // 5. 결과 출력
      this.printResults()
      
      const success = this.results.every(r => r.success)
      
      this.logger.separator('=', 60, success ? 'green' : 'red')
      this.logger.log(success ? '🎉 모든 테스트가 통과했습니다!' : '❌ 일부 테스트가 실패했습니다!', success ? 'green' : 'red')
      this.logger.separator('=', 60, success ? 'green' : 'red')
      
      return { success, results: this.results }
      
    } catch (error: any) {
      this.logger.error(`테스트 실행 실패: ${error.message}`)
      return { success: false, results: this.results }
    }
  }

  /**
   * 설정 파일 존재 확인
   */
  private async testConfigFileExists(): Promise<void> {
    const testName = '설정 파일 존재 확인'
    
    try {
      const configPath = path.join(process.cwd(), 'nginx.conf')
      const exists = fs.existsSync(configPath)
      
      if (exists) {
        this.results.push({
          name: testName,
          success: true,
          message: 'nginx.conf 파일이 존재합니다',
          details: `경로: ${configPath}`
        })
        this.logger.success(`${testName}: 통과`)
      } else {
        this.results.push({
          name: testName,
          success: false,
          message: 'nginx.conf 파일이 존재하지 않습니다',
          details: `경로: ${configPath}`
        })
        this.logger.error(`${testName}: 실패`)
      }
    } catch (error: any) {
      this.results.push({
        name: testName,
        success: false,
        message: `파일 확인 중 오류: ${error.message}`
      })
      this.logger.error(`${testName}: 오류`)
    }
  }

  /**
   * 도메인 설정 확인
   */
  private async testDomainConfig(): Promise<void> {
    const testName = '도메인 설정 확인'
    
    try {
      const configPath = path.join(process.cwd(), 'nginx.conf')
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      const expectedDomains = ['devtrail.net', 'www.devtrail.net']
      const hasDomains = expectedDomains.every(domain => configContent.includes(domain))
      
      if (hasDomains) {
        this.results.push({
          name: testName,
          success: true,
          message: '도메인 설정이 올바르게 되어 있습니다',
          details: `포함된 도메인: ${expectedDomains.join(', ')}`
        })
        this.logger.success(`${testName}: 통과`)
      } else {
        this.results.push({
          name: testName,
          success: false,
          message: '도메인 설정이 누락되었습니다',
          details: `예상 도메인: ${expectedDomains.join(', ')}`
        })
        this.logger.error(`${testName}: 실패`)
      }
    } catch (error: any) {
      this.results.push({
        name: testName,
        success: false,
        message: `도메인 설정 확인 중 오류: ${error.message}`
      })
      this.logger.error(`${testName}: 오류`)
    }
  }

  /**
   * nginx 설정 검증
   */
  private async testNginxConfig(): Promise<void> {
    const testName = 'Nginx 설정 검증'
    
    try {
      const configPath = path.join(process.cwd(), 'nginx.conf')
      const isValid = NginxFunctions.validateNginxConfig(configPath)
      
      if (isValid) {
        this.results.push({
          name: testName,
          success: true,
          message: 'Nginx 설정이 유효합니다',
          details: 'nginx -t 명령어로 검증됨'
        })
        this.logger.success(`${testName}: 통과`)
      } else {
        this.results.push({
          name: testName,
          success: false,
          message: 'Nginx 설정이 유효하지 않습니다',
          details: 'nginx -t 명령어로 검증 실패'
        })
        this.logger.error(`${testName}: 실패`)
      }
    } catch (error: any) {
      this.results.push({
        name: testName,
        success: false,
        message: `Nginx 설정 검증 중 오류: ${error.message}`
      })
      this.logger.error(`${testName}: 오류`)
    }
  }

  /**
   * 포트 설정 확인
   */
  private async testPortConfig(): Promise<void> {
    const testName = '포트 설정 확인'
    
    try {
      const configPath = path.join(process.cwd(), 'nginx.conf')
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      const expectedPorts = ['3000', '5000']
      const hasPorts = expectedPorts.every(port => configContent.includes(port))
      
      if (hasPorts) {
        this.results.push({
          name: testName,
          success: true,
          message: '포트 설정이 올바르게 되어 있습니다',
          details: `포함된 포트: ${expectedPorts.join(', ')}`
        })
        this.logger.success(`${testName}: 통과`)
      } else {
        this.results.push({
          name: testName,
          success: false,
          message: '포트 설정이 누락되었습니다',
          details: `예상 포트: ${expectedPorts.join(', ')}`
        })
        this.logger.error(`${testName}: 실패`)
      }
    } catch (error: any) {
      this.results.push({
        name: testName,
        success: false,
        message: `포트 설정 확인 중 오류: ${error.message}`
      })
      this.logger.error(`${testName}: 오류`)
    }
  }

  /**
   * 결과 출력
   */
  private printResults(): void {
    this.logger.log('\n📊 테스트 결과:', 'cyan')
    
    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const total = this.results.length
    
    this.logger.log(`- 총 테스트: ${total}개`, 'blue')
    this.logger.log(`- 통과: ${passed}개`, 'green')
    this.logger.log(`- 실패: ${failed}개`, failed > 0 ? 'red' : 'blue')
    
    this.logger.log('\n📋 상세 결과:', 'cyan')
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      const color = result.success ? 'green' : 'red'
      this.logger.log(`${status} ${result.name}: ${result.message}`, color)
      if (result.details) {
        this.logger.log(`   ${result.details}`, 'blue')
      }
    })
    
    this.logger.log('\n🔗 예상 서비스 URL:', 'cyan')
    this.logger.log('- http://devtrail.net', 'green')
    this.logger.log('- http://www.devtrail.net', 'green')
    this.logger.log('- http://3.36.230.117', 'green')
    this.logger.log('- http://devtrail.net/api', 'green')
    this.logger.log('- http://devtrail.net/health', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const test = new DomainConfigTest()
    const result = await test.execute()
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    defaultLogger.error(`도메인 설정 테스트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export {
  DomainConfigTest,
  main
}
