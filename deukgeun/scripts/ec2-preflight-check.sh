#!/bin/bash

# =============================================================================
# EC2 환경 사전 검사 스크립트
# EC2 환경에서 실행하기 전에 시스템 요구사항을 확인합니다.
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_separator() {
    echo "========================================"
}

# 검사 결과
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# 1. OS 확인
log_separator
log_info "1. 운영 체제 확인 중..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    log_success "Linux 환경 확인됨"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    log_error "이 스크립트는 Linux 환경에서만 실행됩니다. (현재: $OSTYPE)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# 2. Node.js 확인
log_separator
log_info "2. Node.js 확인 중..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
    log_success "Node.js 설치됨: $NODE_VERSION"
    
    if [[ $NODE_MAJOR -lt 18 ]]; then
        log_warning "Node.js 버전이 낮습니다 (현재: $NODE_VERSION, 권장: 18.x 이상)"
        WARNINGS=$((WARNINGS + 1))
    fi
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    log_error "Node.js가 설치되지 않았습니다."
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# 3. npm 확인
log_separator
log_info "3. npm 확인 중..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm 설치됨: $NPM_VERSION"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    log_error "npm이 설치되지 않았습니다."
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# 4. PM2 확인
log_separator
log_info "4. PM2 확인 중..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    log_success "PM2 설치됨: $PM2_VERSION"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    log_warning "PM2가 설치되지 않았습니다. (배포 스크립트에서 자동 설치됨)"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. nginx 확인
log_separator
log_info "5. nginx 확인 중..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    log_success "nginx 설치됨: $NGINX_VERSION"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    log_warning "nginx가 설치되지 않았습니다. (배포 스크립트에서 자동 설치됨)"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. Git 확인
log_separator
log_info "6. Git 확인 중..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    log_success "Git 설치됨: $GIT_VERSION"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    log_warning "Git이 설치되지 않았습니다. (배포 스크립트에서 자동 설치됨)"
    WARNINGS=$((WARNINGS + 1))
fi

# 7. 디스크 공간 확인
log_separator
log_info "7. 디스크 공간 확인 중..."
AVAILABLE_SPACE=$(df -h . | tail -1 | awk '{print $4}')
USED_SPACE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
log_info "사용 가능한 공간: $AVAILABLE_SPACE"
log_info "사용 중인 공간: ${USED_SPACE}%"

if [[ $USED_SPACE -gt 90 ]]; then
    log_error "디스크 공간이 부족합니다 (사용 중: ${USED_SPACE}%)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
elif [[ $USED_SPACE -gt 80 ]]; then
    log_warning "디스크 공간이 부족할 수 있습니다 (사용 중: ${USED_SPACE}%)"
    WARNINGS=$((WARNINGS + 1))
else
    log_success "디스크 공간 충분함"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

# 8. 메모리 확인
log_separator
log_info "8. 메모리 확인 중..."
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
log_info "총 메모리: ${TOTAL_MEM}MB"
log_info "사용 가능한 메모리: ${AVAILABLE_MEM}MB"

if [[ $AVAILABLE_MEM -lt 512 ]]; then
    log_warning "사용 가능한 메모리가 부족할 수 있습니다 (${AVAILABLE_MEM}MB)"
    WARNINGS=$((WARNINGS + 1))
else
    log_success "메모리 충분함"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

# 9. 필수 포트 확인
log_separator
log_info "9. 필수 포트 확인 중..."
PORTS=(80 443 5000)
PORTS_IN_USE=()

for port in "${PORTS[@]}"; do
    if netstat -tlnp 2>/dev/null | grep -q ":${port} " || ss -tlnp 2>/dev/null | grep -q ":${port} "; then
        PORTS_IN_USE+=("$port")
    fi
done

if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
    log_warning "다음 포트가 이미 사용 중입니다: ${PORTS_IN_USE[*]}"
    WARNINGS=$((WARNINGS + 1))
else
    log_success "필수 포트 사용 가능함"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

# 10. 프로젝트 파일 확인
log_separator
log_info "10. 프로젝트 파일 확인 중..."
REQUIRED_FILES=("package.json" "ecosystem.config.cjs" "nginx.conf")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    log_error "필수 파일이 없습니다: ${MISSING_FILES[*]}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
else
    log_success "필수 파일 확인됨"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

# 최종 결과
log_separator
log_info "검사 결과 요약:"
log_info "✅ 통과: $CHECKS_PASSED"
log_info "⚠️  경고: $WARNINGS"
log_info "❌ 실패: $CHECKS_FAILED"

if [ $CHECKS_FAILED -gt 0 ]; then
    log_error "검사 실패: $CHECKS_FAILED 개 항목이 실패했습니다."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    log_warning "경고: $WARNINGS 개 항목에 경고가 있습니다."
    exit 0
else
    log_success "모든 검사를 통과했습니다!"
    exit 0
fi

