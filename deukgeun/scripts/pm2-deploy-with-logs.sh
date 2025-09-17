#!/bin/bash

# PM2 배포 스크립트 (상세 로그 포함)
# PM2로 배포할 때 정확한 오류 정보를 확인할 수 있도록 구성

set -e  # 오류 발생 시 스크립트 중단

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

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")/.."

log_info "🚀 PM2 배포 시작 (상세 로그 포함)"

# 1. 로그 디렉토리 생성
log_info "📁 로그 디렉토리 생성 중..."
mkdir -p logs
log_success "로그 디렉토리 생성 완료"

# 2. PM2 로그 매니저 초기화
log_info "🔧 PM2 로그 파일 초기화 중..."
node scripts/pm2-log-manager.js init
log_success "PM2 로그 파일 초기화 완료"

# 3. 기존 PM2 프로세스 정리
log_info "🧹 기존 PM2 프로세스 정리 중..."
pm2 delete all 2>/dev/null || true
log_success "기존 PM2 프로세스 정리 완료"

# 4. 빌드 확인 (최적화된 빌드 사용)
if [ ! -d "dist" ]; then
    log_warning "dist 디렉토리가 없습니다. 최적화된 빌드를 실행합니다..."
    export NODE_ENV=production
    npm run build:full:production:optimized
    log_success "최적화된 빌드 완료"
fi

# 5. PM2로 앱 시작
log_info "🚀 PM2로 앱 시작 중..."
pm2 start ecosystem.config.js --env production
log_success "PM2 앱 시작 완료"

# 6. PM2 상태 확인
log_info "📊 PM2 상태 확인 중..."
pm2 status

# 7. 로그 파일 확인
log_info "📋 로그 파일 확인 중..."
ls -la logs/pm2-*-detailed.log 2>/dev/null || log_warning "상세 로그 파일이 아직 생성되지 않았습니다."

# 8. 실시간 로그 모니터링 시작 (5초간)
log_info "👀 5초간 실시간 로그 모니터링..."
timeout 5s pm2 logs --lines 20 || true

# 9. 최근 오류 로그 확인
log_info "🔍 최근 오류 로그 확인 중..."
node scripts/pm2-log-manager.js errors all 20

# 10. 로그 분석
log_info "📊 로그 분석 중..."
node scripts/pm2-log-manager.js analyze all

# 11. 유용한 명령어 안내
log_success "✅ PM2 배포 완료!"
echo ""
log_info "📋 유용한 명령어들:"
echo "  • PM2 상태 확인: pm2 status"
echo "  • 실시간 로그: pm2 logs"
echo "  • 백엔드 로그만: pm2 logs deukgeun-backend"
echo "  • 프론트엔드 로그만: pm2 logs deukgeun-frontend"
echo "  • 오류 로그 조회: node scripts/pm2-log-manager.js errors all 50"
echo "  • 로그 분석: node scripts/pm2-log-manager.js analyze all"
echo "  • 실시간 모니터링: node scripts/pm2-log-manager.js monitor backend error"
echo "  • 로그 정리: node scripts/pm2-log-manager.js cleanup 7"
echo ""
log_info "📁 상세 로그 파일 위치:"
echo "  • 백엔드 오류: logs/pm2-backend-error-detailed.log"
echo "  • 백엔드 출력: logs/pm2-backend-out-detailed.log"
echo "  • 프론트엔드 오류: logs/pm2-frontend-error-detailed.log"
echo "  • 프론트엔드 출력: logs/pm2-frontend-out-detailed.log"
echo ""

# 12. 배포 후 상태 확인
log_info "🔍 배포 후 상태 확인 중..."
sleep 3

# 백엔드 상태 확인
if pm2 list | grep -q "deukgeun-backend.*online"; then
    log_success "✅ 백엔드가 정상적으로 실행 중입니다."
else
    log_error "❌ 백엔드 실행에 문제가 있습니다."
    log_info "백엔드 오류 로그를 확인하세요:"
    node scripts/pm2-log-manager.js errors backend 30
fi

# 프론트엔드 상태 확인
if pm2 list | grep -q "deukgeun-frontend.*online"; then
    log_success "✅ 프론트엔드가 정상적으로 실행 중입니다."
else
    log_error "❌ 프론트엔드 실행에 문제가 있습니다."
    log_info "프론트엔드 오류 로그를 확인하세요:"
    node scripts/pm2-log-manager.js errors frontend 30
fi

echo ""
log_success "🎉 PM2 배포 및 로그 설정 완료!"
log_info "문제가 발생하면 위의 명령어들을 사용하여 상세한 로그를 확인하세요."
