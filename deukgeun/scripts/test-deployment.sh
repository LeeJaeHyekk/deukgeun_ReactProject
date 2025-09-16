#!/bin/bash

# ============================================================================
# Deukgeun 배포 테스트 스크립트 (EC2 환경용)
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

# 함수: 환경 설정 확인
check_environment() {
    log_info "환경 설정 확인 중..."
    
    # .env 파일 확인
    if [ ! -f ".env" ]; then
        log_warning ".env 파일이 없습니다. env.example에서 복사합니다."
        if [ -f "env.example" ]; then
            cp env.example .env
            log_info ".env 파일을 생성했습니다. 필요에 따라 수정하세요."
        else
            log_error "env.example 파일을 찾을 수 없습니다."
            exit 1
        fi
    fi
    
    # 백엔드 .env 파일 확인
    if [ ! -f "src/backend/.env" ]; then
        log_warning "백엔드 .env 파일이 없습니다. env.sample에서 복사합니다."
        if [ -f "src/backend/env.sample" ]; then
            cp src/backend/env.sample src/backend/.env
            log_info "백엔드 .env 파일을 생성했습니다. 필요에 따라 수정하세요."
        else
            log_error "src/backend/env.sample 파일을 찾을 수 없습니다."
            exit 1
        fi
    fi
    
    # logs 디렉토리 생성
    if [ ! -d "logs" ]; then
        log_info "logs 디렉토리를 생성합니다."
        mkdir -p logs
    fi
    
    log_success "환경 설정이 완료되었습니다."
}

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
    
    # serve 확인
    if ! command -v serve &> /dev/null; then
        log_info "serve 설치 중..."
        npm install -g serve
    fi
    
    # curl 확인 (헬스체크용)
    if ! command -v curl &> /dev/null; then
        log_info "curl 설치 중..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y curl
        elif command -v yum &> /dev/null; then
            sudo yum install -y curl
        else
            log_warning "curl을 설치할 수 없습니다. 헬스체크가 제한될 수 있습니다."
        fi
    fi
    
    log_success "모든 의존성이 확인되었습니다."
}

# 함수: 빌드 테스트
test_build() {
    log_info "빌드 테스트 중..."
    
    # 의존성 설치
    log_info "루트 의존성 설치 중..."
    npm install
    
    # 백엔드 의존성 설치
    log_info "백엔드 의존성 설치 중..."
    if [ -d "src/backend" ]; then
        cd src/backend && npm install && cd ../..
    else
        log_warning "src/backend 디렉토리를 찾을 수 없습니다. 백엔드 의존성 설치를 건너뜁니다."
    fi
    
    # 기존 빌드 파일 정리
    log_info "기존 빌드 파일 정리 중..."
    rm -rf dist/
    
    # 백엔드 빌드
    log_info "백엔드 빌드 중..."
    if npm run build:backend:production; then
        log_success "백엔드 빌드가 완료되었습니다."
    else
        log_error "백엔드 빌드에 실패했습니다."
        exit 1
    fi
    
    # 프론트엔드 빌드
    log_info "프론트엔드 빌드 중..."
    if npm run build:production; then
        log_success "프론트엔드 빌드가 완료되었습니다."
    else
        log_error "프론트엔드 빌드에 실패했습니다."
        exit 1
    fi
    
    # 빌드 결과 확인
    if [ ! -f "dist/backend/index.cjs" ]; then
        log_error "백엔드 빌드 파일을 찾을 수 없습니다: dist/backend/index.cjs"
        exit 1
    fi
    
    if [ ! -d "dist/frontend" ]; then
        log_error "프론트엔드 빌드 디렉토리를 찾을 수 없습니다: dist/frontend"
        exit 1
    fi
    
    log_success "빌드 테스트가 완료되었습니다."
}

# 함수: PM2 테스트
test_pm2() {
    log_info "PM2 테스트 중..."
    
    # 기존 서비스 중지 및 정리
    log_info "기존 PM2 프로세스 정리 중..."
    pm2 delete all 2>/dev/null || true
    pm2 kill 2>/dev/null || true
    
    # PM2 설정 파일 확인
    if [ ! -f "ecosystem.config.js" ]; then
        log_error "ecosystem.config.js 파일을 찾을 수 없습니다."
        exit 1
    fi
    
    # PM2 재시작
    log_info "PM2 데몬 재시작 중..."
    pm2 kill
    pm2 resurrect 2>/dev/null || true
    
    # 서비스 시작
    log_info "서비스 시작 중..."
    if pm2 start ecosystem.config.js --env production; then
        log_success "PM2 서비스가 시작되었습니다."
    else
        log_error "PM2 서비스 시작에 실패했습니다."
        pm2 logs --lines 20
        exit 1
    fi
    
    # 서비스 상태 확인
    log_info "서비스 상태 확인 중..."
    pm2 status
    
    # 잠시 대기 후 상태 재확인
    sleep 3
    pm2 status
    
    log_success "PM2 테스트가 완료되었습니다."
}

