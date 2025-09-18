#!/bin/bash

# ============================================================================
# EC2 MySQL 데이터베이스 설정 스크립트
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

# MySQL 설치 및 설정
setup_mysql() {
    log_info "MySQL 설치 및 설정을 시작합니다..."
    
    # MySQL 설치
    log_info "MySQL 서버 설치 중..."
    if ! sudo apt update; then
        log_error "패키지 목록 업데이트 실패"
        exit 1
    fi
    
    if ! sudo apt install -y mysql-server; then
        log_error "MySQL 설치 실패"
        exit 1
    fi
    
    # MySQL 서비스 시작
    log_info "MySQL 서비스 시작 중..."
    if ! sudo systemctl start mysql; then
        log_error "MySQL 서비스 시작 실패"
        exit 1
    fi
    
    if ! sudo systemctl enable mysql; then
        log_warning "MySQL 자동 시작 설정 실패 (수동으로 계속 진행)"
    fi
    
    # MySQL 서비스 상태 확인
    if ! sudo systemctl is-active --quiet mysql; then
        log_error "MySQL 서비스가 실행되지 않음"
        exit 1
    fi
    
    log_success "MySQL 서비스가 정상적으로 시작되었습니다"
    
    # MySQL 보안 설정 (수동으로 처리)
    log_info "MySQL 보안 설정을 시작합니다..."
    log_warning "MySQL 보안 설정을 수동으로 진행해주세요:"
    log_info "1. sudo mysql_secure_installation 실행"
    log_info "2. root 비밀번호를 'Deukgeun6204!@StrongPassword2024'로 설정"
    log_info "3. 모든 보안 질문에 'Y'로 답변"
    
    # 잠시 대기
    sleep 3
    
    # 데이터베이스 및 사용자 생성
    log_info "데이터베이스 및 사용자 생성 중..."
    
    # root 사용자로 데이터베이스 생성 (env.ec2와 일치)
    if sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS deukgeun_production_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"; then
        log_success "데이터베이스 'deukgeun_production_db' 생성 완료"
    else
        log_error "데이터베이스 생성 실패"
        exit 1
    fi
    
    # 추가 사용자 생성 (선택사항)
    if sudo mysql -u root -e "CREATE USER IF NOT EXISTS 'deukgeun_user'@'localhost' IDENTIFIED BY 'Deukgeun6204!@StrongPassword2024'; GRANT ALL PRIVILEGES ON deukgeun_production_db.* TO 'deukgeun_user'@'localhost'; FLUSH PRIVILEGES;"; then
        log_success "추가 사용자 'deukgeun_user' 생성 완료"
    else
        log_warning "추가 사용자 생성 실패 (root 사용자로 계속 진행)"
    fi
    
    # 데이터베이스 연결 테스트
    log_info "데이터베이스 연결 테스트 중..."
    if sudo mysql -u root -e "USE deukgeun_production_db; SELECT 1;" > /dev/null 2>&1; then
        log_success "데이터베이스 연결 테스트 성공"
    else
        log_error "데이터베이스 연결 테스트 실패"
        exit 1
    fi
    
    log_success "MySQL 설정이 완료되었습니다!"
}

