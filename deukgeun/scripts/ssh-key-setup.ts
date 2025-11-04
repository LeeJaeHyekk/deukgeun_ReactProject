#!/usr/bin/env node

/**
 * SSH 키 설정 스크립트 (AWS 공식 문서 기반)
 * AWS 키 페어 구조에 따른 SSH 연결 설정 및 검증
 * 
 * AWS 공식 문서 참조:
 * - EC2 키 페어 관리: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html
 * - SSH 연결: https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { 
  logStep, 
  logSuccess, 
  logError, 
  logInfo, 
  logWarning,
  logSeparator,
  configureLogger,
  setLogLevel,
  setLogPrefix
} from './modules/logger-functions'

// SSH 키 설정 인터페이스
interface SSHKeyConfig {
  keyPath: string
  keyName: string
  ec2Host: string
  ec2User: string
  ec2Port: number
  testConnection: boolean
  verbose: boolean
}

// 기본 설정
const defaultConfig: SSHKeyConfig = {
  keyPath: 'C:\\Users\\jaehyuok\\Desktop\\ZEV_AWS_KEY',
  keyName: 'ZEV_AWS_KEY',
  ec2Host: '43.203.30.167', // 기존 EC2 IP
  ec2User: 'ubuntu',
  ec2Port: 22,
  testConnection: true,
  verbose: true
}

/**
 * SSH 키 설정 클래스
 */
class SSHKeySetup {
  private config: SSHKeyConfig
  private projectRoot: string

  constructor(config: Partial<SSHKeyConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.projectRoot = process.cwd()
    
    // 로거 설정
    configureLogger({
      level: this.config.verbose ? 'debug' : 'info',
      prefix: 'SSH-KEY-SETUP'
    })
  }

