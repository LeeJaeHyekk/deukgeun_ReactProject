#!/usr/bin/env node

/**
 * SSH 완전 솔루션 스크립트
 * SSH 연결 문제를 종합적으로 해결하는 유틸리티
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
  timeout: number
}

const sshConfig: SSHConfig = {
  host: '43.203.30.167',
  user: 'ubuntu',
  port: 22,
  keyPath: './deukgeun_ReactProject.pem',
  projectRoot: process.cwd(),
  timeout: 30000
}

/**
 * SSH 완전 솔루션 클래스
 */
class SSHCompleteSolution {
  private config: SSHConfig

  constructor(config: SSHConfig) {
    this.config = config
  }

  /**
   * 1. SSH 환경 진단
   */
  diagnoseSSHEnvironment(): boolean {
    logStep('SSH_DIAGNOSE', 'SSH 환경 진단 중...')
    
    try {
      // SSH 클라이언트 확인
      const sshVersion = execSync('ssh -V', { encoding: 'utf8' }).trim()
      logSuccess(`SSH 클라이언트: ${sshVersion}`)
      
      // SSH 키 파일 확인
      if (fs.existsSync(this.config.keyPath)) {
        logSuccess(`SSH 키 파일: ${this.config.keyPath}`)
        
        // 키 파일 권한 확인
        const stats = fs.statSync(this.config.keyPath)
        const mode = stats.mode & parseInt('777', 8)
        
        if (mode === parseInt('600', 8)) {
          logSuccess('SSH 키 파일 권한이 올바릅니다.')
        } else {
          logWarning('SSH 키 파일 권한을 수정합니다.')
          this.fixSSHPermissions()
        }
      } else {
        logError(`SSH 키 파일을 찾을 수 없습니다: ${this.config.keyPath}`)
        return false
      }
      
      // 네트워크 연결 확인
      this.testNetworkConnectivity()
      
      return true
    } catch (error: any) {
      logError(`SSH 환경 진단 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 네트워크 연결 테스트
   */
  private testNetworkConnectivity(): void {
    try {
      const pingCommand = `ping -n 1 ${this.config.host}`
      execSync(pingCommand, { encoding: 'utf8', timeout: 10000 })
      logSuccess(`네트워크 연결 확인: ${this.config.host}`)
    } catch (error: any) {
      logWarning(`네트워크 연결 실패: ${this.config.host}`)
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
   * 2. SSH 연결 테스트 (다양한 방법)
   */
  testSSHConnection(): boolean {
    logStep('SSH_TEST', 'SSH 연결 테스트 중...')
    
    const testMethods = [
      {
        name: '기본 연결',
        command: `ssh -i "${this.config.keyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${this.config.user}@${this.config.host} "echo 'SSH 연결 성공'"`
      },
      {
        name: '상세 연결',
        command: `ssh -i "${this.config.keyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 -v ${this.config.user}@${this.config.host} "echo 'SSH 연결 성공'"`
      },
      {
        name: '포트 지정 연결',
        command: `ssh -i "${this.config.keyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 -p ${this.config.port} ${this.config.user}@${this.config.host} "echo 'SSH 연결 성공'"`
      }
    ]
    
    for (const method of testMethods) {
      try {
        log(`테스트 방법: ${method.name}`, 'blue')
        const result = execSync(method.command, { 
          encoding: 'utf8',
          timeout: this.config.timeout,
          stdio: 'pipe'
        })
        
        if (result.includes('SSH 연결 성공')) {
          logSuccess(`${method.name} 성공!`)
          return true
        }
      } catch (error: any) {
        logWarning(`${method.name} 실패: ${error.message}`)
      }
    }
    
    logError('모든 SSH 연결 테스트 실패')
    return false
  }

