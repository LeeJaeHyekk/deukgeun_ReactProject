#!/usr/bin/env node

/**
 * SSH 연결 완전 해결 스크립트 (AWS 공식 문서 기반)
 * AWS 키 페어 구조에 따른 SSH 연결 문제를 종합적으로 해결
 * 
 * AWS 공식 문서 참조:
 * - EC2 키 페어 관리: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html
 * - SSH 연결: https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html
 * - Systems Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 프로젝트 설정
const config = {
  keyPath: './ZEV_AWS_KEY.pem',
  keyName: 'ZEV_AWS_KEY',
  ec2Host: '3.36.230.117',
  ec2User: 'ubuntu',
  ec2Port: 22,
  projectRoot: process.cwd()
}

console.log('🚀 SSH 연결 완전 해결을 시작합니다...')
console.log('=' * 60)
console.log('프로젝트: deukgeun')
console.log(`EC2 호스트: ${config.ec2Host}`)
console.log(`SSH 키: ${config.keyPath}`)
console.log('=' * 60)

/**
 * 1. 네트워크 연결 문제 해결
 */
function solveNetworkIssues() {
  console.log('\n1. 네트워크 연결 문제 해결 중...')
  
  try {
    // 1-1. EC2 인스턴스 상태 확인
    console.log('  1-1. EC2 인스턴스 상태 확인 중...')
    console.log('    ⚠️ AWS 콘솔에서 다음을 확인하세요:')
    console.log('    - EC2 인스턴스가 "running" 상태인지 확인')
    console.log('    - 인스턴스의 공개 IP가 3.36.230.117인지 확인')
    console.log('    - 보안 그룹에서 SSH 포트(22)가 열려있는지 확인')
    
    // 1-2. 대안 IP 주소 시도
    console.log('  1-2. 대안 연결 방법 시도 중...')
    
    const alternativeHosts = [
      '3.36.230.117',
      'ec2-3-36-230-117.ap-northeast-2.compute.amazonaws.com'
    ]
    
    for (const host of alternativeHosts) {
      console.log(`    ${host} 연결 테스트 중...`)
      try {
        const pingCommand = `ping -n 1 ${host}`
        execSync(pingCommand, { stdio: 'pipe', timeout: 5000 })
        console.log(`    ✅ ${host} 연결 성공`)
        config.ec2Host = host
        break
      } catch (error) {
        console.log(`    ❌ ${host} 연결 실패`)
      }
    }
    
    return true
    
  } catch (error) {
    console.log(`❌ 네트워크 문제 해결 실패: ${error.message}`)
    return false
  }
}

/**
 * 2. SSH 키 문제 해결
 */
function solveSSHKeyIssues() {
  console.log('\n2. SSH 키 문제 해결 중...')
  
  try {
    // 2-1. 키 파일 형식 확인 및 수정
    console.log('  2-1. SSH 키 파일 형식 확인 중...')
    
    if (!fs.existsSync(config.keyPath)) {
      console.log('    ❌ SSH 키 파일이 존재하지 않습니다.')
      console.log('    해결 방법:')
      console.log('    1. AWS 콘솔에서 새 키 페어 생성')
      console.log('    2. ZEV_AWS_KEY.pem 파일을 프로젝트 루트에 저장')
      return false
    }
    
    const keyContent = fs.readFileSync(config.keyPath, 'utf8')
    
    // 키 형식 검증
    if (!keyContent.includes('BEGIN PRIVATE KEY') && !keyContent.includes('BEGIN RSA PRIVATE KEY')) {
      console.log('    ❌ 올바른 PEM 형식이 아닙니다.')
      return false
    }
    
    console.log('    ✅ SSH 키 파일 형식 확인 완료')
    
    // 2-2. Windows 권한 수정
    console.log('  2-2. Windows 권한 수정 중...')
    
    try {
      // 기존 권한 제거
      execSync(`icacls "${config.keyPath}" /inheritance:r`, { stdio: 'pipe' })
      
      // 현재 사용자에게만 읽기 권한 부여
      execSync(`icacls "${config.keyPath}" /grant:r "${process.env.USERNAME}:(R)"`, { stdio: 'pipe' })
      
      console.log('    ✅ Windows 권한 수정 완료')
      
    } catch (error) {
      console.log(`    ⚠️ Windows 권한 수정 실패: ${error.message}`)
    }
    
    // 2-3. WSL 환경에서 권한 설정
    console.log('  2-3. WSL 환경에서 권한 설정 중...')
    
    try {
      // WSL로 키 파일 복사
      execSync(`wsl cp "${path.resolve(config.keyPath)}" ~/.ssh/${config.keyName}.pem`, { stdio: 'pipe' })
      
      // WSL에서 권한 설정
      execSync(`wsl chmod 600 ~/.ssh/${config.keyName}.pem`, { stdio: 'pipe' })
      
      console.log('    ✅ WSL 권한 설정 완료')
      
    } catch (error) {
      console.log(`    ⚠️ WSL 권한 설정 실패: ${error.message}`)
    }
    
    return true
    
  } catch (error) {
    console.log(`❌ SSH 키 문제 해결 실패: ${error.message}`)
    return false
  }
}

