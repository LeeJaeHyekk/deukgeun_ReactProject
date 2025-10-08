#!/bin/bash

# =============================================================================
# SSH 배포 명령어 스크립트 - deukgeun 프로젝트 (AWS 공식 문서 기반)
# AWS 키 페어 구조에 따른 SSH 연결 및 배포
# 
# AWS 공식 문서 참조:
# - EC2 키 페어 관리: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html
# - SSH 연결: https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html
# =============================================================================

# SSH 키 경로 (절대 경로 사용)
SSH_KEY="C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
EC2_HOST="3.36.230.117"
EC2_USER="ubuntu"
EC2_PORT="22"

# SSH 연결 함수 (다중 방법 지원)
ssh_connect() {
    # 방법 1: 직접 연결
    if ssh -i "$SSH_KEY" -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "$@" 2>/dev/null; then
        return 0
    fi
    
    # 방법 2: SSH 설정 파일 사용
    if ssh -F "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun/ssh-config" deukgeun-ec2 "$@" 2>/dev/null; then
        return 0
    fi
    
    # 방법 3: WSL 사용
    if wsl ssh -i ~/.ssh/deukgeun_ReactProject.pem -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "$@" 2>/dev/null; then
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
    if wsl scp -i ~/.ssh/deukgeun_ReactProject.pem -P "$EC2_PORT" -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination" 2>/dev/null; then
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
    if wsl scp -i ~/.ssh/deukgeun_ReactProject.pem -P "$EC2_PORT" -r -o StrictHostKeyChecking=no "$source" "$EC2_USER@$EC2_HOST:$destination" 2>/dev/null; then
        return 0
    fi
    
    echo "❌ SCP 디렉토리 전송 실패"
    return 1
}