  /**
   * 3. SSH 설정 파일 생성
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
  ConnectTimeout 30
  ServerAliveCountMax 3
  TCPKeepAlive yes
  Compression yes
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
   * 4. SSH 연결 스크립트 생성
   */
  createSSHScripts(): void {
    logStep('SSH_SCRIPTS', 'SSH 연결 스크립트 생성 중...')
    
    const scripts = {
      'connect-ssh.bat': `@echo off
echo SSH 연결 중...
ssh -i "${this.config.keyPath}" ${this.config.user}@${this.config.host}
pause`,
      'connect-ssh.sh': `#!/bin/bash
echo "SSH 연결 중..."
ssh -i "${this.config.keyPath}" ${this.config.user}@${this.config.host}`,
      'deploy-to-server.bat': `@echo off
echo 파일 배포 중...
scp -i "${this.config.keyPath}" -r ./dist ${this.config.user}@${this.config.host}:~/
echo 배포 완료!
pause`
    }
    
    for (const [filename, content] of Object.entries(scripts)) {
      const scriptPath = path.join(this.config.projectRoot, filename)
      fs.writeFileSync(scriptPath, content)
      logSuccess(`스크립트 생성됨: ${filename}`)
    }
  }

  /**
   * 5. SSH 연결 명령어 생성
   */
  generateSSHCommands(): void {
    logStep('SSH_COMMANDS', 'SSH 연결 명령어 생성 중...')
    
    const commands = {
      direct: `ssh -i "${this.config.keyPath}" ${this.config.user}@${this.config.host}`,
      withConfig: 'ssh deukgeun-server',
      scpUpload: `scp -i "${this.config.keyPath}" -r ./dist ${this.config.user}@${this.config.host}:~/`,
      scpDownload: `scp -i "${this.config.keyPath}" -r ${this.config.user}@${this.config.host}:~/backup ./`,
      rsyncUpload: `rsync -avz -e "ssh -i ${this.config.keyPath}" ./dist/ ${this.config.user}@${this.config.host}:~/dist/`,
      rsyncDownload: `rsync -avz -e "ssh -i ${this.config.keyPath}" ${this.config.user}@${this.config.host}:~/backup/ ./backup/`
    }
    
    log('\n📋 SSH 연결 명령어:', 'bright')
    Object.entries(commands).forEach(([name, command]) => {
      log(`${name}: ${command}`, 'cyan')
    })
    
    // 명령어를 파일로 저장
    const commandsPath = path.join(this.config.projectRoot, 'ssh-commands.txt')
    const commandsContent = Object.entries(commands)
      .map(([name, command]) => `# ${name}\n${command}`)
      .join('\n\n')
    
    fs.writeFileSync(commandsPath, commandsContent)
    logSuccess(`SSH 명령어 저장됨: ${commandsPath}`)
  }

