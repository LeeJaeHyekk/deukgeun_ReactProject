#!/usr/bin/env node

/**
 * 간단한 SSH 설정 스크립트
 * SSH 연결을 위한 기본 설정을 자동화하는 유틸리티
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
 * SSH 설정 클래스
 */
class SSHSetup {
  private config: SSHConfig

  constructor(config: SSHConfig) {
    this.config = config
  }

  /**
   * SSH 키 파일 확인
   */
  checkSSHKey(): boolean {
    logStep('SSH_KEY_CHECK', 'SSH 키 파일 확인 중...')
    
    try {
      if (fs.existsSync(this.config.keyPath)) {
        logSuccess(`SSH 키 파일 발견: ${this.config.keyPath}`)
        
        // 키 파일 권한 확인
        const stats = fs.statSync(this.config.keyPath)
        const mode = stats.mode & parseInt('777', 8)
        
        if (mode === parseInt('600', 8)) {
          logSuccess('SSH 키 파일 권한이 올바릅니다.')
          return true
        } else {
          logWarning('SSH 키 파일 권한을 수정합니다.')
          this.fixSSHPermissions()
          return true
        }
      } else {
        logError(`SSH 키 파일을 찾을 수 없습니다: ${this.config.keyPath}`)
        return false
      }
    } catch (error: any) {
      logError(`SSH 키 파일 확인 실패: ${error.message}`)
      return false
    }
  }

  /**
   * SSH 권한 수정
   */
  private fixSSHPermissions(): void {
    try {
      // Windows에서 icacls 사용
      const chmodCommand = `icacls "${this.config.keyPath}" /inheritance:r /grant:r "%USERNAME%:R"`
      execSync(chmodCommand, { encoding: 'utf8' })
      logSuccess('SSH 키 파일 권한 수정 완료')
    } catch (error: any) {
      logWarning(`권한 수정 실패: ${error.message}`)
    }
  }

  /**
   * SSH 연결 테스트
   */
  testSSHConnection(): boolean {
    logStep('SSH_TEST', 'SSH 연결 테스트 중...')
    
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
        return true
      } else {
        logError('SSH 연결 실패')
        return false
      }
    } catch (error: any) {
      logError(`SSH 연결 테스트 실패: ${error.message}`)
      return false
    }
  }

  /**
   * SSH 설정 파일 생성
   */
  createSSHConfig(): boolean {
    logStep('SSH_CONFIG', 'SSH 설정 파일 생성 중...')
    
    try {
      const sshConfigPath = path.join(this.config.projectRoot, 'ssh-config')
      const configContent = `Host deukgeun-server
  HostName ${this.config.host}
  User ${this.config.user}
  Port ${this.config.port}
  IdentityFile ${path.resolve(this.config.keyPath)}
  StrictHostKeyChecking no
  UserKnownHostsFile /dev/null
  ServerAliveInterval 60
  ServerAliveCountMax 3
`
      
      fs.writeFileSync(sshConfigPath, configContent)
      logSuccess(`SSH 설정 파일 생성됨: ${sshConfigPath}`)
      
      return true
    } catch (error: any) {
      logError(`SSH 설정 파일 생성 실패: ${error.message}`)
      return false
    }
  }

  /**
   * SSH 연결 명령어 생성
   */
  generateSSHCommands(): void {
    logStep('SSH_COMMANDS', 'SSH 연결 명령어 생성 중...')
    
    const commands = {
      direct: `ssh -i "${this.config.keyPath}" ${this.config.user}@${this.config.host}`,
      withConfig: 'ssh deukgeun-server',
      scpUpload: `scp -i "${this.config.keyPath}" -r ./dist ubuntu@${this.config.host}:~/`,
      scpDownload: `scp -i "${this.config.keyPath}" -r ubuntu@${this.config.host}:~/backup ./`
    }
    
    log('\n📋 SSH 연결 명령어:', 'bright')
    log(`직접 연결: ${commands.direct}`, 'cyan')
    log(`설정 파일 사용: ${commands.withConfig}`, 'cyan')
    log(`파일 업로드: ${commands.scpUpload}`, 'cyan')
    log(`파일 다운로드: ${commands.scpDownload}`, 'cyan')
    
    // 명령어를 파일로 저장
    const commandsPath = path.join(this.config.projectRoot, 'ssh-commands.txt')
    const commandsContent = Object.entries(commands)
      .map(([name, command]) => `# ${name}\n${command}`)
      .join('\n\n')
    
    fs.writeFileSync(commandsPath, commandsContent)
    logSuccess(`SSH 명령어 저장됨: ${commandsPath}`)
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 SSH 설정 사용법:', 'bright')
    log('  npm run ssh:setup        : SSH 설정 확인 및 생성', 'cyan')
    log('  npm run ssh:test         : SSH 연결 테스트', 'cyan')
    log('  npm run ssh:config       : SSH 설정 파일 생성', 'cyan')
    
    log('\n🔧 명령어:', 'bright')
    log('  ssh:setup        : 전체 SSH 설정', 'green')
    log('  ssh:test          : SSH 연결 테스트', 'green')
    log('  ssh:config        : SSH 설정 파일 생성', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const sshSetup = new SSHSetup(sshConfig)
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      sshSetup.printUsage()
      return
    }
    
    log('🔧 SSH 설정을 시작합니다...', 'bright')
    log('='.repeat(50))
    
    // 1. SSH 키 확인
    const keyExists = sshSetup.checkSSHKey()
    if (!keyExists) {
      logError('SSH 키 파일이 없습니다. 키 파일을 확인하세요.')
      return
    }
    
    // 2. SSH 연결 테스트
    const connectionSuccess = sshSetup.testSSHConnection()
    if (!connectionSuccess) {
      logWarning('SSH 연결에 실패했습니다. 설정을 확인하세요.')
    }
    
    // 3. SSH 설정 파일 생성
    sshSetup.createSSHConfig()
    
    // 4. SSH 명령어 생성
    sshSetup.generateSSHCommands()
    
    log('\n🎉 SSH 설정이 완료되었습니다!', 'green')
    
  } catch (error: any) {
    logError(`SSH 설정 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { SSHSetup, main }