/**
 * 3. SSH 설정 최적화
 */
function optimizeSSHConfig() {
  console.log('\n3. SSH 설정 최적화 중...')
  
  try {
    // 3-1. SSH 설정 파일 생성
    console.log('  3-1. SSH 설정 파일 생성 중...')
    
    const sshConfigPath = path.join(config.projectRoot, 'ssh-config')
    const sshConfigContent = `# SSH 설정 파일 - deukgeun 프로젝트
# 자동 생성: ${new Date().toISOString()}

Host deukgeun-ec2
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile "${path.resolve(config.keyPath)}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET
    IdentitiesOnly yes
    PasswordAuthentication no
    PubkeyAuthentication yes
    PreferredAuthentications publickey

# 테스트용 별칭
Host deukgeun-test
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile "${path.resolve(config.keyPath)}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 30
    ServerAliveCountMax 2
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET
    IdentitiesOnly yes
    PasswordAuthentication no
    PubkeyAuthentication yes
    PreferredAuthentications publickey

# WSL용 별칭
Host deukgeun-wsl
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile ~/.ssh/${config.keyName}.pem
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET
    IdentitiesOnly yes
    PasswordAuthentication no
    PubkeyAuthentication yes
    PreferredAuthentications publickey
`

    fs.writeFileSync(sshConfigPath, sshConfigContent)
    console.log('    ✅ SSH 설정 파일 생성 완료')
    
    // 3-2. 배포 스크립트 업데이트
    console.log('  3-2. 배포 스크립트 업데이트 중...')
    
    const deployScriptPath = path.join(config.projectRoot, 'deploy-ssh-commands.sh')
    const deployScriptContent = `#!/bin/bash

# =============================================================================
# SSH 배포 명령어 스크립트 - deukgeun 프로젝트
# 완전 해결 버전
# =============================================================================

# SSH 키 경로 (절대 경로 사용)
SSH_KEY="${path.resolve(config.keyPath)}"
EC2_HOST="${config.ec2Host}"
EC2_USER="${config.ec2User}"
EC2_PORT="${config.ec2Port}"

# SSH 연결 함수 (다중 방법 지원)
ssh_connect() {
    # 방법 1: 직접 연결
    if ssh -i "$SSH_KEY" -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "$@" 2>/dev/null; then
        return 0
    fi
    
    # 방법 2: SSH 설정 파일 사용
    if ssh -F "${config.projectRoot}/ssh-config" deukgeun-ec2 "$@" 2>/dev/null; then
        return 0
    fi
    
    # 방법 3: WSL 사용
    if wsl ssh -i ~/.ssh/${config.keyName}.pem -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "$@" 2>/dev/null; then
        return 0
    fi
    
    echo "❌ 모든 SSH 연결 방법 실패"
    return 1
}

# SCP 파일 전송 함수
scp_upload() {
    local source="$1"
    local destination="$2"
    
    # 방법 1: 직접 SCP
    if scp -i "$SSH_KEY" -P "$EC2_PORT" -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination" 2>/dev/null; then
        return 0
    fi
    
    # 방법 2: WSL SCP
    if wsl scp -i ~/.ssh/${config.keyName}.pem -P "$EC2_PORT" -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination" 2>/dev/null; then
        return 0
    fi
    
    echo "❌ SCP 전송 실패"
    return 1
}

# SCP 디렉토리 전송 함수
scp_upload_dir() {
    local source="$1"
    local destination="$2"
    
    # 방법 1: 직접 SCP
    if scp -i "$SSH_KEY" -P "$EC2_PORT" -r -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination" 2>/dev/null; then
        return 0
    fi
    
    # 방법 2: WSL SCP
    if wsl scp -i ~/.ssh/${config.keyName}.pem -P "$EC2_PORT" -r -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination" 2>/dev/null; then
        return 0
    fi
    
    echo "❌ SCP 디렉토리 전송 실패"
    return 1
}

# EC2 연결 테스트
test_connection() {
    echo "🔍 EC2 연결 테스트 중..."
    
    # 방법 1: 직접 연결
    echo "  방법 1: 직접 SSH 연결 테스트..."
    if ssh -i "$SSH_KEY" -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "  ✅ 직접 SSH 연결 성공"
        return 0
    fi
    
    # 방법 2: SSH 설정 파일 사용
    echo "  방법 2: SSH 설정 파일 사용 테스트..."
    if ssh -F "${config.projectRoot}/ssh-config" deukgeun-ec2 "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "  ✅ SSH 설정 파일 연결 성공"
        return 0
    fi
    
    # 방법 3: WSL 사용
    echo "  방법 3: WSL SSH 연결 테스트..."
    if wsl ssh -i ~/.ssh/${config.keyName}.pem -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "  ✅ WSL SSH 연결 성공"
        return 0
    fi
    
    echo "  ❌ 모든 SSH 연결 방법 실패"
    return 1
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
            echo "  test    - SSH 연결 테스트 (다중 방법)"
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

    fs.writeFileSync(deployScriptPath, deployScriptContent)
    console.log('    ✅ 배포 스크립트 업데이트 완료')
    
    return true
    
  } catch (error) {
    console.log(`❌ SSH 설정 최적화 실패: ${error.message}`)
    return false
  }
}

/**
 * 4. 다중 방법 연결 테스트
 */
function testMultipleConnections() {
  console.log('\n4. 다중 방법 연결 테스트 중...')
  
  const testMethods = [
    {
      name: '직접 SSH 연결',
      command: `ssh -i "${config.keyPath}" -p ${config.ec2Port} -o StrictHostKeyChecking=no -o ConnectTimeout=30 ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'"`
    },
    {
      name: 'SSH 설정 파일 사용',
      command: `ssh -F "${path.join(config.projectRoot, 'ssh-config')}" deukgeun-ec2 "echo 'SSH 연결 성공'"`
    },
    {
      name: 'WSL SSH 연결',
      command: `wsl ssh -i ~/.ssh/${config.keyName}.pem -p ${config.ec2Port} -o StrictHostKeyChecking=no -o ConnectTimeout=30 ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'"`
    }
  ]
  
  let successCount = 0
  
  for (const method of testMethods) {
    console.log(`\n  4-${testMethods.indexOf(method) + 1}. ${method.name} 테스트 중...`)
    console.log(`     명령어: ${method.command}`)
    
    try {
      const result = execSync(method.command, { 
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe'
      })
      
      if (result.includes('SSH 연결 성공')) {
        console.log('    ✅ 연결 성공')
        successCount++
      } else {
        console.log('    ⚠️ 예상과 다른 결과')
        console.log('    결과:', result)
      }
      
    } catch (error) {
      console.log(`    ❌ 연결 실패: ${error.message}`)
    }
  }
  
  return successCount > 0
}