  /**
   * 6. SSH 문제 해결 가이드
   */
  generateTroubleshootingGuide(): void {
    logStep('SSH_TROUBLESHOOTING', 'SSH 문제 해결 가이드 생성 중...')
    
    const guideContent = `# SSH 문제 해결 가이드

## 일반적인 SSH 문제와 해결책

### 1. SSH 키 파일 권한 문제
\`\`\`bash
# Windows
icacls "deukgeun_ReactProject.pem" /inheritance:r /grant:r "%USERNAME%:R"

# Linux/Mac
chmod 600 deukgeun_ReactProject.pem
\`\`\`

### 2. SSH 연결 거부
\`\`\`bash
# 상세 로그로 연결 시도
ssh -i "deukgeun_ReactProject.pem" -v ubuntu@43.203.30.167

# 다른 포트로 시도
ssh -i "deukgeun_ReactProject.pem" -p 22 ubuntu@43.203.30.167
\`\`\`

### 3. 호스트 키 확인 실패
\`\`\`bash
# 호스트 키 확인 건너뛰기
ssh -i "deukgeun_ReactProject.pem" -o StrictHostKeyChecking=no ubuntu@43.203.30.167
\`\`\`

### 4. 연결 타임아웃
\`\`\`bash
# 타임아웃 시간 증가
ssh -i "deukgeun_ReactProject.pem" -o ConnectTimeout=30 ubuntu@43.203.30.167
\`\`\`

### 5. 네트워크 연결 확인
\`\`\`bash
# 핑 테스트
ping 43.203.30.167

# 포트 연결 확인
telnet 43.203.30.167 22
\`\`\`

## SSH 설정 파일 사용

\`\`\`bash
# SSH 설정 파일로 연결
ssh deukgeun-server

# 설정 파일 위치: ./ssh-config
\`\`\`

## 파일 전송

### SCP 사용
\`\`\`bash
# 파일 업로드
scp -i "deukgeun_ReactProject.pem" -r ./dist ubuntu@43.203.30.167:~/

# 파일 다운로드
scp -i "deukgeun_ReactProject.pem" -r ubuntu@43.203.30.167:~/backup ./
\`\`\`

### RSYNC 사용 (더 효율적)
\`\`\`bash
# 파일 동기화 (업로드)
rsync -avz -e "ssh -i deukgeun_ReactProject.pem" ./dist/ ubuntu@43.203.30.167:~/dist/

# 파일 동기화 (다운로드)
rsync -avz -e "ssh -i deukgeun_ReactProject.pem" ubuntu@43.203.30.167:~/backup/ ./backup/
\`\`\`
`
    
    const guidePath = path.join(this.config.projectRoot, 'SSH_TROUBLESHOOTING_GUIDE.md')
    fs.writeFileSync(guidePath, guideContent)
    logSuccess(`SSH 문제 해결 가이드 생성됨: ${guidePath}`)
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 SSH 완전 솔루션 사용법:', 'bright')
    log('  npm run ssh:solution        : SSH 완전 솔루션 실행', 'cyan')
    log('  npm run ssh:diagnose        : SSH 환경 진단', 'cyan')
    log('  npm run ssh:test            : SSH 연결 테스트', 'cyan')
    log('  npm run ssh:config          : SSH 설정 파일 생성', 'cyan')
    
    log('\n🔧 명령어:', 'bright')
    log('  ssh:solution        : 전체 SSH 솔루션', 'green')
    log('  ssh:diagnose        : SSH 환경 진단', 'green')
    log('  ssh:test            : SSH 연결 테스트', 'green')
    log('  ssh:config          : SSH 설정 파일 생성', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const sshSolution = new SSHCompleteSolution(sshConfig)
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      sshSolution.printUsage()
      return
    }
    
    log('🔧 SSH 완전 솔루션을 시작합니다...', 'bright')
    log('='.repeat(60))
    
    // 1. SSH 환경 진단
    const diagnosisSuccess = sshSolution.diagnoseSSHEnvironment()
    if (!diagnosisSuccess) {
      logError('SSH 환경 진단 실패')
      return
    }
    
    // 2. SSH 연결 테스트
    const connectionSuccess = sshSolution.testSSHConnection()
    if (!connectionSuccess) {
      logWarning('SSH 연결에 실패했습니다. 문제 해결 가이드를 확인하세요.')
    }
    
    // 3. SSH 설정 파일 생성
    sshSolution.createSSHConfig()
    
    // 4. SSH 연결 스크립트 생성
    sshSolution.createSSHScripts()
    
    // 5. SSH 연결 명령어 생성
    sshSolution.generateSSHCommands()
    
    // 6. SSH 문제 해결 가이드 생성
    sshSolution.generateTroubleshootingGuide()
    
    log('\n🎉 SSH 완전 솔루션이 완료되었습니다!', 'green')
    log('생성된 파일들을 확인하세요:', 'cyan')
    log('  - ssh-config', 'blue')
    log('  - connect-ssh.bat', 'blue')
    log('  - connect-ssh.sh', 'blue')
    log('  - deploy-to-server.bat', 'blue')
    log('  - ssh-commands.txt', 'blue')
    log('  - SSH_TROUBLESHOOTING_GUIDE.md', 'blue')
    
  } catch (error: any) {
    logError(`SSH 솔루션 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { SSHCompleteSolution, main }
