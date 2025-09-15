#!/bin/bash

# ============================================================================
# Deukgeun Docker Deployment Script
# 프로덕션 환경 배포를 위한 자동화 스크립트
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

# 환경 변수 파일 확인
check_env_files() {
    log_info "환경 변수 파일 확인 중..."
    
    if [ ! -f ".env" ]; then
        log_warning ".env 파일이 없습니다. env.production을 복사합니다."
        cp env.production .env
        log_warning "⚠️  .env 파일을 실제 환경에 맞게 수정해주세요!"
    fi
    
    if [ ! -f "src/backend/.env" ]; then
        log_warning "src/backend/.env 파일이 없습니다. env.production을 복사합니다."
        cp env.production src/backend/.env
        log_warning "⚠️  src/backend/.env 파일을 실제 환경에 맞게 수정해주세요!"
    fi
    
    log_success "환경 변수 파일 확인 완료"
}

# 보안 검사
security_check() {
    log_info "보안 검사 실행 중..."
    
    if [ -f "scripts/security-check.js" ]; then
        node scripts/security-check.js
        if [ $? -ne 0 ]; then
            log_error "보안 검사 실패. 배포를 중단합니다."
            exit 1
        fi
        log_success "보안 검사 통과"
    else
        log_warning "보안 검사 스크립트를 찾을 수 없습니다."
    fi
}

# 초기 데이터 시드
run_initial_seed() {
    log_info "초기 데이터 시드 실행 중..."
    
    # 백엔드 컨테이너가 준비될 때까지 대기
    log_info "백엔드 서비스 준비 대기 중..."
    sleep 30
    
    # 마스터 시드 스크립트 실행
    if [ -f "src/backend/scripts/masterSeedScript.ts" ]; then
        log_info "마스터 시드 스크립트 실행 중..."
        docker-compose exec backend npx ts-node scripts/masterSeedScript.ts initial
        if [ $? -eq 0 ]; then
            log_success "초기 데이터 시드 완료"
        else
            log_warning "초기 데이터 시드 실행 중 일부 오류가 발생했지만 계속 진행합니다."
        fi
    else
        log_warning "마스터 시드 스크립트를 찾을 수 없습니다."
    fi
}

# Docker 및 Docker Compose 설치 확인
check_docker() {
    log_info "Docker 및 Docker Compose 설치 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다. Docker를 먼저 설치해주세요."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다. Docker Compose를 먼저 설치해주세요."
        exit 1
    fi
    
    log_success "Docker 및 Docker Compose 확인 완료"
}

# 기존 컨테이너 정리
cleanup_containers() {
    log_info "기존 컨테이너 정리 중..."
    
    # 기존 컨테이너 중지 및 제거
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # 사용하지 않는 이미지 정리
    docker image prune -f
    
    log_success "컨테이너 정리 완료"
}

# 이미지 빌드
build_images() {
    log_info "Docker 이미지 빌드 중..."
    
    # 백엔드 이미지 빌드
    log_info "백엔드 이미지 빌드 중..."
    docker-compose build backend
    
    # 프론트엔드 이미지 빌드
    log_info "프론트엔드 이미지 빌드 중..."
    docker-compose build frontend
    
    log_success "이미지 빌드 완료"
}

# 서비스 시작
start_services() {
    log_info "서비스 시작 중..."
    
    # 데이터베이스 먼저 시작
    log_info "MySQL 데이터베이스 시작 중..."
    docker-compose up -d mysql
    
    # 데이터베이스 준비 대기
    log_info "데이터베이스 준비 대기 중..."
    sleep 30
    
    # Redis 시작
    log_info "Redis 시작 중..."
    docker-compose up -d redis
    
    # 백엔드 시작
    log_info "백엔드 서비스 시작 중..."
    docker-compose up -d backend
    
    # 백엔드 준비 대기
    log_info "백엔드 준비 대기 중..."
    sleep 20
    
    # 프론트엔드 시작
    log_info "프론트엔드 서비스 시작 중..."
    docker-compose up -d frontend
    
    # Nginx 프록시 시작 (선택사항)
    if [ "$1" = "--with-proxy" ]; then
        log_info "Nginx 프록시 시작 중..."
        docker-compose up -d nginx-proxy
    fi
    
    log_success "모든 서비스 시작 완료"
}

# 헬스체크
health_check() {
    log_info "서비스 헬스체크 중..."
    
    # 백엔드 헬스체크
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "백엔드 서비스 정상"
    else
        log_error "백엔드 서비스 헬스체크 실패"
        return 1
    fi
    
    # 프론트엔드 헬스체크
    if curl -f http://localhost:80/health > /dev/null 2>&1; then
        log_success "프론트엔드 서비스 정상"
    else
        log_error "프론트엔드 서비스 헬스체크 실패"
        return 1
    fi
    
    log_success "모든 서비스 헬스체크 통과"
}

# 로그 출력
show_logs() {
    log_info "서비스 로그 출력 중... (Ctrl+C로 종료)"
    docker-compose logs -f
}

# 메인 함수
main() {
    log_info "🚀 Deukgeun Docker 배포 시작"
    
    # 인수 처리
    case "${1:-deploy}" in
        "deploy")
            check_docker
            check_env_files
            security_check
            cleanup_containers
            build_images
            start_services "$2"
            health_check
            run_initial_seed
            log_success "🎉 배포 완료!"
            log_info "프론트엔드: http://localhost:80"
            log_info "백엔드 API: http://localhost:5000"
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            log_info "서비스 중지 중..."
            docker-compose down
            log_success "서비스 중지 완료"
            ;;
        "restart")
            log_info "서비스 재시작 중..."
            docker-compose restart
            log_success "서비스 재시작 완료"
            ;;
        "clean")
            log_info "완전 정리 중..."
            docker-compose down -v --remove-orphans
            docker system prune -f
            log_success "정리 완료"
            ;;
        "status")
            log_info "서비스 상태 확인 중..."
            docker-compose ps
            ;;
        *)
            echo "사용법: $0 [deploy|logs|stop|restart|clean|status] [--with-proxy]"
            echo ""
            echo "명령어:"
            echo "  deploy     - 전체 서비스 배포 (기본값)"
            echo "  logs       - 서비스 로그 출력"
            echo "  stop       - 서비스 중지"
            echo "  restart    - 서비스 재시작"
            echo "  clean      - 완전 정리 (볼륨 포함)"
            echo "  status     - 서비스 상태 확인"
            echo ""
            echo "옵션:"
            echo "  --with-proxy - Nginx 프록시 포함 배포"
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"