# 함수: 헬스체크 테스트
test_health_check() {
    log_info "헬스체크 테스트 중..."
    
    # curl 명령어 확인
    if ! command -v curl &> /dev/null; then
        log_warning "curl이 설치되지 않았습니다. 헬스체크를 건너뜁니다."
        return 0
    fi
    
    # 백엔드 헬스체크 (최대 30초 대기)
    log_info "백엔드 헬스체크 중..."
    backend_healthy=false
    for i in {1..30}; do
        if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
            log_success "백엔드 서비스가 정상적으로 실행 중입니다."
            backend_healthy=true
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "백엔드 서비스에 연결할 수 없습니다. (데이터베이스 연결 문제일 수 있음)"
            log_info "백엔드 로그 확인 중..."
            pm2 logs deukgeun-backend --lines 20
        fi
        sleep 1
    done
    
    # 프론트엔드 헬스체크 (최대 30초 대기)
    log_info "프론트엔드 헬스체크 중..."
    frontend_healthy=false
    for i in {1..30}; do
        if curl -f -s http://localhost:3000/ > /dev/null 2>&1; then
            log_success "프론트엔드 서비스가 정상적으로 실행 중입니다."
            frontend_healthy=true
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "프론트엔드 서비스에 연결할 수 없습니다."
            log_info "프론트엔드 로그 확인 중..."
            pm2 logs deukgeun-frontend --lines 20
        fi
        sleep 1
    done
    
    # 헬스체크 결과 요약
    if [ "$backend_healthy" = true ] && [ "$frontend_healthy" = true ]; then
        log_success "모든 서비스가 정상적으로 실행 중입니다."
    else
        log_warning "일부 서비스에 문제가 있을 수 있습니다."
        log_info "PM2 상태: pm2 status"
        log_info "PM2 로그: pm2 logs"
    fi
    
    log_success "헬스체크 테스트가 완료되었습니다."
}

# 함수: 정리 작업
cleanup() {
    log_info "정리 작업 중..."
    
    # PM2 프로세스 정리 (선택사항)
    if [ "$1" = "--cleanup" ]; then
        log_info "PM2 프로세스를 정리합니다."
        pm2 delete all 2>/dev/null || true
        pm2 kill 2>/dev/null || true
    fi
    
    log_success "정리 작업이 완료되었습니다."
}

# 메인 실행 함수
main() {
    log_info "Deukgeun EC2 배포 테스트를 시작합니다..."
    
    # 환경 설정 확인
    check_environment
    
    # 의존성 확인
    check_dependencies
    
    # 빌드 테스트
    test_build
    
    # PM2 테스트
    test_pm2
    
    # 헬스체크 테스트
    test_health_check
    
    log_success "배포 테스트가 완료되었습니다!"
    echo ""
    log_info "=== 유용한 명령어들 ==="
    log_info "PM2 상태 확인: pm2 status"
    log_info "PM2 로그 확인: pm2 logs"
    log_info "PM2 로그 실시간: pm2 logs --follow"
    log_info "서비스 재시작: pm2 restart all"
    log_info "서비스 중지: pm2 stop all"
    log_info "서비스 삭제: pm2 delete all"
    log_info "PM2 저장: pm2 save"
    log_info "PM2 부팅시 자동시작: pm2 startup"
    echo ""
    log_info "=== 문제 해결 ==="
    log_info "백엔드 로그: pm2 logs deukgeun-backend"
    log_info "프론트엔드 로그: pm2 logs deukgeun-frontend"
    log_info "전체 로그: pm2 logs --lines 50"
    echo ""
    log_info "정리하려면: $0 --cleanup"
}

# 스크립트 실행
if [ "$1" = "--cleanup" ]; then
    cleanup "$1"
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Deukgeun EC2 배포 테스트 스크립트"
    echo ""
    echo "사용법:"
    echo "  $0                 # 전체 배포 테스트 실행"
    echo "  $0 --cleanup       # PM2 프로세스 정리"
    echo "  $0 --help          # 도움말 표시"
    echo ""
    echo "기능:"
    echo "  - 환경 설정 확인 (.env 파일 생성)"
    echo "  - 의존성 확인 및 설치"
    echo "  - 빌드 테스트 (백엔드 + 프론트엔드)"
    echo "  - PM2 서비스 시작 및 테스트"
    echo "  - 헬스체크 테스트"
    echo ""
    echo "요구사항:"
    echo "  - Node.js 18+"
    echo "  - npm"
    echo "  - PM2 (자동 설치)"
    echo "  - serve (자동 설치)"
    echo "  - curl (헬스체크용, 자동 설치)"
else
    main "$@"
fi
