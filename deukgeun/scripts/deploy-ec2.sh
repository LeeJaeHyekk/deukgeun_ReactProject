#!/bin/bash

# ============================================================================
# Deukgeun AWS EC2 배포 스크립트
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

# 환경 변수 로드
if [ -f ".env.production" ]; then
    log_info "프로덕션 환경 변수 로드 중..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    log_error ".env.production 파일을 찾을 수 없습니다."
    log_info "샘플 환경 변수 파일을 생성합니다..."
    cat > .env.production << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=deukgeun_user
DB_PASSWORD=your_secure_password_here
DB_NAME=deukgeun_production
DB_ROOT_PASSWORD=your_root_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_production
JWT_ACCESS_SECRET=your_access_secret_here_production
JWT_REFRESH_SECRET=your_refresh_secret_here_production

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_PORT=80
EOF
    log_warning ".env.production 파일을 생성했습니다. 환경 변수를 설정한 후 다시 실행하세요."
    exit 1
fi

# 전역 변수
PROJECT_NAME="deukgeun"
VERSION=$(git rev-parse --short HEAD)

# 함수: 의존성 확인
check_dependencies() {
    log_info "의존성 확인 중..."
    
    # Node.js 확인
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다."
        exit 1
    fi
    
    # npm 확인
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다."
        exit 1
    fi
    
    # PM2 확인
    if ! command -v pm2 &> /dev/null; then
        log_info "PM2 설치 중..."
        npm install -g pm2
    fi
    
    # serve 확인 (프론트엔드 정적 파일 서빙용)
    if ! command -v serve &> /dev/null; then
        log_info "serve 설치 중..."
        npm install -g serve
    fi
    
    log_success "모든 의존성이 확인되었습니다."
}

# 함수: 빌드
build_project() {
    log_info "프로젝트 빌드 중..."
    
    # 의존성 설치
    log_info "의존성 설치 중..."
    npm install
    
    # 환경 변수 설정
    log_info "환경 변수 설정 중..."
    npm run setup:env:deploy
    
    # 백엔드 빌드
    log_info "백엔드 빌드 중..."
    npm run build:backend:production
    
    # 프론트엔드 빌드
    log_info "프론트엔드 빌드 중..."
    npm run build:production
    
    log_success "프로젝트 빌드가 완료되었습니다."
}

# 함수: PM2로 서비스 시작
start_services() {
    log_info "PM2로 서비스 시작 중..."
    
    # 기존 서비스 중지
    pm2 delete all 2>/dev/null || true
    
    # 백엔드 서비스 시작
    log_info "백엔드 서비스 시작 중..."
    pm2 start ecosystem.config.js --env production
    
    # 서비스 상태 확인
    pm2 status
    
    log_success "서비스가 시작되었습니다."
}

# 함수: 서비스 상태 확인
check_services() {
    log_info "서비스 상태 확인 중..."
    
    # PM2 상태 확인
    pm2 status
    
    # 백엔드 헬스체크
    log_info "백엔드 헬스체크 중..."
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "백엔드 서비스가 정상적으로 실행 중입니다."
    else
        log_error "백엔드 서비스에 연결할 수 없습니다."
        pm2 logs
        exit 1
    fi
    
    # 프론트엔드 헬스체크
    log_info "프론트엔드 헬스체크 중..."
    if curl -f http://localhost:80/ > /dev/null 2>&1; then
        log_success "프론트엔드 서비스가 정상적으로 실행 중입니다."
    else
        log_error "프론트엔드 서비스에 연결할 수 없습니다."
        pm2 logs
        exit 1
    fi
}

# 함수: 방화벽 설정
setup_firewall() {
    log_info "방화벽 설정 중..."
    
    # Ubuntu/Debian
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 80/tcp    # HTTP
        sudo ufw allow 443/tcp   # HTTPS
        sudo ufw allow 5000/tcp  # Backend API
        sudo ufw --force enable
        log_success "UFW 방화벽이 설정되었습니다."
    # CentOS/RHEL/Amazon Linux
    elif command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --permanent --add-port=5000/tcp
        sudo firewall-cmd --reload
        log_success "firewalld가 설정되었습니다."
    else
        log_warning "방화벽 도구를 찾을 수 없습니다. 수동으로 포트를 열어주세요."
    fi
}

# 함수: 시스템 서비스 등록
setup_systemd() {
    log_info "시스템 서비스 등록 중..."
    
    # PM2 startup 스크립트 생성
    pm2 startup
    
    # PM2 save
    pm2 save
    
    log_success "시스템 서비스가 등록되었습니다."
}

# 함수: 로그 디렉토리 생성
create_log_directories() {
    log_info "로그 디렉토리 생성 중..."
    
    mkdir -p logs
    mkdir -p src/backend/logs
    mkdir -p src/backend/uploads
    
    log_success "로그 디렉토리가 생성되었습니다."
}

# 함수: 데이터베이스 초기화
setup_database() {
    log_info "데이터베이스 설정 중..."
    
    # MySQL 설치 확인
    if ! command -v mysql &> /dev/null; then
        log_info "MySQL 설치 중..."
        sudo apt-get update
        sudo apt-get install -y mysql-server
        
        # MySQL 서비스 시작
        sudo systemctl start mysql
        sudo systemctl enable mysql
    fi
    
    # 데이터베이스 및 사용자 생성
    log_info "데이터베이스 및 사용자 생성 중..."
    sudo mysql -e "
        CREATE DATABASE IF NOT EXISTS ${DB_NAME};
        CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
        GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USERNAME}'@'localhost';
        FLUSH PRIVILEGES;
    "
    
    log_success "데이터베이스 설정이 완료되었습니다."
}

# 메인 실행 함수
main() {
    log_info "Deukgeun AWS EC2 배포를 시작합니다..."
    
    # 의존성 확인
    check_dependencies
    
    # 로그 디렉토리 생성
    create_log_directories
    
    # 데이터베이스 설정
    setup_database
    
    # 방화벽 설정
    setup_firewall
    
    # 프로젝트 빌드
    build_project
    
    # 서비스 시작
    start_services
    
    # 서비스 상태 확인
    check_services
    
    # 시스템 서비스 등록
    setup_systemd
    
    log_success "배포가 성공적으로 완료되었습니다!"
    log_info "프론트엔드: http://$(curl -s ifconfig.me):80"
    log_info "백엔드 API: http://$(curl -s ifconfig.me):5000"
    log_info "헬스체크: http://$(curl -s ifconfig.me):5000/health"
    log_info ""
    log_info "PM2 명령어:"
    log_info "  상태 확인: pm2 status"
    log_info "  로그 확인: pm2 logs"
    log_info "  재시작: pm2 restart all"
    log_info "  중지: pm2 stop all"
}

# 스크립트 실행
main "$@"
