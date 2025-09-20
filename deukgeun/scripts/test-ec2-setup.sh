#!/bin/bash

# ============================================================================
# EC2 환경 테스트 스크립트
# ============================================================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} ❌ $1"
}

# 프로젝트 루트로 이동
script_dir="$(dirname "$0")"
project_root="$(cd "$script_dir/.." && pwd)"
cd "$project_root"

log_info "프로젝트 루트: $project_root"
log_info "현재 디렉토리: $(pwd)"

# 1. 필수 파일 존재 확인
log_info "=== 필수 파일 확인 ==="
required_files=(
    "ecosystem.config.js"
    "package.json"
    "env.production"
    "nginx.conf"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file 파일 존재"
    else
        log_error "$file 파일이 없습니다"
        exit 1
    fi
done

# 2. Node.js 및 npm 확인
log_info "=== Node.js 환경 확인 ==="
if command -v node &> /dev/null; then
    log_success "Node.js 버전: $(node --version)"
else
    log_error "Node.js가 설치되지 않았습니다"
    exit 1
fi

if command -v npm &> /dev/null; then
    log_success "npm 버전: $(npm --version)"
else
    log_error "npm이 설치되지 않았습니다"
    exit 1
fi

# 3. PM2 확인
log_info "=== PM2 확인 ==="
if command -v pm2 &> /dev/null; then
    log_success "PM2 버전: $(pm2 --version)"
else
    log_error "PM2가 설치되지 않았습니다"
    log_info "PM2 설치: npm install -g pm2"
    exit 1
fi

# 4. MySQL 확인
log_info "=== MySQL 확인 ==="
if command -v mysql &> /dev/null; then
    log_success "MySQL 클라이언트 설치됨"
else
    log_error "MySQL 클라이언트가 설치되지 않았습니다"
    log_info "MySQL 설치: sudo apt-get install mysql-client"
fi

# 5. Nginx 확인
log_info "=== Nginx 확인 ==="
if command -v nginx &> /dev/null; then
    log_success "Nginx 설치됨"
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log_success "Nginx가 실행 중입니다"
    else
        log_warning "Nginx가 실행되지 않고 있습니다"
    fi
else
    log_warning "Nginx가 설치되지 않았습니다"
fi

# 6. 디스크 공간 확인
log_info "=== 디스크 공간 확인 ==="
available_space=$(df . | tail -1 | awk '{print $4}')
available_space_gb=$(($available_space / 1024 / 1024))
log_info "사용 가능한 디스크 공간: ${available_space_gb}GB"

if [ "$available_space" -lt 2097152 ]; then  # 2GB 미만
    log_error "디스크 공간이 부족합니다 (최소 2GB 필요)"
    exit 1
fi

# 7. 메모리 확인
log_info "=== 메모리 확인 ==="
total_mem=$(free -m | awk 'NR==2{print $2}')
available_mem=$(free -m | awk 'NR==2{print $7}')
log_info "총 메모리: ${total_mem}MB"
log_info "사용 가능 메모리: ${available_mem}MB"

if [ "$total_mem" -lt 1024 ]; then  # 1GB 미만
    log_warning "메모리가 부족할 수 있습니다 (최소 1GB 권장)"
fi

# 8. 네트워크 연결 확인
log_info "=== 네트워크 연결 확인 ==="
if ping -c 1 8.8.8.8 &> /dev/null; then
    log_success "인터넷 연결 정상"
else
    log_error "인터넷 연결에 문제가 있습니다"
fi

# 9. 포트 사용 상태 확인
log_info "=== 포트 사용 상태 확인 ==="
ports=(3000 5000 80 443)
for port in "${ports[@]}"; do
    if ss -tlnp | grep -q ":$port "; then
        log_warning "포트 $port이 이미 사용 중입니다"
    else
        log_success "포트 $port 사용 가능"
    fi
done

# 10. 환경 변수 파일 확인
log_info "=== 환경 변수 파일 확인 ==="
if [ -f ".env" ]; then
    log_success ".env 파일 존재"
    # 파일 권한 확인
    file_perms=$(stat -c "%a" .env 2>/dev/null || echo "unknown")
    if [ "$file_perms" = "600" ]; then
        log_success ".env 파일 권한 적절 (600)"
    else
        log_warning ".env 파일 권한이 너무 관대합니다 ($file_perms)"
        log_info "권한 수정: chmod 600 .env"
    fi
else
    log_warning ".env 파일이 없습니다"
    if [ -f "env.production" ]; then
        log_info "env.production 파일을 .env로 복사합니다"
        cp env.production .env
        chmod 600 .env
        log_success ".env 파일 생성 완료"
    fi
fi

# 11. PM2 설정 파일 문법 확인
log_info "=== PM2 설정 파일 확인 ==="
if node -c ecosystem.config.js 2>/dev/null; then
    log_success "ecosystem.config.js 문법 검사 통과"
else
    log_error "ecosystem.config.js 문법 오류"
    exit 1
fi

# 12. 빌드 디렉토리 확인
log_info "=== 빌드 디렉토리 확인 ==="
if [ -d "dist" ]; then
    log_success "dist 디렉토리 존재"
    if [ -f "dist/backend/index.cjs" ]; then
        log_success "백엔드 빌드 파일 존재"
    else
        log_warning "백엔드 빌드 파일이 없습니다"
    fi
    if [ -d "dist/frontend" ]; then
        log_success "프론트엔드 빌드 디렉토리 존재"
    else
        log_warning "프론트엔드 빌드 디렉토리가 없습니다"
    fi
else
    log_warning "dist 디렉토리가 없습니다 (빌드 필요)"
fi

# 13. 로그 디렉토리 확인
log_info "=== 로그 디렉토리 확인 ==="
if [ -d "logs" ]; then
    log_success "logs 디렉토리 존재"
else
    log_info "logs 디렉토리 생성"
    mkdir -p logs
    log_success "logs 디렉토리 생성 완료"
fi

# 14. 백업 디렉토리 확인
log_info "=== 백업 디렉토리 확인 ==="
if [ -d "backups" ]; then
    log_success "backups 디렉토리 존재"
else
    log_info "backups 디렉토리 생성"
    mkdir -p backups
    log_success "backups 디렉토리 생성 완료"
fi

# 15. PM2 프로세스 상태 확인
log_info "=== PM2 프로세스 상태 확인 ==="
if pm2 list | grep -q "online"; then
    log_warning "PM2 프로세스가 이미 실행 중입니다"
    pm2 status
else
    log_success "PM2 프로세스가 실행되지 않고 있습니다 (정상)"
fi

# 16. EC2 메타데이터 확인
log_info "=== EC2 메타데이터 확인 ==="
if command -v curl &> /dev/null; then
    instance_id=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "로컬 환경")
    instance_type=$(curl -s http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo "알 수 없음")
    log_info "인스턴스 ID: $instance_id"
    log_info "인스턴스 타입: $instance_type"
    
    if [ "$instance_id" != "로컬 환경" ]; then
        log_success "EC2 환경에서 실행 중입니다"
    else
        log_info "로컬 환경에서 실행 중입니다"
    fi