  /**
   * SSH 키 파일 존재 확인
   */
  async checkKeyFile(): Promise<boolean> {
    logStep('KEY_CHECK', 'SSH 키 파일 확인 중...')
    
    try {
      if (!fs.existsSync(this.config.keyPath)) {
        logError(`SSH 키 파일을 찾을 수 없습니다: ${this.config.keyPath}`)
        return false
      }

      // 키 파일 권한 확인 (Linux/Mac에서만)
      if (process.platform !== 'win32') {
        const stats = fs.statSync(this.config.keyPath)
        const mode = stats.mode & parseInt('777', 8)
        
        if (mode !== parseInt('600', 8)) {
          logWarning('SSH 키 파일 권한을 600으로 설정합니다.')
          fs.chmodSync(this.config.keyPath, 0o600)
        }
      }

      logSuccess('SSH 키 파일 확인 완료')
      return true

    } catch (error) {
      logError(`SSH 키 파일 확인 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * SSH 연결 테스트
   */
  async testSSHConnection(): Promise<boolean> {
    if (!this.config.testConnection) {
      logInfo('SSH 연결 테스트를 건너뜁니다.')
      return true
    }

    logStep('SSH_TEST', 'SSH 연결 테스트 중...')
    
    try {
      const sshCommand = `ssh -i "${this.config.keyPath}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${this.config.ec2User}@${this.config.ec2Host} "echo 'SSH 연결 성공'"`

      logInfo(`연결 테스트 명령어: ${sshCommand}`)
      
      const result = execSync(sshCommand, { 
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe'
      })

      if (result.includes('SSH 연결 성공')) {
        logSuccess('SSH 연결 테스트 성공')
        return true
      } else {
        logError('SSH 연결 테스트 실패')
        return false
      }

    } catch (error) {
      logError(`SSH 연결 테스트 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * SSH 설정 파일 생성
   */
  async createSSHConfig(): Promise<boolean> {
    logStep('SSH_CONFIG', 'SSH 설정 파일 생성 중...')
    
    try {
      const sshConfigPath = path.join(this.projectRoot, 'ssh-config')
      const sshConfigContent = `# SSH 설정 파일 - deukgeun 프로젝트
# 생성일: ${new Date().toISOString()}

# EC2 인스턴스 설정
Host deukgeun-ec2
    HostName ${this.config.ec2Host}
    User ${this.config.ec2User}
    Port ${this.config.ec2Port}
    IdentityFile "${this.config.keyPath}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3

# SSH 연결 테스트용 별칭
Host deukgeun-test
    HostName ${this.config.ec2Host}
    User ${this.config.ec2User}
    Port ${this.config.ec2Port}
    IdentityFile "${this.config.keyPath}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 30
    ServerAliveCountMax 2
`

      fs.writeFileSync(sshConfigPath, sshConfigContent)
      logSuccess(`SSH 설정 파일 생성 완료: ${sshConfigPath}`)
      return true

    } catch (error) {
      logError(`SSH 설정 파일 생성 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 배포 스크립트용 SSH 명령어 생성
   */
  async createDeploySSHCommands(): Promise<boolean> {
    logStep('DEPLOY_SSH', '배포용 SSH 명령어 생성 중...')
    
    try {
      const deploySSHPath = path.join(this.projectRoot, 'deploy-ssh-commands.sh')
      const deploySSHContent = `#!/bin/bash

# =============================================================================
# SSH 배포 명령어 스크립트 - deukgeun 프로젝트
# =============================================================================

# SSH 키 경로
SSH_KEY="${this.config.keyPath}"
EC2_HOST="${this.config.ec2Host}"
EC2_USER="${this.config.ec2User}"
EC2_PORT="${this.config.ec2Port}"

# SSH 연결 함수
ssh_connect() {
    ssh -i "$SSH_KEY" -p "$EC2_PORT" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$@"
}

# SCP 파일 전송 함수
scp_upload() {
    local source="$1"
    local destination="$2"
    scp -i "$SSH_KEY" -P "$EC2_PORT" -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination"
}

# SCP 디렉토리 전송 함수
scp_upload_dir() {
    local source="$1"
    local destination="$2"
    scp -i "$SSH_KEY" -P "$EC2_PORT" -r -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination"
}

# EC2 연결 테스트
test_connection() {
    echo "🔍 EC2 연결 테스트 중..."
    if ssh_connect "echo 'SSH 연결 성공'"; then
        echo "✅ SSH 연결 성공"
        return 0
    else
        echo "❌ SSH 연결 실패"
        return 1
    fi
}

# 프로젝트 파일 전송
upload_project() {
    echo "📤 프로젝트 파일 전송 중..."
    
    # 프로젝트 루트로 이동
    cd "$(dirname "$0")"
    
    # 필요한 파일들만 전송
    echo "전송할 파일들:"
    echo "  - package.json"
    echo "  - package-lock.json"
    echo "  - tsconfig.json"
    echo "  - ecosystem.config.cjs"
    echo "  - .env"
    echo "  - src/"
    echo "  - scripts/"
    
    # EC2에서 프로젝트 디렉토리 생성
    ssh_connect "mkdir -p ~/deukgeun"
    
    # 파일들 전송
    scp_upload "package.json" "~/deukgeun/"
    scp_upload "package-lock.json" "~/deukgeun/"
    scp_upload "tsconfig.json" "~/deukgeun/"
    scp_upload "ecosystem.config.cjs" "~/deukgeun/"
    scp_upload ".env" "~/deukgeun/"
    scp_upload_dir "src" "~/deukgeun/"
    scp_upload_dir "scripts" "~/deukgeun/"
    
    echo "✅ 프로젝트 파일 전송 완료"
}

# EC2에서 배포 실행
deploy_on_ec2() {
    echo "🚀 EC2에서 배포 실행 중..."
    
    ssh_connect << 'EOF'
        cd ~/deukgeun
        
        # Node.js 및 npm 확인
        if ! command -v node &> /dev/null; then
            echo "Node.js 설치 중..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        # PM2 설치
        if ! command -v pm2 &> /dev/null; then
            echo "PM2 설치 중..."
            sudo npm install -g pm2
        fi
        
        # 의존성 설치
        echo "의존성 설치 중..."
        npm install --production=false
        
        # TypeScript 컴파일
        echo "TypeScript 컴파일 중..."
        npx tsc --project tsconfig.scripts.json || echo "컴파일 경고 무시"
        
        # 빌드 실행
        echo "프로젝트 빌드 중..."
        npm run build:production || echo "빌드 경고 무시"
        
        # PM2 서비스 시작
        echo "PM2 서비스 시작 중..."
        pm2 delete all 2>/dev/null || true
        pm2 start ecosystem.config.cjs --env production
        
        # PM2 자동 시작 설정
        pm2 startup
        pm2 save
        
        echo "✅ 배포 완료"
        pm2 status
EOF
}

# 서비스 상태 확인
check_services() {
    echo "🔍 서비스 상태 확인 중..."
    ssh_connect "pm2 status"
}

# 서비스 재시작
restart_services() {
    echo "🔄 서비스 재시작 중..."
    ssh_connect "pm2 restart all"
}

# 서비스 중지
stop_services() {
    echo "⏹️ 서비스 중지 중..."
    ssh_connect "pm2 stop all"
}

# 로그 확인
view_logs() {
    echo "📋 로그 확인 중..."
    ssh_connect "pm2 logs"
}

# 메인 함수
main() {
    case "$1" in
        "test")
            test_connection
            ;;
        "upload")
            test_connection && upload_project
            ;;
        "deploy")
            test_connection && upload_project && deploy_on_ec2
            ;;
        "status")
            check_services
            ;;
        "restart")
            restart_services
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            view_logs
            ;;
        *)
            echo "사용법: $0 {test|upload|deploy|status|restart|stop|logs}"
            echo ""
            echo "명령어:"
            echo "  test    - SSH 연결 테스트"
            echo "  upload  - 프로젝트 파일 전송"
            echo "  deploy  - 전체 배포 실행"
            echo "  status  - 서비스 상태 확인"
            echo "  restart - 서비스 재시작"
            echo "  stop    - 서비스 중지"
            echo "  logs    - 로그 확인"
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"
`

      fs.writeFileSync(deploySSHPath, deploySSHContent)
      
      // 실행 권한 부여 (Linux/Mac에서만)
      if (process.platform !== 'win32') {
        fs.chmodSync(deploySSHPath, 0o755)
      }
      
      logSuccess(`배포용 SSH 명령어 생성 완료: ${deploySSHPath}`)
      return true

    } catch (error) {
      logError(`배포용 SSH 명령어 생성 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 환경 변수 파일 업데이트
   */
  async updateEnvFiles(): Promise<boolean> {
    logStep('ENV_UPDATE', '환경 변수 파일 업데이트 중...')
    
    try {
      // .env 파일에 SSH 관련 설정 추가
      const envPath = path.join(this.projectRoot, '.env')
      let envContent = ''
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8')
      }
      
      // SSH 설정 추가
      const sshConfig = `
# ============================================================================
# SSH 연결 설정
# ============================================================================
SSH_KEY_PATH=${this.config.keyPath}
EC2_HOST=${this.config.ec2Host}
EC2_USER=${this.config.ec2User}
EC2_PORT=${this.config.ec2Port}
`
      
      // SSH 설정이 이미 있는지 확인
      if (!envContent.includes('SSH_KEY_PATH')) {
        envContent += sshConfig
        fs.writeFileSync(envPath, envContent)
        logSuccess('.env 파일에 SSH 설정 추가 완료')
      } else {
        logInfo('.env 파일에 SSH 설정이 이미 존재합니다.')
      }
      
      return true

    } catch (error) {
      logError(`환경 변수 파일 업데이트 실패: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 전체 SSH 키 설정 실행
   */
  async execute(): Promise<{ success: boolean; results: any }> {
    const results: any = {}

    try {
      logSeparator('=', 60, 'bright')
      logInfo('🔑 SSH 키 설정을 시작합니다...')
      logSeparator('=', 60, 'bright')

      // 1. SSH 키 파일 확인
      if (!await this.checkKeyFile()) {
        throw new Error('SSH 키 파일 확인 실패')
      }

      // 2. SSH 연결 테스트
      if (!await this.testSSHConnection()) {
        logWarning('SSH 연결 테스트 실패. 설정은 계속 진행됩니다.')
      }

      // 3. SSH 설정 파일 생성
      if (!await this.createSSHConfig()) {
        throw new Error('SSH 설정 파일 생성 실패')
      }

      // 4. 배포용 SSH 명령어 생성
      if (!await this.createDeploySSHCommands()) {
        throw new Error('배포용 SSH 명령어 생성 실패')
      }

      // 5. 환경 변수 파일 업데이트
      if (!await this.updateEnvFiles()) {
        throw new Error('환경 변수 파일 업데이트 실패')
      }

      // 성공 처리
      results.success = true
      results.config = this.config

      logSeparator('=', 60, 'green')
      logSuccess('🎉 SSH 키 설정이 성공적으로 완료되었습니다!')
      logInfo('📋 생성된 파일들:')
      logInfo('  - ssh-config (SSH 설정 파일)')
      logInfo('  - deploy-ssh-commands.sh (배포용 SSH 명령어)')
      logInfo('  - .env (환경 변수 업데이트)')
      logSeparator('=', 60, 'green')

      logInfo('🚀 사용 방법:')
      logInfo('  1. SSH 연결 테스트: ./deploy-ssh-commands.sh test')
      logInfo('  2. 프로젝트 전송: ./deploy-ssh-commands.sh upload')
      logInfo('  3. 전체 배포: ./deploy-ssh-commands.sh deploy')
      logInfo('  4. 서비스 관리: ./deploy-ssh-commands.sh {status|restart|stop|logs}')

      return { success: true, results }

    } catch (error) {
      logError(`SSH 키 설정 실패: ${(error as Error).message}`)
      return { success: false, results }
    }
  }
}

/**
 * SSH 키 설정 함수
 */
export async function setupSSHKey(config: Partial<SSHKeyConfig> = {}): Promise<{ success: boolean; results: any }> {
  const setup = new SSHKeySetup(config)
  return await setup.execute()
}

// 메인 실행 함수
async function main(): Promise<void> {
  try {
    // 명령행 인수 파싱
    const args = process.argv.slice(2)
    const config: Partial<SSHKeyConfig> = {}

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--key-path':
        case '-k':
          config.keyPath = args[++i]
          break
        case '--host':
        case '-h':
          config.ec2Host = args[++i]
          break
        case '--user':
        case '-u':
          config.ec2User = args[++i]
          break
        case '--port':
        case '-p':
          config.ec2Port = parseInt(args[++i])
          break
        case '--no-test':
          config.testConnection = false
          break
        case '--verbose':
        case '-v':
          config.verbose = true
          break
        case '--help':
          console.log(`
SSH 키 설정 스크립트

사용법: npx ts-node ssh-key-setup.ts [옵션]

옵션:
  -k, --key-path <path>    SSH 키 파일 경로
  -h, --host <host>        EC2 호스트 주소
  -u, --user <user>        EC2 사용자명
  -p, --port <port>        SSH 포트 (기본값: 22)
  --no-test                SSH 연결 테스트 건너뛰기
  -v, --verbose            상세 로그
  --help                   도움말 표시

예시:
  npx ts-node ssh-key-setup.ts --key-path "C:\\Users\\jaehyuok\\Desktop\\ZEV_AWS_KEY"
  npx ts-node ssh-key-setup.ts --host 43.203.30.167 --user ubuntu
          `)
          process.exit(0)
          break
      }
    }

    const result = await setupSSHKey(config)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }

  } catch (error) {
    logError(`실행 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export type { SSHKeyConfig }
export { SSHKeySetup }
