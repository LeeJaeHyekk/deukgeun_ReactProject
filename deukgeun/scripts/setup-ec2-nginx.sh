#!/bin/bash

# ============================================================================
# EC2 Nginx 설정 스크립트
# ============================================================================

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Nginx 설치 및 설정
setup_nginx() {
    log_info "Nginx 설치 및 설정을 시작합니다..."
    
    # Nginx 설치
    log_info "Nginx 설치 중..."
    sudo apt update
    sudo apt install -y nginx
    
    # Nginx 서비스 시작
    log_info "Nginx 서비스 시작 중..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # 기본 Nginx 설정 백업
    log_info "기본 Nginx 설정 백업 중..."
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    
    # 프로젝트 Nginx 설정 복사
    log_info "프로젝트 Nginx 설정 적용 중..."
    if [ -f "nginx.conf" ]; then
        sudo cp nginx.conf /etc/nginx/nginx.conf
        log_success "Nginx 설정이 적용되었습니다"
    else
        log_warning "nginx.conf 파일을 찾을 수 없습니다. 기본 설정을 사용합니다"
    fi
    
    # Nginx 설정 테스트
    log_info "Nginx 설정 테스트 중..."
    if sudo nginx -t; then
        log_success "Nginx 설정이 유효합니다"
    else
        log_error "Nginx 설정에 오류가 있습니다"
        exit 1
    fi
    
    # Nginx 재시작
    log_info "Nginx 재시작 중..."
    sudo systemctl restart nginx
    
    log_success "Nginx 설정이 완료되었습니다!"
}

# 프론트엔드 파일 복사
setup_frontend() {
    log_info "프론트엔드 파일 설정 중..."
    
    # Nginx 웹 루트 디렉토리 생성
    sudo mkdir -p /usr/share/nginx/html
    
    # 프론트엔드 빌드 파일이 있는지 확인
    if [ -d "dist/frontend" ]; then
        log_info "프론트엔드 빌드 파일을 Nginx 웹 루트로 복사 중..."
        sudo cp -r dist/frontend/* /usr/share/nginx/html/
        sudo chown -R www-data:www-data /usr/share/nginx/html
        sudo chmod -R 755 /usr/share/nginx/html
        log_success "프론트엔드 파일이 복사되었습니다"
    else
        log_warning "dist/frontend 디렉토리를 찾을 수 없습니다"
        log_info "빌드를 먼저 실행해주세요: npm run build:full:production:optimized"
    fi
}

# 방화벽 설정
setup_firewall() {
    log_info "방화벽 설정 중..."
    
    # UFW 활성화
    sudo ufw --force enable
    
    # 필요한 포트 열기
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 5000/tcp  # Backend API
    
    log_success "방화벽 설정이 완료되었습니다!"
}

# 메인 실행 함수
main() {
    log_info "EC2 Nginx 설정을 시작합니다..."
    
    # 프로젝트 루트로 이동
    cd "$(dirname "$0")/.."
    
    # Nginx 설정
    setup_nginx
    
    # 프론트엔드 설정
    setup_frontend
    
    # 방화벽 설정
    setup_firewall
    
    # 외부 IP 확인
    EXTERNAL_IP=$(curl -s ifconfig.me)
    
    log_success "EC2 Nginx 설정이 완료되었습니다!"
    echo ""
    log_info "=== 서비스 정보 ==="
    log_info "웹사이트: http://$EXTERNAL_IP"
    log_info "백엔드 API: http://$EXTERNAL_IP:5000"
    log_info "Nginx 상태: sudo systemctl status nginx"
    echo ""
    log_info "=== 유용한 명령어들 ==="
    log_info "Nginx 상태: sudo systemctl status nginx"
    log_info "Nginx 재시작: sudo systemctl restart nginx"
    log_info "Nginx 로그: sudo tail -f /var/log/nginx/access.log"
    log_info "Nginx 에러 로그: sudo tail -f /var/log/nginx/error.log"
    log_info "방화벽 상태: sudo ufw status"
}

# 스크립트 실행
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "EC2 Nginx 설정 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0                 # Nginx 설정 실행"
    echo "  $0 --help          # 도움말 표시"
    echo ""
    echo "기능:"
    echo "  - Nginx 설치 및 설정"
    echo "  - 프론트엔드 파일 복사"
    echo "  - 방화벽 설정"
    echo ""
    echo "요구사항:"
    echo "  - Ubuntu/Debian 시스템"
    echo "  - sudo 권한"
    echo "  - 프론트엔드 빌드 완료 (dist/frontend 디렉토리)"
else
    main "$@"
fi
