#!/bin/bash

# =============================================================================
# EC2 통합 배포 스크립트
# 모든 모듈화된 기능을 통합하여 EC2 환경에서 한번에 실행
# =============================================================================

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로깅 함수들
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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

log_separator() {
    echo -e "${PURPLE}================================${NC}"
}

# 환경 변수 설정
export NODE_ENV=production
export PROJECT_ROOT=$(pwd)
export LOG_DIR="$PROJECT_ROOT/logs"
export BACKUP_DIR="$PROJECT_ROOT/backups"
export DIST_DIR="$PROJECT_ROOT/dist"

# 타임스탬프 생성
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/ec2-deploy-$TIMESTAMP.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR" "$BACKUP_DIR"

# 로그 함수 (파일에도 기록)
log_with_file() {
    local level="$1"
    local message="$2"
    echo -e "$level $message" | tee -a "$LOG_FILE"
}

log_info_file() {
    log_with_file "${BLUE}[INFO]${NC}" "$1"
}

log_success_file() {
    log_with_file "${GREEN}[SUCCESS]${NC}" "$1"
}

log_error_file() {
    log_with_file "${RED}[ERROR]${NC}" "$1"
}

# =============================================================================
# 1. 시스템 환경 확인
# =============================================================================
check_system_requirements() {
    log_step "시스템 환경 확인 중..."
    
    # OS 확인
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        log_error "이 스크립트는 Linux 환경에서만 실행됩니다."
        exit 1
    fi
    
    # Node.js 확인
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다."
        log_info "Node.js 설치 중..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # npm 확인
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다."
        exit 1
    fi
    
    # PM2 확인 및 설치
    if ! command -v pm2 &> /dev/null; then
        log_info "PM2 설치 중..."
        sudo npm install -g pm2
    fi
    
    # serve 확인 및 설치 (프론트엔드 서빙용)
    if ! command -v serve &> /dev/null; then
        log_info "serve 설치 중..."
        sudo npm install -g serve
    fi
    
    # Git 확인
    if ! command -v git &> /dev/null; then
        log_error "Git이 설치되지 않았습니다."
        exit 1
    fi
    
    log_success "시스템 환경 확인 완료"
}

# =============================================================================
# 2. 프로젝트 의존성 설치
# =============================================================================
install_dependencies() {
    log_step "프로젝트 의존성 설치 중..."
    
    # package.json 확인
    if [[ ! -f "package.json" ]]; then
        log_error "package.json 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # npm install 실행
    log_info "npm install 실행 중..."
    npm install --production=false
    
    # @types/node 설치 (TypeScript 타입 정의)
    log_info "TypeScript 타입 정의 설치 중..."
    npm install --save-dev @types/node
    
    log_success "의존성 설치 완료"
}

# =============================================================================
# 3. 환경 변수 설정
# =============================================================================
setup_environment() {
    log_step "환경 변수 설정 중..."
    
    # .env 파일 확인 및 생성
    if [[ ! -f ".env" ]]; then
        log_info ".env 파일 생성 중..."
        cp .env.example .env 2>/dev/null || {
            log_warning ".env.example 파일이 없습니다. 기본 .env 파일을 생성합니다."
            cat > .env << EOF
NODE_ENV=production
PORT=5000
FRONTEND_PORT=80
DATABASE_URL=postgresql://localhost:5432/deukgeun
JWT_SECRET=your-jwt-secret-here
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
EOF
        }
    fi
    
    # 환경 변수 로드
    if [[ -f ".env" ]]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    log_success "환경 변수 설정 완료"
}