# 방화벽 설정
setup_firewall() {
    log_info "방화벽 설정 중..."
    
    # UFW 상태 확인
    if ! command -v ufw &> /dev/null; then
        log_info "UFW 설치 중..."
        sudo apt install -y ufw
    fi
    
    # UFW 활성화
    if ! sudo ufw --force enable; then
        log_error "방화벽 활성화 실패"
        exit 1
    fi
    
    # 필요한 포트 열기
    log_info "필요한 포트를 열고 있습니다..."
    
    # SSH 포트 (기본 22번)
    if sudo ufw allow 22/tcp; then
        log_success "SSH 포트 (22) 열기 완료"
    else
        log_warning "SSH 포트 열기 실패"
    fi
    
    # HTTP 포트
    if sudo ufw allow 80/tcp; then
        log_success "HTTP 포트 (80) 열기 완료"
    else
        log_warning "HTTP 포트 열기 실패"
    fi
    
    # HTTPS 포트
    if sudo ufw allow 443/tcp; then
        log_success "HTTPS 포트 (443) 열기 완료"
    else
        log_warning "HTTPS 포트 열기 실패"
    fi
    
    # 백엔드 API 포트
    if sudo ufw allow 5000/tcp; then
        log_success "백엔드 API 포트 (5000) 열기 완료"
    else
        log_warning "백엔드 API 포트 열기 실패"
    fi
    
    # 프론트엔드 개발 포트 (선택사항)
    if sudo ufw allow 3000/tcp; then
        log_success "프론트엔드 개발 포트 (3000) 열기 완료"
    else
        log_warning "프론트엔드 개발 포트 열기 실패"
    fi
    
    # 방화벽 상태 확인
    log_info "방화벽 상태 확인 중..."
    sudo ufw status
    
    log_success "방화벽 설정이 완료되었습니다!"
}

# 시스템 요구사항 확인
check_requirements() {
    log_info "시스템 요구사항을 확인합니다..."
    
    # Ubuntu/Debian 확인
    if ! command -v apt &> /dev/null; then
        log_error "이 스크립트는 Ubuntu/Debian 시스템에서만 실행 가능합니다"
        exit 1
    fi
    
    # sudo 권한 확인
    if ! sudo -n true 2>/dev/null; then
        log_error "sudo 권한이 필요합니다"
        exit 1
    fi
    
    # 인터넷 연결 확인
    if ! ping -c 1 google.com &> /dev/null; then
        log_warning "인터넷 연결을 확인할 수 없습니다. 계속 진행합니다..."
    fi
    
    log_success "시스템 요구사항 확인 완료"
}

# 메인 실행 함수
main() {
    log_info "EC2 데이터베이스 설정을 시작합니다..."
    
    # 시스템 요구사항 확인
    check_requirements
    
    # MySQL 설정
    setup_mysql
    
    # 방화벽 설정
    setup_firewall
    
    # 외부 IP 확인
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "확인 불가")
    
    log_success "EC2 데이터베이스 설정이 완료되었습니다!"
    echo ""
    log_info "=== 데이터베이스 정보 ==="
    log_info "호스트: localhost"
    log_info "포트: 3306"
    log_info "데이터베이스: deukgeun_production_db"
    log_info "사용자: root (기본)"
    log_info "비밀번호: Deukgeun6204!@StrongPassword2024"
    log_info "추가 사용자: deukgeun_user (선택사항)"
    echo ""
    log_info "=== 서비스 정보 ==="
    log_info "외부 IP: $EXTERNAL_IP"
    log_info "웹사이트: http://$EXTERNAL_IP"
    log_info "백엔드 API: http://$EXTERNAL_IP:5000"
    echo ""
    log_info "=== 다음 단계 ==="
    log_info "1. MySQL 보안 설정: sudo mysql_secure_installation"
    log_info "2. 애플리케이션 배포: ./scripts/deploy-ec2-simple.sh"
    log_info "3. 서비스 상태 확인: pm2 status"
    log_info "4. 백엔드 테스트: curl http://$EXTERNAL_IP:5000/health"
    echo ""
    log_info "=== 유용한 명령어들 ==="
    log_info "MySQL 상태: sudo systemctl status mysql"
    log_info "MySQL 연결: sudo mysql -u root -p"
    log_info "방화벽 상태: sudo ufw status"
    log_info "포트 확인: ss -tlnp | grep :3306"
}

# 스크립트 실행
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "EC2 MySQL 데이터베이스 설정 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0                 # 데이터베이스 설정 실행"
    echo "  $0 --help          # 도움말 표시"
    echo ""
    echo "기능:"
    echo "  - MySQL 서버 설치"
    echo "  - 데이터베이스 및 사용자 생성"
    echo "  - 방화벽 설정"
    echo ""
    echo "요구사항:"
    echo "  - Ubuntu/Debian 시스템"
    echo "  - sudo 권한"
else
    main "$@"
fi
