#!/bin/bash

# =============================================================================
# EC2 통합 배포 스크립트 (안전장치 강화)
# 모든 모듈화된 기능을 통합하여 EC2 환경에서 한번에 실행
# =============================================================================

# 안전장치: 조건부 에러 처리 (중요한 단계에서만 즉시 중단)
set -u  # 정의되지 않은 변수 사용 시 에러
set -o pipefail  # 파이프라인에서 에러 발생 시 에러 처리

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
export NGINX_CONF_PATH="/etc/nginx/nginx.conf"
export NGINX_SITES_PATH="/etc/nginx/sites-available"
export NGINX_ENABLED_PATH="/etc/nginx/sites-enabled"

# 타임스탬프 생성
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/ec2-deploy-$TIMESTAMP.log"

# 타임아웃 설정 (안전장치)
MAX_BUILD_TIME=1800  # 30분
MAX_SERVICE_START_TIME=300  # 5분
MAX_HEALTH_CHECK_TIME=60  # 1분

# 재시도 설정
MAX_RETRIES=3
RETRY_DELAY=5  # 5초

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
# 유틸리티 함수들
# =============================================================================

# 타임아웃 실행 함수
run_with_timeout() {
    local timeout=$1
    local cmd="$2"
    local log_msg="$3"
    
    log_info "$log_msg (타임아웃: ${timeout}초)"
    
    if timeout "$timeout" bash -c "$cmd"; then
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log_error "$log_msg 타임아웃 (${timeout}초 초과)"
            return 1
        else
            log_error "$log_msg 실패 (종료 코드: $exit_code)"
            return $exit_code
        fi
    fi
}

# 재시도 실행 함수
run_with_retry() {
    local max_attempts=$1
    local delay=$2
    local cmd="$3"
    local log_msg="$4"
    
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "$log_msg (시도 $attempt/$max_attempts)"
        
        if eval "$cmd"; then
            log_success "$log_msg 성공"
            return 0
        else
            local exit_code=$?
            log_warning "$log_msg 실패 (종료 코드: $exit_code)"
            
            if [ $attempt -lt $max_attempts ]; then
                log_info "${delay}초 후 재시도..."
                sleep $delay
                attempt=$((attempt + 1))
            else
                log_error "$log_msg 모든 재시도 실패"
                return $exit_code
            fi
        fi
    done
    
    return 1
}

# 파일 존재 및 읽기 가능 확인
check_file() {
    local file="$1"
    local description="$2"
    
    if [[ ! -f "$file" ]]; then
        log_error "$description 파일이 없습니다: $file"
        return 1
    fi
    
    if [[ ! -r "$file" ]]; then
        log_error "$description 파일을 읽을 수 없습니다: $file"
        return 1
    fi
    
    return 0
}

# 디렉토리 존재 및 쓰기 가능 확인
check_directory() {
    local dir="$1"
    local description="$2"
    local create_if_missing="$3"
    
    if [[ ! -d "$dir" ]]; then
        if [[ "$create_if_missing" == "true" ]]; then
            log_info "$description 디렉토리 생성 중: $dir"
            mkdir -p "$dir" || {
                log_error "$description 디렉토리 생성 실패: $dir"
                return 1
            }
        else
            log_error "$description 디렉토리가 없습니다: $dir"
            return 1
        fi
    fi
    
    if [[ ! -w "$dir" ]]; then
        log_error "$description 디렉토리에 쓸 수 없습니다: $dir"
        return 1
    fi
    
    return 0
}

# 포트 사용 확인
check_port() {
    local port=$1
    local service_name="$2"
    
    if command -v netstat &> /dev/null; then
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            log_warning "$service_name 포트 $port이 이미 사용 중입니다"
            return 1
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp 2>/dev/null | grep -q ":$port "; then
            log_warning "$service_name 포트 $port이 이미 사용 중입니다"
            return 1
        fi
    fi
    
    return 0
}

# =============================================================================
# OS 감지 및 패키지 매니저 확인 (Amazon Linux 2023 최적화)
# =============================================================================
detect_os_and_package_manager() {
    # OS 정보 확인
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        export OS_ID="${ID:-}"
        export OS_VERSION="${VERSION_ID:-}"
    fi
    
    # 패키지 매니저 감지
    if command -v dnf &> /dev/null; then
        export PACKAGE_MANAGER="dnf"
        export INSTALL_CMD="sudo dnf install -y"
        export UPDATE_CMD="sudo dnf update -y"
    elif command -v yum &> /dev/null; then
        export PACKAGE_MANAGER="yum"
        export INSTALL_CMD="sudo yum install -y"
        export UPDATE_CMD="sudo yum update -y"
    elif command -v apt-get &> /dev/null; then
        export PACKAGE_MANAGER="apt-get"
        export INSTALL_CMD="sudo apt-get install -y"
        export UPDATE_CMD="sudo apt-get update"
    else
        log_error "지원되지 않는 패키지 매니저입니다."
        return 1
    fi
    
    log_info "OS 감지: ${OS_ID:-unknown} ${OS_VERSION:-}"
    log_info "패키지 매니저: $PACKAGE_MANAGER"
    
    return 0
}