else
    log_warning "curl이 없어 EC2 메타데이터를 확인할 수 없습니다"
fi

# 17. 방화벽 상태 확인
log_info "=== 방화벽 상태 확인 ==="
if command -v ufw &> /dev/null; then
    ufw_status=$(sudo ufw status 2>/dev/null | head -1)
    log_info "UFW 방화벽 상태: $ufw_status"
    
    if echo "$ufw_status" | grep -q "active"; then
        log_info "UFW 방화벽이 활성화되어 있습니다"
        # 필요한 포트 확인
        required_ports=(22 80 443 3000 5000)
        for port in "${required_ports[@]}"; do
            if sudo ufw status | grep -q "$port"; then
                log_success "포트 $port이 UFW에서 허용되어 있습니다"
            else
                log_warning "포트 $port이 UFW에서 허용되지 않았습니다"
            fi
        done
    else
        log_warning "UFW 방화벽이 비활성화되어 있습니다"
    fi
else
    log_info "UFW가 설치되지 않았습니다"
fi

# 테스트 완료
echo ""
log_success "EC2 환경 테스트가 완료되었습니다!"
echo ""
log_info "=== 다음 단계 ==="
log_info "1. 빌드가 필요한 경우: npm run build:full:production:optimized"
log_info "2. 배포 실행: npm run deploy:ec2:simple"
log_info "3. PM2 상태 확인: pm2 status"
log_info "4. 로그 확인: pm2 logs"
echo ""
log_info "=== 문제 해결 ==="
log_info "• PM2 관련 문제: pm2 kill && pm2 start ./ecosystem.config.js --env production"
log_info "• 포트 충돌: ss -tlnp | grep -E ':(3000|5000)'"
log_info "• 메모리 부족: free -h"
log_info "• 디스크 공간: df -h"
echo ""
