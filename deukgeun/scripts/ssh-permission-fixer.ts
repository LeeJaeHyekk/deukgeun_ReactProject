#!/usr/bin/env node

/**
 * SSH 권한 수정 스크립트
 * SSH 키 파일 권한 문제를 해결하는 유틸리티
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

interface SSHKeyInfo {
  path: string
  exists: boolean
  permissions: string
  size: number
  validPermissions: boolean
}

/**
 * SSH 권한 수정 클래스
 */
class SSHPermissionFixer {
  private projectRoot: string
  private keyPath: string

  constructor() {
    this.projectRoot = process.cwd()
    this.keyPath = './deukgeun_ReactProject.pem'
  }

  /**
   * SSH 키 파일 정보 확인
   */
  checkSSHKeyInfo(): SSHKeyInfo | null {
    logStep('SSH_KEY_CHECK', 'SSH 키 파일 정보 확인 중...')
    
    try {
      if (!fs.existsSync(this.keyPath)) {
        logError(`SSH 키 파일을 찾을 수 없습니다: ${this.keyPath}`)
        return null
      }
      
      const stats = fs.statSync(this.keyPath)
      const mode = stats.mode & parseInt('777', 8)
      const permissions = mode.toString(8)
      const validPermissions = mode === parseInt('600', 8)
      
      const keyInfo: SSHKeyInfo = {
        path: this.keyPath,
        exists: true,
        permissions: permissions,
        size: stats.size,
        validPermissions: validPermissions
      }
      
      log(`SSH 키 파일: ${this.keyPath}`, 'blue')
      log(`파일 크기: ${stats.size} bytes`, 'blue')
      log(`현재 권한: ${permissions}`, 'blue')
      log(`올바른 권한: ${validPermissions ? '✅' : '❌'}`, 'blue')
      
      return keyInfo
    } catch (error: any) {
      logError(`SSH 키 파일 정보 확인 실패: ${error.message}`)
      return null
    }
  }

  /**
   * Windows에서 SSH 권한 수정
   */
  fixSSHPermissionsWindows(): boolean {
    logStep('SSH_PERMISSIONS_WINDOWS', 'Windows에서 SSH 권한 수정 중...')
    
    try {
      // icacls를 사용하여 권한 수정
      const chmodCommand = `icacls "${this.keyPath}" /inheritance:r /grant:r "%USERNAME%:R"`
      log(`권한 수정 명령: ${chmodCommand}`, 'blue')
      
      execSync(chmodCommand, { encoding: 'utf8' })
      logSuccess('SSH 키 파일 권한 수정 완료')
      
      // 권한 확인
      const verifyCommand = `icacls "${this.keyPath}"`
      const result = execSync(verifyCommand, { encoding: 'utf8' })
      log('수정된 권한:', 'cyan')
      console.log(result)
      
      return true
    } catch (error: any) {
      logError(`SSH 권한 수정 실패: ${error.message}`)
      return false
    }
  }