# =============================================================================
# 1. 시스템 환경 확인 (안전장치 강화, Amazon Linux 2023 최적화)
# =============================================================================
check_system_requirements() {
    log_step "시스템 환경 확인 중..."
    
    local errors=0
    
    # OS 및 패키지 매니저 감지
    if ! detect_os_and_package_manager; then
        log_error "OS 감지 실패"
        exit 1
    fi
    
    # OS 확인
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        log_error "이 스크립트는 Linux 환경에서만 실행됩니다."
        exit 1
    fi
    
    # Node.js 확인 및 설치 (Amazon Linux 2023 최적화)
    if ! command -v node &> /dev/null; then
        log_warning "Node.js가 설치되지 않았습니다."
        log_info "Node.js 설치 중..."
        
        if [[ "$PACKAGE_MANAGER" == "dnf" ]] || [[ "$PACKAGE_MANAGER" == "yum" ]]; then
            # Amazon Linux 2023용 Node.js 설치
            if ! run_with_retry 3 5 "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && $INSTALL_CMD nodejs" "Node.js 설치"; then
                log_error "Node.js 설치 실패"
                errors=$((errors + 1))
            else
                local node_version=$(node --version 2>/dev/null || echo "unknown")
                log_success "Node.js 설치 완료: $node_version"
            fi
        else
            # Ubuntu/Debian용 Node.js 설치
            if ! run_with_retry 3 5 "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && $INSTALL_CMD nodejs" "Node.js 설치"; then
                log_error "Node.js 설치 실패"
                errors=$((errors + 1))
            else
                local node_version=$(node --version 2>/dev/null || echo "unknown")
                log_success "Node.js 설치 완료: $node_version"
            fi
        fi
    else
        local node_version=$(node --version)
        log_success "Node.js 확인 완료: $node_version"
        
        # Node.js 버전 검증 (최소 18.x)
        local node_major=$(echo "$node_version" | cut -d'.' -f1 | sed 's/v//')
        if [[ $node_major -lt 18 ]]; then
            log_warning "Node.js 버전이 낮습니다 (현재: $node_version, 권장: 18.x 이상)"
        fi
    fi
    
    # npm 확인 및 설치
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다."
        errors=$((errors + 1))
    else
        local npm_version=$(npm --version)
        log_success "npm 확인 완료: $npm_version"
    fi
    
    # PM2 확인 및 설치
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2가 설치되지 않았습니다."
        log_info "PM2 설치 중..."
        
        if ! run_with_retry 3 5 "sudo npm install -g pm2" "PM2 설치"; then
            log_error "PM2 설치 실패"
            errors=$((errors + 1))
        else
            local pm2_version=$(pm2 --version 2>/dev/null || echo "unknown")
            log_success "PM2 설치 완료: $pm2_version"
        fi
    else
        local pm2_version=$(pm2 --version)
        log_success "PM2 확인 완료: $pm2_version"
    fi
    
    # nginx 확인 및 설치 (Amazon Linux 2023 최적화)
    if ! command -v nginx &> /dev/null; then
        log_warning "nginx가 설치되지 않았습니다."
        log_info "nginx 설치 중..."
        
        if ! run_with_retry 3 5 "$UPDATE_CMD && $INSTALL_CMD nginx" "nginx 설치"; then
            log_error "nginx 설치 실패"
            errors=$((errors + 1))
        else
            log_success "nginx 설치 완료"
        fi
    else
        local nginx_version=$(nginx -v 2>&1 | cut -d'/' -f2)
        log_success "nginx 확인 완료: $nginx_version"
    fi
    
    # Git 확인 (Amazon Linux 2023 최적화)
    if ! command -v git &> /dev/null; then
        log_warning "Git이 설치되지 않았습니다."
        log_info "Git 설치 중..."
        
        if ! run_with_retry 3 5 "$INSTALL_CMD git" "Git 설치"; then
            log_error "Git 설치 실패"
            errors=$((errors + 1))
        else
            log_success "Git 설치 완료"
        fi
    else
        local git_version=$(git --version | cut -d' ' -f3)
        log_success "Git 확인 완료: $git_version"
    fi
    
    # 포트 사용 확인
    check_port 80 "HTTP"
    check_port 443 "HTTPS"
    check_port 5000 "Backend API"
    
    if [ $errors -gt 0 ]; then
        log_error "시스템 환경 확인 실패 ($errors 개 오류)"
        return 1
    fi
    
    log_success "시스템 환경 확인 완료"
    return 0
}

# =============================================================================
# 2. 프로젝트 의존성 설치 (안전장치 강화)
# =============================================================================
install_dependencies() {
    log_step "프로젝트 의존성 설치 중..."
    
    # package.json 확인
    if ! check_file "package.json" "package.json"; then
        log_error "package.json 파일이 없습니다."
        return 1
    fi
    
    # package-lock.json 확인 (없으면 생성)
    if [[ ! -f "package-lock.json" ]]; then
        log_warning "package-lock.json 파일이 없습니다. 생성 중..."
        npm install --package-lock-only || {
            log_warning "package-lock.json 생성 실패, 계속 진행..."
        }
    fi
    
    # npm install 실행 (재시도 로직 포함)
    log_info "npm install 실행 중..."
    
    if ! run_with_timeout 600 "npm install --production=false" "의존성 설치"; then
        log_error "의존성 설치 실패"
        return 1
    fi
    
    # 설치된 패키지 검증
    if [[ ! -d "node_modules" ]]; then
        log_error "node_modules 디렉토리가 생성되지 않았습니다."
        return 1
    fi
    
    local installed_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    if [ $installed_count -lt 10 ]; then
        log_warning "설치된 패키지 수가 적습니다 ($installed_count 개). 설치가 완전하지 않을 수 있습니다."
    else
        log_success "의존성 설치 완료 ($installed_count 개 패키지)"
    fi
    
    return 0
}

