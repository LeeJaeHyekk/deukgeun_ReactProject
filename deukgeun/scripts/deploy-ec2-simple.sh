#!/bin/bash

# ============================================================================
# Deukgeun EC2 간단 배포 스크립트 (최적화된 빌드 사용)
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

# 메인 실행 함수
main() {
    log_info "Deukgeun EC2 간단 배포를 시작합니다 (최적화된 빌드 사용)..."
    
    # 프로젝트 루트로 이동
    cd "$(dirname "$0")/.."
    
    # 의존성 설치
    log_info "의존성 설치 중..."
    npm install
    
    # 백엔드 의존성 설치
    if [ -d "src/backend" ]; then
        log_info "백엔드 의존성 설치 중..."
        cd src/backend && npm install && cd ../..
    fi
    
    # 최적화된 프로덕션 빌드
    log_info "최적화된 프로덕션 빌드 중..."
    export NODE_ENV=production
    npm run build:full:production:optimized
    
    # 빌드 검증
    log_info "빌드 결과 검증 중..."
    
    # 백엔드 빌드 검증
    if [ ! -f "dist/backend/index.cjs" ]; then
        log_error "백엔드 빌드 파일이 없습니다: dist/backend/index.cjs"
        exit 1
    fi
    
    # 프론트엔드 빌드 검증
    if [ ! -d "dist/frontend" ]; then
        log_error "프론트엔드 빌드 디렉토리가 없습니다: dist/frontend"
        exit 1
    fi
    
    log_success "빌드 검증 완료"
    
    # 기존 PM2 프로세스 정리
    log_info "기존 PM2 프로세스 정리 중..."
    pm2 delete all 2>/dev/null || true
    
    # PM2로 서비스 시작
    log_info "PM2로 서비스 시작 중..."
    pm2 start ecosystem.config.js --env production
    
    # 서비스 상태 확인
    log_info "서비스 상태 확인 중..."
    pm2 status
    
    log_success "EC2 간단 배포가 완료되었습니다!"
    echo ""
    log_info "=== 서비스 정보 ==="
    log_info "프론트엔드: http://$(curl -s ifconfig.me):3000"
    log_info "백엔드 API: http://$(curl -s ifconfig.me):5000"
    echo ""
    log_info "=== 유용한 명령어들 ==="
    log_info "PM2 상태: pm2 status"
    log_info "PM2 로그: pm2 logs"
    log_info "서비스 재시작: pm2 restart all"
    log_info "서비스 중지: pm2 stop all"
}

# 스크립트 실행
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Deukgeun EC2 간단 배포 스크립트 (최적화된 빌드 사용)"
    echo ""
    echo "사용법:"
    echo "  $0                 # 간단 배포 실행"
    echo "  $0 --help          # 도움말 표시"
    echo ""
    echo "기능:"
    echo "  - 의존성 설치"
    echo "  - 최적화된 프로덕션 빌드 (build-optimized.cjs 사용)"
    echo "  - PM2 서비스 시작"
    echo ""
    echo "요구사항:"
    echo "  - Node.js 18+"
    echo "  - PM2 설치됨"
    echo "  - 프로젝트 루트에서 실행"
else
    main "$@"
fi
