#!/usr/bin/env node

/**
 * SSH 진단 스크립트
 * SSH 연결 문제를 진단하고 해결책을 제시하는 유틸리티
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

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

interface SSHConfig {
  host: string
  user: string
  port: number
  keyPath: string
  projectRoot: string
}

const sshConfig: SSHConfig = {
  host: '43.203.30.167',
  user: 'ubuntu',
  port: 22,
  keyPath: './deukgeun_ReactProject.pem',
  projectRoot: process.cwd()
}

/**
 * SSH 진단 클래스
 */
class SSHDiagnostic {
  private config: SSHConfig
  private diagnosticResults: Record<string, any> = {}

  constructor(config: SSHConfig) {
    this.config = config
  }

  /**
   * 1. SSH 클라이언트 확인
   */
  checkSSHClient(): boolean {
    logStep('SSH_CLIENT', 'SSH 클라이언트 확인 중...')
    
    try {
      const sshVersion = execSync('ssh -V', { encoding: 'utf8' }).trim()
      logSuccess(`SSH 클라이언트: ${sshVersion}`)
      
      this.diagnosticResults.sshClient = {
        available: true,
        version: sshVersion
      }
      
      return true
    } catch (error: any) {
      logError(`SSH 클라이언트를 찾을 수 없습니다: ${error.message}`)
      
      this.diagnosticResults.sshClient = {
        available: false,
        error: error.message
      }
      
      return false
    }
  }

  /**
   * 2. SSH 키 파일 확인
   */
  checkSSHKey(): boolean {
    logStep('SSH_KEY', 'SSH 키 파일 확인 중...')
    
    try {
      if (fs.existsSync(this.config.keyPath)) {
        logSuccess(`SSH 키 파일 발견: ${this.config.keyPath}`)
        
        // 키 파일 정보
        const stats = fs.statSync(this.config.keyPath)
        const mode = stats.mode & parseInt('777', 8)
        const size = stats.size
        
        log(`키 파일 크기: ${size} bytes`, 'blue')
        log(`키 파일 권한: ${mode.toString(8)}`, 'blue')
        
        // 권한 확인
        if (mode === parseInt('600', 8)) {
          logSuccess('SSH 키 파일 권한이 올바릅니다.')
        } else {
          logWarning('SSH 키 파일 권한이 올바르지 않습니다.')
          this.fixSSHPermissions()
        }
        
        this.diagnosticResults.sshKey = {
          exists: true,
          path: this.config.keyPath,
          size: size,
          permissions: mode.toString(8),
          validPermissions: mode === parseInt('600', 8)
        }
        
        return true
      } else {
        logError(`SSH 키 파일을 찾을 수 없습니다: ${this.config.keyPath}`)
        
        this.diagnosticResults.sshKey = {
          exists: false,
          path: this.config.keyPath
        }
        
        return false
      }
    } catch (error: any) {
      logError(`SSH 키 파일 확인 실패: ${error.message}`)
      
      this.diagnosticResults.sshKey = {
        exists: false,
        error: error.message
      }
      
      return false
    }
  }

  /**
   * SSH 권한 수정
   */
  private fixSSHPermissions(): void {
    try {
      const chmodCommand = `icacls "${this.config.keyPath}" /inheritance:r /grant:r "%USERNAME%:R"`
      execSync(chmodCommand, { encoding: 'utf8' })
      logSuccess('SSH 키 파일 권한 수정 완료')
    } catch (error: any) {
      logWarning(`권한 수정 실패: ${error.message}`)
    }
  }

  /**
   * 3. 네트워크 연결 확인
   */
  checkNetworkConnectivity(): boolean {
    logStep('NETWORK', '네트워크 연결 확인 중...')
    
    try {
      // 핑 테스트
      const pingCommand = `ping -n 1 ${this.config.host}`
      execSync(pingCommand, { encoding: 'utf8', timeout: 10000 })
      logSuccess(`네트워크 연결 확인: ${this.config.host}`)
      
      this.diagnosticResults.network = {
        ping: true,
        host: this.config.host
      }
      
      return true
    } catch (error: any) {
      logError(`네트워크 연결 실패: ${this.config.host}`)
      
      this.diagnosticResults.network = {
        ping: false,
        host: this.config.host,
        error: error.message
      }
      
      return false
    }
  }

  /**
   * 4. SSH 포트 연결 확인
   */
  checkSSHPort(): boolean {
    logStep('SSH_PORT', 'SSH 포트 연결 확인 중...')
    
    try {
      const telnetCommand = `telnet ${this.config.host} ${this.config.port}`
      execSync(telnetCommand, { encoding: 'utf8', timeout: 10000 })
      logSuccess(`SSH 포트 연결 확인: ${this.config.host}:${this.config.port}`)
      
      this.diagnosticResults.sshPort = {
        accessible: true,
        host: this.config.host,
        port: this.config.port
      }
      
      return true
    } catch (error: any) {
      logWarning(`SSH 포트 연결 실패: ${this.config.host}:${this.config.port}`)
      
      this.diagnosticResults.sshPort = {
        accessible: false,
        host: this.config.host,
        port: this.config.port,
        error: error.message
      }
      
      return false
    }
  }

