#!/bin/bash

# PM2 배포 스크립트 (안전장치 포함)
# www.devtrail.net 배포용

set -e  # 에러 발생 시 즉시 종료
set -u  # 정의되지 않은 변수 사용 시 에러

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

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

log_info "프로젝트 루트: $PROJECT_ROOT"

# =============================================================================
# 안전장치 1: 필수 파일 존재 확인
# =============================================================================
log_info "안전장치 1: 필수 파일 존재 확인 중..."

REQUIRED_FILES=(
    "dist/backend/backend/index.cjs"
    "dist/frontend/index.html"
    "ecosystem.config.cjs"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "필수 파일이 없습니다: $file"
        exit 1
    fi
    log_success "파일 확인: $file"
done

# =============================================================================
# 안전장치 2: 로그 디렉토리 생성
# =============================================================================
log_info "안전장치 2: 로그 디렉토리 생성 중..."

if [ ! -d "logs" ]; then
    mkdir -p logs
    chmod 755 logs
    log_success "로그 디렉토리 생성 완료"
else
    log_success "로그 디렉토리 존재 확인"
fi

# =============================================================================
# 안전장치 3: 포트 사용 확인
# =============================================================================
log_info "안전장치 3: 포트 5000 사용 확인 중..."

PORT_IN_USE=false
if command -v lsof &> /dev/null; then
    if sudo lsof -i :5000 &> /dev/null; then
        PORT_IN_USE=true
        log_warning "포트 5000이 이미 사용 중입니다. PM2가 관리 중일 수 있습니다."
    fi
elif command -v netstat &> /dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":5000 "; then
        PORT_IN_USE=true
        log_warning "포트 5000이 이미 사용 중입니다. PM2가 관리 중일 수 있습니다."
    fi
fi

if [ "$PORT_IN_USE" = false ]; then
    log_success "포트 5000 사용 가능"
fi

# =============================================================================
# 안전장치 4: Node.js 버전 확인
# =============================================================================
log_info "안전장치 4: Node.js 버전 확인 중..."

if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되어 있지 않습니다."
    exit 1
fi

NODE_VERSION=$(node --version)
log_success "Node.js 버전: $NODE_VERSION"

# =============================================================================
# 안전장치 5: PM2 설치 확인
# =============================================================================
log_info "안전장치 5: PM2 설치 확인 중..."

if ! command -v pm2 &> /dev/null; then
    log_error "PM2가 설치되어 있지 않습니다."
    exit 1
fi

PM2_VERSION=$(pm2 --version)
log_success "PM2 버전: $PM2_VERSION"

# =============================================================================
# 안전장치 6: 기존 PM2 프로세스 확인 및 정리
# =============================================================================
log_info "안전장치 6: 기존 PM2 프로세스 확인 중..."

EXISTING_PROCESS=$(pm2 jlist 2>/dev/null | grep -c '"name":"deukgeun-backend"' || echo "0")

if [ "$EXISTING_PROCESS" -gt 0 ]; then
    log_warning "기존 PM2 프로세스가 실행 중입니다. 재시작합니다..."
    pm2 stop ecosystem.config.cjs --env production 2>/dev/null || true
    pm2 delete ecosystem.config.cjs 2>/dev/null || true
    sleep 2
    log_success "기존 프로세스 정리 완료"
fi

# =============================================================================
# 배포 실행
# =============================================================================
log_info "PM2 프로덕션 배포 시작..."

# PM2 시작 (프로덕션 환경)
log_info "PM2 프로세스 시작 중..."
pm2 start ecosystem.config.cjs --env production

# 프로세스 시작 대기
log_info "프로세스 시작 대기 중 (10초)..."
sleep 10

# =============================================================================
# 안전장치 7: 배포 후 검증
# =============================================================================
log_info "안전장치 7: 배포 후 검증 중..."

# PM2 상태 확인
PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"status":"[^"]*"' | grep -c '"status":"online"' || echo "0")

if [ "$PM2_STATUS" -eq 0 ]; then
    log_error "PM2 프로세스가 실행되지 않았습니다."
    log_info "PM2 로그 확인:"
    pm2 logs --lines 20 --nostream || true
    exit 1
fi

log_success "PM2 프로세스 실행 확인"

# 포트 리스닝 확인
log_info "포트 5000 리스닝 확인 중..."
if sudo lsof -i :5000 &> /dev/null || netstat -tlnp 2>/dev/null | grep -q ":5000 "; then
    log_success "포트 5000 리스닝 확인"
else
    log_warning "포트 5000 리스닝 확인 실패 (서버가 아직 시작 중일 수 있음)"
fi

# 헬스체크 (재시도 포함)
log_info "헬스체크 실행 중..."

HEALTH_CHECK_PASSED=false
for i in {1..10}; do
    if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
        HEALTH_CHECK_PASSED=true
        log_success "헬스체크 통과 (시도 $i/10)"
        break
    fi
    log_info "헬스체크 재시도 $i/10..."
    sleep 3
done

if [ "$HEALTH_CHECK_PASSED" = false ]; then
    log_warning "헬스체크 실패 (서버가 시작 중일 수 있음)"
    log_info "PM2 상태:"
    pm2 status
    log_info "PM2 로그 (최근 20줄):"
    pm2 logs --lines 20 --nostream || true
else
    log_success "헬스체크 통과"
fi

# =============================================================================
# PM2 저장 및 상태 확인
# =============================================================================
log_info "PM2 설정 저장 중..."
pm2 save

log_info "PM2 상태:"
pm2 status

log_success "=========================================="
log_success "PM2 프로덕션 배포 완료!"
log_success "=========================================="
log_info "서비스 URL: https://www.devtrail.net"
log_info "백엔드 API: http://localhost:5000"
log_info ""
log_info "유용한 명령어:"
log_info "  - PM2 상태: pm2 status"
log_info "  - PM2 로그: pm2 logs"
log_info "  - PM2 재시작: pm2 restart ecosystem.config.cjs"
log_info "  - PM2 중지: pm2 stop ecosystem.config.cjs"
log_success "=========================================="