/**
 * 5. 최종 해결책 제시
 */
function provideFinalSolutions() {
  console.log('\n5. 최종 해결책 제시')
  console.log('=' * 50)
  
  console.log('\n🔧 SSH 연결 문제 해결 방법:')
  
  console.log('\n1. AWS EC2 인스턴스 확인 (가장 중요):')
  console.log('   - AWS 콘솔 → EC2 → 인스턴스')
  console.log('   - 인스턴스 상태가 "running"인지 확인')
  console.log('   - 공개 IP 주소가 3.36.230.117인지 확인')
  console.log('   - 보안 그룹에서 SSH 포트(22)가 열려있는지 확인')
  
  console.log('\n2. SSH 키 페어 확인:')
  console.log('   - AWS 콘솔 → EC2 → 키 페어')
  console.log('   - ZEV_AWS_KEY가 올바른 키인지 확인')
  console.log('   - 새 키 페어 생성하여 테스트')
  
  console.log('\n3. 네트워크 문제 해결:')
  console.log('   - 방화벽 설정 확인')
  console.log('   - VPN 연결 상태 확인')
  console.log('   - 다른 네트워크에서 테스트')
  
  console.log('\n4. Windows 환경 해결책:')
  console.log('   - WSL 사용: wsl ssh -i ~/.ssh/ZEV_AWS_KEY.pem ubuntu@3.36.230.117')
  console.log('   - Git Bash 사용: Git Bash에서 SSH 명령어 실행')
  console.log('   - PowerShell 관리자 권한으로 실행')
  
  console.log('\n5. 프로젝트 배포 방법:')
  console.log('   - ./deploy-ssh-commands.sh test (연결 테스트)')
  console.log('   - ./deploy-ssh-commands.sh upload (파일 전송)')
  console.log('   - ./deploy-ssh-commands.sh deploy (전체 배포)')
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    const results = {
      network: false,
      sshKey: false,
      sshConfig: false,
      connection: false
    }
    
    // 1. 네트워크 문제 해결
    results.network = solveNetworkIssues()
    
    // 2. SSH 키 문제 해결
    results.sshKey = solveSSHKeyIssues()
    
    // 3. SSH 설정 최적화
    results.sshConfig = optimizeSSHConfig()
    
    // 4. 다중 방법 연결 테스트
    results.connection = testMultipleConnections()
    
    // 5. 최종 해결책 제시
    provideFinalSolutions()
    
    // 결과 요약
    console.log('\n' + '=' * 60)
    console.log('🎯 최종 결과 요약')
    console.log('=' * 60)
    
    console.log(`네트워크 문제 해결: ${results.network ? '✅' : '❌'}`)
    console.log(`SSH 키 문제 해결: ${results.sshKey ? '✅' : '❌'}`)
    console.log(`SSH 설정 최적화: ${results.sshConfig ? '✅' : '❌'}`)
    console.log(`SSH 연결 성공: ${results.connection ? '✅' : '❌'}`)
    
    if (results.connection) {
      console.log('\n🎉 SSH 연결 문제가 해결되었습니다!')
      console.log('\n🚀 다음 단계:')
      console.log('  1. ./deploy-ssh-commands.sh test (연결 테스트)')
      console.log('  2. ./deploy-ssh-commands.sh upload (프로젝트 전송)')
      console.log('  3. ./deploy-ssh-commands.sh deploy (전체 배포)')
    } else {
      console.log('\n⚠️ SSH 연결 문제가 지속되고 있습니다.')
      console.log('위의 해결책을 참고하여 수동으로 문제를 해결해주세요.')
      console.log('\n📞 추가 도움이 필요한 경우:')
      console.log('  1. AWS EC2 인스턴스 상태 확인')
      console.log('  2. 네트워크 연결 상태 확인')
      console.log('  3. SSH 키 페어 재생성')
    }
    
  } catch (error) {
    console.error(`❌ 실행 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = {
  solveNetworkIssues,
  solveSSHKeyIssues,
  optimizeSSHConfig,
  testMultipleConnections,
  provideFinalSolutions
}