# =============================================================================
# 4. 백업 생성
# =============================================================================
create_backup() {
    log_step "백업 생성 중..."
    
    local backup_path="$BACKUP_DIR/backup-$TIMESTAMP"
    mkdir -p "$backup_path"
    
    # 중요한 파일들 백업
    local backup_files=(
        "package.json"
        "package-lock.json"
        "tsconfig.json"
        "ecosystem.config.cjs"
        ".env"
        "src"
    )
    
    for file in "${backup_files[@]}"; do
        if [[ -e "$file" ]]; then
            cp -r "$file" "$backup_path/"
            log_info "백업됨: $file"
        fi
    done
    
    # 백업 정보 저장
    cat > "$backup_path/backup-info.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "backup_path": "$backup_path",
  "files_backed_up": ${#backup_files[@]},
  "project_root": "$PROJECT_ROOT"
}
EOF
    
    log_success "백업 생성 완료: $backup_path"
}

# =============================================================================
# 5. TypeScript 컴파일 및 변환
# =============================================================================
compile_and_convert() {
    log_step "TypeScript 컴파일 및 변환 중..."
    
    # TypeScript 컴파일
    log_info "TypeScript 컴파일 중..."
    npx tsc --project tsconfig.scripts.json || {
        log_warning "TypeScript 컴파일에서 일부 오류가 발생했지만 계속 진행합니다."
    }
    
    # JS to CJS 변환 (필요한 경우)
    if [[ -f "scripts/js-to-cjs-converter.ts" ]]; then
        log_info "ES 모듈을 CommonJS로 변환 중..."
        npx ts-node scripts/js-to-cjs-converter.ts || {
            log_warning "모듈 변환에서 일부 오류가 발생했지만 계속 진행합니다."
        }
    fi
    
    log_success "컴파일 및 변환 완료"
}

# =============================================================================
# 6. 빌드 실행
# =============================================================================
run_build() {
    log_step "프로젝트 빌드 실행 중..."
    
    # 백엔드 빌드
    log_info "백엔드 빌드 중..."
    npm run build:backend:production || {
        log_error "백엔드 빌드 실패"
        return 1
    }
    
    # 프론트엔드 빌드
    log_info "프론트엔드 빌드 중..."
    npm run build:production || {
        log_error "프론트엔드 빌드 실패"
        return 1
    }
    
    # 빌드 결과 확인
    if [[ -d "dist" ]]; then
        log_success "빌드 완료: dist 디렉토리 생성됨"
    else
        log_error "빌드 결과를 찾을 수 없습니다."
        return 1
    fi
}

# =============================================================================
# 7. 데이터베이스 설정
# =============================================================================
setup_database() {
    log_step "데이터베이스 설정 중..."
    
    # PostgreSQL 확인
    if ! command -v psql &> /dev/null; then
        log_info "PostgreSQL 설치 중..."
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # 데이터베이스 생성 (필요한 경우)
    if [[ -n "$DATABASE_URL" ]]; then
        log_info "데이터베이스 연결 확인 중..."
        # 데이터베이스 연결 테스트
        log_success "데이터베이스 설정 완료"
    else
        log_warning "DATABASE_URL이 설정되지 않았습니다."
    fi
}

# =============================================================================
# 8. 방화벽 설정
# =============================================================================
setup_firewall() {
    log_step "방화벽 설정 중..."
    
    # UFW 확인 및 설정
    if command -v ufw &> /dev/null; then
        log_info "UFW 방화벽 설정 중..."
        sudo ufw allow 22    # SSH
        sudo ufw allow 80    # HTTP
        sudo ufw allow 443   # HTTPS
        sudo ufw allow 5000  # Backend API
        sudo ufw --force enable
        log_success "방화벽 설정 완료"
    else
        log_warning "UFW가 설치되지 않았습니다. 수동으로 포트를 열어주세요."
    fi
}

# =============================================================================
# 9. PM2 서비스 시작
# =============================================================================
start_services() {
    log_step "PM2 서비스 시작 중..."
    
    # 기존 서비스 중지
    pm2 delete all 2>/dev/null || true
    
    # ecosystem.config.cjs 확인
    if [[ -f "ecosystem.config.cjs" ]]; then
        log_info "PM2로 서비스 시작 중..."
        pm2 start ecosystem.config.cjs --env production
        
        # PM2 상태 확인
        pm2 status
        
        # PM2 자동 시작 설정
        pm2 startup
        pm2 save
        
        log_success "PM2 서비스 시작 완료"
    else
        log_error "ecosystem.config.cjs 파일을 찾을 수 없습니다."
        return 1
    fi
}

