#!/bin/bash

# ============================================================================
# Simple Deploy Script for Deukgeun
# ============================================================================

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Deukgeun 배포를 시작합니다..."

# 0. 환경 확인
echo "🔍 환경 확인 중..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되지 않았습니다."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2가 설치되지 않았습니다. 설치 중..."
    npm install -g pm2
fi

echo "✅ 환경 확인 완료"

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 보안 취약점 확인 (경고만, 중단하지 않음)
echo "🔒 보안 취약점 확인 중..."
npm audit --audit-level=high || echo "⚠️  보안 취약점이 발견되었지만 계속 진행합니다."

# 3. 백엔드 빌드
echo "🔨 백엔드 빌드 중..."
npm run build:backend:production

# 4. 프론트엔드 빌드
echo "🎨 프론트엔드 빌드 중..."
npm run build:production

# 5. 빌드 결과 확인
echo "🔍 빌드 결과 확인 중..."
if [ ! -d "dist/backend" ]; then
    echo "❌ 백엔드 빌드가 실패했습니다."
    exit 1
fi

if [ ! -d "dist/frontend" ]; then
    echo "❌ 프론트엔드 빌드가 실패했습니다."
    exit 1
fi

echo "✅ 빌드 결과 확인 완료"

# 6. 로그 디렉토리 생성
echo "📁 로그 디렉토리 생성 중..."
mkdir -p logs

# 7. PM2로 서비스 시작
echo "🚀 PM2로 서비스 시작 중..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# 8. 서비스 상태 확인
echo "⏳ 서비스 시작 대기 중..."
sleep 5

# 9. 상태 확인
echo "✅ 배포 완료! 서비스 상태:"
pm2 status

# 10. 헬스체크
echo "🏥 헬스체크 수행 중..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ 백엔드 헬스체크 성공"
else
    echo "⚠️  백엔드 헬스체크 실패 (서비스가 아직 시작 중일 수 있습니다)"
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ 프론트엔드 헬스체크 성공"
else
    echo "⚠️  프론트엔드 헬스체크 실패 (서비스가 아직 시작 중일 수 있습니다)"
fi

echo ""
echo "🌐 접속 정보:"
echo "프론트엔드: http://localhost:80"
echo "백엔드 API: http://localhost:5000"
echo "헬스체크: http://localhost:5000/health"
echo ""
echo "📋 PM2 명령어:"
echo "  상태 확인: pm2 status"
echo "  로그 확인: pm2 logs"
echo "  재시작: pm2 restart all"
echo "  중지: pm2 stop all"
echo "  삭제: pm2 delete all"
echo ""
echo "📊 모니터링:"
echo "  실시간 모니터링: pm2 monit"
echo "  로그 실시간 확인: pm2 logs --lines 100"