  /**
   * 5. SSH 연결 테스트
   */
  testSSHConnection(): boolean {
    logStep('SSH_CONNECTION', 'SSH 연결 테스트 중...')
    
    try {
      const testCommand = `ssh -i "${this.config.keyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${this.config.user}@${this.config.host} "echo 'SSH 연결 성공'"`
      
      log(`테스트 명령: ${testCommand}`, 'blue')
      
      const result = execSync(testCommand, { 
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe'
      })
      
      if (result.includes('SSH 연결 성공')) {
        logSuccess('SSH 연결 성공!')
        
        this.diagnosticResults.sshConnection = {
          success: true,
          result: result.trim()
        }
        
        return true
      } else {
        logError('SSH 연결 실패')
        
        this.diagnosticResults.sshConnection = {
          success: false,
          result: result.trim()
        }
        
        return false
      }
    } catch (error: any) {
      logError(`SSH 연결 테스트 실패: ${error.message}`)
      
      this.diagnosticResults.sshConnection = {
        success: false,
        error: error.message
      }
      
      return false
    }
  }

  /**
   * 6. SSH 상세 진단
   */
  detailedSSHDiagnosis(): void {
    logStep('SSH_DETAILED', 'SSH 상세 진단 중...')
    
    try {
      const detailedCommand = `ssh -i "${this.config.keyPath}" -v -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${this.config.user}@${this.config.host} "echo 'SSH 상세 진단 완료'" 2>&1`
      
      log('SSH 상세 진단 실행 중...', 'blue')
      const result = execSync(detailedCommand, { 
        encoding: 'utf8',
        timeout: 30000,
        stdio: 'pipe'
      })
      
      log('SSH 상세 진단 결과:', 'cyan')
      console.log(result)
      
      this.diagnosticResults.detailedSSH = {
        success: true,
        output: result
      }
      
    } catch (error: any) {
      logWarning(`SSH 상세 진단 실패: ${error.message}`)
      
      this.diagnosticResults.detailedSSH = {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 7. 진단 결과 요약
   */
  generateDiagnosticReport(): void {
    logStep('DIAGNOSTIC_REPORT', '진단 결과 요약 생성 중...')
    
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.diagnosticResults,
      recommendations: this.generateRecommendations()
    }
    
    const reportPath = path.join(this.config.projectRoot, 'ssh-diagnostic-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    logSuccess(`진단 결과 보고서 생성됨: ${reportPath}`)
    
    // 콘솔에 요약 출력
    this.printDiagnosticSummary()
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (!this.diagnosticResults.sshClient?.available) {
      recommendations.push('SSH 클라이언트를 설치하세요.')
    }
    
    if (!this.diagnosticResults.sshKey?.exists) {
      recommendations.push('SSH 키 파일을 확인하세요.')
    }
    
    if (!this.diagnosticResults.sshKey?.validPermissions) {
      recommendations.push('SSH 키 파일 권한을 수정하세요.')
    }
    
    if (!this.diagnosticResults.network?.ping) {
      recommendations.push('네트워크 연결을 확인하세요.')
    }
    
    if (!this.diagnosticResults.sshPort?.accessible) {
      recommendations.push('SSH 포트 연결을 확인하세요.')
    }
    
    if (!this.diagnosticResults.sshConnection?.success) {
      recommendations.push('SSH 연결 설정을 확인하세요.')
    }
    
    return recommendations
  }

  /**
   * 진단 요약 출력
   */
  private printDiagnosticSummary(): void {
    log('\n📊 SSH 진단 결과 요약:', 'bright')
    log('='.repeat(50))
    
    log(`SSH 클라이언트: ${this.diagnosticResults.sshClient?.available ? '✅' : '❌'}`, 'blue')
    log(`SSH 키 파일: ${this.diagnosticResults.sshKey?.exists ? '✅' : '❌'}`, 'blue')
    log(`네트워크 연결: ${this.diagnosticResults.network?.ping ? '✅' : '❌'}`, 'blue')
    log(`SSH 포트: ${this.diagnosticResults.sshPort?.accessible ? '✅' : '❌'}`, 'blue')
    log(`SSH 연결: ${this.diagnosticResults.sshConnection?.success ? '✅' : '❌'}`, 'blue')
    
    const recommendations = this.generateRecommendations()
    if (recommendations.length > 0) {
      log('\n💡 권장사항:', 'yellow')
      recommendations.forEach((rec, index) => {
        log(`${index + 1}. ${rec}`, 'yellow')
      })
    }
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 SSH 진단 사용법:', 'bright')
    log('  npm run ssh:diagnostic        : SSH 진단 실행', 'cyan')
    log('  npm run ssh:diagnostic:full   : SSH 상세 진단 실행', 'cyan')
    
    log('\n🔧 명령어:', 'bright')
    log('  ssh:diagnostic        : 기본 SSH 진단', 'green')
    log('  ssh:diagnostic:full   : 상세 SSH 진단', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const sshDiagnostic = new SSHDiagnostic(sshConfig)
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      sshDiagnostic.printUsage()
      return
    }
    
    log('🔧 SSH 진단을 시작합니다...', 'bright')
    log('='.repeat(50))
    
    // 1. SSH 클라이언트 확인
    sshDiagnostic.checkSSHClient()
    
    // 2. SSH 키 파일 확인
    sshDiagnostic.checkSSHKey()
    
    // 3. 네트워크 연결 확인
    sshDiagnostic.checkNetworkConnectivity()
    
    // 4. SSH 포트 연결 확인
    sshDiagnostic.checkSSHPort()
    
    // 5. SSH 연결 테스트
    sshDiagnostic.testSSHConnection()
    
    // 6. 상세 진단 (옵션)
    if (args.includes('--full') || args.includes('-f')) {
      sshDiagnostic.detailedSSHDiagnosis()
    }
    
    // 7. 진단 결과 요약
    sshDiagnostic.generateDiagnosticReport()
    
    log('\n🎉 SSH 진단이 완료되었습니다!', 'green')
    
  } catch (error: any) {
    logError(`SSH 진단 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { SSHDiagnostic, main }