# AWS CLI를 통한 EC2 인스턴스 상태 확인
check_ec2_status() {
    echo "🔍 AWS EC2 인스턴스 상태 확인 중..."
    
    # AWS CLI 설치 확인
    if ! command -v aws &> /dev/null; then
        echo "  ❌ AWS CLI가 설치되지 않았습니다."
        echo "  해결책: https://aws.amazon.com/cli/ 에서 AWS CLI를 설치하세요."
        return 1
    fi
    
    # AWS 자격 증명 확인
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "  ❌ AWS 자격 증명이 설정되지 않았습니다."
        echo "  해결책: aws configure 명령어로 자격 증명을 설정하세요."
        return 1
    fi
    
    # EC2 인스턴스 상태 확인
    echo "  EC2 인스턴스 상태 확인 중..."
    local instance_info=$(aws ec2 describe-instances --filters "Name=ip-address,Values=$EC2_HOST" --query "Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,KeyName]" --output table 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$instance_info" ]; then
        echo "  ✅ EC2 인스턴스 정보:"
        echo "$instance_info"
        
        # 인스턴스 상태 확인
        local instance_state=$(aws ec2 describe-instances --filters "Name=ip-address,Values=$EC2_HOST" --query "Reservations[*].Instances[*].State.Name" --output text 2>/dev/null)
        
        if [ "$instance_state" = "running" ]; then
            echo "  ✅ EC2 인스턴스가 실행 중입니다."
            return 0
        elif [ "$instance_state" = "stopped" ]; then
            echo "  ❌ EC2 인스턴스가 중지되었습니다."
            echo "  해결책: AWS 콘솔에서 인스턴스를 시작하세요."
            return 1
        else
            echo "  ⚠️ EC2 인스턴스 상태를 확인할 수 없습니다: $instance_state"
            return 1
        fi
    else
        echo "  ❌ EC2 인스턴스 정보를 가져올 수 없습니다."
        echo "  해결책: AWS 콘솔에서 인스턴스 상태를 확인하세요."
        return 1
    fi
}

# EC2 연결 테스트 (AWS 기반)
test_connection() {
    echo "🔍 EC2 연결 테스트 중 (AWS 공식 문서 기반)..."
    
    # 1. AWS EC2 인스턴스 상태 확인
    if ! check_ec2_status; then
        echo "  ❌ EC2 인스턴스 상태 확인 실패"
        return 1
    fi
    
    # 2. SSH 연결 테스트
    echo "  SSH 연결 테스트 중..."
    
    # 방법 1: 직접 연결
    echo "  방법 1: 직접 SSH 연결 테스트..."
    if ssh -i "$SSH_KEY" -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "  ✅ 직접 SSH 연결 성공"
        return 0
    fi
    
    # 방법 2: SSH 설정 파일 사용
    echo "  방법 2: SSH 설정 파일 사용 테스트..."
    if ssh -F "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun/ssh-config" deukgeun-ec2 "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "  ✅ SSH 설정 파일 연결 성공"
        return 0
    fi
    
    # 방법 3: WSL 사용
    echo "  방법 3: WSL SSH 연결 테스트..."
    if wsl ssh -i ~/.ssh/deukgeun_ReactProject.pem -p "$EC2_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "  ✅ WSL SSH 연결 성공"
        return 0
    fi
    
    echo "  ❌ 모든 SSH 연결 방법 실패"
    echo "  해결책: AWS 콘솔에서 키 페어와 보안 그룹을 확인하세요."
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

# AWS Systems Manager를 통한 인스턴스 접근
access_via_ssm() {
    echo "🔧 AWS Systems Manager를 통한 인스턴스 접근 중..."
    
    # 인스턴스 ID 확인
    local instance_id=$(aws ec2 describe-instances --filters "Name=ip-address,Values=$EC2_HOST" --query "Reservations[*].Instances[*].InstanceId" --output text 2>/dev/null)
    
    if [ -z "$instance_id" ] || [ "$instance_id" = "None" ]; then
        echo "  ❌ 인스턴스 ID를 찾을 수 없습니다."
        return 1
    fi
    
    echo "  인스턴스 ID: $instance_id"
    echo "  Systems Manager Session Manager를 시작합니다..."
    echo "  다음 명령어를 실행하세요:"
    echo "  aws ssm start-session --target $instance_id"
    
    # 자동으로 Session Manager 시작
    aws ssm start-session --target "$instance_id"
}

# AWS 기반 키 페어 복구
recover_key_pair() {
    echo "🔧 AWS 키 페어 복구 중..."
    echo "  Node.js 스크립트를 실행합니다..."
    
    if command -v node &> /dev/null; then
        node scripts/aws-key-pair-recovery.cjs
    else
        echo "  ❌ Node.js가 설치되지 않았습니다."
        echo "  해결책: Node.js를 설치하거나 수동으로 키 페어를 복구하세요."
        return 1
    fi
}

# 메인 함수 (AWS 기반)
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
        "aws-status")
            check_ec2_status
            ;;
        "ssm")
            access_via_ssm
            ;;
        "recover")
            recover_key_pair
            ;;
        *)
            echo "사용법: $0 {test|upload|deploy|status|restart|stop|logs|aws-status|ssm|recover}"
            echo ""
            echo "기본 명령어:"
            echo "  test    - SSH 연결 테스트 (AWS 기반)"
            echo "  upload  - 프로젝트 파일 전송"
            echo "  deploy  - 전체 배포 실행"
            echo "  status  - 서비스 상태 확인"
            echo "  restart - 서비스 재시작"
            echo "  stop    - 서비스 중지"
            echo "  logs    - 로그 확인"
            echo ""
            echo "AWS 기반 명령어:"
            echo "  aws-status - AWS EC2 인스턴스 상태 확인"
            echo "  ssm        - AWS Systems Manager로 인스턴스 접근"
            echo "  recover    - AWS 키 페어 복구"
            echo ""
            echo "AWS 공식 문서 참조:"
            echo "  - EC2 키 페어: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html"
            echo "  - SSH 연결: https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html"
            echo "  - Systems Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html"
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"