  /**
   * Linux/Mac에서 SSH 권한 수정
   */
  fixSSHPermissionsUnix(): boolean {
    logStep('SSH_PERMISSIONS_UNIX', 'Unix/Linux에서 SSH 권한 수정 중...')
    
    try {
      // chmod를 사용하여 권한 수정
      const chmodCommand = `chmod 600 "${this.keyPath}"`
      log(`권한 수정 명령: ${chmodCommand}`, 'blue')
      
      execSync(chmodCommand, { encoding: 'utf8' })
      logSuccess('SSH 키 파일 권한 수정 완료')
      
      // 권한 확인
      const verifyCommand = `ls -la "${this.keyPath}"`
      const result = execSync(verifyCommand, { encoding: 'utf8' })
      log('수정된 권한:', 'cyan')
      console.log(result)
      
      return true
    } catch (error: any) {
      logError(`SSH 권한 수정 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 플랫폼별 SSH 권한 수정
   */
  fixSSHPermissions(): boolean {
    logStep('SSH_PERMISSIONS', 'SSH 권한 수정 중...')
    
    const platform = process.platform
    
    if (platform === 'win32') {
      return this.fixSSHPermissionsWindows()
    } else {
      return this.fixSSHPermissionsUnix()
    }
  }

  /**
   * SSH 권한 수정 후 확인
   */
  verifySSHPermissions(): boolean {
    logStep('SSH_VERIFY', 'SSH 권한 수정 후 확인 중...')
    
    try {
      const keyInfo = this.checkSSHKeyInfo()
      if (!keyInfo) {
        return false
      }
      
      if (keyInfo.validPermissions) {
        logSuccess('SSH 키 파일 권한이 올바르게 설정되었습니다.')
        return true
      } else {
        logWarning('SSH 키 파일 권한이 여전히 올바르지 않습니다.')
        return false
      }
    } catch (error: any) {
      logError(`SSH 권한 확인 실패: ${error.message}`)
      return false
    }
  }

  /**
   * SSH 연결 테스트
   */
  testSSHConnection(): boolean {
    logStep('SSH_TEST', 'SSH 연결 테스트 중...')
    
    try {
      const testCommand = `ssh -i "${this.keyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@43.203.30.167 "echo 'SSH 연결 성공'"`
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
   * SSH 권한 수정 가이드 생성
   */
  generatePermissionGuide(): void {
    logStep('SSH_GUIDE', 'SSH 권한 수정 가이드 생성 중...')
    
    const guideContent = `# SSH 권한 수정 가이드

## 문제 상황
SSH 키 파일의 권한이 올바르지 않아 SSH 연결이 실패하는 경우

## 해결 방법

### Windows
\`\`\`cmd
# SSH 키 파일 권한 수정
icacls "deukgeun_ReactProject.pem" /inheritance:r /grant:r "%USERNAME%:R"

# 권한 확인
icacls "deukgeun_ReactProject.pem"
\`\`\`

### Linux/Mac
\`\`\`bash
# SSH 키 파일 권한 수정
chmod 600 deukgeun_ReactProject.pem

# 권한 확인
ls -la deukgeun_ReactProject.pem
\`\`\`

## 권한 설명
- **600**: 소유자만 읽기/쓰기 가능
- **644**: 소유자는 읽기/쓰기, 그룹/기타는 읽기만
- **700**: 소유자만 읽기/쓰기/실행 가능

## SSH 연결 테스트
\`\`\`bash
# 기본 연결 테스트
ssh -i "deukgeun_ReactProject.pem" ubuntu@43.203.30.167

# 상세 로그로 연결 테스트
ssh -i "deukgeun_ReactProject.pem" -v ubuntu@43.203.30.167
\`\`\`

## 문제 해결
1. SSH 키 파일이 존재하는지 확인
2. SSH 키 파일 권한이 600인지 확인
3. SSH 키 파일이 손상되지 않았는지 확인
4. 네트워크 연결 상태 확인
5. SSH 서버 상태 확인
`
    
    const guidePath = path.join(this.projectRoot, 'SSH_PERMISSION_GUIDE.md')
    fs.writeFileSync(guidePath, guideContent)
    logSuccess(`SSH 권한 수정 가이드 생성됨: ${guidePath}`)
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 SSH 권한 수정 사용법:', 'bright')
    log('  npm run ssh:fix-permissions        : SSH 권한 수정', 'cyan')
    log('  npm run ssh:fix-permissions:test    : SSH 권한 수정 후 테스트', 'cyan')
    
    log('\n🔧 명령어:', 'bright')
    log('  ssh:fix-permissions        : SSH 권한 수정', 'green')
    log('  ssh:fix-permissions:test   : SSH 권한 수정 후 테스트', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const sshPermissionFixer = new SSHPermissionFixer()
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      sshPermissionFixer.printUsage()
      return
    }
    
    log('🔧 SSH 권한 수정을 시작합니다...', 'bright')
    log('='.repeat(50))
    
    // 1. SSH 키 파일 정보 확인
    const keyInfo = sshPermissionFixer.checkSSHKeyInfo()
    if (!keyInfo) {
      logError('SSH 키 파일을 찾을 수 없습니다.')
      return
    }
    
    // 2. SSH 권한 수정
    if (!keyInfo.validPermissions) {
      const fixSuccess = sshPermissionFixer.fixSSHPermissions()
      if (!fixSuccess) {
        logError('SSH 권한 수정 실패')
        return
      }
    } else {
      logSuccess('SSH 키 파일 권한이 이미 올바릅니다.')
    }
    
    // 3. SSH 권한 수정 후 확인
    const verifySuccess = sshPermissionFixer.verifySSHPermissions()
    if (!verifySuccess) {
      logWarning('SSH 권한 확인 실패')
    }
    
    // 4. SSH 연결 테스트 (옵션)
    if (args.includes('--test') || args.includes('-t')) {
      const testSuccess = sshPermissionFixer.testSSHConnection()
      if (!testSuccess) {
        logWarning('SSH 연결 테스트 실패')
      }
    }
    
    // 5. SSH 권한 수정 가이드 생성
    sshPermissionFixer.generatePermissionGuide()
    
    log('\n🎉 SSH 권한 수정이 완료되었습니다!', 'green')
    
  } catch (error: any) {
    logError(`SSH 권한 수정 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { SSHPermissionFixer, main }