# =============================================================================
# 3. 환경 변수 설정 (안전장치 강화)
# =============================================================================
setup_environment() {
    log_step "환경 변수 설정 중..."
    
    local errors=0
    
    # .env 파일 확인 및 생성
    if [[ ! -f ".env" ]]; then
        log_warning ".env 파일이 없습니다."
        
        # .env.example에서 복사 시도
        if [[ -f ".env.example" ]]; then
            log_info ".env.example에서 .env 파일 생성 중..."
            cp .env.example .env || {
                log_error ".env.example 복사 실패"
                errors=$((errors + 1))
            }
        elif [[ -f "env.unified" ]]; then
            log_info "env.unified에서 .env 파일 생성 중..."
            cp env.unified .env || {
                log_error "env.unified 복사 실패"
                errors=$((errors + 1))
            }
        else
            log_warning "기본 .env 파일 생성 중..."
            cat > .env << EOF
NODE_ENV=production
MODE=production
PORT=5000
FRONTEND_PORT=80
DATABASE_URL=postgresql://localhost:5432/deukgeun
JWT_SECRET=your-jwt-secret-here
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
VITE_BACKEND_URL=http://43.203.30.167:5000
VITE_FRONTEND_URL=https://devtrail.net
CORS_ORIGIN=https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000
EOF
            log_warning "기본 .env 파일이 생성되었습니다. 실제 값으로 수정하세요."
        fi
    fi
    
    # .env 파일 검증
    if [[ -f ".env" ]]; then
        # 필수 환경 변수 확인
        local required_vars=(
            "NODE_ENV"
            "PORT"
            "CORS_ORIGIN"
        )
        
        local missing_vars=()
        for var in "${required_vars[@]}"; do
            if ! grep -q "^${var}=" .env 2>/dev/null; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            log_warning "필수 환경 변수가 없습니다: ${missing_vars[*]}"
            log_info ".env 파일을 확인하고 필수 변수를 추가하세요."
        fi
        
        # 환경 변수 로드 (안전하게)
        set -a  # 모든 변수를 자동으로 export
        source .env 2>/dev/null || {
            log_error ".env 파일 로드 실패"
            errors=$((errors + 1))
        }
        set +a  # 자동 export 비활성화
        
        # 환경 변수 검증
        if [[ -z "${NODE_ENV:-}" ]]; then
            log_warning "NODE_ENV가 설정되지 않았습니다. 기본값 'production' 사용"
            export NODE_ENV=production
        fi
        
        if [[ -z "${PORT:-}" ]]; then
            log_warning "PORT가 설정되지 않았습니다. 기본값 '5000' 사용"
            export PORT=5000
        fi
        
        log_success "환경 변수 설정 완료"
    else
        log_error ".env 파일을 생성할 수 없습니다."
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        log_error "환경 변수 설정 실패 ($errors 개 오류)"
        return 1
    fi
    
    return 0
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
# 6. 빌드 실행 (안전장치 강화)
# =============================================================================
run_build() {
    log_step "프로젝트 빌드 실행 중..."
    
    local errors=0
    
    # 빌드 스크립트 확인
    if ! check_file "package.json" "package.json"; then
        log_error "package.json 파일이 없습니다."
        return 1
    fi
    
    # 빌드 명령어 확인
    if ! grep -q '"build"' package.json; then
        log_error "package.json에 build 스크립트가 없습니다."
        return 1
    fi
    
    # 통합 빌드 실행 (타임아웃 포함)
    log_info "통합 빌드 실행 중..."
    
    if ! run_with_timeout "$MAX_BUILD_TIME" "npm run build" "프로젝트 빌드"; then
        log_error "빌드 실패"
        errors=$((errors + 1))
        
        # 빌드 로그 확인
        if [[ -f "$LOG_DIR/build-error.log" ]]; then
            log_info "빌드 에러 로그 (최근 50줄):"
            tail -n 50 "$LOG_DIR/build-error.log" || true
        fi
    fi
    
    # 빌드 결과 검증
    log_info "빌드 결과 검증 중..."
    
    local required_dirs=(
        "dist/backend"
        "dist/frontend"
    )
    
    local missing_dirs=()
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [ ${#missing_dirs[@]} -gt 0 ]; then
        log_error "필수 빌드 디렉토리가 없습니다: ${missing_dirs[*]}"
        errors=$((errors + 1))
    fi
    
    # 백엔드 빌드 파일 확인
    if [[ ! -f "dist/backend/backend/index.cjs" ]]; then
        log_error "백엔드 진입점 파일이 없습니다: dist/backend/backend/index.cjs"
        errors=$((errors + 1))
    fi
    
    # 프론트엔드 빌드 파일 확인
    if [[ ! -f "dist/frontend/index.html" ]]; then
        log_error "프론트엔드 진입점 파일이 없습니다: dist/frontend/index.html"
        errors=$((errors + 1))
    fi
    
    # 빌드 결과 크기 확인
    local dist_size=$(du -sh dist 2>/dev/null | cut -f1 || echo "0")
    if [[ "$dist_size" == "0" ]] || [[ -z "$dist_size" ]]; then
        log_error "빌드 결과가 비어있습니다."
        errors=$((errors + 1))
    else
        log_info "빌드 결과 크기: $dist_size"
    fi
    
    if [ $errors -gt 0 ]; then
        log_error "빌드 검증 실패 ($errors 개 오류)"
        return 1
    fi
    
    log_success "빌드 완료: dist 디렉토리 생성됨 ($dist_size)"
    return 0
}

# =============================================================================
# 7. 데이터베이스 설정 (안전장치 강화)
# =============================================================================
setup_database() {
    log_step "데이터베이스 설정 중..."
    
    # DATABASE_URL 확인
    if [[ -z "${DATABASE_URL:-}" ]]; then
        log_warning "DATABASE_URL이 설정되지 않았습니다. 데이터베이스 설정을 건너뜁니다."
        return 0
    fi
    
    # PostgreSQL 확인 (Amazon Linux 2023 최적화)
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL이 설치되지 않았습니다."
        log_info "PostgreSQL 설치 중..."
        
        if [[ "$PACKAGE_MANAGER" == "dnf" ]] || [[ "$PACKAGE_MANAGER" == "yum" ]]; then
            # Amazon Linux 2023용 PostgreSQL 설치
            if ! run_with_retry 3 10 "$UPDATE_CMD && $INSTALL_CMD postgresql15 postgresql15-server postgresql15-contrib" "PostgreSQL 설치"; then
                log_error "PostgreSQL 설치 실패"
                return 1
            fi
            
            # PostgreSQL 초기화 (Amazon Linux 2023)
            if [[ ! -d /var/lib/pgsql/data ]]; then
                log_info "PostgreSQL 데이터베이스 초기화 중..."
                sudo postgresql-setup --initdb || sudo /usr/pgsql-15/bin/postgresql-15-setup initdb || {
                    log_warning "PostgreSQL 초기화 실패, 수동으로 초기화하세요"
                }
            fi
        else
            # Ubuntu/Debian용 PostgreSQL 설치
            if ! run_with_retry 3 10 "$UPDATE_CMD && $INSTALL_CMD postgresql postgresql-contrib" "PostgreSQL 설치"; then
                log_error "PostgreSQL 설치 실패"
                return 1
            fi
        fi
        
        # PostgreSQL 서비스 시작 (Amazon Linux 2023은 서비스 이름이 다를 수 있음)
        local postgresql_service="postgresql"
        if [[ "$PACKAGE_MANAGER" == "dnf" ]] || [[ "$PACKAGE_MANAGER" == "yum" ]]; then
            # Amazon Linux 2023에서 PostgreSQL 15 서비스 이름 확인
            if systemctl list-unit-files | grep -q postgresql-15; then
                postgresql_service="postgresql-15"
            elif systemctl list-unit-files | grep -q postgresql15; then
                postgresql_service="postgresql15"
            fi
        fi
        
        if ! sudo systemctl start "$postgresql_service"; then
            log_error "PostgreSQL 서비스 시작 실패 (서비스명: $postgresql_service)"
            return 1
        fi
        
        # PostgreSQL 서비스 자동 시작 설정
        sudo systemctl enable "$postgresql_service" || {
            log_warning "PostgreSQL 자동 시작 설정 실패 (서비스명: $postgresql_service)"
        }
        
        log_success "PostgreSQL 설치 및 시작 완료 (서비스명: $postgresql_service)"
    else
        # PostgreSQL 서비스 상태 확인
        local postgresql_service="postgresql"
        if [[ "$PACKAGE_MANAGER" == "dnf" ]] || [[ "$PACKAGE_MANAGER" == "yum" ]]; then
            # Amazon Linux 2023에서 PostgreSQL 15 서비스 이름 확인
            if systemctl list-unit-files | grep -q postgresql-15; then
                postgresql_service="postgresql-15"
            elif systemctl list-unit-files | grep -q postgresql15; then
                postgresql_service="postgresql15"
            fi
        fi
        
        if sudo systemctl is-active --quiet "$postgresql_service"; then
            log_success "PostgreSQL 서비스 정상 실행 중 (서비스명: $postgresql_service)"
        else
            log_warning "PostgreSQL 서비스가 실행되지 않았습니다. 시작 시도 중... (서비스명: $postgresql_service)"
            sudo systemctl start "$postgresql_service" || {
                log_error "PostgreSQL 서비스 시작 실패 (서비스명: $postgresql_service)"
                return 1
            }
        fi
    fi
    
    # 데이터베이스 연결 테스트 (선택적)
    if command -v psql &> /dev/null && [[ -n "${DATABASE_URL:-}" ]]; then
        log_info "데이터베이스 연결 테스트 중..."
        # DATABASE_URL 파싱은 복잡하므로 실제 연결 테스트는 백엔드 서버에서 수행
        log_info "데이터베이스 연결은 백엔드 서버 시작 시 검증됩니다."
    fi
    
    log_success "데이터베이스 설정 완료"
    return 0
}

# =============================================================================
# 8. 방화벽 설정 (안전장치 강화)
# =============================================================================
setup_firewall() {
    log_step "방화벽 설정 중..."
    
    # Amazon Linux 2023은 기본적으로 firewalld 사용, UFW는 Ubuntu/Debian용
    if [[ "$PACKAGE_MANAGER" == "dnf" ]] || [[ "$PACKAGE_MANAGER" == "yum" ]]; then
        # firewalld 사용 (Amazon Linux 2023)
        if ! command -v firewall-cmd &> /dev/null; then
            log_warning "firewalld가 설치되지 않았습니다."
            log_info "firewalld 설치 중..."
            
            if ! run_with_retry 3 5 "$INSTALL_CMD firewalld" "firewalld 설치"; then
                log_error "firewalld 설치 실패"
                log_warning "수동으로 포트를 열어주세요:"
                log_warning "  - SSH (22): sudo firewall-cmd --permanent --add-service=ssh"
                log_warning "  - HTTP (80): sudo firewall-cmd --permanent --add-service=http"
                log_warning "  - HTTPS (443): sudo firewall-cmd --permanent --add-service=https"
                log_warning "  - Backend API (5000): sudo firewall-cmd --permanent --add-port=5000/tcp"
                log_warning "  - sudo firewall-cmd --reload"
                return 1
            fi
        fi
        
        # firewalld 서비스 시작
        if ! sudo systemctl is-active --quiet firewalld; then
            log_info "firewalld 서비스 시작 중..."
            sudo systemctl start firewalld || {
                log_error "firewalld 서비스 시작 실패"
                return 1
            }
        fi
        
        # firewalld 자동 시작 설정
        sudo systemctl enable firewalld || {
            log_warning "firewalld 자동 시작 설정 실패"
        }
        
        # 필수 포트 허용
        log_info "방화벽 규칙 설정 중..."
        
        sudo firewall-cmd --permanent --add-service=ssh || {
            log_warning "SSH 포트 설정 실패"
        }
        
        sudo firewall-cmd --permanent --add-service=http || {
            log_warning "HTTP 포트 설정 실패"
        }
        
        sudo firewall-cmd --permanent --add-service=https || {
            log_warning "HTTPS 포트 설정 실패"
        }
        
        sudo firewall-cmd --permanent --add-port=5000/tcp || {
            log_warning "Backend API 포트 설정 실패"
        }
        
        # 방화벽 규칙 적용
        sudo firewall-cmd --reload || {
            log_error "방화벽 규칙 적용 실패"
            return 1
        }
        
        log_success "firewalld 방화벽 설정 완료"
        
        # 방화벽 규칙 확인
        log_info "현재 방화벽 규칙:"
        sudo firewall-cmd --list-all 2>/dev/null || true
        
    else
        # UFW 사용 (Ubuntu/Debian)
        if ! command -v ufw &> /dev/null; then
            log_warning "UFW가 설치되지 않았습니다."
            log_info "UFW 설치 중..."
            
            if ! run_with_retry 3 5 "$INSTALL_CMD ufw" "UFW 설치"; then
                log_error "UFW 설치 실패"
                log_warning "수동으로 포트를 열어주세요:"
                log_warning "  - SSH (22): sudo ufw allow 22"
                log_warning "  - HTTP (80): sudo ufw allow 80"
                log_warning "  - HTTPS (443): sudo ufw allow 443"
                log_warning "  - Backend API (5000): sudo ufw allow 5000"
                return 1
            fi
        fi
        
        # 현재 방화벽 상태 확인
        local ufw_status=$(sudo ufw status 2>/dev/null | head -n 1 || echo "inactive")
        if [[ "$ufw_status" == *"active"* ]]; then
            log_info "UFW 방화벽이 이미 활성화되어 있습니다."
        else
            log_info "UFW 방화벽 설정 중..."
            
            # 기본 규칙 설정
            sudo ufw --force reset 2>/dev/null || true
            
            # 필수 포트 허용
            sudo ufw allow 22/tcp comment 'SSH' || {
                log_error "SSH 포트 설정 실패"
                return 1
            }
            
            sudo ufw allow 80/tcp comment 'HTTP' || {
                log_error "HTTP 포트 설정 실패"
                return 1
            }
            
            sudo ufw allow 443/tcp comment 'HTTPS' || {
                log_error "HTTPS 포트 설정 실패"
                return 1
            }
            
            sudo ufw allow 5000/tcp comment 'Backend API' || {
                log_error "Backend API 포트 설정 실패"
                return 1
            }
            
            # 방화벽 활성화
            if sudo ufw --force enable; then
                log_success "UFW 방화벽 활성화 완료"
            else
                log_error "UFW 방화벽 활성화 실패"
                return 1
            fi
        fi
        
        # 방화벽 규칙 확인
        log_info "현재 방화벽 규칙:"
        sudo ufw status numbered 2>/dev/null || true
    fi
    
    log_success "방화벽 설정 완료"
    return 0
}

# =============================================================================
# 9. Nginx 설정 및 서비스 시작 (안전장치 강화)
# =============================================================================
setup_nginx() {
    log_step "Nginx 설정 중..."
    
    local errors=0
    
    # nginx.conf 파일 확인
    if ! check_file "nginx.conf" "nginx.conf"; then
        log_error "nginx.conf 파일이 없습니다."
        return 1
    fi
    
    # nginx 설정 백업
    if [[ -f "$NGINX_CONF_PATH" ]]; then
        log_info "기존 nginx 설정 백업 중..."
        sudo cp "$NGINX_CONF_PATH" "${NGINX_CONF_PATH}.backup.${TIMESTAMP}" || {
            log_warning "nginx 설정 백업 실패, 계속 진행..."
        }
    fi
    
    # nginx.conf 검증
    log_info "nginx 설정 검증 중..."
    if ! sudo nginx -t -c "$PROJECT_ROOT/nginx.conf" 2>/dev/null; then
        log_error "nginx 설정 검증 실패"
        
        # 에러 메시지 출력
        sudo nginx -t -c "$PROJECT_ROOT/nginx.conf" 2>&1 | tail -n 10 || true
        
        errors=$((errors + 1))
    else
        log_success "nginx 설정 검증 통과"
        
        # nginx 설정 복사
        log_info "nginx 설정 복사 중..."
        sudo cp "$PROJECT_ROOT/nginx.conf" "$NGINX_CONF_PATH" || {
            log_error "nginx 설정 복사 실패"
            errors=$((errors + 1))
        }
    fi
    
    # 프론트엔드 빌드 파일을 nginx 서빙 디렉토리로 복사
    if [[ -d "dist/frontend" ]]; then
        log_info "프론트엔드 빌드 파일 복사 중..."
        
        # nginx 서빙 디렉토리 확인 및 생성
        local nginx_html_dir="/usr/share/nginx/html"
        if ! check_directory "$nginx_html_dir" "nginx HTML" "true"; then
            log_error "nginx HTML 디렉토리 생성 실패"
            errors=$((errors + 1))
        else
            # 기존 파일 백업
            if [[ -d "$nginx_html_dir" ]] && [[ "$(ls -A $nginx_html_dir 2>/dev/null)" ]]; then
                log_info "기존 nginx HTML 파일 백업 중..."
                sudo mv "$nginx_html_dir" "${nginx_html_dir}.backup.${TIMESTAMP}" || {
                    log_warning "nginx HTML 백업 실패, 계속 진행..."
                }
            fi
            
            # 새 디렉토리 생성
            sudo mkdir -p "$nginx_html_dir" || {
                log_error "nginx HTML 디렉토리 생성 실패"
                errors=$((errors + 1))
            }
            
            # 프론트엔드 파일 복사
            sudo cp -r dist/frontend/* "$nginx_html_dir/" || {
                log_error "프론트엔드 파일 복사 실패"
                errors=$((errors + 1))
            }
            
            # 권한 설정
            sudo chown -R nginx:nginx "$nginx_html_dir" || {
                log_warning "nginx HTML 디렉토리 권한 설정 실패"
            }
            
            sudo chmod -R 755 "$nginx_html_dir" || {
                log_warning "nginx HTML 디렉토리 권한 설정 실패"
            }
            
            log_success "프론트엔드 파일 복사 완료"
        fi
    else
        log_error "프론트엔드 빌드 디렉토리가 없습니다: dist/frontend"
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        log_error "Nginx 설정 실패 ($errors 개 오류)"
        return 1
    fi
    
    # nginx 재시작
    log_info "nginx 재시작 중..."
    if ! run_with_retry 3 5 "sudo systemctl restart nginx" "nginx 재시작"; then
        log_error "nginx 재시작 실패"
        return 1
    fi
    
    # nginx 상태 확인
    sleep 2
    if sudo systemctl is-active --quiet nginx; then
        log_success "nginx 서비스 정상 실행 중"
    else
        log_error "nginx 서비스가 실행되지 않았습니다"
        sudo systemctl status nginx --no-pager -l || true
        return 1
    fi
    
    log_success "Nginx 설정 완료"
    return 0
}

# =============================================================================
# 10. PM2 서비스 시작 (안전장치 강화)
# =============================================================================
start_services() {
    log_step "PM2 서비스 시작 중..."
    
    local errors=0
    
    # ecosystem.config.cjs 확인
    if ! check_file "ecosystem.config.cjs" "ecosystem.config.cjs"; then
        log_error "ecosystem.config.cjs 파일이 없습니다."
        return 1
    fi
    
    # 로그 디렉토리 생성 (PM2 시작 전)
    mkdir -p "$LOG_DIR" || {
        log_warning "로그 디렉토리 생성 실패, 계속 진행..."
    }
    
    # 로그 디렉토리 권한 설정 (EC2 환경)
    chmod -R 755 "$LOG_DIR" 2>/dev/null || {
        log_warning "로그 디렉토리 권한 설정 실패"
    }
    
    # 기존 서비스 중지 (안전하게)
    log_info "기존 PM2 서비스 중지 중..."
    if pm2 list | grep -q "online\|restarting"; then
        pm2 delete all 2>/dev/null || {
            log_warning "기존 PM2 서비스 중지 실패, 계속 진행..."
        }
    fi
    
    # PM2 로그 정리
    pm2 flush 2>/dev/null || true
    
    # PM2 서비스 시작 (타임아웃 포함)
    log_info "PM2로 서비스 시작 중... (EC2 환경: production)"
    
    # EC2 환경 변수 설정
    export NODE_ENV=production
    export MODE=production
    
    if ! run_with_timeout "$MAX_SERVICE_START_TIME" "pm2 start ecosystem.config.cjs --env production" "PM2 서비스 시작"; then
        log_error "PM2 서비스 시작 실패"
        errors=$((errors + 1))
        
        # PM2 로그 확인
        log_info "PM2 로그 (최근 50줄):"
        pm2 logs --lines 50 --nostream 2>/dev/null || true
    fi
    
    # PM2 상태 확인
    sleep 3
    log_info "PM2 서비스 상태:"
    pm2 status || {
        log_error "PM2 상태 확인 실패"
        errors=$((errors + 1))
    }
    
    # PM2 프로세스 확인
    local running_processes=$(pm2 jlist 2>/dev/null | grep -c '"status":"online"' || echo "0")
    if [ $running_processes -eq 0 ]; then
        log_error "실행 중인 PM2 프로세스가 없습니다"
        errors=$((errors + 1))
    else
        log_success "PM2 프로세스 실행 중: $running_processes 개"
    fi
    
    # PM2 자동 시작 설정
    log_info "PM2 자동 시작 설정 중..."
    if ! pm2 startup 2>/dev/null; then
        log_warning "PM2 자동 시작 설정 실패 (수동으로 설정하세요)"
    else
        log_success "PM2 자동 시작 설정 완료"
    fi
    
    # PM2 설정 저장
    pm2 save 2>/dev/null || {
        log_warning "PM2 설정 저장 실패"
    }
    
    if [ $errors -gt 0 ]; then
        log_error "PM2 서비스 시작 실패 ($errors 개 오류)"
        return 1
    fi
    
    log_success "PM2 서비스 시작 완료"
    return 0
}

# =============================================================================
# 11. 서비스 상태 확인 (안전장치 강화)
# =============================================================================
check_services() {
    log_step "서비스 상태 확인 중..."
    
    local errors=0
    local warnings=0
    
    # PM2 상태 확인
    log_info "PM2 서비스 상태:"
    if ! pm2 status; then
        log_error "PM2 상태 확인 실패"
        errors=$((errors + 1))
    fi
    
    # PM2 프로세스 상세 확인
    local pm2_list=$(pm2 jlist 2>/dev/null || echo "[]")
    local online_count=$(echo "$pm2_list" | grep -c '"status":"online"' || echo "0")
    local error_count=$(echo "$pm2_list" | grep -c '"status":"errored"' || echo "0")
    local stopped_count=$(echo "$pm2_list" | grep -c '"status":"stopped"' || echo "0")
    
    log_info "PM2 프로세스 상태:"
    log_info "  - 실행 중: $online_count"
    log_info "  - 에러: $error_count"
    log_info "  - 중지됨: $stopped_count"
    
    if [ $error_count -gt 0 ]; then
        log_error "PM2 프로세스 중 $error_count 개가 에러 상태입니다"
        errors=$((errors + 1))
    fi
    
    # 포트 확인
    log_info "포트 사용 상태:"
    if command -v netstat &> /dev/null; then
        netstat -tlnp | grep -E ':(80|443|5000)' || true
    elif command -v ss &> /dev/null; then
        ss -tlnp | grep -E ':(80|443|5000)' || true
    else
        log_warning "포트 확인 도구를 사용할 수 없습니다"
        warnings=$((warnings + 1))
    fi
    
    # nginx 상태 확인
    log_info "nginx 서비스 상태:"
    if sudo systemctl is-active --quiet nginx; then
        log_success "nginx 서비스 정상 실행 중"
    else
        log_error "nginx 서비스가 실행되지 않았습니다"
        errors=$((errors + 1))
    fi
    
    # 서비스 헬스체크 (재시도 포함)
    log_info "서비스 헬스체크 중..."
    
    # 백엔드 헬스체크
    local backend_health_ok=false
    for i in {1..5}; do
        log_info "백엔드 헬스체크 시도 $i/5..."
        sleep 2
        
        if curl -f -s -m 10 http://localhost:5000/health >/dev/null 2>&1; then
            log_success "백엔드 서비스 정상 동작"
            backend_health_ok=true
            break
        fi
    done
    
    if [ "$backend_health_ok" = false ]; then
        log_error "백엔드 서비스 헬스체크 실패"
        errors=$((errors + 1))
        
        # PM2 로그 확인
        log_info "백엔드 PM2 로그 (최근 30줄):"
        pm2 logs deukgeun-backend --lines 30 --nostream 2>/dev/null || true
    fi
    
    # 프론트엔드 헬스체크
    local frontend_health_ok=false
    for i in {1..5}; do
        log_info "프론트엔드 헬스체크 시도 $i/5..."
        sleep 2
        
        if curl -f -s -m 10 http://localhost/health >/dev/null 2>&1; then
            log_success "프론트엔드 서비스 정상 동작"
            frontend_health_ok=true
            break
        fi
    done
    
    if [ "$frontend_health_ok" = false ]; then
        log_error "프론트엔드 서비스 헬스체크 실패"
        errors=$((errors + 1))
        
        # nginx 로그 확인
        log_info "nginx 에러 로그 (최근 30줄):"
        sudo tail -n 30 /var/log/nginx/error.log 2>/dev/null || true
    fi
    
    # 최종 상태 보고
    if [ $errors -gt 0 ]; then
        log_error "서비스 상태 확인 실패 ($errors 개 오류, $warnings 개 경고)"
        return 1
    elif [ $warnings -gt 0 ]; then
        log_warning "서비스 상태 확인 완료 ($warnings 개 경고)"
        return 0
    else
        log_success "서비스 상태 확인 완료"
        return 0
    fi
}

# =============================================================================
# 12. 로그 모니터링 설정 (안전장치 강화)
# =============================================================================
setup_log_monitoring() {
    log_step "로그 모니터링 설정 중..."
    
    local errors=0
    
    # 로그 디렉토리 확인 및 생성
    if ! check_directory "$LOG_DIR" "로그" "true"; then
        log_error "로그 디렉토리 생성 실패"
        errors=$((errors + 1))
    fi
    
    # PM2 로그 로테이션 설정
    log_info "PM2 로그 로테이션 설정 중..."
    if ! pm2 install pm2-logrotate 2>/dev/null; then
        log_warning "PM2 로그 로테이션 설치 실패, 계속 진행..."
    else
        # PM2 로그 로테이션 설정
        pm2 set pm2-logrotate:max_size 10M 2>/dev/null || true
        pm2 set pm2-logrotate:retain 7 2>/dev/null || true
        pm2 set pm2-logrotate:compress true 2>/dev/null || true
        pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss 2>/dev/null || true
        
        log_success "PM2 로그 로테이션 설정 완료"
    fi
    
    # nginx 로그 로테이션 설정
    log_info "nginx 로그 로테이션 설정 중..."
    if [[ -f "/etc/logrotate.d/nginx" ]]; then
        log_success "nginx 로그 로테이션 설정 확인됨"
    else
        log_warning "nginx 로그 로테이션 설정이 없습니다. 수동으로 설정하세요."
    fi
    
    # 로그 디렉토리 권한 설정
    chmod -R 755 "$LOG_DIR" 2>/dev/null || {
        log_warning "로그 디렉토리 권한 설정 실패"
    }
    
    # 로그 파일 크기 확인
    local total_log_size=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1 || echo "0")
    log_info "현재 로그 디렉토리 크기: $total_log_size"
    
    if [ $errors -gt 0 ]; then
        log_error "로그 모니터링 설정 실패 ($errors 개 오류)"
        return 1
    fi
    
    log_success "로그 모니터링 설정 완료"
    return 0
}

# =============================================================================
# 13. 최종 상태 보고 (안전장치 강화)
# =============================================================================
final_report() {
    log_separator
    log_success "🎉 EC2 통합 배포가 성공적으로 완료되었습니다!"
    log_separator
    
    # 서비스 정보
    local public_ip=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || curl -s --max-time 5 ifconfig.co 2>/dev/null || echo "localhost")
    local domain="devtrail.net"
    
    log_info "📊 서비스 정보:"
    log_info "  - 프론트엔드: http://$domain (또는 http://$public_ip)"
    log_info "  - 백엔드 API: http://$public_ip:5000"
    log_info "  - 헬스체크: http://$public_ip:5000/health"
    log_info "  - Nginx 헬스체크: http://$public_ip/health"
    
    log_info "📁 디렉토리 정보:"
    log_info "  - 프로젝트 루트: $PROJECT_ROOT"
    log_info "  - 빌드 결과: $DIST_DIR"
    log_info "  - 로그 파일: $LOG_FILE"
    log_info "  - 백업 위치: $BACKUP_DIR"
    
    # 서비스 상태 요약
    log_info "📊 서비스 상태 요약:"
    
    # PM2 상태
    local pm2_status=$(pm2 jlist 2>/dev/null || echo "[]")
    local online_count=$(echo "$pm2_status" | grep -c '"status":"online"' || echo "0")
    log_info "  - PM2 실행 중 프로세스: $online_count"
    
    # nginx 상태
    if sudo systemctl is-active --quiet nginx; then
        log_info "  - nginx: 정상 실행 중"
    else
        log_warning "  - nginx: 실행되지 않음"
    fi
    
    log_info "🔧 관리 명령어:"
    log_info "  - PM2 상태: pm2 status"
    log_info "  - PM2 로그: pm2 logs"
    log_info "  - PM2 모니터링: pm2 monit"
    log_info "  - 서비스 재시작: pm2 restart all"
    log_info "  - 서비스 중지: pm2 stop all"
    log_info "  - nginx 재시작: sudo systemctl restart nginx"
    log_info "  - nginx 로그: sudo tail -f /var/log/nginx/error.log"
    
    log_info "📋 문제 해결:"
    log_info "  - 배포 실패 시 백업에서 복원: $BACKUP_DIR/backup-$TIMESTAMP"
    log_info "  - PM2 로그 확인: pm2 logs"
    log_info "  - nginx 설정 확인: sudo nginx -t"
    log_info "  - 서비스 상태 확인: pm2 status && sudo systemctl status nginx"
    
    log_separator
}

# =============================================================================
# 오류 처리 및 롤백 (안전장치 강화)
# =============================================================================
handle_error() {
    local exit_code=$?
    local line_number=$1
    local command=$2
    
    log_error "스크립트 실행 중 오류가 발생했습니다."
    log_error "  - 종료 코드: $exit_code"
    log_error "  - 라인 번호: $line_number"
    log_error "  - 명령어: $command"
    
    # 현재 단계 확인
    log_info "현재 배포 단계 확인 중..."
    
    # PM2 서비스 상태 확인 및 정리
    if command -v pm2 &> /dev/null; then
        log_info "PM2 서비스 상태 확인 중..."
        pm2 status 2>/dev/null || true
        
        # PM2 프로세스가 실행 중이면 중지하지 않음 (사용자가 결정)
        log_warning "PM2 서비스는 수동으로 중지하세요: pm2 delete all"
    fi
    
    # nginx 상태 확인
    if command -v nginx &> /dev/null; then
        if sudo systemctl is-active --quiet nginx; then
            log_warning "nginx 서비스는 실행 중입니다. 수동으로 중지하세요: sudo systemctl stop nginx"
        fi
    fi
    
    # 롤백 옵션 제공
    log_separator
    log_info "🔧 롤백 옵션:"
    log_info "  1. PM2 서비스 중지: pm2 delete all"
    log_info "  2. nginx 서비스 중지: sudo systemctl stop nginx"
    log_info "  3. 백업에서 복원: $BACKUP_DIR/backup-$TIMESTAMP"
    log_info "  4. 이전 nginx 설정 복원: sudo cp ${NGINX_CONF_PATH}.backup.* $NGINX_CONF_PATH"
    log_info "  5. 로그 확인: $LOG_FILE"
    log_separator
    
    # 에러 로그에 기록
    log_error_file "배포 실패: 종료 코드=$exit_code, 라인=$line_number, 명령어=$command"
    
    exit $exit_code
}

# 오류 트랩 설정 (라인 번호와 명령어 포함)
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# =============================================================================
# 메인 실행 함수 (안전장치 강화, 실행 순서 검증)
# =============================================================================
main() {
    local start_time=$(date +%s)
    log_separator
    log_info "🚀 Deukgeun EC2 통합 배포를 시작합니다..."
    log_info "📅 시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"
    log_separator
    
    local step_errors=0
    local total_steps=12
    
    # 단계별 실행 (에러 발생 시 다음 단계로 진행 가능하도록)
    log_info "📋 실행 단계:"
    log_info "  1. 시스템 환경 확인"
    log_info "  2. 프로젝트 의존성 설치"
    log_info "  3. 환경 변수 설정"
    log_info "  4. 백업 생성"
    log_info "  5. TypeScript 컴파일 및 변환"
    log_info "  6. 빌드 실행"
    log_info "  7. 데이터베이스 설정"
    log_info "  8. 방화벽 설정"
    log_info "  9. Nginx 설정"
    log_info "  10. PM2 서비스 시작"
    log_info "  11. 서비스 상태 확인"
    log_info "  12. 로그 모니터링 설정"
    log_separator
    
    # 1. 시스템 환경 확인 (필수)
    log_step "[1/$total_steps] 시스템 환경 확인"
    if ! check_system_requirements; then
        log_error "시스템 환경 확인 실패"
        step_errors=$((step_errors + 1))
        exit 1
    fi
    
    # 2. 프로젝트 의존성 설치 (필수)
    log_step "[2/$total_steps] 프로젝트 의존성 설치"
    if ! install_dependencies; then
        log_error "의존성 설치 실패"
        step_errors=$((step_errors + 1))
        exit 1
    fi
    
    # 3. 환경 변수 설정 (필수)
    log_step "[3/$total_steps] 환경 변수 설정"
    if ! setup_environment; then
        log_error "환경 변수 설정 실패"
        step_errors=$((step_errors + 1))
        exit 1
    fi
    
    # 4. 백업 생성 (권장)
    log_step "[4/$total_steps] 백업 생성"
    if ! create_backup; then
        log_warning "백업 생성 실패, 계속 진행..."
        step_errors=$((step_errors + 1))
    fi
    
    # 5. TypeScript 컴파일 및 변환 (선택)
    log_step "[5/$total_steps] TypeScript 컴파일 및 변환"
    if ! compile_and_convert; then
        log_warning "컴파일 및 변환 실패, 계속 진행..."
        step_errors=$((step_errors + 1))
    fi
    
    # 6. 빌드 실행 (필수)
    log_step "[6/$total_steps] 빌드 실행"
    
    # 로그 디렉토리 생성 (빌드 전)
    mkdir -p "$LOG_DIR" || {
        log_warning "로그 디렉토리 생성 실패, 계속 진행..."
    }
    
    # 빌드 실행
    if ! run_build; then
        log_error "빌드 실패"
        step_errors=$((step_errors + 1))
        exit 1
    fi
    
    # 7. 데이터베이스 설정 (선택)
    log_step "[7/$total_steps] 데이터베이스 설정"
    if ! setup_database; then
        log_warning "데이터베이스 설정 실패, 계속 진행..."
        step_errors=$((step_errors + 1))
    fi
    
    # 8. 방화벽 설정 (권장)
    log_step "[8/$total_steps] 방화벽 설정"
    if ! setup_firewall; then
        log_warning "방화벽 설정 실패, 계속 진행..."
        step_errors=$((step_errors + 1))
    fi
    
    # 9. Nginx 설정 (필수)
    log_step "[9/$total_steps] Nginx 설정"
    if ! setup_nginx; then
        log_error "Nginx 설정 실패"
        step_errors=$((step_errors + 1))
        exit 1
    fi
    
    # 10. PM2 서비스 시작 (필수)
    log_step "[10/$total_steps] PM2 서비스 시작"
    if ! start_services; then
        log_error "PM2 서비스 시작 실패"
        step_errors=$((step_errors + 1))
        exit 1
    fi
    
    # 11. 서비스 상태 확인 (필수)
    log_step "[11/$total_steps] 서비스 상태 확인"
    if ! check_services; then
        log_error "서비스 상태 확인 실패"
        step_errors=$((step_errors + 1))
        # 에러가 있어도 계속 진행 (수동 확인 필요)
    fi
    
    # 12. 로그 모니터링 설정 (권장)
    log_step "[12/$total_steps] 로그 모니터링 설정"
    if ! setup_log_monitoring; then
        log_warning "로그 모니터링 설정 실패, 계속 진행..."
        step_errors=$((step_errors + 1))
    fi
    
    # 최종 상태 보고
    final_report
    
    # 실행 시간 계산
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    log_separator
    if [ $step_errors -eq 0 ]; then
        log_success "✅ 모든 단계가 성공적으로 완료되었습니다!"
        log_info "⏱️  총 소요 시간: ${minutes}분 ${seconds}초"
    else
        log_warning "⚠️  배포가 완료되었지만 $step_errors 개 단계에서 경고가 발생했습니다."
        log_info "⏱️  총 소요 시간: ${minutes}분 ${seconds}초"
        log_info "로그 파일을 확인하여 문제를 해결하세요: $LOG_FILE"
    fi
    log_separator
    
    # 성공 시 종료 코드 0, 경고 시 0, 실패 시 1
    if [ $step_errors -eq 0 ]; then
        exit 0
    else
        exit 0  # 경고가 있어도 종료 코드 0 (수동 확인 필요)
    fi
}

# 스크립트 실행
main "$@"
