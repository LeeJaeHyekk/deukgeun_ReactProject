#!/bin/bash

# ============================================================================
# Deukgeun EC2 배포 스크립트 (프로덕션용)
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

# 함수: 시스템 업데이트
update_system() {
    log_info "시스템 업데이트 중..."
    
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get upgrade -y
    elif command -v yum &> /dev/null; then
        sudo yum update -y
    else
        log_warning "패키지 매니저를 찾을 수 없습니다. 시스템 업데이트를 건너뜁니다."
    fi
    
    log_success "시스템 업데이트가 완료되었습니다."
}

# 함수: Node.js 설치 확인
check_nodejs() {
    log_info "Node.js 설치 확인 중..."
    
    if ! command -v node &> /dev/null; then
        log_info "Node.js를 설치합니다..."
        
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        else
            log_error "지원되지 않는 운영체제입니다."
            exit 1
        fi
    fi
    
    # Node.js 버전 확인
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18 이상이 필요합니다. 현재 버전: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version)이 설치되어 있습니다."
}

# 함수: 방화벽 설정
setup_firewall() {
    log_info "방화벽 설정 중..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu UFW
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 3000/tcp  # Frontend
        sudo ufw allow 5000/tcp  # Backend
        sudo ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL firewalld
        sudo firewall-cmd --permanent --add-port=22/tcp
        sudo firewall-cmd --permanent --add-port=3000/tcp
        sudo firewall-cmd --permanent --add-port=5000/tcp
        sudo firewall-cmd --reload
    else
        log_warning "방화벽 설정을 건너뜁니다."
    fi
    
    log_success "방화벽 설정이 완료되었습니다."
}

# 함수: PM2 부팅시 자동시작 설정
setup_pm2_startup() {
    log_info "PM2 부팅시 자동시작 설정 중..."
    
    # PM2 startup 스크립트 생성
    pm2 startup
    
    # 현재 PM2 프로세스 저장
    pm2 save
    
    log_success "PM2 자동시작 설정이 완료되었습니다."
}

# 함수: Nginx 설정 (선택사항)
setup_nginx() {
    if [ "$1" = "--nginx" ]; then
        log_info "Nginx 설정 중..."
        
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y nginx
        elif command -v yum &> /dev/null; then
            sudo yum install -y nginx
        fi
        
        # Nginx 설정 파일 생성
        sudo tee /etc/nginx/sites-available/deukgeun > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Nginx 사이트 활성화
        sudo ln -sf /etc/nginx/sites-available/deukgeun /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Nginx 설정 테스트 및 재시작
        sudo nginx -t
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        
        log_success "Nginx 설정이 완료되었습니다."
    fi
}

# 메인 실행 함수
main() {
    log_info "Deukgeun EC2 배포를 시작합니다..."
    
    # 시스템 업데이트
    update_system
    
    # Node.js 설치 확인
    check_nodejs
    
    # 방화벽 설정
    setup_firewall
    
    # 프로젝트 의존성 설치
    log_info "프로젝트 의존성 설치 중..."
    npm install
    
    # 백엔드 의존성 설치
    if [ -d "src/backend" ]; then
        cd src/backend && npm install && cd ../..
    fi
    
    # 프로덕션 빌드 (최적화된 빌드 사용)
    log_info "프로덕션 빌드 중 (최적화된 빌드 사용)..."
    export NODE_ENV=production
    npm run build:full:production:optimized
    
    # 빌드 검증
    log_info "빌드 결과 검증 중..."
    
    # 백엔드 빌드 검증
    if [ ! -f "dist/backend/index.cjs" ]; then
        log_error "백엔드 빌드 파일이 없습니다: dist/backend/index.cjs"
        exit 1
    fi
    
    if [ ! -f "dist/backend/routes/index.cjs" ]; then
        log_error "라우트 파일이 없습니다: dist/backend/routes/index.cjs"
        exit 1
    fi
    
    if [ ! -d "dist/backend/node_modules" ]; then
        log_error "백엔드 의존성이 없습니다: dist/backend/node_modules"
        exit 1
    fi
    
    # 프론트엔드 빌드 검증
    if [ ! -d "dist/frontend" ]; then
        log_error "프론트엔드 빌드 디렉토리가 없습니다: dist/frontend"
        exit 1
    fi
    
    if [ ! -f "dist/frontend/index.html" ]; then
        log_error "프론트엔드 index.html이 없습니다: dist/frontend/index.html"
        exit 1
    fi
    
    if [ ! -d "dist/frontend/assets" ]; then
        log_error "프론트엔드 assets 디렉토리가 없습니다: dist/frontend/assets"
        exit 1
    fi
    
    log_success "빌드 검증 완료"
    
    # 기존 PM2 프로세스 정리
    log_info "기존 PM2 프로세스 정리 중..."
    pm2 delete all 2>/dev/null || true
    
    # PM2로 서비스 시작
    log_info "PM2로 서비스 시작 중..."
    pm2 start ecosystem.config.js --env production
    
    # PM2 부팅시 자동시작 설정
    setup_pm2_startup
    
    # Nginx 설정 (선택사항)
    setup_nginx "$1"
    
    # 서비스 상태 확인
    log_info "서비스 상태 확인 중..."
    pm2 status
    
    log_success "EC2 배포가 완료되었습니다!"
    echo ""
    log_info "=== 서비스 정보 ==="
    log_info "프론트엔드: http://$(curl -s ifconfig.me):3000"
    log_info "백엔드 API: http://$(curl -s ifconfig.me):5000"
    if [ "$1" = "--nginx" ]; then
        log_info "Nginx 프록시: http://$(curl -s ifconfig.me)"
    fi
    echo ""
    log_info "=== 유용한 명령어들 ==="
    log_info "PM2 상태: pm2 status"
    log_info "PM2 로그: pm2 logs"
    log_info "서비스 재시작: pm2 restart all"
    log_info "서비스 중지: pm2 stop all"
    echo ""
    log_info "=== 보안 설정 ==="
    log_info "SSH 키 설정을 권장합니다."
    log_info "데이터베이스 보안 그룹을 확인하세요."
    log_info "환경 변수 파일(.env)을 안전하게 설정하세요."
}

# 스크립트 실행
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Deukgeun EC2 배포 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0                 # 기본 배포"
    echo "  $0 --nginx         # Nginx 프록시와 함께 배포"
    echo "  $0 --help          # 도움말 표시"
    echo ""
    echo "기능:"
    echo "  - 시스템 업데이트"
    echo "  - Node.js 설치/확인"
    echo "  - 방화벽 설정"
    echo "  - 최적화된 프로덕션 빌드 (build-optimized.cjs 사용)"
    echo "  - PM2 서비스 시작"
    echo "  - 부팅시 자동시작 설정"
    echo "  - Nginx 프록시 설정 (선택사항)"
    echo ""
    echo "요구사항:"
    echo "  - Ubuntu 20.04+ 또는 CentOS 7+"
    echo "  - sudo 권한"
    echo "  - 인터넷 연결"
else
    main "$@"
fi