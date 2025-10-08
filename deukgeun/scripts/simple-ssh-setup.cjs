#!/usr/bin/env node

/**
 * 간단한 SSH 키 설정 스크립트
 * 새로운 AWS EC2 키 페어를 사용하여 연결 설정
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// SSH 키 설정
const config = {
  keyPath: './ZEV_AWS_KEY.pem',
  keyName: 'ZEV_AWS_KEY',
  ec2Host: '3.36.230.117',
  ec2User: 'ubuntu',
  ec2Port: 22
}

// Windows에서 SSH 키 파일 권한 수정 함수
function fixSSHPermissions() {
  console.log('\n🔧 SSH 키 파일 권한 수정 중...')
  
  try {
    // 1단계: 기존 권한 모두 제거
    const removeInheritanceCommand = `icacls "${config.keyPath}" /inheritance:r`
    console.log(`권한 제거 명령어: ${removeInheritanceCommand}`)
    
    try {
      execSync(removeInheritanceCommand, { stdio: 'pipe' })
      console.log('✅ 기존 권한 제거 완료')
    } catch (error) {
      console.log(`⚠️ 기존 권한 제거 실패: ${error.message}`)
    }
    
    // 2단계: 현재 사용자에게만 읽기 권한 부여
    const grantReadCommand = `icacls "${config.keyPath}" /grant:r "${process.env.USERNAME}:(R)"`
    console.log(`읽기 권한 부여 명령어: ${grantReadCommand}`)
    
    try {
      execSync(grantReadCommand, { stdio: 'pipe' })
      console.log('✅ 읽기 권한 부여 완료')
    } catch (error) {
      console.log(`⚠️ 읽기 권한 부여 실패: ${error.message}`)
    }
    
    // 3단계: 권한 확인
    const checkCommand = `icacls "${config.keyPath}"`
    console.log(`권한 확인 명령어: ${checkCommand}`)
    
    try {
      const result = execSync(checkCommand, { encoding: 'utf8', stdio: 'pipe' })
      console.log('현재 권한:')
      console.log(result)
      
      if (result.includes('(R)') && !result.includes('(F)')) {
        console.log('✅ 권한이 올바르게 설정되었습니다')
        return true
      } else {
        console.log('⚠️ 권한 설정이 완전하지 않을 수 있습니다')
        return false
      }
    } catch (error) {
      console.log(`⚠️ 권한 확인 실패: ${error.message}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Windows 권한 수정 실패: ${error.message}`)
    return false
  }
}

console.log('🔑 SSH 키 설정을 시작합니다...')
console.log('설정 정보:')
console.log(`  - 키 경로: ${config.keyPath}`)
console.log(`  - EC2 호스트: ${config.ec2Host}`)
console.log(`  - 사용자: ${config.ec2User}`)
console.log(`  - 포트: ${config.ec2Port}`)

// 1. SSH 키 파일 확인
console.log('\n1. SSH 키 파일 확인 중...')
if (!fs.existsSync(config.keyPath)) {
  console.error(`❌ SSH 키 파일을 찾을 수 없습니다: ${config.keyPath}`)
  process.exit(1)
}
console.log('✅ SSH 키 파일 확인 완료')

// 1-1. SSH 키 파일 권한 수정
const permissionFixed = fixSSHPermissions()
if (!permissionFixed) {
  console.log('⚠️ 권한 수정에 문제가 있지만 계속 진행합니다.')
}

// 2. SSH 설정 파일 생성
console.log('\n2. SSH 설정 파일 생성 중...')
const sshConfigPath = path.join(process.cwd(), 'ssh-config')
const sshConfigContent = `# SSH 설정 파일 - deukgeun 프로젝트
# 생성일: ${new Date().toISOString()}

# EC2 인스턴스 설정
Host deukgeun-ec2
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile "${config.keyPath}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3

# SSH 연결 테스트용 별칭
Host deukgeun-test
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile "${config.keyPath}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 30
    ServerAliveCountMax 2
`

fs.writeFileSync(sshConfigPath, sshConfigContent)
console.log(`✅ SSH 설정 파일 생성 완료: ${sshConfigPath}`)

// 3. 배포용 SSH 명령어 생성
console.log('\n3. 배포용 SSH 명령어 생성 중...')
const deploySSHPath = path.join(process.cwd(), 'deploy-ssh-commands.sh')
const deploySSHContent = `#!/bin/bash

# =============================================================================
# SSH 배포 명령어 스크립트 - deukgeun 프로젝트
# =============================================================================

# SSH 키 경로
SSH_KEY="${config.keyPath}"
EC2_HOST="${config.ec2Host}"
EC2_USER="${config.ec2User}"
EC2_PORT="${config.ec2Port}"

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
console.log(`✅ 배포용 SSH 명령어 생성 완료: ${deploySSHPath}`)

// 4. 환경 변수 파일 업데이트
console.log('\n4. 환경 변수 파일 업데이트 중...')
const envPath = path.join(process.cwd(), '.env')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
}

// SSH 설정 추가
const sshConfig = `
# ============================================================================
# SSH 연결 설정
# ============================================================================
SSH_KEY_PATH=${config.keyPath}
EC2_HOST=${config.ec2Host}
EC2_USER=${config.ec2User}
EC2_PORT=${config.ec2Port}
`

// SSH 설정이 이미 있는지 확인
if (!envContent.includes('SSH_KEY_PATH')) {
  envContent += sshConfig
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env 파일에 SSH 설정 추가 완료')
} else {
  console.log('ℹ️ .env 파일에 SSH 설정이 이미 존재합니다.')
}

// 5. SSH 연결 테스트
console.log('\n5. SSH 연결 테스트 중...')
try {
  const sshCommand = `ssh -i "${config.keyPath}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'"`
  console.log(`연결 테스트 명령어: ${sshCommand}`)
  
  const result = execSync(sshCommand, { 
    encoding: 'utf8',
    timeout: 15000,
    stdio: 'pipe'
  })

  if (result.includes('SSH 연결 성공')) {
    console.log('✅ SSH 연결 테스트 성공')
  } else {
    console.log('⚠️ SSH 연결 테스트 결과가 예상과 다릅니다.')
  }
} catch (error) {
  console.log(`⚠️ SSH 연결 테스트 실패: ${error.message}`)
  console.log('설정은 완료되었지만 연결에 문제가 있을 수 있습니다.')
}

console.log('\n🎉 SSH 키 설정이 완료되었습니다!')
console.log('\n📋 생성된 파일들:')
console.log('  - ssh-config (SSH 설정 파일)')
console.log('  - deploy-ssh-commands.sh (배포용 SSH 명령어)')
console.log('  - .env (환경 변수 업데이트)')

console.log('\n🚀 사용 방법:')
console.log('  1. SSH 연결 테스트: node scripts/simple-ssh-setup.cjs')
console.log('  2. 배포 스크립트 사용 (Linux/Mac): ./deploy-ssh-commands.sh test')
console.log('  3. Windows에서 WSL 사용 권장')