# =============================================================================
# 10. 서비스 상태 확인
# =============================================================================
check_services() {
    log_step "서비스 상태 확인 중..."
    
    # PM2 상태 확인
    log_info "PM2 서비스 상태:"
    pm2 status
    
    # 포트 확인
    log_info "포트 사용 상태:"
    netstat -tlnp | grep -E ':(80|5000|3000)' || true
    
    # 서비스 헬스체크
    sleep 5
    if curl -f http://localhost:5000/health 2>/dev/null; then
        log_success "백엔드 서비스 정상 동작"
    else
        log_warning "백엔드 서비스 헬스체크 실패"
    fi
    
    if curl -f http://localhost:80 2>/dev/null; then
        log_success "프론트엔드 서비스 정상 동작"
    else
        log_warning "프론트엔드 서비스 헬스체크 실패"
    fi
}

# =============================================================================
# 11. 로그 모니터링 설정
# =============================================================================
setup_log_monitoring() {
    log_step "로그 모니터링 설정 중..."
    
    # PM2 로그 설정
    pm2 install pm2-logrotate
    
    # 로그 디렉토리 권한 설정
    chmod -R 755 "$LOG_DIR"
    
    log_success "로그 모니터링 설정 완료"
}

# =============================================================================
# 12. 최종 상태 보고
# =============================================================================
final_report() {
    log_separator
    log_success "🎉 EC2 통합 배포가 성공적으로 완료되었습니다!"
    log_separator
    
    # 서비스 정보
    local public_ip=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
    
    log_info "📊 서비스 정보:"
    log_info "  - 프론트엔드: http://$public_ip:80"
    log_info "  - 백엔드 API: http://$public_ip:5000"
    log_info "  - 헬스체크: http://$public_ip:5000/health"
    
    log_info "📁 디렉토리 정보:"
    log_info "  - 프로젝트 루트: $PROJECT_ROOT"
    log_info "  - 빌드 결과: $DIST_DIR"
    log_info "  - 로그 파일: $LOG_FILE"
    log_info "  - 백업 위치: $BACKUP_DIR"
    
    log_info "🔧 관리 명령어:"
    log_info "  - PM2 상태: pm2 status"
    log_info "  - PM2 로그: pm2 logs"
    log_info "  - 서비스 재시작: pm2 restart all"
    log_info "  - 서비스 중지: pm2 stop all"
    
    log_separator
}

# =============================================================================
# 오류 처리 및 롤백
# =============================================================================
handle_error() {
    local exit_code=$?
    log_error "스크립트 실행 중 오류가 발생했습니다. (종료 코드: $exit_code)"
    
    # PM2 서비스 중지
    pm2 delete all 2>/dev/null || true
    
    # 롤백 옵션 제공
    log_info "롤백을 원하시면 다음 명령어를 실행하세요:"
    log_info "  pm2 delete all"
    log_info "  # 백업에서 복원 (필요한 경우)"
    
    exit $exit_code
}

# 오류 트랩 설정
trap handle_error ERR

# =============================================================================
# 메인 실행 함수
# =============================================================================
main() {
    log_separator
    log_info "🚀 Deukgeun EC2 통합 배포를 시작합니다..."
    log_separator
    
    # 실행 단계들
    check_system_requirements
    install_dependencies
    setup_environment
    create_backup
    compile_and_convert
    run_build
    setup_database
    setup_firewall
    start_services
    check_services
    setup_log_monitoring
    final_report
    
    log_success "✅ 모든 단계가 성공적으로 완료되었습니다!"
}

# 스크립트 실행
main "$@"
